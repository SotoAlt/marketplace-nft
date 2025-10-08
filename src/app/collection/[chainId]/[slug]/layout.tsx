import MarketplaceProvider from '@/hooks/useMarketplaceContext';
import type { ReactNode } from 'react';

export default function MarketplaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string; chainId: string };
}) {
  return (
    <MarketplaceProvider chainId={params.chainId} slug={params.slug}>
      {children}
    </MarketplaceProvider>
  );
}