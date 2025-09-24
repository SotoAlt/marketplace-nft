'use client';

import { NFT_CONTRACTS, type NftContract } from '@/consts/nft_contracts';
import { client, NFT_PLACEHOLDER_IMAGE } from '@/consts/client';
import Link from 'next/link';
import {
  Box,
  Container,
  Divider,
  HStack,
  Heading,
  SimpleGrid,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from '@chakra-ui/react';
import { getContract } from 'thirdweb';
import { getContractMetadata } from 'thirdweb/extensions/common';
import { MediaRenderer, useReadContract } from 'thirdweb/react';
import { useMemo } from 'react';
import { useCollectionCardStats } from '@/hooks/useCollectionCardStats';

export default function Home() {
  return (
    <Container maxW="7xl" py={8}>
      {/* Hero Section */}
      <VStack spacing={8} align="center" textAlign="center" mb={16}>
        <VStack spacing={4}>
          <Heading as="h1" size="2xl">
            Discover Premium NFT Collections
          </Heading>
          <Text fontSize="xl" color="gray.500" maxW="2xl">
            Explore, trade, and collect unique digital assets from verified creators and established
            collections.
          </Text>
        </VStack>

        {/* Marketplace Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} w="full" maxW="4xl">
          <Stat textAlign="center">
            <StatNumber fontSize="2xl">{NFT_CONTRACTS.length}</StatNumber>
            <StatLabel color="gray.500">Collections</StatLabel>
          </Stat>
          <Stat textAlign="center">
            <StatNumber fontSize="2xl">12.4K</StatNumber>
            <StatLabel color="gray.500">Items</StatLabel>
          </Stat>
          <Stat textAlign="center">
            <StatNumber fontSize="2xl">3.2K</StatNumber>
            <StatLabel color="gray.500">Owners</StatLabel>
          </Stat>
          <Stat textAlign="center">
            <StatNumber fontSize="2xl">247 ETH</StatNumber>
            <StatLabel color="gray.500">Volume</StatLabel>
          </Stat>
        </SimpleGrid>
      </VStack>

      <Divider mb={12} />

      {/* Featured Collections Section */}
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h2" size="xl" mb={2}>
            Featured Collections
          </Heading>
          <Text color="gray.500" fontSize="lg">
            Curated selections from top creators and trending projects
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full" justifyItems="center">
          {NFT_CONTRACTS.map((item) => (
            <CollectionCard key={`${item.chain.id}-${item.address}`} item={item} />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
}

function CollectionCard({ item }: { item: NftContract }) {
  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: item.chain,
        address: item.address,
      }),
    [item]
  );

  const { data: rawMetadata } = useReadContract(getContractMetadata, {
    contract,
    queryOptions: {},
  });

  const metadata = rawMetadata as
    | {
        name?: string;
        description?: string;
        image?: string;
      }
    | undefined;

  const title = metadata?.name ?? item.title ?? 'Collection';
  const imageSrc = metadata?.image ?? NFT_PLACEHOLDER_IMAGE;

  // Get real collection stats
  const { floorDisplay, volumeDisplay, isLoading } = useCollectionCardStats(item);

  return (
    <Link href={`/collection/${item.chain.id.toString()}/${item.address}`}>
      <Box
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
        cursor="pointer"
        rounded="none"
      >
        {/* Collection Image */}
        <Box position="relative">
          <MediaRenderer
            client={client}
            src={imageSrc}
            style={{
              width: '100%',
              aspectRatio: '1',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>

        {/* Collection Info */}
        <Box p={4}>
          <Text fontWeight="bold" fontSize="lg" color="white" noOfLines={1} mb={1}>
            {title}
          </Text>
          <Text fontSize="sm" color="gray.400" mb={3}>
            Collection
          </Text>

          {/* Stats Row */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between" align="center">
              <Text fontSize="xs" color="gray.500">
                Floor Price
              </Text>
              {isLoading ? (
                <Skeleton height="16px" width="60px" />
              ) : (
                <Text fontWeight="bold" fontSize="sm" color="white">
                  {floorDisplay ?? 'N/A'}
                </Text>
              )}
            </HStack>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs" color="gray.500">
                Volume
              </Text>
              {isLoading ? (
                <Skeleton height="16px" width="60px" />
              ) : (
                <Text fontWeight="bold" fontSize="sm" color="white">
                  {volumeDisplay ?? 'N/A'}
                </Text>
              )}
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Link>
  );
}
