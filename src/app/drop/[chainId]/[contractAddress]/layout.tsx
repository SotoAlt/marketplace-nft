import NftDropProvider from '@/hooks/useNftDropContext';
import type { ReactNode } from 'react';

export default function DropLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { chainId: string; contractAddress: string };
}) {
  return (
    <NftDropProvider chainId={params.chainId} contractAddress={params.contractAddress}>
      {children}
    </NftDropProvider>
  );
}
