import { client } from '@/consts/client';
import { Link } from '@chakra-ui/next-js';
import { Box, Text, HStack } from '@chakra-ui/react';
import { MediaRenderer } from 'thirdweb/react';

interface NFTCardProps {
  nft: {
    id: bigint;
    metadata: {
      name?: string;
      image?: string;
    };
  };
  href: string;
  showPrice?: boolean;
  price?: {
    displayValue: string;
    symbol: string;
  };
}

export function NFTCard({ nft, href, showPrice = false, price }: NFTCardProps) {
  return (
    <Box
      as={Link}
      href={href}
      _hover={{
        textDecoration: 'none',
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
      transition="all 0.2s"
      bg="gray.800"
      border="1px solid"
      borderColor="gray.700"
      overflow="hidden"
      boxShadow="md"
      maxW="280px"
      w="full"
    >
      <MediaRenderer
        client={client}
        src={nft.metadata.image}
        style={{
          width: '100%',
          aspectRatio: '0.9',
          objectFit: 'cover',
        }}
      />
      <Box p={3}>
        <Text fontWeight="bold" fontSize="lg" color="white" noOfLines={1} mb={1}>
          {nft.metadata?.name ?? 'Unnamed NFT'}
        </Text>
        <Text fontSize="sm" color="gray.400" mb={showPrice ? 3 : 0}>
          #{nft.id.toString()}
        </Text>
        {showPrice && price && (
          <HStack justify="space-between" align="center">
            <Text fontSize="xs" color="gray.500">
              Price
            </Text>
            <Text fontWeight="bold" fontSize="md" color="white">
              {price.displayValue} {price.symbol}
            </Text>
          </HStack>
        )}
      </Box>
    </Box>
  );
}
