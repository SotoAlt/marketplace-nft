'use client';

import { getOwnedERC1155s } from '@/extensions/getOwnedERC1155s';
import { getOwnedERC721s } from '@/extensions/getOwnedERC721s';
import type { NftType } from '@/hooks/useMarketplaceContext';
import { ADDRESS_ZERO, type ThirdwebContract } from 'thirdweb';
import { useReadContract } from 'thirdweb/react';

type UseOwnedNftsOptions = {
  contract: ThirdwebContract;
  ownerAddress: string | undefined;
  type: NftType;
  enabled?: boolean;
  requestPerSec?: number;
};

export function useOwnedNfts(options: UseOwnedNftsOptions) {
  const { contract, ownerAddress, type, enabled = true, requestPerSec = 50 } = options;
  const shouldFetch = Boolean(contract && ownerAddress && enabled);

  return useReadContract(type === 'ERC1155' ? getOwnedERC1155s : getOwnedERC721s, {
    contract,
    owner: ownerAddress ?? ADDRESS_ZERO,
    requestPerSec,
    queryOptions: {
      enabled: shouldFetch,
    },
  });
}
