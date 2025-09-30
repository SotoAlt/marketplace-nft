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
  rpc: 'https://wild-purple-hill.plasma-testnet.quiknode.pro/0ea85c07ec31cfce02300197228e70fc73b72d80/',
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
  // Oficial RPC https://rpc.plasma.to
  rpc: 'https://wiser-dimensional-diamond.plasma-mainnet.quiknode.pro/2992f10bae5577cf72a6eb544b014a10b3ac5d9c',
});
