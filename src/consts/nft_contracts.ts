import type { Chain } from 'thirdweb';
import { avalancheFuji, polygonAmoy, plasmaTestnet, sepolia } from './chains';

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
export const NFT_CONTRACTS: NftContract[] = [
  {
    address: '0x2D4FaB93749625B16325e50716B282D6204DE23F',
    chain: sepolia,
    title: 'Sepolia NFT test collection',
    description: 'Sepolia NFT test collection on Sepolia testnet',
    thumbnailUrl: '/plasmagirl-logo.png', // You can update this with your actual logo
    slug: 'sepolia-nft-test-collection',
    type: 'ERC721',
  },
  {
    address: '0xC5c28aA8DA13588CBf8B23D9c57FB2DA98aebcE0',
    chain: plasmaTestnet,
    title: 'PlasmaGirl NFT Open',
    description: 'PlasmaGirl NFT Open collection on Plasma testnet',
    thumbnailUrl: '/plasmagirl-logo.png', // You can update this with your actual logo
    slug: 'plasmagirl-nft-open',
    type: 'ERC721',
  },
];
