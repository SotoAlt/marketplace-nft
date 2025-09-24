'use client';

import { NFT_CONTRACTS, type NftContract } from '@/consts/nft_contracts';
import { client } from '@/consts/client';
import { Link } from '@chakra-ui/next-js';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { getContract } from 'thirdweb';
import { getContractMetadata } from 'thirdweb/extensions/common';
import { MediaRenderer, useReadContract } from 'thirdweb/react';
import { useMemo } from 'react';

export default function Home() {
  return (
    <Flex>
      <Box mt="24px" m="auto">
        <Flex direction="column" gap="4">
          <Heading ml="20px" mt="40px">
            Trending collections
          </Heading>
          <Flex direction="row" wrap="wrap" mt="20px" gap="5" justifyContent="space-evenly">
            {NFT_CONTRACTS.map((item) => (
              <CollectionCard key={`${item.chain.id}-${item.address}`} item={item} />
            ))}
          </Flex>
        </Flex>
      </Box>
    </Flex>
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
  const imageSrc = metadata?.image ?? item.thumbnailUrl ?? '';

  return (
    <Link
      _hover={{ textDecoration: 'none' }}
      w={300}
      h={400}
      href={`/collection/${item.chain.id.toString()}/${item.address}`}
    >
      <Box w="100%" h={300} overflow="hidden" borderRadius="md" borderWidth="1px">
        {imageSrc ? (
          <MediaRenderer
            client={client}
            src={imageSrc}
            style={{ height: '100%', width: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box height="100%" bg="gray.700" />
        )}
      </Box>
      <Text fontSize="large" mt="10px">
        {title}
      </Text>
    </Link>
  );
}
