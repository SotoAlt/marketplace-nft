'use client';
import { MediaRenderer, useActiveAccount, useReadContract } from 'thirdweb/react';
import { getNFT as getNFT721 } from 'thirdweb/extensions/erc721';
import { getNFT as getNFT1155 } from 'thirdweb/extensions/erc1155';
import { client, NFT_PLACEHOLDER_IMAGE } from '@/consts/client';
import {
  Box,
  Flex,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { ListingsTabContent } from './ListingsTabContent';
import { AllNftsGrid } from './AllNftsGrid';
import { CollectionStats } from './CollectionStats';
import { shortenAddress } from 'thirdweb/utils';
import { useOwnedNfts } from '@/hooks/useOwnedNfts';
import { OwnedNftsPanel } from './OwnedNftsPanel';
import ListingHelpDialog from '@/components/shared/ListingHelpDialog';

export function Collection() {
  const {
    type,
    nftContract,
    isLoading,
    isCheckingType,
    contractMetadata,
    listingsInSelectedCollection,
    supplyInfo,
  } = useMarketplaceContext();
  const account = useActiveAccount();
  const { data: ownedNfts, isLoading: isLoadingOwnedNfts } = useOwnedNfts({
    contract: nftContract,
    ownerAddress: account?.address,
    type,
    enabled: !isCheckingType,
  });

  // In case the collection doesn't have a thumbnail, we use the image of the first NFT
  const { data: firstNFT, isLoading: isLoadingFirstNFT } = useReadContract(
    type === 'ERC1155' ? getNFT1155 : getNFT721,
    {
      contract: nftContract,
      tokenId: 0n,
      queryOptions: {
        enabled: !isCheckingType && !contractMetadata?.image,
      },
    }
  );

  const thumbnailImage =
    contractMetadata?.image || firstNFT?.metadata.image || NFT_PLACEHOLDER_IMAGE;
  return (
    <Box mt="24px" maxW="7xl" mx="auto" px={{ base: 4, md: 8 }}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 6, md: 10 }} align="stretch">
        {/* Left: Image + Title + Description */}
        <Flex w={{ base: 'full', md: 'fit-content' }} flexShrink={0} align="flex-start">
          <HStack align="center" spacing={{ base: 4, md: 5 }}>
            <Box
              w={{ base: '64px', md: '96px' }}
              h={{ base: '64px', md: '96px' }}
              rounded="16px"
              overflow="hidden"
              bg="gray.700"
              flexShrink={0}
            >
              <MediaRenderer
                client={client}
                src={thumbnailImage}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Flex direction="column" gap={1} minW={0}>
              <Heading
                size="lg"
                lineHeight={1.1}
                noOfLines={1}
                textAlign={{ base: 'left', md: 'left' }}
              >
                {contractMetadata?.name || 'Unknown collection'}
              </Heading>
              <Text fontSize="sm" color="gray.400" noOfLines={1}>
                {shortenAddress(nftContract.address)}
              </Text>
              {contractMetadata?.description && (
                <Text maxW={{ base: '320px', md: '420px' }} color="gray.400" noOfLines={2}>
                  {contractMetadata.description}
                </Text>
              )}
            </Flex>
          </HStack>
        </Flex>

        {/* Right: Stats aligned to the right of image */}
        <Flex flex="1" align="flex-end">
          <CollectionStats />
          <Box ml={{ base: 0, md: 4, lg: 6 }} mr={{ base: 0, md: 4, lg: 6 }}>
            <ListingHelpDialog />
          </Box>
        </Flex>
      </Flex>

      <Tabs mt={12} variant={'enclosed-colored'} isFitted isLazy defaultIndex={0}>
        <TabList>
          <Tab>Listings ({listingsInSelectedCollection.length || 0})</Tab>
          <Tab>
            All items{' '}
            {supplyInfo
              ? `(${(supplyInfo.endTokenId - supplyInfo.startTokenId + 1n).toString()})`
              : ''}
          </Tab>
          <Tab>Owned ({ownedNfts?.length ?? 0})</Tab>
          {/* Support for English Auctions coming soon */}
          {/* <Tab>Auctions ({allAuctions?.length || 0})</Tab> */}
        </TabList>

        <TabPanels border={'1px'} borderColor="gray.700" p={0}>
          <TabPanel>
            <ListingsTabContent />
          </TabPanel>
          <TabPanel>
            <AllNftsGrid />
          </TabPanel>
          <TabPanel>
            <OwnedNftsPanel
              ownedNfts={ownedNfts}
              isLoading={isLoadingOwnedNfts}
              accountAddress={account?.address}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
