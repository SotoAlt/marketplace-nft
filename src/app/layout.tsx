import type { Metadata } from 'next';
import { Providers } from '@/components/shared/Providers';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { AutoConnect } from 'thirdweb/react';
import { client } from '@/consts/client';

export const metadata: Metadata = {
  title: 'remi NFT Marketplace',
  description:
    'Welcome to the remi NFT Marketplace, a platform for buying and selling NFTs. on Plasma',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AutoConnect client={client} />
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
