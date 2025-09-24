'use client';

import { Divider, Flex, Skeleton, Text } from '@chakra-ui/react';
import { useCollectionStats } from '@/hooks/useCollectionStats';

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="column" minW="max-content">
      <Text fontSize="xs" color="gray.400">
        {label}
      </Text>
      <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight={800} lineHeight={1.1}>
        {value}
      </Text>
    </Flex>
  );
}

export function CollectionStats() {
  const { floorDisplay, volumeDisplay, listed, supplyDisplay, ownersDisplay, isLoading } =
    useCollectionStats();

  return (
    <Skeleton isLoaded={!isLoading} rounded="xl" w="full">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 2, md: 8 }}
        align={{ base: 'flex-start', md: 'center' }}
        justify={{ base: 'flex-start', md: 'flex-end' }}
        w="full"
      >
        <InlineStat label="Floor Price" value={floorDisplay ?? '-'} />
        <Divider display={{ base: 'none', md: 'block' }} orientation="vertical" h="8" />
        <InlineStat label="Vol. (24h)" value={volumeDisplay ?? '-'} />
        <Divider display={{ base: 'none', md: 'block' }} orientation="vertical" h="8" />
        <InlineStat label="Listed / Supply" value={`${listed} / ${supplyDisplay}`} />
        <Divider display={{ base: 'none', md: 'block' }} orientation="vertical" h="8" />
        <InlineStat label="Owners" value={ownersDisplay ?? 'N/A'} />
      </Flex>
    </Skeleton>
  );
}
