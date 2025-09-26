import { client, NFT_PLACEHOLDER_IMAGE } from '@/consts/client';
import { Link } from '@chakra-ui/next-js';
import { Box, Text } from '@chakra-ui/react';
import type { NFT, ThirdwebContract } from 'thirdweb';
import { MediaRenderer } from 'thirdweb/react';

export function OwnedItem(props: { nft: NFT; nftCollection: ThirdwebContract }) {
  const { nft, nftCollection } = props;
  return (
    <Box
      as={Link}
      href={`/collection/${nftCollection.chain.id}/${
        nftCollection.address
      }/token/${nft.id.toString()}`}
      bg="gray.800"
      border="1px solid"
      borderColor="gray.700"
      boxShadow="md"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{
        textDecoration: 'none',
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
      maxW="280px"
      w="full"
    >
      <MediaRenderer
        client={client}
        src={nft.metadata.image || NFT_PLACEHOLDER_IMAGE}
        style={{ width: '100%', aspectRatio: '0.9', objectFit: 'cover' }}
      />
      <Box p={3}>
        <Text fontWeight="bold" fontSize="lg" color="white" noOfLines={1} mb={1}>
          {nft.metadata?.name ?? 'Unknown item'}
        </Text>
        <Text fontSize="sm" color="gray.400">
          #{nft.id.toString()}
        </Text>
      </Box>
    </Box>
  );
}
