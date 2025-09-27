'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Select, Text } from '@chakra-ui/react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { useListingPriceFilter, type ListingSortOrder } from '@/hooks/useListingPriceFilter';
import { ListingGrid } from './ListingGrid';

const ITEMS_PER_PAGE = 20;

export function ListingsTabContent() {
  const { listingsInSelectedCollection } = useMarketplaceContext();
  const { sortedListings, sortOrder, handleSortOrderChange } = useListingPriceFilter(
    listingsInSelectedCollection
  );
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [sortedListings]);

  const paginatedListings = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return sortedListings.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedListings]);

  const totalListings = sortedListings.length;
  const totalPages = totalListings ? Math.ceil(totalListings / ITEMS_PER_PAGE) : 0;
  const hasListings = totalListings > 0;

  const onNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, Math.max(totalPages - 1, 0)));
  };

  const onPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

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
      {hasListings ? (
        <>
          <ListingGrid listings={paginatedListings} />
          {totalPages > 1 && (
            <Box
              mx="auto"
              maxW={{ base: '90vw', lg: '700px' }}
              mt="20px"
              px="10px"
              py="5px"
              overflowX="auto"
            >
              <Flex direction="row" justify="center" align="center" gap={3}>
                <Button size="sm" onClick={onPreviousPage} isDisabled={currentPage === 0}>
                  <RiArrowLeftSLine />
                </Button>
                <Text fontSize="sm" color="gray.400">
                  Page {currentPage + 1} of {totalPages}
                </Text>
                <Button
                  size="sm"
                  onClick={onNextPage}
                  isDisabled={currentPage >= totalPages - 1}
                >
                  <RiArrowRightSLine />
                </Button>
              </Flex>
            </Box>
          )}
        </>
      ) : (
        <Text px={4} py={6} textAlign="center" color="gray.400">
          No active listings found.
        </Text>
      )}
    </>
  );
}
