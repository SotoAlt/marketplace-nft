'use client';

import { DropClaim } from '@/components/drop-page/DropClaim';
import NftDropProvider from '@/hooks/useNftDropContext';

const PRETRILLIONS_ADDRESS = '0x4633B5f2F84C5506AE3979d1eeB5E58C912CFA5B';
const PLASMA_CHAIN_ID = '9745';

export default function PretrillionsDropPage() {
  return (
    <NftDropProvider chainId={PLASMA_CHAIN_ID} contractAddress={PRETRILLIONS_ADDRESS}>
      <DropClaim />
    </NftDropProvider>
  );
}