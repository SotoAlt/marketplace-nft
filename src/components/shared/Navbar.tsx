'use client';

import { client } from '@/consts/client';
import { supportedWallets } from '@/consts/wallets';
import { useGetENSAvatar } from '@/hooks/useGetENSAvatar';
import { useGetENSName } from '@/hooks/useGetENSName';
import { Link } from '@chakra-ui/next-js';
import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Image,
  useColorMode,
  Tooltip,
} from '@chakra-ui/react';
import { blo } from 'blo';
import { FiUser } from 'react-icons/fi';
import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';
import type { Wallet } from 'thirdweb/wallets';
import { SideMenu } from './SideMenu';

export function Navbar() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { colorMode } = useColorMode();
  return (
    <Box py="30px" px={{ base: '20px', lg: '50px' }}>
      <Flex direction="row" justifyContent="space-between">
        <Flex gap="16px" alignItems="center">
          <Heading
            as={Link}
            href="/"
            _hover={{ textDecoration: 'none' }}
            bgGradient="linear(to-l, #7928CA, #FF0080)"
            bgClip="text"
            fontWeight="extrabold"
          >
            <Image src="/remi-logo.svg" alt="remi" width="100px" height="auto" />
          </Heading>
        </Flex>
        <Box display={{ lg: 'block', base: 'none' }}>
          <Tooltip label="You will be redirected to a DEX aggregator" placement="bottom">
            <Button 
              as={Link} 
              href="https://dapp.gluex.xyz/?fromChain=9745&fromToken=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&toChain=9745&toToken=0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb"
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost" 
              mr="10px"
            >
              Swap
            </Button>
          </Tooltip>
          <Button as={Link} href="/faq" variant="ghost" mr="10px">
            FAQ
          </Button>
          <Tooltip label="Coming Soon" placement="bottom">
            <Button variant="ghost" mr="10px" isDisabled cursor="not-allowed">
              Leaderboard
            </Button>
          </Tooltip>
          {account && wallet ? (
            <ProfileButton address={account.address} wallet={wallet} />
          ) : (
            <ConnectButton
              client={client}
              wallets={supportedWallets}
              theme={colorMode}
              connectButton={{ style: { height: '56px' } }}
              connectModal={{
                size: 'compact',
              }}
            />
          )}
        </Box>
        <SideMenu />
      </Flex>
    </Box>
  );
}

function ProfileButton({ address, wallet }: { address: string; wallet: Wallet }) {
  const { disconnect } = useDisconnect();
  const { data: ensName } = useGetENSName({ address });
  const { data: ensAvatar } = useGetENSAvatar({ ensName });
  const { colorMode } = useColorMode();
  return (
    <Menu>
      <MenuButton as={Button} height="56px">
        <Flex direction="row" gap="5">
          <Box my="auto">
            <FiUser size={30} />
          </Box>
          <Image src={ensAvatar ?? blo(address as `0x${string}`)} height="40px" rounded="8px" />
        </Flex>
      </MenuButton>
      <MenuList>
        <Box px="3" py="2">
          <ConnectButton
            client={client}
            wallets={supportedWallets}
            theme={colorMode}
            connectModal={{
              size: 'compact',
            }}
          />
        </Box>
        <MenuDivider />
        <MenuItem as={Link} href="/profile" _hover={{ textDecoration: 'none' }}>
          Profile {ensName ? `(${ensName})` : ''}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (wallet) disconnect(wallet);
          }}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
