'use client';

import { Collection } from '@/components/collection-page/Collection';
import MarketplaceProvider from '@/hooks/useMarketplaceContext';
import { plasma } from '@/consts/chains';

const PRETRILLIONS_ADDRESS = '0x4633B5f2F84C5506AE3979d1eeB5E58C912CFA5B';

export default function PretrillionsCollectionPage() {
  return (
    <MarketplaceProvider chainId={plasma.id.toString()} contractAddress={PRETRILLIONS_ADDRESS}>
      <Collection />
    </MarketplaceProvider>
  );
}