'use client';

import { useNftDropContext } from '@/hooks/useNftDropContext';
import { Button, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { sendAndConfirmTransaction, getContract } from 'thirdweb';
import { approve } from 'thirdweb/extensions/erc20';
import type { Account } from 'thirdweb/wallets';
import { client } from '@/consts/client';

export function ApprovalButton({
  account,
  isConnected,
  isCorrectChain,
  isDropReady,
  onConnect,
  onSwitchChain,
  chainName,
}: {
  account: Account | undefined;
  isConnected: boolean;
  isCorrectChain: boolean;
  isDropReady: boolean;
  onConnect: () => void;
  onSwitchChain: () => Promise<void>;
  chainName: string;
}) {
  const toast = useToast();
  const { contract, isERC20Currency, currencyAddress, drop } = useNftDropContext();
  const [isApproving, setIsApproving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // USDT0 has 6 decimals, so 100 USDT0 = 100 * 10^6 = 100,000,000
  const APPROVAL_AMOUNT = 100n * 1000000n; // 100 USDT0 tokens

  let buttonLabel = 'Approve 100 USDT0';
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
  } else {
    // Always enable the approval button when connected and on correct chain
    onClick = async () => {
      if (!account) return;
      setIsApproving(true);
      try {
        // Always use hardcoded USDT0 contract for Plasma
        const usdtContract = getContract({
          client,
          chain: drop.chain,
          address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT0 on Plasma
        });

        const approvalTransaction = approve({
          contract: usdtContract,
          spender: contract.address,
          amount: APPROVAL_AMOUNT.toString(),
        });

        toast({
          title: 'Approval started',
          description: 'Approving 100 USDT0 for spending...',
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
          description: 'Successfully approved 100 USDT0 for spending',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        const message = parseApprovalError(error);
        toast({
          title: 'Approval failed',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsApproving(false);
      }
    };
  }

  // Always show the button for better UX

  const isLoading = isApproving || isSwitching;

  return (
    <Button
      colorScheme="purple"
      variant="outline"
      height="56px"
      borderRadius="0"
      onClick={onClick}
      isLoading={isLoading}
      isDisabled={isDisabled || !onClick}
      width="100%"
    >
      {buttonLabel}
    </Button>
  );
}

function parseApprovalError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();
  
  if (lower.includes('insufficient') && lower.includes('fund')) {
    return 'Insufficient ETH/XPL for gas fees.';
  }
  if (lower.includes('user rejected') || lower.includes('user denied')) {
    return 'Transaction was cancelled by user.';
  }
  if (lower.includes('network') || lower.includes('connection')) {
    return 'Network connection error. Please try again.';
  }
  
  return 'Approval failed. Please try again.';
}