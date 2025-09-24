'use client';

import { useMemo } from 'react';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { NATIVE_TOKEN_ADDRESS } from 'thirdweb';
import { useContractEvents, useReadContract } from 'thirdweb/react';
import { newSaleEvent } from 'thirdweb/extensions/marketplace';
import { getAllOwners } from 'thirdweb/extensions/erc721';
import { toTokens } from 'thirdweb/utils';

export type CollectionStats = {
  floorDisplay: string | undefined;
  volumeDisplay: string | undefined;
  listed: number;
  supplyDisplay: string;
  ownersDisplay: string | undefined; // 'N/A' for ERC1155 handled at render site
  isLoading: boolean;
};

export function useCollectionStats(): CollectionStats {
  const { nftContract, marketplaceContract, listingsInSelectedCollection, supplyInfo, type } =
    useMarketplaceContext();

  // Floor price from active listings, prioritizing native currency listings
  const floorDisplay = useMemo(() => {
    if (!listingsInSelectedCollection?.length) return undefined;
    const nativeListings = listingsInSelectedCollection.filter(
      (l) => l.currencyValuePerToken.tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS
    );
    const pool = nativeListings.length ? nativeListings : listingsInSelectedCollection;
    const min = pool.reduce((acc, curr) => {
      if (!acc) return curr;
      return curr.currencyValuePerToken.value < acc.currencyValuePerToken.value ? curr : acc;
    }, pool[0]);
    return `${min.currencyValuePerToken.displayValue} ${min.currencyValuePerToken.symbol}`;
  }, [listingsInSelectedCollection]);

  // Listed vs Supply
  const { listed, supplyBn } = useMemo(() => {
    const listedUniqueCount = new Set(
      (listingsInSelectedCollection || []).map((l) => l.tokenId.toString())
    ).size;
    const supply = supplyInfo ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n : 0n;
    return { listed: listedUniqueCount, supplyBn: supply };
  }, [listingsInSelectedCollection, supplyInfo]);

  // Owners (ERC721 only, cap query to first 500 to limit RPC load)
  const totalItems = useMemo(() => {
    const total = supplyInfo ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n : 0n;
    const n = Number(total);
    return Number.isFinite(n) ? Math.min(n, 500) : 0;
  }, [supplyInfo]);

  const { data: ownersChunk, isLoading: loadingOwners } = useReadContract(
    type === 'ERC721' ? getAllOwners : (undefined as unknown as typeof getAllOwners),
    {
      contract: nftContract,
      start: Number(supplyInfo?.startTokenId ?? 0n),
      count: totalItems || 0,
      queryOptions: { enabled: type === 'ERC721' && totalItems > 0 },
    }
  );

  const ownersDisplay = useMemo(() => {
    if (type !== 'ERC721') return undefined;
    const owners = new Set((ownersChunk || []).map((o) => o.owner.toLowerCase()));
    const fullSupply = supplyInfo ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n : 0n;
    if (fullSupply > BigInt(totalItems)) return `${owners.size}+`;
    return `${owners.size}`;
  }, [ownersChunk, supplyInfo, totalItems, type]);

  // Volume = sum of NewSale events amounts (native token assumed)
  const chainDecimals = nftContract.chain.nativeCurrency?.decimals ?? 18;
  const nativeSymbol = nftContract.chain.nativeCurrency?.symbol ?? '';
  const { data: saleEvents, isLoading: loadingSales } = useContractEvents({
    contract: marketplaceContract!,
    blockRange: 200000,
    events: [newSaleEvent({ assetContract: nftContract.address })],
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
    listed,
    supplyDisplay: supplyBn.toString(),
    ownersDisplay,
    isLoading: loadingOwners || loadingSales,
  };
}
