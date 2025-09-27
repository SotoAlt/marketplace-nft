import { useCallback, useMemo, useState } from 'react';
import { type DirectListing } from 'thirdweb/extensions/marketplace';

type ListingSortOrder = 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW';

type UseListingPriceFilterReturn = {
  sortOrder: ListingSortOrder;
  sortedListings: DirectListing[];
  handleSortOrderChange: (order: ListingSortOrder) => void;
};

const getListingPrice = (listing: DirectListing): number => {
  const displayValue = listing.currencyValuePerToken?.displayValue;
  if (displayValue) {
    const parsed = Number.parseFloat(displayValue);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const rawValue = listing.currencyValuePerToken?.value;
  if (rawValue !== undefined && rawValue !== null) {
    const numeric = Number(rawValue);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return Number.POSITIVE_INFINITY;
};

export const useListingPriceFilter = (
  listings: DirectListing[] | undefined
): UseListingPriceFilterReturn => {
  const [sortOrder, setSortOrder] = useState<ListingSortOrder>('PRICE_LOW_TO_HIGH');

  const sortedListings = useMemo(() => {
    if (!listings || listings.length === 0) {
      return [];
    }

    const withPrice = listings.map((listing) => ({
      price: getListingPrice(listing),
      listing,
    }));

    withPrice.sort((a, b) => a.price - b.price);

    if (sortOrder === 'PRICE_HIGH_TO_LOW') {
      withPrice.reverse();
    }

    return withPrice.map(({ listing }) => listing);
  }, [listings, sortOrder]);

  const handleSortOrderChange = useCallback((order: ListingSortOrder) => {
    setSortOrder(order);
  }, []);

  return {
    sortOrder,
    sortedListings,
    handleSortOrderChange,
  };
};

export type { ListingSortOrder };
