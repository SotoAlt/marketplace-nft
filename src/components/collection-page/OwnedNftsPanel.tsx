'use client';

import { OwnedItem } from '@/components/profile-page/OwnedItem';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { Box, SimpleGrid, Text, useBreakpointValue } from '@chakra-ui/react';
import type { NFT } from 'thirdweb';

type Props = {
  ownedNfts: NFT[] | undefined;
  isLoading: boolean;
  accountAddress?: string;
};

export function OwnedNftsPanel(props: Props) {
  const { ownedNfts, isLoading, accountAddress } = props;
  const { nftContract } = useMarketplaceContext();
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }) ?? 1;

  if (!accountAddress) {
    return (
      <Box p={4}>
        <Text>Connect your wallet to see the NFTs you own in this collection.</Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>Loading your NFTs...</Text>
      </Box>
    );
  }

  if (!ownedNfts?.length) {
    return (
      <Box p={4}>
        <Text>You don&apos;t own any NFTs in this collection yet.</Text>
        <Text mt={3} fontSize="sm" color="gray.400">
          Tip: Open a token detail and choose &quot;List for sale&quot; to create a listing.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text mb={3} fontSize="sm" color="gray.400">
        Tip: Open a token detail and choose &quot;List for sale&quot; to create a listing.
      </Text>
      <SimpleGrid columns={columns} spacing={4}>
        {ownedNfts.map((nft) => (
          <OwnedItem
            key={nft.id.toString()}
            nftCollection={nftContract}
            nft={nft}
            actionButtonLabel="SELL"
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
