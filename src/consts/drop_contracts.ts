import type { Chain } from 'thirdweb';
import { base, sepolia } from './chains';

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
    address: '0x9f761CdAE083143973B7EB238B8344783240b589',
    chain: base,
    type: 'DropERC721',
    title: 'Base Drop Placeholder',
    description: 'Claim experimental Base drop tokens while supplies last.',
    thumbnailUrl:
      'https://nft-cdn.thirdweb.com/ipfs/QmQzUo3rgsH1ZMVXQw6T68J5mhS5PaAn9KnQWpN6wiwkF7/0.png',
    slug: 'base-drop-placeholder',
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
