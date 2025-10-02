'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaExchangeAlt } from 'react-icons/fa';

export default function SwapPage() {
  return (
    <Container maxW="7xl" py={12}>
      <VStack align="center" spacing={8}>
        <Box textAlign="center">
          <Icon as={FaExchangeAlt} boxSize={16} color="purple.400" mb={4} />
          <Heading as="h1" size="2xl" mb={4}>
            Token Swap
          </Heading>
          <Text fontSize="lg" color="gray.500">
            Swap functionality coming soon
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}