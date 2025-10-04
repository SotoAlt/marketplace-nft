'use client';

import { Box, Container, HStack, IconButton, Link, Stack, Text } from '@chakra-ui/react';
import { FaXTwitter, FaDiscord, FaGlobe } from 'react-icons/fa6';

export function Footer() {
  return (
    <Box as="footer" bg="gray.900" color="gray.400" py={8} mt={12}>
      <Container maxW="7xl">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 4, md: 6 }}
          justify="space-between"
          align={{ base: 'center', md: 'center' }}
        >
          <HStack spacing={4} align="center">
            <Text fontSize="sm" fontWeight="medium">
              © {new Date().getFullYear()} remi. All rights reserved.
            </Text>
            <HStack spacing={2}>
              <IconButton
                as={Link}
                href="https://x.com/remi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                icon={<FaXTwitter />}
                variant="ghost"
                size="sm"
                _hover={{ bg: 'whiteAlpha.200' }}
              />
              <IconButton
                as={Link}
                href="https://discord.gg/remi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                icon={<FaDiscord />}
                variant="ghost"
                size="sm"
                _hover={{ bg: 'whiteAlpha.200' }}
              />
              <IconButton
                as={Link}
                href="https://remi.online"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                icon={<FaGlobe />}
                variant="ghost"
                size="sm"
                _hover={{ bg: 'whiteAlpha.200' }}
              />
            </HStack>
          </HStack>
          <Text fontSize="sm">Built for curious collectors and forward-thinking creators.</Text>
        </Stack>
      </Container>
    </Box>
  );
}
