'use client';

import { useNftDropContext } from '@/hooks/useNftDropContext';
import { Button, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { sendAndConfirmTransaction } from 'thirdweb';
import { claimTo } from 'thirdweb/extensions/erc721';
import { getApprovalForTransaction } from 'thirdweb/extensions/erc20';
import type { Account } from 'thirdweb/wallets';

export function ClaimAction({
  quantity,
  account,
  isConnected,
  isCorrectChain,
  isDropReady,
  isSoldOut,
  canClaim,
  eligibilityReason,
  startsInSeconds,
  currencySymbol,
  totalPriceDisplay,
  onConnect,
  onSwitchChain,
  isCheckingEligibility,
  refreshEligibility,
  chainName,
}: {
  quantity: number;
  account: Account | undefined;
  isConnected: boolean;
  isCorrectChain: boolean;
  isDropReady: boolean;
  isSoldOut: boolean;
  canClaim: boolean;
  eligibilityReason: string | null;
  startsInSeconds: number | null;
  currencySymbol: string;
  totalPriceDisplay: string;
  onConnect: () => void;
  onSwitchChain: () => Promise<void>;
  isCheckingEligibility: boolean;
  refreshEligibility: () => Promise<unknown> | void;
  chainName: string;
}) {
  const toast = useToast();
  const { contract, refetch, isERC20Currency, currencyAddress, drop } =
    useNftDropContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  let buttonLabel = `Mint (${totalPriceDisplay} ${
    totalPriceDisplay !== 'Free' ? currencySymbol : ''
  })`;
  let onClick: (() => Promise<void> | void) | undefined;
  let isDisabled = false;

  if (!isConnected) {
    buttonLabel = 'Connect Wallet';
    onClick = onConnect;
  } else if (!isCorrectChain) {
    buttonLabel = `Switch to ${chainName}`;
    onClick = async () => {
      setIsSwitching(true);
      try {
        await onSwitchChain();
      } finally {
        setIsSwitching(false);
      }
    };
  } else if (isSoldOut) {
    buttonLabel = 'Sold Out';
    isDisabled = true;
  } else if (!isDropReady) {
    buttonLabel =
      startsInSeconds && startsInSeconds > 0
        ? `Starts in ${formatCountdown(startsInSeconds)}`
        : 'Coming Soon';
    isDisabled = true;
  } else if (isCheckingEligibility) {
    buttonLabel = 'Checking eligibility...';
    isDisabled = true;
  } else if (!canClaim) {
    // Use shorter label for button if it's the allocation exceeded message
    if (eligibilityReason?.includes('already minted your maximum allocation')) {
      buttonLabel = 'Allocation Reached';
    } else {
      buttonLabel = eligibilityReason ?? 'Not Eligible';
    }
    isDisabled = true;
  } else if (quantity === 0) {
    buttonLabel = 'Select quantity';
    isDisabled = true;
  } else {
    onClick = async () => {
      if (!account) return;
      setIsProcessing(true);
      try {
        // Prepare claim transaction once to reuse during optional approval + mint
        const transaction = claimTo({
          contract,
          to: account.address,
          from: account.address,
          quantity: BigInt(quantity),
        });

        // Trigger ERC20 approval flow when necessary before minting
        if (isERC20Currency && currencyAddress) {
          const approvalTransaction = await getApprovalForTransaction({
            transaction,
            account,
          });

          if (approvalTransaction) {
            toast({
              title: 'Approval required',
              description: 'Approving token spending...',
              status: 'info',
              duration: 3000,
              isClosable: true,
            });

            await sendAndConfirmTransaction({
              transaction: approvalTransaction,
              account,
            });

            toast({
              title: 'Approval successful',
              description: 'Now proceeding with minting...',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }
        }

        // Proceed with claiming
        await sendAndConfirmTransaction({ transaction, account });
        toast({
          title: 'Mint successful',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        await Promise.allSettled([
          refetch.metadata(),
          refetch.activeClaimCondition(),
          refetch.claimConditions(),
          refetch.totalClaimed(),
          refetch.totalUnclaimed(),
        ]);
        await refreshEligibility();
      } catch (error) {
        const message = parseClaimError(error);
        toast({
          title: 'Mint failed',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsProcessing(false);
      }
    };
  }

  const isLoading = isProcessing || isSwitching;

  return (
    <Button
      colorScheme="purple"
      height="56px"
      borderRadius="0"
      onClick={onClick}
      isLoading={isLoading}
      isDisabled={isDisabled || !onClick}
    >
      {buttonLabel}
    </Button>
  );
}

function parseClaimError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();
  if (lower.includes('insufficient') && lower.includes('fund')) {
    return 'Insufficient balance to cover the mint price.';
  }
  if (lower.includes('insufficient') && lower.includes('balance')) {
    return 'Insufficient token balance. Please ensure you have enough USDT0 tokens.';
  }
  if (lower.includes('allowance') || lower.includes('approve')) {
    console.log("lood", lower)
    return 'Token approval required. Please approve the contract to spend your tokens.';
  }
  if (lower.includes('allowlist') || lower.includes('not allowlisted')) {
    return 'Wallet is not on the allowlist for this drop.';
  }
  if (lower.includes('not enough') && lower.includes('supply')) {
    return 'Not enough supply remaining for this quantity.';
  }
  return raw;
}

function formatCountdown(seconds: number) {
  const clamped = Math.max(seconds, 0);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = Math.floor(clamped % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
