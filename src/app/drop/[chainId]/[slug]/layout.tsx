import NftDropProvider from '@/hooks/useNftDropContext';
import type { ReactNode } from 'react';

export default function DropLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { chainId: string; slug: string };
}) {
  return (
    <NftDropProvider chainId={params.chainId} slug={params.slug}>
      {children}
    </NftDropProvider>
  );
}