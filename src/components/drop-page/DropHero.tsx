'use client';

import { client, NFT_PLACEHOLDER_IMAGE } from '@/consts/client';
import type { DropContract } from '@/consts/drop_contracts';
import { Link } from '@chakra-ui/next-js';
import { Box, Flex, Heading, Skeleton, Stack, Text } from '@chakra-ui/react';
import { MediaRenderer } from 'thirdweb/react';

export function DropHero({
  drop,
  contractMetadata,
  sharePath,
  isLoading,
}: {
  drop: DropContract;
  contractMetadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
  sharePath: string;
  isLoading: boolean;
}) {
  const imageSrc = contractMetadata?.image ?? drop.thumbnailUrl ?? NFT_PLACEHOLDER_IMAGE;
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 6, md: 10 }}
      alignItems={{ base: 'flex-start', md: 'center' }}
    >
      <Box
        w={{ base: '100%', md: '320px' }}
        h={{ base: '280px', md: '320px' }}
        borderRadius="xl"
        overflow="hidden"
        borderWidth="1px"
      >
        <MediaRenderer
          client={client}
          src={imageSrc}
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
      </Box>
      <Stack flex="1" spacing={4}>
        <Skeleton isLoaded={!isLoading} minH="40px">
          <Heading size="lg">{contractMetadata?.name ?? drop.title}</Heading>
        </Skeleton>
        <Skeleton isLoaded={!isLoading}>
          <Text color="gray.400">{contractMetadata?.description ?? drop.description}</Text>
        </Skeleton>
        <Text color="gray.500" fontSize="sm">
          Share this drop:{' '}
          <Link href={sharePath} color="purple.300" fontWeight="semibold">
            {sharePath}
          </Link>
        </Text>
      </Stack>
    </Flex>
  );
}
