'use client';

import { NFT_CONTRACTS, type NftContract } from '@/consts/nft_contracts';
import { DROP_CONTRACTS, type DropContract } from '@/consts/drop_contracts';
import { ShineBorder } from '@/components/ui/shine-border';
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
  Stack,
  Button,
  Badge,
} from '@chakra-ui/react';
import Image from 'next/image';
import { getContract } from 'thirdweb';
import { getContractMetadata } from 'thirdweb/extensions/common';
import {
  getActiveClaimCondition,
  getTotalUnclaimedSupply,
  getTotalClaimedSupply,
} from 'thirdweb/extensions/erc721';
import { MediaRenderer, useReadContract } from 'thirdweb/react';
import { useMemo } from 'react';
import { useCollectionCardStats } from '@/hooks/useCollectionCardStats';

export default function Home() {
  return (
    <Container maxW="7xl" py={8}>
      {/* Hero Section */}
      <VStack spacing={8} align="center" textAlign="center" mb={16}>
        <VStack spacing={4}>
          <Heading as="h1" size="2xl" fontFamily="var(--font-pixelify), sans-serif">
            Co-create and trade AI-native NFTs
          </Heading>
        </VStack>
      </VStack>

      <Divider mb={12} />

      {/* Featured Collections Section */}
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h2" size="xl" mb={2} fontFamily="var(--font-pixelify), sans-serif">
            Featured Collections
          </Heading>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full" justifyItems="center">
          {NFT_CONTRACTS.map((item) => (
            <CollectionCard key={`${item.chain.id}-${item.address}`} item={item} />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Drops Section */}
      <VStack spacing={8} align="stretch" mt={16}>
        <Box>
          <Heading as="h2" size="xl" mb={2} fontFamily="var(--font-pixelify), sans-serif">
            Featured Drops
          </Heading>
        </Box>

        <VStack spacing={4} align="stretch">
          {DROP_CONTRACTS.map((drop) => (
            <DropRow key={`${drop.chain.id}-${drop.address}`} drop={drop} />
          ))}
          {DROP_CONTRACTS.length === 0 && (
            <Text color="gray.500">No drops configured yet. Check back soon.</Text>
          )}
        </VStack>
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
    <Link href={`/collection/${item.chain.id.toString()}/${item.slug || item.address}`}>
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
                <HStack spacing={1}>
                  {floorDisplay && floorDisplay !== 'N/A' && (
                    <Box position="relative" width="14px" height="14px" flexShrink={0}>
                      <Image
                        src="/erc20-icons/usdt0_logo.png"
                        alt="USDT0"
                        fill
                        sizes="14px"
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                  <Text fontWeight="bold" fontSize="sm" color="white">
                    {floorDisplay ?? 'N/A'}
                  </Text>
                </HStack>
              )}
            </HStack>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs" color="gray.500">
                Volume
              </Text>
              {isLoading ? (
                <Skeleton height="16px" width="60px" />
              ) : (
                <HStack spacing={1}>
                  {volumeDisplay && volumeDisplay !== 'N/A' && (
                    <Box position="relative" width="14px" height="14px" flexShrink={0}>
                      <Image
                        src="/erc20-icons/usdt0_logo.png"
                        alt="USDT0"
                        fill
                        sizes="14px"
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                  <Text fontWeight="bold" fontSize="sm" color="white">
                    {volumeDisplay ?? 'N/A'}
                  </Text>
                </HStack>
              )}
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Link>
  );
}

function DropRow({ drop }: { drop: DropContract }) {
  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: drop.chain,
        address: drop.address,
      }),
    [drop]
  );

  const { data: rawMetadata, isLoading } = useReadContract(getContractMetadata, {
    contract,
    queryOptions: {},
  });

  const { data: activeClaimCondition } = useReadContract(getActiveClaimCondition, {
    contract,
    queryOptions: { retry: 0 },
  });
  const { data: totalUnclaimed } = useReadContract(getTotalUnclaimedSupply, {
    contract,
    queryOptions: { retry: 0 },
  });
  const { data: totalClaimed } = useReadContract(getTotalClaimedSupply, {
    contract,
    queryOptions: { retry: 0 },
  });

  const metadata = rawMetadata as
    | {
        name?: string;
        description?: string;
        image?: string;
      }
    | undefined;

  const title = metadata?.name ?? undefined;
  const description = metadata?.description ?? undefined;
  const imageSrc = metadata?.image ?? NFT_PLACEHOLDER_IMAGE;

  const nowInSeconds = BigInt(Math.floor(Date.now() / 1000));
  const isDropReady = activeClaimCondition
    ? (activeClaimCondition as { startTimestamp: bigint }).startTimestamp <= nowInSeconds
    : false;
  const isSoldOut = typeof totalUnclaimed === 'bigint' ? totalUnclaimed <= 0n : false;
  const isMintingNow = isDropReady && !isSoldOut;
  const startsInSeconds = activeClaimCondition
    ? Number((activeClaimCondition as { startTimestamp: bigint }).startTimestamp - nowInSeconds)
    : null;

  const maxSupply =
    typeof totalClaimed === 'bigint' && typeof totalUnclaimed === 'bigint'
      ? totalClaimed + totalUnclaimed
      : undefined;
  const isStatsLoading = !(typeof totalClaimed === 'bigint' && typeof totalUnclaimed === 'bigint');

  function fmt(n?: bigint) {
    return typeof n === 'bigint' ? n.toString() : '—';
  }

  function formatTimeLeft(seconds: number | null) {
    if (seconds === null) return 'soon';
    const s = Math.max(0, seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <Box
      border="1px solid"
      borderColor="gray.700"
      bg="gray.800"
      boxShadow="md"
      w="full"
      overflow="hidden"
      position="relative"
    >
      {isMintingNow && (
        <ShineBorder
          shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
          className="animate-shine"
          style={{ borderRadius: 'inherit' }}
        />
      )}
      <Stack direction={{ base: 'column', md: 'row' }} spacing={0} align="stretch">
        {/* Left image */}
        <Box
          w={{ base: '100%', md: '340px' }}
          h={{ base: '220px', md: 'auto' }}
          minH={{ md: '220px' }}
          position="relative"
          flexShrink={0}
        >
          <MediaRenderer
            client={client}
            src={imageSrc}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>

        {/* Right content */}
        <Box p={5} display="flex" flexDirection="column" gap={3} flex="1">
          <HStack justify="space-between" align="start">
            {isLoading ? (
              <Skeleton height="24px" width="240px" />
            ) : (
              <Heading size="lg" noOfLines={1} fontFamily="var(--font-roboto)" fontWeight="600">
                {title ?? 'Drop'}
              </Heading>
            )}
            <HStack spacing={2} flexShrink={0}>
              {isMintingNow && <Badge colorScheme="green">Mint now</Badge>}
              {!isMintingNow && isSoldOut && <Badge colorScheme="red">Sold out</Badge>}
              {!isMintingNow && !isSoldOut && (
                <Badge colorScheme="purple">Opens in {formatTimeLeft(startsInSeconds)}</Badge>
              )}
            </HStack>
          </HStack>

          {isLoading ? (
            <Skeleton height="40px" width="80%" />
          ) : description ? (
            <Text color="gray.400" noOfLines={2}>
              {description}
            </Text>
          ) : null}

          {/* Stats */}
          <Stack direction={{ base: 'column', md: 'row' }} spacing={6} mt={2}>
            <Stat>
              <StatLabel>Total Mints</StatLabel>
              {isStatsLoading ? (
                <Skeleton height="20px" width="80px" />
              ) : (
                <StatNumber>{fmt(totalClaimed)}</StatNumber>
              )}
            </Stat>
            <Stat>
              <StatLabel>Max Supply</StatLabel>
              {isStatsLoading ? (
                <Skeleton height="20px" width="80px" />
              ) : (
                <StatNumber>{fmt(maxSupply)}</StatNumber>
              )}
            </Stat>
          </Stack>

          <Box mt="auto">
            <Button
              as={Link}
              href={`/drop/${drop.chain.id}/${drop.slug || drop.address}`}
              variant="outline"
              colorScheme="purple"
              borderColor="gray.600"
            >
              View drop
            </Button>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
