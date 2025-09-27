'use client';

import { useMemo } from 'react';
import { getContract, NATIVE_TOKEN_ADDRESS } from 'thirdweb';
import { useContractEvents, useReadContract } from 'thirdweb/react';
import { newSaleEvent, getAllValidListings } from 'thirdweb/extensions/marketplace';
import { getAllOwners } from 'thirdweb/extensions/erc721';
import { toTokens } from 'thirdweb/utils';
import { client } from '@/consts/client';
import { MARKETPLACE_CONTRACTS } from '@/consts/marketplace_contract';
import type { NftContract } from '@/consts/nft_contracts';

export type CollectionCardStats = {
  floorDisplay: string | undefined;
  volumeDisplay: string | undefined;
  isLoading: boolean;
};

export function useCollectionCardStats(item: NftContract): CollectionCardStats {
  // Create contracts
  const nftContract = useMemo(
    () =>
      getContract({
        client,
        chain: item.chain,
        address: item.address,
      }),
    [item]
  );

  const marketplaceContract = useMemo(() => {
    const marketplaceInfo = MARKETPLACE_CONTRACTS.find((m) => m.chain.id === item.chain.id);
    if (!marketplaceInfo) return undefined;

    return getContract({
      client,
      chain: item.chain,
      address: marketplaceInfo.address,
    });
  }, [item]);

  // Get all listings for this collection
  const { data: allListings, isLoading: loadingListings } = useReadContract(getAllValidListings, {
    contract: marketplaceContract!,
    start: 0,
    count: 50n, // Reduce to 50 listings for better performance
    queryOptions: {
      enabled: !!marketplaceContract,
    },
  });

  // Filter listings for this specific collection and calculate floor price
  const floorDisplay = useMemo(() => {
    if (!allListings?.length) return undefined;

    // Filter listings for this collection
    const collectionListings = allListings.filter(
      (listing) => listing.assetContractAddress.toLowerCase() === item.address.toLowerCase()
    );

    if (!collectionListings.length) return undefined;

    // Prioritize native currency listings
    const nativeListings = collectionListings.filter(
      (l) => l.currencyContractAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS
    );
    const pool = nativeListings.length ? nativeListings : collectionListings;

    // Find minimum price
    const min = pool.reduce((acc, curr) => {
      if (!acc) return curr;
      return curr.pricePerToken < acc.pricePerToken ? curr : acc;
    }, pool[0]);

    const chainDecimals = item.chain.nativeCurrency?.decimals ?? 18;
    const nativeSymbol = item.chain.nativeCurrency?.symbol ?? 'ETH';

    return `${toTokens(min.pricePerToken, chainDecimals)} ${nativeSymbol}`;
  }, [allListings, item.address, item.chain]);

  // Get volume from sale events
  const chainDecimals = nftContract.chain.nativeCurrency?.decimals ?? 18;
  const nativeSymbol = nftContract.chain.nativeCurrency?.symbol ?? 'ETH';

  const { data: saleEvents, isLoading: loadingSales } = useContractEvents({
    contract: marketplaceContract!,
    blockRange: 10000, // Reduce to 10k blocks for better performance
    events: marketplaceContract ? [newSaleEvent({ assetContract: nftContract.address })] : [],
    enabled: !!marketplaceContract && !!nftContract,
    watch: false,
  });

  const volumeDisplay = useMemo(() => {
    if (!saleEvents?.length) return undefined;
    const sum = saleEvents.reduce((acc, ev) => {
      const amt = (ev.args?.totalPricePaid as bigint) ?? 0n;
      return acc + amt;
    }, 0n);
    return `${toTokens(sum, chainDecimals)} ${nativeSymbol}`.trim();
  }, [saleEvents, chainDecimals, nativeSymbol]);

  return {
    floorDisplay,
    volumeDisplay,
    isLoading: loadingListings || loadingSales,
  };
}
