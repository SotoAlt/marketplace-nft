'use client';

import { Box, Button, Flex, HStack, Skeleton, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function ClaimControls({
  quantity,
  onDecrement,
  onIncrement,
  maxQuantity,
  pricePerTokenDisplay,
  totalPriceDisplay,
  currencySymbol,
  eligibilityMessage,
  isCheckingEligibility,
  isSoldOut,
  isDropReady,
  maxPerWalletLabel,
  action,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  maxQuantity: number;
  pricePerTokenDisplay: string;
  totalPriceDisplay: string;
  currencySymbol: string;
  eligibilityMessage: string | null;
  isCheckingEligibility: boolean;
  isSoldOut: boolean;
  isDropReady: boolean;
  maxPerWalletLabel: string | null;
  action: ReactNode;
}) {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} w="100%">
      <Flex direction="column" gap={6}>
        <Box>
          <Text fontWeight="semibold" mb={2}>
            Quantity
          </Text>
          <HStack>
            <Button onClick={onDecrement} isDisabled={quantity <= 1 || !isDropReady || isSoldOut}>
              -
            </Button>
            <Text minW="40px" textAlign="center">
              {quantity}
            </Text>
            <Button
              onClick={onIncrement}
              isDisabled={quantity >= maxQuantity || !isDropReady || isSoldOut}
            >
              +
            </Button>
          </HStack>
          {maxPerWalletLabel && (
            <Text fontSize="sm" color="gray.500" mt={2}>
              {maxPerWalletLabel}
            </Text>
          )}
        </Box>
        <Box>
          <Text fontWeight="semibold">Price</Text>
          <Text color="gray.400" fontSize="sm">
            {pricePerTokenDisplay} {pricePerTokenDisplay !== 'Free' ? currencySymbol : ''} each
          </Text>
          <Text fontWeight="bold" mt={2}>
            Total: {totalPriceDisplay} {totalPriceDisplay !== 'Free' ? currencySymbol : ''}
          </Text>
        </Box>
        <Skeleton isLoaded={!isCheckingEligibility} minH="24px">
          {eligibilityMessage && (
            <Text color="gray.300" fontSize="sm">
              {eligibilityMessage}
            </Text>
          )}
          {!eligibilityMessage && (
            <Text color="gray.400" fontSize="sm">
              {isDropReady ? 'Select quantity to see your eligibility.' : 'Drop not live yet.'}
            </Text>
          )}
        </Skeleton>
        {action}
      </Flex>
    </Box>
  );
}
