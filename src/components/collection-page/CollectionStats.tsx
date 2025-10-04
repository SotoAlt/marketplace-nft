'use client';

import { Divider, Flex, HStack, Skeleton, Text, Box } from '@chakra-ui/react';
import Image from 'next/image';
import { useCollectionStats } from '@/hooks/useCollectionStats';

function InlineStat({
  label,
  value,
  showIcon,
}: {
  label: string;
  value: string;
  showIcon?: boolean;
}) {
  return (
    <Flex direction="column" minW="max-content">
      <Text fontSize="xs" color="gray.400">
        {label}
      </Text>
      <HStack spacing={1} align="center">
        {showIcon && value !== '-' && value !== 'N/A' && (
          <Box position="relative" width="18px" height="18px" flexShrink={0}>
            <Image
              src="/erc20-icons/usdt0_logo.png"
              alt="USDT0"
              fill
              sizes="18px"
              style={{ objectFit: 'contain' }}
            />
          </Box>
        )}
        <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight={800} lineHeight={1.1}>
          {value}
        </Text>
      </HStack>
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
        <InlineStat label="Floor Price" value={floorDisplay ?? '-'} showIcon />
        <Divider display={{ base: 'none', md: 'block' }} orientation="vertical" h="8" />
        <InlineStat label="Recent Volume" value={volumeDisplay ?? '-'} showIcon />
        <Divider display={{ base: 'none', md: 'block' }} orientation="vertical" h="8" />
        <InlineStat label="Listed / Supply" value={`${listed} / ${supplyDisplay}`} />
        <Divider display={{ base: 'none', md: 'block' }} orientation="vertical" h="8" />
        <InlineStat label="Owners" value={ownersDisplay ?? 'N/A'} />
      </Flex>
    </Skeleton>
  );
}
