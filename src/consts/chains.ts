import { defineChain } from 'thirdweb';

/**
 * All chains should be exported from this file
 */
export { avalancheFuji, sepolia, polygonAmoy, base, baseSepolia } from 'thirdweb/chains';

/**
 * Define any custom chain using `defineChain`
 */
export const example_customChain1 = defineChain(0.001); // don't actually use this
export const plasmaTestnet = defineChain({
  id: 9746,
  name: 'Plasma Testnet',
  nativeCurrency: {
    name: 'Plasma',
    symbol: 'XPL',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Plasma Scan',
      url: 'https://testnet.plasmascan.to',
      apiUrl: 'https://testnet.plasmascan.to/api',
    },
  ],
  rpc: process.env.NEXT_PUBLIC_PLASMA_TESTNET_RPC_URL || 'https://rpc.plasma.to',
  testnet: true,
});

export const plasma = defineChain({
  id: 9745,
  name: 'Plasma',
  nativeCurrency: {
    name: 'Plasma',
    symbol: 'XPL',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'Plasma Scan',
      url: 'https://plasmascan.to/',
      apiUrl: 'https://plasmascan.to/api',
    },
  ],
  // Use private RPC if available, fallback to public RPC
  rpc: process.env.NEXT_PUBLIC_PLASMA_MAINNET_RPC_URL || 'https://rpc.plasma.to',
});
