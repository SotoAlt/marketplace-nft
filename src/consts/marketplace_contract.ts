import type { Chain } from 'thirdweb';
import { avalancheFuji, polygonAmoy, sepolia, plasmaTestnet } from './chains';

type MarketplaceContract = {
  address: string;
  chain: Chain;
};

/**
 * You need a marketplace contract on each of the chain you want to support
 * Only list one marketplace contract address for each chain
 */
export const MARKETPLACE_CONTRACTS: MarketplaceContract[] = [
  {
    address: '0x8C1D464B385A2B7EAa80dcAAD66DD8BC0256e717',
    chain: avalancheFuji,
  },
  {
    address: '0x571B773F1e4A7C080b51C36f37e06f371C515569',
    chain: polygonAmoy,
  },
  {
    address: '0x481e01cf24dE1715804608ddB14508d9892d5181',
    chain: sepolia,
  },
  {
    address: '0x0d94Ff4570Ef35569e6d0591eE09a88E44488207',
    chain: plasmaTestnet,
  },
];
