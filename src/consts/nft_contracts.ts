import type { Chain } from 'thirdweb';
import { plasmaTestnet, plasma } from './chains';
import { NFT_PLACEHOLDER_IMAGE } from './client';
import { SHOULD_INCLUDE_TESTNET_RESOURCES } from './environment';

export type NftContract = {
  address: string;
  chain: Chain;
  type: 'ERC1155' | 'ERC721';

  title?: string;
  description?: string;
  thumbnailUrl?: string;
  slug?: string;
};

/**
 * Below is a list of all NFT contracts supported by your marketplace(s)
 * This is of course hard-coded for demo purpose
 *
 * In reality, the list should be dynamically fetched from your own data source
 */
const baseNftContracts: NftContract[] = [
  {
    address: '0xB4ab5b0A52432eA35030459958059a7B31E191C4',
    chain: plasma,
    type: 'ERC721',
    title: 'PRETRILLIONS',
    description: 'Claim experimental Plasma drop tokens while supplies last.',
    thumbnailUrl: NFT_PLACEHOLDER_IMAGE,
    slug: 'pretrillions-nft',
  },
];

const testnetNftContracts: NftContract[] = [
  {
    address: '0x3d5c08df863085a516de9820C836E7c0d632A831',
    chain: plasmaTestnet,
    title: 'Plasma Testnet Drop NFT test collection',
    description: 'Plasma Testnet Drop NFT test collection on Plasma Testnet',
    thumbnailUrl:
      'https://d391b93f5f62d9c15f67142e43841acc.ipfscdn.io/ipfs/QmRqHh9fxeoezmhaGHEFWAwWshmkttUJgaK3PBtuBLPggR/SCR-20250117-td9.jpeg',
    slug: 'plasma-testnet-drop-nft-test-collection',
    type: 'ERC721',
  },
  {
    address: '0xC5c28aA8DA13588CBf8B23D9c57FB2DA98aebcE0',
    chain: plasmaTestnet,
    title: 'PlasmaGirl NFT Open',
    description: 'PlasmaGirl NFT Open collection on Plasma testnet',
    thumbnailUrl: '/plasmagirl-logo.png',
    slug: 'plasmagirl-nft-open',
    type: 'ERC721',
  },
];

export const NFT_CONTRACTS: NftContract[] = SHOULD_INCLUDE_TESTNET_RESOURCES
  ? [...baseNftContracts, ...testnetNftContracts]
  : baseNftContracts;
