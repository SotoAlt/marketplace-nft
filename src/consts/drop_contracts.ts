import type { Chain } from 'thirdweb';
import { plasma, plasmaTestnet } from './chains';
import { NFT_PLACEHOLDER_IMAGE } from './client';
import { SHOULD_INCLUDE_TESTNET_RESOURCES } from './environment';

export type DropContract = {
  address: string;
  chain: Chain;
  type: 'DropERC721';
  title: string;
  description: string;
  thumbnailUrl: string;
  slug?: string;
  // Optional per-phase end timestamps (unix seconds) for UI countdowns
  phaseDeadlines?: number[];
};

const baseDropContracts: DropContract[] = [
  {
    address: '0xB4ab5b0A52432eA35030459958059a7B31E191C4',
    chain: plasma,
    type: 'DropERC721',
    title: 'PRETRILLIONS',
    description: 'Claim experimental Plasma drop tokens while supplies last.',
    thumbnailUrl: NFT_PLACEHOLDER_IMAGE,
    slug: 'pretrillions-drop-nft',
    phaseDeadlines: [
      1760121600, // 2025-10-10T00:00:00Z
    ],
  },
];

const testnetDropContracts: DropContract[] = [
  {
    address: '0x3d5c08df863085a516de9820C836E7c0d632A831',
    chain: plasmaTestnet,
    type: 'DropERC721',
    title: 'Plasma Testnet Drop NFT',
    description: 'Claim experimental Plasma Testnet drop tokens while supplies last.',
    thumbnailUrl: NFT_PLACEHOLDER_IMAGE,
    slug: 'plasma-testnet-drop-placeholder',
    // Example hardcoded deadlines for up to 3 phases (unix seconds)
    // These are used by the UI to show a countdown per phase when present.
    phaseDeadlines: [
      // Phase 1 ends in ~7 days from 2025-09-24 reference
      1760121600, // 2025-10-10T00:00:00Z
      1760726400, // 2025-10-17T00:00:00Z
      1761331200, // 2025-10-24T00:00:00Z
    ],
  },
];

export const DROP_CONTRACTS: DropContract[] = SHOULD_INCLUDE_TESTNET_RESOURCES
  ? [...baseDropContracts, ...testnetDropContracts]
  : baseDropContracts;
