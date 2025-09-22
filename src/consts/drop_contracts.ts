import type { Chain } from 'thirdweb';
import { base, plasmaTestnet, sepolia } from './chains';

export type DropContract = {
  address: string;
  chain: Chain;
  type: 'DropERC721';
  title: string;
  description: string;
  thumbnailUrl: string;
  slug?: string;
};

export const DROP_CONTRACTS: DropContract[] = [
  {
    address: '0x3d5c08df863085a516de9820C836E7c0d632A831',
    chain: plasmaTestnet,
    type: 'DropERC721',
    title: 'Plasma Testnet Drop NFT',
    description: 'Claim experimental Plasma Testnet drop tokens while supplies last.',
    thumbnailUrl:
      'https://nft-cdn.thirdweb.com/ipfs/QmQzUo3rgsH1ZMVXQw6T68J5mhS5PaAn9KnQWpN6wiwkF7/0.png',
    slug: 'plasma-testnet-drop-placeholder',
  },
  {
    address: '0x6d3EBD12eb82653f872344EC4d0e15B8C0C32c83',
    chain: sepolia,
    type: 'DropERC721',
    title: 'Sepolia Test',
    description: 'Claim experimental Base drop tokens while supplies last.',
    thumbnailUrl:
      'https://nft-cdn.thirdweb.com/ipfs/QmQzUo3rgsH1ZMVXQw6T68J5mhS5PaAn9KnQWpN6wiwkF7/0.png',
    slug: 'sepolia-test-nft-drop',
  },
];
