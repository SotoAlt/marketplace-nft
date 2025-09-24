'use client';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { SimpleGrid, useBreakpointValue } from '@chakra-ui/react';
import { NFTCard } from './NFTCard';

export function ListingGrid() {
  const { listingsInSelectedCollection, nftContract } = useMarketplaceContext();
  const len = listingsInSelectedCollection.length;
  const columns = useBreakpointValue({
    base: 1,
    sm: Math.min(len, 2),
    md: Math.min(len, 4),
    lg: Math.min(len, 4),
    xl: Math.min(len, 5),
  });

  if (!listingsInSelectedCollection || !len) return <></>;

  return (
    <SimpleGrid columns={columns} spacing={4} p={4} mx="auto" mt="20px">
      {listingsInSelectedCollection.map((item) => (
        <NFTCard
          key={item.id}
          nft={{
            id: item.asset.id,
            metadata: item.asset.metadata,
          }}
          href={`/collection/${nftContract.chain.id}/${
            nftContract.address
          }/token/${item.asset.id.toString()}`}
          showPrice={true}
          price={{
            displayValue: item.currencyValuePerToken.displayValue,
            symbol: item.currencyValuePerToken.symbol,
          }}
        />
      ))}
    </SimpleGrid>
  );
}
