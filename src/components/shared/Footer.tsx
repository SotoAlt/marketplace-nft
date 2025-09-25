'use client';

import { Box, Container, Stack, Text } from '@chakra-ui/react';

export function Footer() {
  return (
    <Box as="footer" bg="gray.900" color="gray.400" py={8} mt={12}>
      <Container maxW="7xl">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 2, md: 6 }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
        >
          <Text fontSize="sm" fontWeight="medium">
            © {new Date().getFullYear()} remi. All rights reserved.
          </Text>
          <Text fontSize="sm">Built for curious collectors and forward-thinking creators.</Text>
        </Stack>
      </Container>
    </Box>
  );
}
