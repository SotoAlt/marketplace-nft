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
  IconButton,
  useClipboard,
  Tooltip,
} from '@chakra-ui/react';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { ListingsTabContent } from './ListingsTabContent';
import { AllNftsGrid } from './AllNftsGrid';
import { CollectionStats } from './CollectionStats';
import { CollectionBanner } from './CollectionBanner';
import { CollectionSocials } from './CollectionSocials';
import { shortenAddress } from 'thirdweb/utils';
import { useOwnedNfts } from '@/hooks/useOwnedNfts';
import { OwnedNftsPanel } from './OwnedNftsPanel';
import ListingHelpDialog from '@/components/shared/ListingHelpDialog';
import { IoCopy, IoCheckmark } from 'react-icons/io5';

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
  
  // Hardcoded social links per collection contract address
  const getSocialLinks = (contractAddress: string) => {
    const address = contractAddress.toLowerCase();
    
    // PRETRILLIONS collection (official contract)
    if (address === '0x4633b5f2f84c5506ae3979d1eeb5e58c912cfa5b') {
      return {
        twitter: 'https://x.com/remi_online_',
        discord: 'https://discord.gg/pretrillions',
      };
    }
    
    // Default - no socials
    return {
      twitter: undefined,
      discord: undefined,
    };
  };

  const socialLinks = getSocialLinks(nftContract.address);
  const { hasCopied, onCopy } = useClipboard(nftContract.address);

  return (
    <>
      <CollectionBanner />
      <Box mt="12px" maxW="7xl" mx="auto" px={{ base: 4, md: 8 }}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 6, md: 10 }} align="stretch">
        {/* Left: Image + Title + Description */}
        <Flex w={{ base: 'full', md: 'fit-content' }} flexShrink={0} align="flex-start">
          <HStack align="center" spacing={{ base: 4, md: 5 }}>
            <Box
              w={{ base: '80px', md: '120px' }}
              h={{ base: '80px', md: '120px' }}
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
                fontFamily="var(--font-roboto)"
                fontWeight="600"
              >
                {contractMetadata?.name || 'Unknown collection'}
              </Heading>
              <HStack spacing={2} align="center">
                <HStack spacing={1} align="center">
                  <Text fontSize="sm" color="gray.400" noOfLines={1}>
                    {shortenAddress(nftContract.address)}
                  </Text>
                  <Tooltip label={hasCopied ? "Copied!" : "Copy contract address"} placement="top">
                    <IconButton
                      aria-label="Copy contract address"
                      icon={hasCopied ? <IoCheckmark /> : <IoCopy />}
                      size="xs"
                      variant="ghost"
                      color={hasCopied ? "green.400" : "gray.400"}
                      _hover={{ color: hasCopied ? "green.300" : "gray.300" }}
                      onClick={onCopy}
                    />
                  </Tooltip>
                </HStack>
                <CollectionSocials 
                  twitter={socialLinks.twitter}
                  discord={socialLinks.discord}
                />
              </HStack>
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
        </Flex>
      </Flex>

      <Flex justify="space-between" align="center" mt={12} mb={4}>
        <Box flex="1">
        </Box>
        <Box>
          <ListingHelpDialog />
        </Box>
      </Flex>
      
      <Tabs variant={'enclosed-colored'} isFitted isLazy defaultIndex={0}>
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
    </>
  );
}
