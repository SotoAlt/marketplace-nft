'use client';

import { Box } from '@chakra-ui/react';
import Image from 'next/image';

export function CollectionBanner() {
  return (
    <Box
      position="relative"
      width="100%"
      height={{ base: '200px', md: '250px', lg: '300px' }}
      overflow="hidden"
    >
      <Image
        src="/images/pretrillions-banner.png"
        alt="Pretrillions Banner"
        fill
        priority
        style={{
          objectFit: 'cover',
          objectPosition: 'top',
        }}
        sizes="100vw"
      />
      {/* Gradient overlay for better text readability */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="50%"
        bgGradient="linear(to-t, rgba(0,0,0,0.8), transparent)"
        pointerEvents="none"
      />
    </Box>
  );
}