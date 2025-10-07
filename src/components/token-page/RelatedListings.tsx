import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { NFT_CONTRACTS } from '@/consts/nft_contracts';
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Text,
} from '@chakra-ui/react';
import { NFTCard } from '@/components/collection-page/NFTCard';
import Link from 'next/link';

export default function RelatedListings({ excludedListingId }: { excludedListingId: bigint }) {
  const { nftContract, allValidListings } = useMarketplaceContext();
  const listings = allValidListings?.filter(
    (o) =>
      o.id !== excludedListingId &&
      o.assetContractAddress.toLowerCase() === nftContract.address.toLowerCase()
  );
  
  // Find the NFT contract config to get the slug
  const nftContractConfig = NFT_CONTRACTS.find(
    (config) =>
      config.address.toLowerCase() === nftContract.address.toLowerCase() &&
      config.chain.id === nftContract.chain.id
  );
  
  if (!listings || !listings.length) return <></>;
  return (
    <AccordionItem>
      <Text>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left">
            More from this collections
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Text>
      <AccordionPanel pb={4}>
        <Box display="flex" overflowX="auto" width="100%" gap={4}>
          {listings.slice(0, 4)?.map((item) => (
            <Box key={item.id.toString()} borderWidth={1}>
              <NFTCard
                nft={{
                  id: item.asset.id,
                  metadata: {
                    name: item.asset.metadata?.name,
                    image: item.asset.metadata?.image,
                  },
                }}
                contract={nftContract}
                containerProps={{
                  borderWidth: 0,
                }}
                href={`/collection/${nftContract.chain.id}/${
                  nftContract.address
                }/token/${item.asset.id.toString()}`}
                showPrice
                price={{
                  displayValue: item.currencyValuePerToken.displayValue,
                  symbol: item.currencyValuePerToken.symbol,
                }}
              />
            </Box>
          ))}
        </Box>
        <Box _hover={{ textDecoration: 'underline' }} textAlign="center" mt={4}>
          <Link href={`/collection/${nftContract.chain.id}/${nftContractConfig?.slug || nftContract.address}`}>View all</Link>
        </Box>
      </AccordionPanel>
    </AccordionItem>
  );
}
