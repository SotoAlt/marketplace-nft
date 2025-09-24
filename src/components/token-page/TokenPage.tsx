import { client, NFT_PLACEHOLDER_IMAGE } from '@/consts/client';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  SimpleGrid,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { balanceOf, getNFT as getERC1155 } from 'thirdweb/extensions/erc1155';
import { getNFT as getERC721 } from 'thirdweb/extensions/erc721';
import { MediaRenderer, useActiveAccount, useReadContract } from 'thirdweb/react';
import { shortenAddress } from 'thirdweb/utils';
import { CreateListing } from './CreateListing';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import dynamic from 'next/dynamic';
import { NftDetails } from './NftDetails';
import RelatedListings from './RelatedListings';

const CancelListingButton = dynamic(() => import('./CancelListingButton'), {
  ssr: false,
});
const BuyFromListingButton = dynamic(() => import('./BuyFromListingButton'), {
  ssr: false,
});

type Props = {
  tokenId: bigint;
};

export function Token(props: Props) {
  const { type, nftContract, contractMetadata, listingsInSelectedCollection } =
    useMarketplaceContext();
  const { tokenId } = props;
  const account = useActiveAccount();

  const { data: nft } = useReadContract(type === 'ERC1155' ? getERC1155 : getERC721, {
    tokenId: BigInt(tokenId),
    contract: nftContract,
    includeOwner: true,
  });

  const { data: ownedQuantity1155 } = useReadContract(balanceOf, {
    contract: nftContract,
    owner: account?.address!,
    tokenId: tokenId,
    queryOptions: {
      enabled: !!account?.address && type === 'ERC1155',
    },
  });

  const listings = (listingsInSelectedCollection || []).filter(
    (item) =>
      item.assetContractAddress.toLowerCase() === nftContract.address.toLowerCase() &&
      item.asset.id === BigInt(tokenId)
  );

  const ownedByYou = nft?.owner?.toLowerCase() === account?.address.toLowerCase();

  const lowestPriceListing =
    listings.length > 0
      ? listings.reduce((lowest, current) => {
          const currentPrice = parseFloat(current.currencyValuePerToken.displayValue);
          const lowestPrice = parseFloat(lowest.currencyValuePerToken.displayValue);
          return currentPrice < lowestPrice ? current : lowest;
        })
      : null;

  return (
    <Container maxW="7xl" py={8} minH="100vh">
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="start">
        {/* Left Column - NFT Image & Info */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* NFT Image */}
            <Box bg="gray.900" p={0} overflow="hidden">
              <Box position="relative">
                <MediaRenderer
                  client={client}
                  src={nft?.metadata.image || NFT_PLACEHOLDER_IMAGE}
                  style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '1',
                  }}
                />
              </Box>
            </Box>

            {/* Accordion Sections */}
            <Accordion allowMultiple defaultIndex={[0, 1, 2]} allowToggle>
              {/* Description */}
              {nft?.metadata.description && (
                <AccordionItem bg="gray.900" border="1px" borderColor="gray.700" mb={2}>
                  <AccordionButton _hover={{ bg: 'gray.800' }} py={4}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="semibold" color="white">
                      Description
                    </Box>
                    <AccordionIcon color="white" />
                  </AccordionButton>
                  <AccordionPanel pb={4} color="gray.300">
                    <Text>{nft.metadata.description}</Text>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Traits */}
              {Array.isArray(nft?.metadata?.attributes) && nft.metadata.attributes.length > 0 && (
                <AccordionItem bg="gray.900" border="1px" borderColor="gray.700" mb={2}>
                  <AccordionButton _hover={{ bg: 'gray.800' }} py={4}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="semibold" color="white">
                      Traits {nft.metadata.attributes.filter((attr: any) => attr.trait_type).length}
                    </Box>
                    <AccordionIcon color="white" />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                      {nft.metadata.attributes
                        .filter((attr: any) => attr.trait_type)
                        .map((attr: any) => (
                          <Box
                            key={attr.trait_type}
                            bg="gray.800"
                            border="1px"
                            borderColor="gray.600"
                            p={3}
                          >
                            <Text fontSize="xs" color="gray.400" mb={1}>
                              {attr.trait_type}
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" color="white">
                              {String(attr.value)}
                            </Text>
                          </Box>
                        ))}
                    </SimpleGrid>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Details */}
              {nft && (
                <AccordionItem bg="gray.900" border="1px" borderColor="gray.700">
                  <AccordionButton _hover={{ bg: 'gray.800' }} py={4}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="semibold" color="white">
                      Details
                    </Box>
                    <AccordionIcon color="white" />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <NftDetails nft={nft} />
                  </AccordionPanel>
                </AccordionItem>
              )}
            </Accordion>
          </VStack>
        </GridItem>

        {/* Right Column - Token Info & Actions */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Collection Info */}
            <Box>
              <Text fontSize="sm" color="gray.400">
                Collection
              </Text>
              <Heading size="md" color="white" mb={4}>
                {contractMetadata?.name}
              </Heading>
            </Box>

            {/* Token Name & ID */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1}>
                #{nft?.id.toString()}
              </Text>
              <Heading size="lg" color="white" mb={6}>
                {nft?.metadata.name}
              </Heading>
            </Box>

            {/* Best Price Section */}
            {lowestPriceListing && (
              <Box bg="gray.900" border="1px" borderColor="gray.700" p={4}>
                <Text fontSize="sm" color="gray.400" mb={2}>
                  Best Price
                </Text>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color="white">
                      {lowestPriceListing.currencyValuePerToken.displayValue}
                    </Heading>
                    <Text fontSize="sm" color="gray.400">
                      {lowestPriceListing.currencyValuePerToken.symbol}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Owner Info */}
            <Box bg="gray.900" border="1px" borderColor="gray.700" p={4}>
              {type === 'ERC1155' ? (
                account &&
                ownedQuantity1155 && (
                  <>
                    <Text fontSize="sm" color="gray.400" mb={2}>
                      You own
                    </Text>
                    <Heading size="md" color="white">
                      {ownedQuantity1155.toString()}
                    </Heading>
                  </>
                )
              ) : (
                <>
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Owned by
                  </Text>
                  <HStack>
                    <Heading size="md" color="white">
                      {nft?.owner ? shortenAddress(nft.owner) : 'N/A'}
                    </Heading>
                    {ownedByYou && (
                      <Tag colorScheme="blue" size="sm">
                        <TagLabel>You</TagLabel>
                      </Tag>
                    )}
                  </HStack>
                </>
              )}
            </Box>

            {/* Create Listing */}
            {account && nft && (ownedByYou || (ownedQuantity1155 && ownedQuantity1155 > 0n)) && (
              <CreateListing tokenId={nft?.id} account={account} />
            )}

            {/* Listings & Offers */}
            <Accordion allowMultiple defaultIndex={[0]} allowToggle>
              <AccordionItem bg="gray.900" border="1px" borderColor="gray.700">
                <AccordionButton _hover={{ bg: 'gray.800' }} py={4}>
                  <Box as="span" flex="1" textAlign="left" fontWeight="semibold" color="white">
                    Listings ({listings.length})
                  </Box>
                  <AccordionIcon color="white" />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {listings.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th color="gray.400" borderColor="gray.700">
                              Price
                            </Th>
                            {type === 'ERC1155' && (
                              <Th color="gray.400" borderColor="gray.700">
                                Qty
                              </Th>
                            )}
                            <Th color="gray.400" borderColor="gray.700">
                              Expiration
                            </Th>
                            <Th color="gray.400" borderColor="gray.700">
                              From
                            </Th>
                            <Th color="gray.400" borderColor="gray.700"></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {listings.map((item) => {
                            const listedByYou =
                              item.creatorAddress.toLowerCase() === account?.address.toLowerCase();
                            return (
                              <Tr key={item.id.toString()}>
                                <Td borderColor="gray.700">
                                  <Text color="white" fontWeight="semibold">
                                    {item.currencyValuePerToken.displayValue}{' '}
                                    {item.currencyValuePerToken.symbol}
                                  </Text>
                                </Td>
                                {type === 'ERC1155' && (
                                  <Td borderColor="gray.700">
                                    <Text color="gray.300">{item.quantity.toString()}</Text>
                                  </Td>
                                )}
                                <Td borderColor="gray.700">
                                  <Text color="gray.300" fontSize="sm">
                                    {getExpiration(item.endTimeInSeconds)}
                                  </Text>
                                </Td>
                                <Td borderColor="gray.700">
                                  <Text color="gray.300" fontSize="sm">
                                    {listedByYou ? 'You' : shortenAddress(item.creatorAddress)}
                                  </Text>
                                </Td>
                                {account && (
                                  <Td borderColor="gray.700">
                                    {!listedByYou ? (
                                      <BuyFromListingButton account={account} listing={item} />
                                    ) : (
                                      <CancelListingButton account={account} listingId={item.id} />
                                    )}
                                  </Td>
                                )}
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Text color="gray.400">This item is not listed for sale</Text>
                  )}
                </AccordionPanel>
              </AccordionItem>

              <Box mt={2}>
                <RelatedListings excludedListingId={listings[0]?.id ?? -1n} />
              </Box>
            </Accordion>
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
}

function getExpiration(endTimeInSeconds: bigint) {
  // Get the current date and time
  const currentDate = new Date();

  // Convert seconds to milliseconds (bigint)
  const milliseconds: bigint = endTimeInSeconds * 1000n;

  // Calculate the future date by adding milliseconds to the current date
  const futureDate = new Date(currentDate.getTime() + Number(milliseconds));

  // Format the future date
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    timeZoneName: 'short',
  };
  const formattedDate = futureDate.toLocaleDateString('en-US', options);
  return formattedDate;
}
