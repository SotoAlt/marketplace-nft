import { NATIVE_TOKEN_ICON_MAP, Token } from '@/consts/supported_tokens';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { CheckIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { plasma } from '@/consts/chains';
import {
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Image,
  useToast,
  Box,
  HStack,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { NATIVE_TOKEN_ADDRESS, sendAndConfirmTransaction } from 'thirdweb';
import {
  isApprovedForAll as isApprovedForAll1155,
  setApprovalForAll as setApprovalForAll1155,
} from 'thirdweb/extensions/erc1155';
import {
  isApprovedForAll as isApprovedForAll721,
  setApprovalForAll as setApprovalForAll721,
} from 'thirdweb/extensions/erc721';
import { createListing } from 'thirdweb/extensions/marketplace';
import { useActiveWalletChain, useSwitchActiveWalletChain } from 'thirdweb/react';
import type { Account } from 'thirdweb/wallets';

type Props = {
  tokenId: bigint;
  account: Account;
};

export function CreateListing(props: Props) {
  const priceRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const { tokenId, account } = props;
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();
  const [currency, setCurrency] = useState<Token>();
  const toast = useToast();

  const { nftContract, marketplaceContract, refetchAllListings, type, supportedTokens } =
    useMarketplaceContext();
  const chain = marketplaceContract.chain;

  const isPlasmaMainnet = chain.id === plasma.id;
  
  // Auto-select USDT0 for Plasma mainnet
  useEffect(() => {
    if (isPlasmaMainnet && supportedTokens.length > 0) {
      // Find USDT0 token in supported tokens
      const usdt0Token = supportedTokens.find(token => 
        token.symbol.toUpperCase() === 'USDT0'
      );
      if (usdt0Token) {
        setCurrency(usdt0Token);
      }
    }
  }, [isPlasmaMainnet, supportedTokens]);

  const nativeToken: Token = {
    tokenAddress: NATIVE_TOKEN_ADDRESS,
    symbol: chain.nativeCurrency?.symbol || 'NATIVE TOKEN',
    icon: NATIVE_TOKEN_ICON_MAP[chain.id] || '',
  };

  const options: Token[] = [nativeToken].concat(supportedTokens);

  return (
    <>
      <br />
      <Flex direction="column" w={{ base: '90vw', lg: '100%' }} gap="10px">
        {type === 'ERC1155' ? (
          <>
            <Flex direction="row" flexWrap="wrap" justifyContent="space-between">
              <Box>
                <Text>Price</Text>
                <Input type="number" ref={priceRef} placeholder="Enter a price" />
              </Box>
              <Box>
                <Text>Quantity</Text>
                <Input type="number" ref={qtyRef} defaultValue={1} placeholder="Quantity to sell" />
              </Box>
            </Flex>
          </>
        ) : (
          <>
            <Text>Price</Text>
            <Input type="number" ref={priceRef} placeholder="Enter a price for your listing" />
          </>
        )}
        
        {/* Show fixed USDT0 for Plasma mainnet, dropdown for other chains */}
        {isPlasmaMainnet ? (
          <Box>
            <Text mb={2}>Currency</Text>
            <HStack 
              p={3} 
              borderWidth="1px" 
              borderRadius="md" 
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
            >
              {currency && (
                <>
                  <Image boxSize="2rem" borderRadius="full" src={currency.icon} />
                  <Text fontWeight="medium">{currency.symbol}</Text>
                  <Text fontSize="sm" color="gray.500" ml="auto">Fixed</Text>
                </>
              )}
            </HStack>
          </Box>
        ) : (
          <Menu>
            <MenuButton minH="48px" as={Button} rightIcon={<ChevronDownIcon />}>
              {currency ? (
                <Flex direction="row">
                  <Image boxSize="2rem" borderRadius="full" src={currency.icon} mr="12px" />
                  <Text my="auto">{currency.symbol}</Text>
                </Flex>
              ) : (
                'Select currency'
              )}
            </MenuButton>
            <MenuList>
              {options.map((token) => (
                <MenuItem
                  minH="48px"
                  key={token.tokenAddress}
                  onClick={() => setCurrency(token)}
                  display={'flex'}
                  flexDir={'row'}
                >
                  <Image boxSize="2rem" borderRadius="full" src={token.icon} ml="2px" mr="14px" />
                  <Text my="auto">{token.symbol}</Text>
                  {token.tokenAddress.toLowerCase() === currency?.tokenAddress.toLowerCase() && (
                    <CheckIcon ml="auto" />
                  )}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
        <Button
          isDisabled={!currency}
          onClick={async () => {
            const value = priceRef.current?.value;
            if (!value) {
              return toast({
                title: 'Please enter a price for this listing',
                status: 'error',
                isClosable: true,
                duration: 5000,
              });
            }
            if (!currency) {
              return toast({
                title: `Please select a currency for the listing`,
                status: 'error',
                isClosable: true,
                duration: 5000,
              });
            }
            if (activeChain?.id !== nftContract.chain.id) {
              await switchChain(nftContract.chain);
            }
            const _qty = BigInt(qtyRef.current?.value ?? 1);
            if (type === 'ERC1155') {
              if (!_qty || _qty <= 0n) {
                return toast({
                  title: 'Error',
                  description: 'Invalid quantity',
                  status: 'error',
                  isClosable: true,
                  duration: 5000,
                });
              }
            }

            // Check for approval
            const checkApprove = type === 'ERC1155' ? isApprovedForAll1155 : isApprovedForAll721;

            const isApproved = await checkApprove({
              contract: nftContract,
              owner: account.address,
              operator: marketplaceContract.address,
            });

            if (!isApproved) {
              const setApproval = type === 'ERC1155' ? setApprovalForAll1155 : setApprovalForAll721;

              const approveTx = setApproval({
                contract: nftContract,
                operator: marketplaceContract.address,
                approved: true,
              });

              await sendAndConfirmTransaction({
                transaction: approveTx,
                account,
              });
            }

            const transaction = createListing({
              contract: marketplaceContract,
              assetContractAddress: nftContract.address,
              tokenId,
              quantity: type === 'ERC721' ? 1n : _qty,
              currencyContractAddress: currency?.tokenAddress,
              pricePerToken: value,
            });

            await sendAndConfirmTransaction({
              transaction,
              account,
            });
            refetchAllListings();
          }}
        >
          List
        </Button>
      </Flex>
    </>
  );
}
