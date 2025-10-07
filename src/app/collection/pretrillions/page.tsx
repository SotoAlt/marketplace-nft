'use client';

import { Collection } from '@/components/collection-page/Collection';
import MarketplaceProvider from '@/hooks/useMarketplaceContext';

const PRETRILLIONS_ADDRESS = '0x4633B5f2F84C5506AE3979d1eeB5E58C912CFA5B';
const PLASMA_CHAIN_ID = '9745';

export default function PretrillionsCollectionPage() {
  return (
    <MarketplaceProvider chainId={PLASMA_CHAIN_ID} contractAddress={PRETRILLIONS_ADDRESS}>
      <Collection />
    </MarketplaceProvider>
  );
}