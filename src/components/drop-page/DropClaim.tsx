'use client';
import { DropHero } from '@/components/drop-page/DropHero';
import { DropStats } from '@/components/drop-page/DropStats';
import { ClaimAction } from '@/components/drop-page/ClaimAction';
import { ClaimControls } from '@/components/drop-page/ClaimControls';
import { useNftDropContext } from '@/hooks/useNftDropContext';
import { Box, Flex, Heading, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  useActiveAccount,
  useActiveWalletChain,
  useConnectModal,
  useSwitchActiveWalletChain,
} from 'thirdweb/react';
import { canClaim } from 'thirdweb/extensions/erc721';
import { toTokens } from 'thirdweb/utils';
import { useEffect, useMemo, useState } from 'react';

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
  const { open: openConnectModal } = useConnectModal();

  const [quantity, setQuantity] = useState(1);

  const maxClaimable = useMemo(() => {
    if (!activeClaimCondition) {
      return 0n;
    }
    const limits: bigint[] = [];
    const phaseRemaining =
      activeClaimCondition.maxClaimableSupply > 0n
        ? activeClaimCondition.maxClaimableSupply - activeClaimCondition.supplyClaimed
        : null;
    if (phaseRemaining && phaseRemaining > 0n) {
      limits.push(phaseRemaining);
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

  return (
    <Flex direction="column" gap={10} maxW="7xl" mx="auto" px={{ base: 4, md: 8 }}>
      <Stack spacing={8}>
        <Heading>Drop Claim</Heading>
        {activeClaimErrorMessage && (
          <Box borderWidth="1px" borderRadius="lg" p={4} borderColor="orange.500">
            <Text color="orange.200">{activeClaimErrorMessage}</Text>
          </Box>
        )}
        <DropHero
          drop={drop}
          contractMetadata={contractMetadata}
          sharePath={sharePath}
          isLoading={isLoading}
        />
        <DropStats
          totalClaimed={totalClaimed}
          totalUnclaimed={totalUnclaimed}
          isLoading={isLoading}
          startsInSeconds={startsInSeconds}
          isDropReady={isDropReady}
          priceDisplay={pricePerTokenDisplay}
          currencySymbol={currencySymbol}
        />
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box flex="1" minW={0}>
            <ClaimControls
              quantity={quantity}
              onDecrement={() => setQuantity((prev) => Math.max(prev - 1, 1))}
              onIncrement={() => setQuantity((prev) => Math.min(prev + 1, maxQuantityNumber))}
              maxQuantity={maxQuantityNumber}
              pricePerTokenDisplay={pricePerTokenDisplay}
              totalPriceDisplay={totalPriceDisplay}
              currencySymbol={currencySymbol}
              eligibilityMessage={parsedEligibilityReason}
              isCheckingEligibility={eligibilityQuery.isLoading || eligibilityQuery.isFetching}
              isSoldOut={isSoldOut}
              isDropReady={isDropReady}
              maxPerWalletLabel={maxPerWalletLabel}
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
                  onConnect={() => openConnectModal?.()}
                  onSwitchChain={() => switchChain(drop.chain)}
                  isCheckingEligibility={eligibilityQuery.isLoading || eligibilityQuery.isFetching}
                  refreshEligibility={() => eligibilityQuery.refetch()}
                  chainName={drop.chain.name ?? 'Target Chain'}
                />
              }
            />
          </Box>
          <Box flex="1" minW={0}>
            <Skeleton isLoaded={!isLoading} borderRadius="lg" minH="200px" p={6}>
              <Stack spacing={4}>
                <Heading size="md">Claim Conditions</Heading>
                {claimConditions?.length ? (
                  claimConditions.map((condition, index) => (
                    <Box key={index} borderWidth="1px" borderRadius="lg" p={4}>
                      <Text fontWeight="semibold">Phase {index + 1}</Text>
                      <Text fontSize="sm" color="gray.400">
                        Max supply: {condition.maxClaimableSupply.toString()}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        Claimed: {condition.supplyClaimed.toString()}
                      </Text>
                    </Box>
                  ))
                ) : (
                  <Text color="gray.400">No additional claim conditions configured.</Text>
                )}
              </Stack>
            </Skeleton>
          </Box>
        </Flex>
      </Stack>
    </Flex>
  );
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
