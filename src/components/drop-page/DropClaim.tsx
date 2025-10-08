'use client';
import { ClaimAction } from '@/components/drop-page/ClaimAction';
import { ClaimControls } from '@/components/drop-page/ClaimControls';
import { ApprovalButton } from '@/components/drop-page/ApprovalButton';
import { client, NFT_PLACEHOLDER_IMAGE } from '@/consts/client';
import { useNftDropContext } from '@/hooks/useNftDropContext';
import {
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  useActiveAccount,
  useActiveWalletChain,
  useConnectModal,
  useSwitchActiveWalletChain,
} from 'thirdweb/react';
import {
  canClaim,
  tokensClaimedEvent,
  getActiveClaimConditionId,
} from 'thirdweb/extensions/erc721';
import { toTokens, getClaimParams } from 'thirdweb/utils';
import { getContract, getContractEvents, NATIVE_TOKEN_ADDRESS } from 'thirdweb';
import { getCurrencyMetadata } from 'thirdweb/extensions/erc20';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveScheme } from 'thirdweb/storage';
import { format, intlFormatDistance } from 'date-fns';

import { MediaRenderer } from 'thirdweb/react';
import {
  CardBody as TiltBody,
  CardContainer as TiltContainer,
  CardItem as TiltItem,
} from '@/components/ui/3d-card';
import { Icon } from '@chakra-ui/react';
import { FaDiscord, FaGlobe, FaInstagram, FaTwitter, FaLink } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

// Shared constant used across this file
const MAX_UINT256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;

