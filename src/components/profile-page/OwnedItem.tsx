import { NFTCard } from '@/components/collection-page/NFTCard';
import { NFT_CONTRACTS } from '@/consts/nft_contracts';
import type { NFT, ThirdwebContract } from 'thirdweb';

type OwnedItemProps = {
  nft: NFT;
  nftCollection: ThirdwebContract;
  actionButtonLabel?: string;
};

export function OwnedItem(props: OwnedItemProps) {
  const { nft, nftCollection, actionButtonLabel } = props;

  // Find the NFT contract config to get the slug
  const nftContractConfig = NFT_CONTRACTS.find(
    (config) =>
      config.address.toLowerCase() === nftCollection.address.toLowerCase() &&
      config.chain.id === nftCollection.chain.id
  );

  return (
    <NFTCard
      nft={{
        id: nft.id,
        metadata: nft.metadata,
      }}
      contract={nftCollection}
      href={`/collection/${nftCollection.chain.id}/${
        nftContractConfig?.slug || nftCollection.address
      }/token/${nft.id.toString()}`}
      actionButtonLabel={actionButtonLabel}
    />
  );
}
