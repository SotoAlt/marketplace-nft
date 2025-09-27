import { NFTCard } from '@/components/collection-page/NFTCard';
import type { NFT, ThirdwebContract } from 'thirdweb';

type OwnedItemProps = {
  nft: NFT;
  nftCollection: ThirdwebContract;
  actionButtonLabel?: string;
};

export function OwnedItem(props: OwnedItemProps) {
  const { nft, nftCollection, actionButtonLabel } = props;

  return (
    <NFTCard
      nft={{
        id: nft.id,
        metadata: nft.metadata,
      }}
      href={`/collection/${nftCollection.chain.id}/${
        nftCollection.address
      }/token/${nft.id.toString()}`}
      actionButtonLabel={actionButtonLabel}
    />
  );
}
