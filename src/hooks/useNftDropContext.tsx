'use client';

import { client } from '@/consts/client';
import { DROP_CONTRACTS, type DropContract } from '@/consts/drop_contracts';
import { SUPPORTED_TOKENS } from '@/consts/supported_tokens';
import { Box, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import type { Abi, AbiFunction } from 'abitype';
import { type ReactNode, createContext, useContext, useMemo } from 'react';
import { getContract, type ThirdwebContract, NATIVE_TOKEN_ADDRESS } from 'thirdweb';
import { resolveContractAbi } from 'thirdweb/contract';
import { getContractMetadata } from 'thirdweb/extensions/common';
import {
  getActiveClaimCondition,
  getClaimConditions,
  getTotalClaimedSupply,
  getTotalUnclaimedSupply,
  isClaimToSupported,
  isERC721,
} from 'thirdweb/extensions/erc721';
import { decimals, getSymbol } from 'thirdweb/extensions/erc20';
import { useReadContract } from 'thirdweb/react';
import { toFunctionSelector } from 'thirdweb/utils';

type ClaimCondition = {
  startTimestamp: bigint;
  maxClaimableSupply: bigint;
  supplyClaimed: bigint;
  quantityLimitPerWallet: bigint;
  merkleRoot: string;
  pricePerToken: bigint;
  currency: string;
  metadata: string;
};

type NftDropContextValue = {
  contract: ThirdwebContract;
  drop: DropContract;
  contractMetadata:
    | {
        [key: string]: unknown;
        name?: string;
        description?: string;
        image?: string;
      }
    | undefined;
  activeClaimCondition: ClaimCondition | undefined;
  activeClaimError: Error | null;
  claimConditions: ClaimCondition[] | undefined;
  totalClaimed: bigint | undefined;
  totalUnclaimed: bigint | undefined;
  isLoading: boolean;
  isCheckingSupport: boolean;
  isDropReady: boolean;
  isSoldOut: boolean;
  startsInSeconds: number | null;
  currencySymbol: string;
  currencyAddress: string | undefined;
  currencyDecimals: number;
  isERC20Currency: boolean;
  refetch: {
    metadata: () => Promise<unknown>;
    activeClaimCondition: () => Promise<unknown>;
    claimConditions: () => Promise<unknown>;
    totalClaimed: () => Promise<unknown>;
    totalUnclaimed: () => Promise<unknown>;
  };
};

const NftDropContext = createContext<NftDropContextValue | undefined>(undefined);

export default function NftDropProvider({
  children,
  chainId,
  contractAddress,
}: {
  children: ReactNode;
  chainId: string;
  contractAddress: string;
}) {
  const parsedChainId = Number.parseInt(chainId, 10);
  if (Number.isNaN(parsedChainId)) {
    throw new Error('Invalid chain ID provided for drop page');
  }

  const drop = DROP_CONTRACTS.find(
    (entry) =>
      entry.chain.id === parsedChainId &&
      entry.address.toLowerCase() === contractAddress.toLowerCase()
  );

  if (!drop) {
    throw new Error('Drop configuration not found for this route');
  }

  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: drop.chain,
        address: drop.address,
      }),
    [drop]
  );

  const {
    data: selectors,
    isLoading: isLoadingSelectors,
    error: selectorsError,
  } = useQuery({
    queryKey: ['drop', 'selectors', drop.chain.id, drop.address.toLowerCase()],
    queryFn: async () => {
      // Keeping this resolver ensures we can swap contracts later without changing the UI logic.
      const abi = (await resolveContractAbi(contract)) as Abi;
      return (abi.filter((item) => item.type === 'function') as AbiFunction[]).map((fn) =>
        toFunctionSelector(fn)
      );
    },
  });

  if (selectorsError) {
    throw selectorsError instanceof Error
      ? selectorsError
      : new Error('Failed to resolve contract ABI');
  }

  const claimSupported = selectors ? isClaimToSupported(selectors) : false;

  const { data: isERC721Contract, isLoading: isLoadingErc721 } = useReadContract(isERC721, {
    contract,
    queryOptions: {
      retry: 0,
    },
  });

  const shouldEnableDropsQueries = Boolean(claimSupported);

  const {
    data: contractMetadata,
    isLoading: isLoadingMetadata,
    refetch: refetchMetadata,
  } = useReadContract(getContractMetadata, {
    contract,
    queryOptions: {
      enabled: shouldEnableDropsQueries,
    },
  });

  const {
    data: activeClaimCondition,
    error: activeClaimError,
    isLoading: isLoadingActiveClaimCondition,
    refetch: refetchActiveClaimCondition,
  } = useReadContract(getActiveClaimCondition, {
    contract,
    queryOptions: {
      enabled: shouldEnableDropsQueries,
      retry: 0,
    },
  });

  const {
    data: claimConditions,
    isLoading: isLoadingClaimConditions,
    refetch: refetchClaimConditions,
  } = useReadContract(getClaimConditions, {
    contract,
    queryOptions: {
      enabled: shouldEnableDropsQueries,
      retry: 0,
    },
  });

  const {
    data: totalClaimed,
    isLoading: isLoadingTotalClaimed,
    refetch: refetchTotalClaimed,
  } = useReadContract(getTotalClaimedSupply, {
    contract,
    queryOptions: {
      enabled: shouldEnableDropsQueries,
    },
  });

  const {
    data: totalUnclaimed,
    isLoading: isLoadingTotalUnclaimed,
    refetch: refetchTotalUnclaimed,
  } = useReadContract(getTotalUnclaimedSupply, {
    contract,
    queryOptions: {
      enabled: shouldEnableDropsQueries,
    },
  });

  // Determine if we're using ERC20 currency
  const isERC20Currency = useMemo(() => {
    if (!activeClaimCondition) return false;
    const currencyAddress = activeClaimCondition.currency.toLowerCase();
    return (
      currencyAddress !== NATIVE_TOKEN_ADDRESS.toLowerCase() &&
      currencyAddress !== '0x0000000000000000000000000000000000000000'
    );
  }, [activeClaimCondition]);

  // Get ERC20 token details
  const currencyContract = useMemo(() => {
    if (!isERC20Currency || !activeClaimCondition) return undefined;
    return getContract({
      client,
      chain: drop.chain,
      address: activeClaimCondition.currency,
    });
  }, [isERC20Currency, activeClaimCondition, drop.chain]);

  const { data: tokenSymbol, isLoading: isLoadingSymbol } = useReadContract(getSymbol, {
    contract: currencyContract!,
    queryOptions: {
      enabled: !!currencyContract,
    },
  });

  const { data: tokenDecimals, isLoading: isLoadingDecimals } = useReadContract(decimals, {
    contract: currencyContract!,
    queryOptions: {
      enabled: !!currencyContract,
    },
  });

  if (!isLoadingSelectors && claimSupported === false) {
    throw new Error('Drop contract does not support claimTo operations');
  }

  if (!isLoadingErc721 && isERC721Contract === false) {
    throw new Error('Configured contract is not an ERC721 contract');
  }

  const isSoldOut = totalUnclaimed !== undefined && totalUnclaimed <= 0n;

  const nowInSeconds = BigInt(Math.floor(Date.now() / 1000));
  const startsInSeconds = activeClaimCondition
    ? Number(activeClaimCondition.startTimestamp - nowInSeconds)
    : null;

  const isDropReady = activeClaimCondition
    ? activeClaimCondition.startTimestamp <= nowInSeconds
    : false;

  const isLoading =
    isLoadingSelectors ||
    isLoadingErc721 ||
    isLoadingMetadata ||
    isLoadingActiveClaimCondition ||
    isLoadingClaimConditions ||
    isLoadingTotalClaimed ||
    isLoadingTotalUnclaimed ||
    (isERC20Currency && (isLoadingSymbol || isLoadingDecimals));

  // Determine the currency symbol
  const currencySymbol = useMemo(() => {
    if (isERC20Currency && tokenSymbol) {
      return tokenSymbol;
    }
    return drop.chain.nativeCurrency?.symbol ?? 'TOKEN';
  }, [isERC20Currency, tokenSymbol, drop.chain.nativeCurrency]);

  // Determine the currency decimals
  const currencyDecimals = useMemo(() => {
    if (isERC20Currency && tokenDecimals !== undefined) {
      return Number(tokenDecimals);
    }
    return drop.chain.nativeCurrency?.decimals ?? 18;
  }, [isERC20Currency, tokenDecimals, drop.chain.nativeCurrency]);

  const contextValue: NftDropContextValue = {
    contract,
    drop,
    contractMetadata,
    activeClaimCondition,
    activeClaimError: activeClaimError instanceof Error ? activeClaimError : null,
    claimConditions,
    totalClaimed,
    totalUnclaimed,
    isLoading,
    isCheckingSupport: isLoadingSelectors || isLoadingErc721,
    isDropReady,
    isSoldOut,
    startsInSeconds: startsInSeconds !== null ? Math.max(startsInSeconds, 0) : null,
    currencySymbol,
    currencyAddress: activeClaimCondition?.currency,
    currencyDecimals,
    isERC20Currency,
    refetch: {
      metadata: refetchMetadata,
      activeClaimCondition: refetchActiveClaimCondition,
      claimConditions: refetchClaimConditions,
      totalClaimed: refetchTotalClaimed,
      totalUnclaimed: refetchTotalUnclaimed,
    },
  };

  console.log('DROP CONTRACT METADATA >>>', {
    claimConditions,
    activeClaimCondition,
  });

  return (
    <NftDropContext.Provider value={contextValue}>
      {children}
      {isLoading && (
        <Box
          position="fixed"
          bottom="10px"
          right="10px"
          backgroundColor="rgba(0, 0, 0, 0.7)"
          padding="10px"
          borderRadius="md"
          zIndex={1000}
        >
          <Spinner size="lg" color="purple" />
        </Box>
      )}
    </NftDropContext.Provider>
  );
}

export function useNftDropContext() {
  const context = useContext(NftDropContext);
  if (!context) {
    throw new Error('useNftDropContext must be used inside NftDropProvider');
  }
  return context;
}
