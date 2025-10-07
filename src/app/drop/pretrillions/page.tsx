'use client';

import { DropClaim } from '@/components/drop-page/DropClaim';
import NftDropProvider from '@/hooks/useNftDropContext';
import { plasma } from '@/consts/chains';

const PRETRILLIONS_ADDRESS = '0x4633B5f2F84C5506AE3979d1eeB5E58C912CFA5B';

export default function PretrillionsDropPage() {
  return (
    <NftDropProvider chainId={plasma.id.toString()} contractAddress={PRETRILLIONS_ADDRESS}>
      <DropClaim />
    </NftDropProvider>
  );
}