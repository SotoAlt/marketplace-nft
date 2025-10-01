'use client';

import { Box, Button, Flex, HStack, Skeleton, Text, Image, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function ClaimControls({
  quantity,
  onDecrement,
  onIncrement,
  maxQuantity,
  pricePerTokenDisplay,
  totalPriceDisplay,
  currencySymbol,
  currencyIcon,
  eligibilityMessage,
  isCheckingEligibility,
  isSoldOut,
  isDropReady,
  maxPerWalletLabel,
  action,
  withContainer = true,
  containerProps,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  maxQuantity: number;
  pricePerTokenDisplay: string;
  totalPriceDisplay: string;
  currencySymbol: string;
  currencyIcon?: string;
  eligibilityMessage: string | null;
  isCheckingEligibility: boolean;
  isSoldOut: boolean;
  isDropReady: boolean;
  maxPerWalletLabel: string | null;
  action: ReactNode;
  withContainer?: boolean;
  containerProps?: BoxProps;
}) {
  const Content = (
    <Flex direction="column" gap={6}>
      <Box>
        <Text fontWeight="semibold" mb={2}>
          Quantity
        </Text>
        <HStack>
          <Button
            variant="outline"
            borderRadius="0"
            onClick={onDecrement}
            isDisabled={quantity <= 1 || !isDropReady || isSoldOut}
          >
            -
          </Button>
          <Text minW="40px" textAlign="center">
            {quantity}
          </Text>
          <Button
            variant="outline"
            borderRadius="0"
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
        <HStack spacing={1} color="gray.400" fontSize="sm">
          <Text>{pricePerTokenDisplay}</Text>
          {pricePerTokenDisplay !== 'Free' && (
            <>
              {currencyIcon && <Image boxSize="16px" src={currencyIcon} borderRadius="full" />}
              <Text>{currencySymbol}</Text>
            </>
          )}
          <Text>each</Text>
        </HStack>
        <HStack fontWeight="bold" mt={2} spacing={1}>
          <Text>Total: {totalPriceDisplay}</Text>
          {totalPriceDisplay !== 'Free' && (
            <>
              {currencyIcon && <Image boxSize="20px" src={currencyIcon} borderRadius="full" />}
              <Text>{currencySymbol}</Text>
            </>
          )}
        </HStack>
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
  );

  if (!withContainer) return Content;

  return (
    <Box borderWidth="1px" borderRadius="0" p={6} w="100%" {...containerProps}>
      {Content}
    </Box>
  );
}
