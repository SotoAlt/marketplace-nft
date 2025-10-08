import MarketplaceProvider from '@/hooks/useMarketplaceContext';
import type { ReactNode } from 'react';

export default function TokenLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string; chainId: string; tokenId: string };
}) {
  return (
    <MarketplaceProvider chainId={params.chainId} slug={params.slug}>
      {children}
    </MarketplaceProvider>
  );
}