export function DropClaim() {
  const {
    drop,
    contract,
    contractMetadata,
    activeClaimCondition,
    activeClaimError,
    claimConditions,
    totalClaimed,
    totalUnclaimed,
    isLoading,
    isDropReady,
    isSoldOut,
    startsInSeconds,
    currencySymbol,
    currencyDecimals,
    isERC20Currency,
  } = useNftDropContext();

  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const { connect } = useConnectModal();
  const handleConnect = useCallback(() => {
    void connect({ client });
  }, [connect]);

  const [quantity, setQuantity] = useState(1);

  // Wallet-specific overrides & minted count
  const claimParamsQuery = useQuery({
    queryKey: ['drop', contract.address, 'claimParams', account?.address ?? 'anon'],
    queryFn: async () => {
      if (!account) return null;
      return getClaimParams({
        contract,
        type: 'erc721',
        quantity: 1n,
        to: account.address,
        from: account.address,
      });
    },
    enabled: Boolean(account) && isDropReady,
    staleTime: 0,
    retry: 0,
  });

  const activeConditionIdQuery = useQuery({
    queryKey: ['drop', contract.address, 'activeConditionId'],
    queryFn: () => getActiveClaimConditionId({ contract }),
    enabled: isDropReady,
    staleTime: 0,
    retry: 0,
  });

  const mintedByWalletQuery = useQuery({
    queryKey: [
      'drop',
      contract.address,
      'mintedByWallet',
      account?.address ?? 'anon',
      activeConditionIdQuery.data !== undefined
        ? (activeConditionIdQuery.data as unknown as bigint).toString()
        : 'no-active-id',
    ],
    queryFn: async () => {
      if (!account) return 0n;
      const activeId = activeConditionIdQuery.data;
      if (activeId === undefined) return 0n;
      const events = await getContractEvents({
        contract,
        // filter by current phase and claimer
        events: [
          tokensClaimedEvent({
            claimer: account.address,
            claimConditionIndex: activeId,
          }),
        ],
        // let thirdweb pick the best source (indexer/rpc)
      });
      let total = 0n;
      for (const e of events) {
        const rawQty = (e.args as Record<string, unknown> | undefined)?.quantityClaimed;
        let qty: bigint | null = null;

        if (typeof rawQty === 'bigint' || typeof rawQty === 'number' || typeof rawQty === 'string') {
          qty = ensureBigInt(rawQty);
        } else if (
          rawQty &&
          typeof rawQty === 'object' &&
          'toString' in rawQty &&
          typeof (rawQty as { toString: () => string }).toString === 'function'
        ) {
          try {
            const formatted = (rawQty as { toString: () => string }).toString();
            qty = ensureBigInt(formatted);
          } catch {
            qty = null;
          }
        }

        if (qty !== null) {
          total += qty;
        }
      }
      return total;
    },
    enabled: Boolean(account) && isDropReady && activeConditionIdQuery.data !== undefined,
    staleTime: 0,
    retry: 0,
  });

  const walletOverrideLimit = claimParamsQuery.data?.allowlistProof?.quantityLimitPerWallet;
  const walletMintedInPhase = mintedByWalletQuery.data ?? 0n;

  const effectivePerWalletLimit = useMemo(() => {
    if (!activeClaimCondition) return 0n;
    const globalLimit = activeClaimCondition.quantityLimitPerWallet;
    // Detect if the phase is allowlist-gated
    const merkle = activeClaimCondition?.merkleRoot?.toLowerCase?.() ?? '';
    const isAllowlistGated = Boolean(merkle && !/^0x0+$/i.test(merkle));

    // Respect snapshot override when provided
    if (walletOverrideLimit !== undefined) {
      if (walletOverrideLimit === MAX_UINT256) return MAX_UINT256; // unlimited for this wallet
      if (walletOverrideLimit > 0n) return walletOverrideLimit; // finite per-wallet override
      // walletOverrideLimit <= 0n: treat as zero (not allowlisted / no allocation)
      return 0n;
    }

    // No snapshot override
    // Treat global 0 as unlimited only for public drops; for allowlist-gated drops,
    // zero remains a sentinel for "not allowlisted" wallets.
    if (globalLimit === 0n) {
      return isAllowlistGated ? 0n : MAX_UINT256;
    }
    return globalLimit;
  }, [activeClaimCondition, walletOverrideLimit]);

  const remainingForWallet = useMemo(() => {
    if (effectivePerWalletLimit === 0n) return 0n;
    if (effectivePerWalletLimit === MAX_UINT256) return MAX_UINT256;
    const rem = effectivePerWalletLimit - (walletMintedInPhase ?? 0n);
    return rem > 0n ? rem : 0n;
  }, [effectivePerWalletLimit, walletMintedInPhase]);

  const maxClaimable = useMemo(() => {
    if (!activeClaimCondition) {
      return 0n;
    }
    const limits: bigint[] = [];
    const maxSupply = ensureBigInt(activeClaimCondition.maxClaimableSupply);
    const supplyClaimed = ensureBigInt(activeClaimCondition.supplyClaimed);
    if (maxSupply > 0n) {
      const phaseRemaining = maxSupply - supplyClaimed;
      if (phaseRemaining > 0n) {
        limits.push(phaseRemaining);
      }
    }
    // If there is a finite per-wallet limit in effect (snapshot override or global > 0),
    // include the wallet-specific remaining even when it is 0 (fixes minted-out UX).
    const finitePerWallet =
      effectivePerWalletLimit > 0n && effectivePerWalletLimit !== MAX_UINT256;
    if (finitePerWallet) {
      limits.push(remainingForWallet);
    } else if (activeClaimCondition.quantityLimitPerWallet > 0n) {
      limits.push(activeClaimCondition.quantityLimitPerWallet);
    }
    if (totalUnclaimed && totalUnclaimed > 0n) {
      limits.push(totalUnclaimed);
    }
    if (limits.length === 0) {
      // Default to a reasonable UI cap when the contract exposes no limit.
      return 100n;
    }
    return limits.reduce((min, value) => (value < min ? value : min));
  }, [activeClaimCondition, totalUnclaimed, remainingForWallet, effectivePerWalletLimit]);

  const maxQuantityNumber = useMemo(() => {
    if (maxClaimable <= 0n) {
      return 0;
    }
    const value = Number(maxClaimable);
    if (!Number.isFinite(value) || value <= 0) {
      return 1;
    }
    return Math.min(value, 100);
  }, [maxClaimable]);

  useEffect(() => {
    if (quantity > maxQuantityNumber) {
      setQuantity(maxQuantityNumber);
    }
  }, [maxQuantityNumber, quantity]);

  // Resolve effective currency/price (respect allowlist overrides)
  const effectiveCurrencyAddress =
    claimParamsQuery.data?.currency ?? activeClaimCondition?.currency;
  const isWalletERC20 = useMemo(() => {
    const addr = effectiveCurrencyAddress?.toLowerCase();
    return (
      !!addr &&
      addr !== '0x0000000000000000000000000000000000000000' &&
      addr !== NATIVE_TOKEN_ADDRESS
    );
  }, [effectiveCurrencyAddress]);

  const walletCurrencyMetadataQuery = useQuery({
    queryKey: [
      'drop',
      contract.address,
      'currencyMeta',
      effectiveCurrencyAddress?.toLowerCase() ?? 'native',
    ],
    queryFn: async () => {
      if (!effectiveCurrencyAddress || !isWalletERC20) return null;
      const currencyContract = getContract({
        client,
        chain: drop.chain,
        address: effectiveCurrencyAddress,
      });
      const meta = await getCurrencyMetadata({ contract: currencyContract });
      return meta;
    },
    enabled: Boolean(effectiveCurrencyAddress) && isWalletERC20,
    staleTime: 60_000,
  });

  const effectiveCurrencySymbol = isWalletERC20
    ? (walletCurrencyMetadataQuery.data?.symbol ?? currencySymbol)
    : currencySymbol;
  const effectiveCurrencyDecimals = isWalletERC20
    ? (walletCurrencyMetadataQuery.data?.decimals ?? currencyDecimals)
    : currencyDecimals;

  const effectivePriceWei =
    claimParamsQuery.data?.pricePerToken ?? activeClaimCondition?.pricePerToken ?? 0n;
  const pricePerToken =
    effectivePriceWei > 0n ? toTokens(effectivePriceWei, effectiveCurrencyDecimals) : '0';
  const pricePerTokenDisplay = effectivePriceWei > 0n ? pricePerToken : 'Free';
  const totalPriceDisplay =
    effectivePriceWei > 0n
      ? toTokens(effectivePriceWei * BigInt(quantity), effectiveCurrencyDecimals)
      : 'Free';

  const isConnected = Boolean(account);
  const isCorrectChain = activeChain?.id === drop.chain.id;

  const eligibilityQuery = useQuery({
    queryKey: ['drop', contract.address, 'canClaim', account?.address ?? 'anon', quantity],
    queryFn: async () => {
      if (!account) {
        return { result: false, reason: 'Wallet not connected' };
      }
      return canClaim({
        contract,
        claimer: account.address,
        quantity: BigInt(quantity),
        from: account.address,
      });
    },
    enabled:
      isConnected &&
      isCorrectChain &&
      isDropReady &&
      !isSoldOut &&
      quantity > 0 &&
      quantity <= maxQuantityNumber,
    staleTime: 0,
    retry: false,
  });

  const eligibilityResult = eligibilityQuery.data;

  const parsedEligibilityReason = useMemo(() => {
    if (!isConnected) {
      return 'Connect your wallet to check eligibility.';
    }
    if (!isCorrectChain) {
      return `Switch to ${drop.chain.name ?? 'the target network'} to mint.`;
    }
    if (isSoldOut) {
      return 'This drop is sold out.';
    }
    if (!isDropReady) {
      return 'Drop is not live yet.';
    }
    // If allowlist-gated and this wallet has no override, show not-allowlisted copy.
    const merkle = activeClaimCondition?.merkleRoot?.toLowerCase?.() ?? '';
    const isAllowlistGated = Boolean(merkle && !/^0x0+$/i.test(merkle));
    if (isAllowlistGated && (!walletOverrideLimit || walletOverrideLimit <= 0n)) {
      return 'Wallet is not on the allowlist for this drop.';
    }
    // If the wallet has exhausted a finite per-wallet allocation (snapshot/global), show minted-out copy.
    if (walletOverrideLimit !== undefined && walletOverrideLimit > 0n && remainingForWallet === 0n) {
      const eff = Number(walletOverrideLimit);
      const plural = eff === 1 ? '' : 's';
      return `You've already minted your maximum allocation (${eff} NFT${plural}). No more mints available for this wallet.`;
    }
    if (eligibilityResult?.result) {
      if (effectivePerWalletLimit === MAX_UINT256) {
        return `Wallet eligible. You can mint up to ${maxQuantityNumber}.`;
      }
      const eff = Number(effectivePerWalletLimit);
      const rem = Number(
        remainingForWallet === MAX_UINT256 ? maxQuantityNumber : remainingForWallet
      );
      if (Number.isFinite(eff) && Number.isFinite(rem)) {
        if (eff > 0 && rem < eff) {
          return `You can claim ${rem}/${eff}.`;
        }
        return `Wallet eligible. You can mint up to ${eff}.`;
      }
      return `Wallet eligible. You can mint up to ${maxQuantityNumber}.`;
    }
    if (eligibilityResult?.reason) {
      return decodeEligibilityReason(eligibilityResult.reason);
    }
    return 'Unable to verify eligibility for this quantity.';
  }, [
    eligibilityResult?.reason,
    eligibilityResult?.result,
    isConnected,
    isCorrectChain,
    isDropReady,
    isSoldOut,
    maxQuantityNumber,
    effectivePerWalletLimit,
    remainingForWallet,
    drop.chain.name,
    activeClaimCondition?.merkleRoot,
    walletOverrideLimit,
  ]);

  const sharePath = `/drop/${drop.chain.id}/${drop.address}`;

  const maxPerWalletLabel = useMemo(() => {
    if (!activeClaimCondition) return null;
    const merkle = activeClaimCondition?.merkleRoot?.toLowerCase?.() ?? '';
    const isAllowlistGated = Boolean(merkle && !/^0x0+$/i.test(merkle));
    let base: string;
    if (effectivePerWalletLimit === MAX_UINT256) {
      base = 'Max per wallet: Unlimited';
    } else if (effectivePerWalletLimit === 0n) {
      base = isAllowlistGated ? 'Max per wallet: 0' : 'Max per wallet: Unlimited';
    } else {
      base = `Max per wallet: ${effectivePerWalletLimit.toString()}`;
    }
    if (effectivePerWalletLimit !== MAX_UINT256 && walletMintedInPhase !== undefined) {
      const eff = Number(effectivePerWalletLimit);
      const rem = Number(remainingForWallet === MAX_UINT256 ? eff : remainingForWallet);
      if (Number.isFinite(eff) && Number.isFinite(rem) && eff > 0 && rem < eff) {
        return `${base} • You can claim ${rem}/${eff}`;
      }
    }
    return base;
  }, [activeClaimCondition, effectivePerWalletLimit, remainingForWallet, walletMintedInPhase]);

  const canClaimNow = Boolean(eligibilityResult?.result);

  const activeClaimErrorMessage = activeClaimError
    ? decodeEligibilityReason(activeClaimError.message)
    : null;

  const imageSrc = contractMetadata?.image ?? drop.thumbnailUrl ?? NFT_PLACEHOLDER_IMAGE;

  // Derived totals for the progress display
  const totalSupply =
    totalClaimed !== undefined && totalUnclaimed !== undefined
      ? totalClaimed + totalUnclaimed
      : undefined;

  const mintedPct = useMemo(() => {
    if (totalSupply === undefined || totalClaimed === undefined || totalSupply === 0n) {
      return 0;
    }
    // Keep two decimals without floating bigint math overflow
    const pctTimes100 = Number((totalClaimed * 10000n) / totalSupply);
    return Math.min(100, Math.max(0, pctTimes100 / 100));
  }, [totalClaimed, totalSupply]);

  const statusBadge = isSoldOut
    ? { label: 'Sold Out', colorScheme: 'red' as const }
    : isDropReady
      ? { label: 'Minting now', colorScheme: 'green' as const }
      : { label: 'Coming soon', colorScheme: 'yellow' as const };

  // Single ticker to update countdowns in Claim Conditions UI
  const [, setNowTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNowTick((t) => (t + 1) % 1_000_000), 1000);
    return () => clearInterval(id);
  }, []);

  // Attempt to extract social links from contract metadata.
  type SocialLink = { platform: string; url: string };
  const socialLinks: SocialLink[] = useMemo(() => {
    const linksField = (contractMetadata as any)?.links;
    const result: SocialLink[] = [];
    const push = (platform: string, url?: string) => {
      if (url && typeof url === 'string') {
        result.push({ platform, url });
      }
    };
    // Preferred format: [{ platform, link }]
    if (Array.isArray(linksField)) {
      for (const entry of linksField) {
        const p = (entry?.platform ?? '').toString();
        const u = (entry?.link ?? entry?.url ?? '').toString();
        if (p && u) result.push({ platform: p, url: u });
      }
    }
    // Fallback common fields
    const m = contractMetadata as any;
    push('website', m?.website || m?.external_link || m?.external_url);
    push('twitter', m?.twitter || m?.x);
    push('discord', m?.discord);
    push('instagram', m?.instagram);
    push('mirror', m?.mirror);
    push('github', m?.github);
    push('telegram', m?.telegram);
    // Deduplicate by url
    const seen = new Set<string>();
    return result.filter((r) => {
      if (!r.url) return false;
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });
  }, [contractMetadata]);

  return (
    <Flex direction="column" gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 8 }}>
      {activeClaimErrorMessage && (
        <Box borderWidth="1px" borderRadius="0" p={4} borderColor="orange.500">
          <Text color="orange.200">{activeClaimErrorMessage}</Text>
        </Box>
      )}

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 6, md: 10 }}>
        {/* Left: media + description */}
        <GridItem>
          <TiltContainer containerStyle={{ padding: 0 }} style={{ width: '100%' }}>
            <TiltBody style={{ width: '100%', height: 'auto' }}>
              <TiltItem translateZ={60} style={{ width: '100%' }}>
                <Box w="100%" borderWidth="1px" borderRadius="0" overflow="hidden">
                  <MediaRenderer
                    client={client}
                    src={imageSrc}
                    style={{ height: '100%', width: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              </TiltItem>
            </TiltBody>
          </TiltContainer>
          <Skeleton isLoaded={!isLoading} mt={4}>
            <Text color="gray.300">{contractMetadata?.description ?? drop.description}</Text>
          </Skeleton>
        </GridItem>

        {/* Right: details + actions */}
        <GridItem>
          <Stack spacing={6}>
            <Stack spacing={2}>
              <Badge colorScheme={statusBadge.colorScheme} width="fit-content" borderRadius="0">
                {statusBadge.label}
              </Badge>
              <Skeleton isLoaded={!isLoading} minH="40px">
                <Heading
                  size="lg"
                  lineHeight="1.2"
                  bgGradient="linear(to-r, purple.300, pink.300)"
                  bgClip="text"
                >
                  {contractMetadata?.name ?? drop.title}
                </Heading>
              </Skeleton>
              <Text color="gray.500" fontSize="sm">
                {drop.chain.name}
              </Text>
              {socialLinks.length > 0 && (
                <Flex gap={2} mt={1} wrap="wrap">
                  {socialLinks.map((item, i) => (
                    <SocialIconLink
                      key={`${item.platform}-${i}`}
                      platform={item.platform}
                      url={item.url}
                    />
                  ))}
                </Flex>
              )}
            </Stack>

            <Tabs variant="line" colorScheme="purple">
              <TabList>
                <Tab>Overview</Tab>
                <Tab isDisabled>Activity</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <Stack spacing={6}>
                    {/* Minted progress */}
                    <Box
                      borderWidth="1px"
                      borderRadius="0"
                      p={4}
                      _hover={{ boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                    >
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontWeight="semibold">Total minted</Text>
                        <Text color="gray.400" fontSize="sm">
                          {totalClaimed !== undefined && totalSupply !== undefined
                            ? `${mintedPct}% (${totalClaimed.toString()} / ${totalSupply.toString()})`
                            : '-'}
                        </Text>
                      </Flex>
                      <Progress value={mintedPct} size="sm" borderRadius="0" colorScheme="yellow" />
                    </Box>
                    {/* Claim Conditions (full width, above claim UI) */}
                    <ClaimConditionsPanel
                      claimConditions={claimConditions}
                      currencySymbol={currencySymbol}
                      chainDecimals={currencyDecimals}
                      phaseDeadlines={drop.phaseDeadlines}
                      activeStartTs={activeClaimCondition?.startTimestamp}
                    />

                    {/* Claim UI */}
                    <Box
                      borderWidth="2px"
                      borderRadius="0"
                      p={6}
                      _hover={{ boxShadow: '0 0 0 2px var(--chakra-colors-yellow-400)' }}
                    >
                      <Flex justify="space-between" mb={6} align="center">
                        <Text
                          fontWeight="semibold"
                          letterSpacing="wide"
                          textTransform="uppercase"
                          fontSize="sm"
                        >
                          Active
                        </Text>
                        <Badge
                          colorScheme={statusBadge.colorScheme}
                          borderRadius="0"
                          variant="solid"
                        >
                          {isSoldOut ? 'Closed' : isDropReady ? 'Mint Open' : 'Pending'}
                        </Badge>
                      </Flex>
                      <ClaimControls
                        quantity={quantity}
                        onDecrement={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                        onIncrement={() =>
                          setQuantity((prev) => Math.min(prev + 1, maxQuantityNumber))
                        }
                        maxQuantity={maxQuantityNumber}
                        pricePerTokenDisplay={pricePerTokenDisplay}
                        totalPriceDisplay={totalPriceDisplay}
                        currencySymbol={effectiveCurrencySymbol}
                        currencyIcon={isWalletERC20 ? '/erc20-icons/usdt0_logo.png' : undefined}
                        eligibilityMessage={parsedEligibilityReason}
                        isCheckingEligibility={
                          eligibilityQuery.isLoading || eligibilityQuery.isFetching
                        }
                        isSoldOut={isSoldOut}
                        isDropReady={isDropReady}
                        maxPerWalletLabel={maxPerWalletLabel}
                        withContainer={false}
                        approvalAction={
                          <ApprovalButton
                            account={account}
                            isConnected={isConnected}
                            isCorrectChain={Boolean(isCorrectChain)}
                            isDropReady={isDropReady}
                            onConnect={handleConnect}
                            onSwitchChain={() => switchChain(drop.chain)}
                            chainName={drop.chain.name ?? 'Target Chain'}
                          />
                        }
                        action={
                          <ClaimAction
                            quantity={quantity}
                            account={account}
                            isConnected={isConnected}
                            isCorrectChain={Boolean(isCorrectChain)}
                            isDropReady={isDropReady}
                            isSoldOut={isSoldOut}
                            canClaim={canClaimNow}
                            eligibilityReason={
                              eligibilityResult?.reason
                                ? decodeEligibilityReason(eligibilityResult.reason)
                                : parsedEligibilityReason
                            }
                            startsInSeconds={startsInSeconds}
                            currencySymbol={effectiveCurrencySymbol}
                            totalPriceDisplay={totalPriceDisplay}
                            onConnect={handleConnect}
                            onSwitchChain={() => switchChain(drop.chain)}
                            isCheckingEligibility={
                              eligibilityQuery.isLoading || eligibilityQuery.isFetching
                            }
                            refreshEligibility={() => eligibilityQuery.refetch()}
                            chainName={drop.chain.name ?? 'Target Chain'}
                          />
                        }
                      />
                    </Box>
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </GridItem>
      </Grid>
    </Flex>
  );
}

function ensureBigInt(value: bigint | number | string) {
  return typeof value === 'bigint' ? value : BigInt(value);
}

function decodeEligibilityReason(reason: string) {
  const lower = reason.toLowerCase();
  if (lower.includes('wallet not connected')) {
    return 'Connect your wallet to continue.';
  }
  if (
    lower.includes('dropclaimexceedlimit') ||
    (lower.includes('exceed') && lower.includes('limit'))
  ) {
    // Try to extract numbers from the error message (e.g., "2,3" means minted 2, trying for 3rd)
    const numbers = reason.match(/\d+/g);
    if (numbers && numbers.length >= 1) {
      return `You've already minted your maximum allocation (${numbers[0]} NFT${numbers[0] !== '1' ? 's' : ''}). No more mints available for this wallet.`;
    }
    return "You've already minted your maximum allocation for this drop.";
  }
  if (lower.includes('allowlist') || lower.includes('not allowlisted')) {
    return 'Wallet is not on the allowlist for this drop.';
  }
  if (lower.includes('supply')) {
    return 'Not enough supply remaining for this quantity.';
  }
  if (lower.includes('limit') && lower.includes('per wallet')) {
    return 'Wallet has reached the per wallet limit for this drop.';
  }
  if (lower.includes('insufficient') && lower.includes('fund')) {
    return 'Insufficient balance to cover the mint price.';
  }
  if (lower.includes('claim condition not found')) {
    return 'No active claim condition configured yet.';
  }
  return reason;
}

function SocialIconLink({ platform, url }: { platform: string; url: string }) {
  const p = platform.toLowerCase();
  const label = `${platform} link`;
  let IconComp: IconType = FaLink;
  if (p.includes('website') || p.includes('external') || p.includes('site') || p.includes('web'))
    IconComp = FaGlobe;
  if (p.includes('instagram')) IconComp = FaInstagram;
  if (p.includes('discord')) IconComp = FaDiscord;
  if (p === 'x' || p.includes('xtwitter') || p.includes('twitter')) IconComp = FaTwitter;
  return (
    <Box
      as="a"
      href={url}
      target="_blank"
      rel="noreferrer"
      borderWidth="1px"
      borderRadius="0"
      px={2}
      py={1}
      _hover={{ bg: 'whiteAlpha.100' }}
      aria-label={label}
    >
      <Icon as={IconComp} verticalAlign="text-bottom" mr={2} />
      <Text as="span" fontSize="xs" color="gray.300" textTransform="capitalize">
        {platform}
      </Text>
    </Box>
  );
}

// Utilities and UI for Claim Conditions

function formatMaxPerWalletLabel(limit: bigint) {
  if (limit <= 0n || limit === MAX_UINT256) {
    return 'Max per wallet: Unlimited';
  }
  return `Max per wallet: ${limit.toString()}`;
}

function formatCountdownShort(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide" mb={0.5}>
        {label}
      </Text>
      <Text fontWeight="medium" fontSize="sm">
        {value}
      </Text>
    </Box>
  );
}

function ClaimConditionsPanel({
  claimConditions,
  currencySymbol,
  chainDecimals,
  phaseDeadlines,
  activeStartTs,
}: {
  claimConditions:
    | {
        startTimestamp: bigint;
        maxClaimableSupply: bigint;
        supplyClaimed: bigint;
        quantityLimitPerWallet: bigint;
        merkleRoot: string;
        pricePerToken: bigint;
        currency: string;
        metadata: string;
      }[]
    | undefined;
  currencySymbol: string;
  chainDecimals: number;
  phaseDeadlines?: number[];
  activeStartTs?: bigint;
}) {
  const nowSec = Math.floor(Date.now() / 1000);
  const [phaseNames, setPhaseNames] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!claimConditions) return;
      const entries = await Promise.all(
        claimConditions.map(async (cond, idx) => {
          const uri = String(cond.metadata || '');
          // If JSON string was directly in metadata
          if (uri.startsWith('{') || uri.startsWith('[')) {
            try {
              const meta = JSON.parse(uri);
              const nm = meta?.name || meta?.phaseName || meta?.title || '';
              return [idx, typeof nm === 'string' ? nm : ''] as const;
            } catch {
              return [idx, ''] as const;
            }
          }
          // If ipfs/http URL -> fetch JSON
          if (uri.startsWith('ipfs://') || uri.startsWith('http')) {
            try {
              const url = resolveScheme({ client, uri });
              const res = await fetch(url);
              if (!res.ok) return [idx, ''] as const;
              const meta = await res.json().catch(() => undefined);
              const nm = meta?.name || meta?.phaseName || meta?.title || '';
              return [idx, typeof nm === 'string' ? nm : ''] as const;
            } catch {
              return [idx, ''] as const;
            }
          }
          return [idx, ''] as const;
        })
      );
      if (cancelled) return;
      const next: Record<number, string> = {};
      for (const [i, n] of entries) {
        if (n && String(n).trim().length > 0) next[i] = String(n).trim();
      }
      setPhaseNames(next);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [claimConditions]);
  return (
    <Box>
      <Text fontWeight="semibold" mb={4}>
        Claim Conditions
      </Text>
      <Stack spacing={3}>
        {!claimConditions || claimConditions.length === 0 ? (
          <Text color="gray.400" fontSize="sm">
            No claim conditions configured.
          </Text>
        ) : (
          claimConditions.map((cond, idx) => {
            const start = Number(cond.startTimestamp);
            const max = cond.maxClaimableSupply;
            const claimed = cond.supplyClaimed;
            const isUnlimited = max === 0n || max === MAX_UINT256;
            const endedBySupply = !isUnlimited && claimed >= max;
            // Status exclusivamente desde datos del contrato (no usar deadline)
            const hasStarted = nowSec >= start;
            const isLive = hasStarted && !endedBySupply;
            const status = isLive ? 'Live' : !hasStarted ? 'Upcoming' : 'Ended';
            const mintedLabel = isUnlimited
              ? `${claimed.toString()} / ∞`
              : `${claimed.toString()} / ${max.toString()}`;
            const priceLabel =
              cond.pricePerToken && cond.pricePerToken > 0n
                ? `${toTokens(cond.pricePerToken, chainDecimals)} ${currencySymbol}`
                : 'Free';
            const deadline = phaseDeadlines?.[idx];
            const remainingSec =
              typeof deadline === 'number' && deadline > nowSec ? deadline - nowSec : 0;

            // Intentar leer el nombre de fase desde cond.metadata (si es JSON)
            let phaseName = `Phase ${idx + 1}`;
            try {
              if (cond.metadata) {
                const meta = JSON.parse(String(cond.metadata));
                if (typeof meta?.name === 'string' && meta.name.trim().length > 0) {
                  phaseName = meta.name.trim();
                }
                if (typeof meta?.phaseName === 'string' && meta.phaseName.trim().length > 0) {
                  phaseName = meta.phaseName.trim();
                }
              }
            } catch {}

            const perWallet = cond.quantityLimitPerWallet;
            const perWalletLabel =
              perWallet === 0n || perWallet === MAX_UINT256 ? '∞' : perWallet.toString();
            const isAllowlist =
              cond.merkleRoot && /[1-9a-f]/i.test(cond.merkleRoot.replace(/^0x/, ''));
            const isActive =
              typeof activeStartTs === 'bigint' && cond.startTimestamp === activeStartTs;
            const borderProps = isActive
              ? { borderWidth: '2px', borderColor: 'yellow.400' }
              : { borderWidth: '1px', borderColor: 'whiteAlpha.300' };
            const title = phaseNames[idx]?.length ? phaseNames[idx] : `Phase ${idx + 1}`;
            const perWalletValue =
              perWalletLabel === '∞' ? 'Unlimited' : `${perWalletLabel} / wallet`;
            let startDisplay = '-';
            try {
              startDisplay = format(new Date(start * 1000), 'MMM d, yyyy, p');
            } catch {}
            const endsLabel = (() => {
              if (status === 'Ended') return 'Ended';
              if (typeof deadline !== 'number') return '-';
              try {
                return intlFormatDistance(new Date(deadline * 1000), new Date(), {
                  numeric: 'auto',
                  style: 'short',
                });
              } catch {
                return formatCountdownShort(remainingSec);
              }
            })();
            const accessLabel = isAllowlist ? 'Wallet WL' : 'Public';
            return (
              <Box key={idx} {...borderProps} p={{ base: 4, md: 5 }} bg="transparent">
                <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={4}>
                  <Text fontWeight="semibold" fontSize="lg">
                    {title}
                  </Text>
                  <HStack spacing={2} align="center">
                    {isAllowlist && (
                      <Badge variant="outline" colorScheme="purple" borderRadius="full" px={3}>
                        Allowlist
                      </Badge>
                    )}
                    <Badge
                      colorScheme={
                        status === 'Live' ? 'green' : status === 'Upcoming' ? 'yellow' : 'gray'
                      }
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {status}
                    </Badge>
                  </HStack>
                </Flex>

                <Flex
                  mt={3}
                  direction={{ base: 'column', md: 'row' }}
                  gap={{ base: 3, md: 6 }}
                  justify="space-between"
                  align={{ base: 'flex-start', md: 'center' }}
                >
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacingX={6} spacingY={2} flex="1">
                    <KeyValue label="Price" value="Depends on WL" />
                    <KeyValue label="Per wallet" value="Depends on WL" />
                    <KeyValue label="Access" value={accessLabel} />
                    <KeyValue label="Starts" value={startDisplay} />
                  </SimpleGrid>
                  <Flex
                    gap={6}
                    align="center"
                    justify={{ base: 'flex-start', md: 'flex-end' }}
                    flexWrap={{ base: 'wrap', md: 'nowrap' }}
                    minW="fit-content"
                  >
                    <KeyValue label={status === 'Ended' ? 'Ended' : 'Ends in'} value={endsLabel} />
                    <Box>
                      <Text
                        color="gray.500"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="wide"
                        mb={1}
                      >
                        Minted
                      </Text>
                      <Text fontWeight="bold" fontSize="lg">
                        {mintedLabel}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            );
          })
        )}
      </Stack>
    </Box>
  );
}
