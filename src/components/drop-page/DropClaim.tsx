'use client';
import { ClaimAction } from '@/components/drop-page/ClaimAction';
import { ClaimControls } from '@/components/drop-page/ClaimControls';
import { client, NFT_PLACEHOLDER_IMAGE } from '@/consts/client';
import { useNftDropContext } from '@/hooks/useNftDropContext';
import {
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Progress,
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
import { canClaim } from 'thirdweb/extensions/erc721';
import { toTokens } from 'thirdweb/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { MediaRenderer } from 'thirdweb/react';
import {
  CardBody as TiltBody,
  CardContainer as TiltContainer,
  CardItem as TiltItem,
} from '@/components/ui/3d-card';
import { Icon } from '@chakra-ui/react';
import { FaDiscord, FaGlobe, FaInstagram, FaTwitter, FaLink } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

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
  } = useNftDropContext();

  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const { connect } = useConnectModal();
  const handleConnect = useCallback(() => {
    void connect({ client });
  }, [connect]);

  const [quantity, setQuantity] = useState(1);

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
    if (activeClaimCondition.quantityLimitPerWallet > 0n) {
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
  }, [activeClaimCondition, totalUnclaimed]);

  const maxQuantityNumber = useMemo(() => {
    if (maxClaimable <= 0n) {
      return 1;
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

  const chainDecimals = drop.chain.nativeCurrency?.decimals ?? 18;
  const pricePerToken =
    activeClaimCondition?.pricePerToken && activeClaimCondition.pricePerToken > 0n
      ? toTokens(activeClaimCondition.pricePerToken, chainDecimals)
      : '0';
  const pricePerTokenDisplay =
    activeClaimCondition?.pricePerToken && activeClaimCondition.pricePerToken > 0n
      ? pricePerToken
      : 'Free';
  const totalPriceDisplay =
    activeClaimCondition?.pricePerToken && activeClaimCondition.pricePerToken > 0n
      ? toTokens(activeClaimCondition.pricePerToken * BigInt(quantity), chainDecimals)
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
    if (eligibilityResult?.result) {
      return `Wallet eligible. You can mint up to ${maxQuantityNumber} item${
        maxQuantityNumber > 1 ? 's' : ''
      }.`;
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
    drop.chain.name,
  ]);

  const sharePath = `/drop/${drop.chain.id}/${drop.address}`;

  const maxPerWalletLabel =
    activeClaimCondition && activeClaimCondition.quantityLimitPerWallet > 0n
      ? `Max per wallet: ${activeClaimCondition.quantityLimitPerWallet.toString()}`
      : null;

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
                          Public
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
                        currencySymbol={currencySymbol}
                        eligibilityMessage={parsedEligibilityReason}
                        isCheckingEligibility={
                          eligibilityQuery.isLoading || eligibilityQuery.isFetching
                        }
                        isSoldOut={isSoldOut}
                        isDropReady={isDropReady}
                        maxPerWalletLabel={maxPerWalletLabel}
                        withContainer={false}
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
                            currencySymbol={currencySymbol}
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
