'use client';

import { DROP_CONTRACTS, type DropContract } from '@/consts/drop_contracts';
import { client } from '@/consts/client';
import { Link } from '@chakra-ui/next-js';
import { Box, Card, CardBody, Flex, Heading, Text } from '@chakra-ui/react';
import { getContract } from 'thirdweb';
import { getContractMetadata } from 'thirdweb/extensions/common';
import { MediaRenderer, useReadContract } from 'thirdweb/react';
import { useMemo } from 'react';

export default function DropDiscoverPage() {
  return (
    <Flex>
      <Box mt="24px" m="auto" maxW="7xl" px={{ base: '20px', md: '0' }}>
        <Heading>Featured drops</Heading>
        <Text color="gray.500" mt="2" mb="8">
          Explore thirdweb drops curated for this marketplace.
        </Text>
        <Flex direction="row" wrap="wrap" gap="6" justifyContent="flex-start">
          {DROP_CONTRACTS.map((drop) => (
            <DropCard key={`${drop.chain.id}-${drop.address}`} drop={drop} />
          ))}
          {DROP_CONTRACTS.length === 0 && <Text>No drops configured yet. Check back soon.</Text>}
        </Flex>
      </Box>
    </Flex>
  );
}

function DropCard({ drop }: { drop: DropContract }) {
  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: drop.chain,
        address: drop.address,
      }),
    [drop]
  );

  const { data: rawMetadata } = useReadContract(getContractMetadata, {
    contract,
    // Let it fetch in background; UI will fallback to local values.
    queryOptions: {
      // small cache to avoid refetching repeatedly when navigating
      staleTime: 60_000,
    },
  });

  const metadata = rawMetadata as
    | {
        name?: string;
        description?: string;
        image?: string;
      }
    | undefined;

  const title = metadata?.name ?? drop.title ?? 'Drop';
  const description = metadata?.description ?? drop.description ?? '';
  const imageSrc = metadata?.image ?? drop.thumbnailUrl ?? '';

  return (
    <Card w={{ base: '100%', sm: '320px' }} borderWidth="1px" overflow="hidden">
      <Box height="200px" overflow="hidden">
        {imageSrc ? (
          <MediaRenderer
            client={client}
            src={imageSrc}
            style={{ height: '200px', width: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box height="200px" bg="gray.700" />
        )}
      </Box>
      <CardBody display="flex" flexDirection="column" gap="3">
        <Heading size="md">{title}</Heading>
        {description ? (
          <Text color="gray.400" noOfLines={2}>
            {description}
          </Text>
        ) : null}
        <Link
          mt="auto"
          fontWeight="semibold"
          href={`/drop/${drop.chain.id}/${drop.address}`}
          _hover={{ textDecoration: 'none' }}
        >
          View drop
        </Link>
      </CardBody>
    </Card>
  );
}
