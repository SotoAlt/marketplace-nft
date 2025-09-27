'use client';
import { type DirectListing } from 'thirdweb/extensions/marketplace';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { SimpleGrid, useBreakpointValue } from '@chakra-ui/react';
import { NFTCard } from './NFTCard';

type ListingGridProps = {
  listings?: DirectListing[];
};

export function ListingGrid({ listings = [] }: ListingGridProps) {
  const { nftContract } = useMarketplaceContext();
  const len = listings.length;
  const columns = useBreakpointValue({
    base: 1,
    sm: Math.min(len, 2),
    md: Math.min(len, 4),
    lg: Math.min(len, 4),
    xl: Math.min(len, 5),
  });

  if (!len) return <></>;

  return (
    <SimpleGrid columns={columns} spacing={4} p={4} mx="auto" mt="20px">
      {listings.map((item, index) => (
        <NFTCard
          key={item.id}
          nft={{
            id: item.asset.id,
            metadata: item.asset.metadata,
          }}
          contract={nftContract}
          href={`/collection/${nftContract.chain.id}/${
            nftContract.address
          }/token/${item.asset.id.toString()}`}
          showPrice={true}
          price={{
            displayValue: item.currencyValuePerToken.displayValue,
            symbol: item.currencyValuePerToken.symbol,
          }}
          actionButtonLabel="BUY"
          index={index}
        />
      ))}
    </SimpleGrid>
  );
}
