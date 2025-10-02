import type { Chain } from 'thirdweb';
import { plasmaTestnet, plasma } from './chains';
import { SHOULD_INCLUDE_TESTNET_RESOURCES } from './environment';

type MarketplaceContract = {
  address: string;
  chain: Chain;
};

/**
 * You need a marketplace contract on each of the chain you want to support
 * Only list one marketplace contract address for each chain
 */
const baseMarketplaceContracts: MarketplaceContract[] = [
  {
    address: '0xa7Dcd966E8F612d5Dad9B7cAdfcdb0e0d1470eC7',
    chain: plasma,
  },
];

const testnetMarketplaceContracts: MarketplaceContract[] = [
  {
    address: '0x0d94Ff4570Ef35569e6d0591eE09a88E44488207',
    chain: plasmaTestnet,
  },
];

export const MARKETPLACE_CONTRACTS: MarketplaceContract[] = SHOULD_INCLUDE_TESTNET_RESOURCES
  ? [...baseMarketplaceContracts, ...testnetMarketplaceContracts]
  : baseMarketplaceContracts;
