'use client';

import { ChangeEvent } from 'react';
import { Flex, Select, Text } from '@chakra-ui/react';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { useListingPriceFilter, type ListingSortOrder } from '@/hooks/useListingPriceFilter';
import { ListingGrid } from './ListingGrid';

export function ListingsTabContent() {
  const { listingsInSelectedCollection } = useMarketplaceContext();
  const { sortedListings, sortOrder, handleSortOrderChange } = useListingPriceFilter(
    listingsInSelectedCollection
  );

  const onSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleSortOrderChange(event.target.value as ListingSortOrder);
  };

  return (
    <>
      <Flex
        align={{ base: 'stretch', sm: 'center' }}
        justify="flex-end"
        gap={2}
        flexWrap="wrap"
        px={4}
      >
        <Text fontSize="sm" color="gray.400">
          Sort by price
        </Text>
        <Select
          maxW="220px"
          size="sm"
          value={sortOrder}
          onChange={onSortChange}
          bg="blackAlpha.400"
          borderColor="whiteAlpha.200"
          _hover={{ borderColor: 'purple.400' }}
          _focusVisible={{
            borderColor: 'purple.500',
            boxShadow: '0 0 0 1px rgba(128, 90, 213, 0.6)',
          }}
        >
          <option style={{ color: 'black' }} value="PRICE_LOW_TO_HIGH">
            Price: low to high
          </option>
          <option style={{ color: 'black' }} value="PRICE_HIGH_TO_LOW">
            Price: high to low
          </option>
        </Select>
      </Flex>
      <ListingGrid listings={sortedListings} />
    </>
  );
}
