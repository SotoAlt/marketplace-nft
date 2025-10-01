'use client';

import { client } from '@/consts/client';
import { supportedWallets } from '@/consts/wallets';
import { useGetENSAvatar } from '@/hooks/useGetENSAvatar';
import { useGetENSName } from '@/hooks/useGetENSName';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link } from '@chakra-ui/next-js';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { FaRegMoon } from 'react-icons/fa';
import { IoSunny } from 'react-icons/io5';
import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';

export function SideMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { disconnect } = useDisconnect();
  const account = useActiveAccount();
  const { data: ensName } = useGetENSName({ address: account?.address });
  const { data: ensAvatar } = useGetENSAvatar({ ensName });
  const { colorMode, toggleColorMode } = useColorMode();
  const wallet = useActiveWallet();

  return (
    <>
      <Button display={{ lg: 'none', base: 'block' }} ref={btnRef} onClick={onOpen}>
        <HamburgerIcon />
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Button height="56px" w="56px" onClick={toggleColorMode} mr="10px">
              {colorMode === 'light' ? <FaRegMoon /> : <IoSunny />}
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <Box mb="6" display="flex" flexDirection="column" gap="4">
              <Link href="/" onClick={onClose}>
                Home
              </Link>
              <Link href="/drop" onClick={onClose}>
                Drops
              </Link>
              <Link href="/#faqs" onClick={onClose}>
                FAQs
              </Link>
              {account && (
                <Link href="/profile" onClick={onClose}>
                  Profile {ensName ? `(${ensName})` : ''}
                </Link>
              )}
            </Box>
            <Box>
              <ConnectButton 
                theme={colorMode} 
                client={client} 
                wallets={supportedWallets}
                connectModal={{
                  showThirdwebBranding: false,
                }}
              />
            </Box>
          </DrawerBody>
          <DrawerFooter>
            {account && (
              <Button
                onClick={() => {
                  if (wallet) disconnect(wallet);
                }}
              >
                Logout
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
