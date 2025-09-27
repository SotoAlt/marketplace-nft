import { Link } from '@chakra-ui/next-js';
import { Box, Text, HStack, Button, type ButtonProps, Skeleton } from '@chakra-ui/react';
import { NFTProvider, NFTMedia, NFTName } from 'thirdweb/react';
import { FiZap } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import type { ThirdwebContract } from 'thirdweb';

interface NFTCardProps {
  nft: {
    id: bigint;
    metadata: {
      name?: string;
      image?: string;
    };
  };
  href: string;
  contract: ThirdwebContract;
  showPrice?: boolean;
  price?: {
    displayValue: string;
    symbol: string;
  };
  containerProps?: any;
  actionButtonLabel?: string;
  actionButtonProps?: ButtonProps;
  index?: number;
}

export function NFTCard({
  nft,
  href,
  contract,
  showPrice = false,
  price,
  containerProps,
  actionButtonLabel,
  actionButtonProps,
  index = 0,
}: NFTCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 80); // 80ms delay between each card

    return () => clearTimeout(timer);
  }, [index]);

  const hoverStyles = {
    bg: 'green.400',
    color: 'black',
    boxShadow: '0 6px 20px rgba(72, 187, 120, 0.35)',
  } as const;

  const defaultButtonProps: ButtonProps = {
    size: 'sm',
    w: 'full',
    fontWeight: 'bold',
    rounded: 'md',
    bg: 'purple.500',
    color: 'white',
    transition: 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
    _groupHover: hoverStyles,
    _hover: hoverStyles,
  };

  const buttonProps: ButtonProps = {
    ...defaultButtonProps,
    leftIcon: <FiZap />,
    ...actionButtonProps,
  };

  return (
    <NFTProvider contract={contract} tokenId={nft.id}>
      <Box
        as={Link}
        href={href}
        role="group"
        _hover={{
          textDecoration: 'none',
          transform: isVisible ? 'translateY(-2px)' : 'translateY(20px)',
          boxShadow: 'lg',
        }}
        transition="all 0.4s ease-out"
        opacity={isVisible ? 1 : 0}
        transform={isVisible ? 'translateY(0)' : 'translateY(20px)'}
        bg="gray.800"
        border="1px solid"
        borderColor="gray.700"
        overflow="hidden"
        boxShadow="md"
        maxW="280px"
        w="full"
        display="flex"
        flexDirection="column"
        {...containerProps}
      >
        <Box overflow="hidden">
          <Box
            transition="transform 0.3s ease"
            transformOrigin="center"
            _groupHover={{ transform: 'scale(1.05)' }}
          >
            <NFTMedia
              loadingComponent={<Skeleton height={'200px'} width={'250px'} />}
              style={{
                width: '100%',
                aspectRatio: '0.9',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Box>
        <Box p={3} display="flex" flexDirection="column" gap={2}>
          <Text fontWeight="bold" fontSize="lg" color="white" noOfLines={1}>
            <NFTName />
          </Text>
          <Text fontSize="sm" color="gray.400">
            #{nft.id.toString()}
          </Text>
          {showPrice && price && (
            <HStack justify="space-between" align="center">
              <Text fontSize="xs" color="gray.500">
                Price
              </Text>
              <Text fontWeight="bold" fontSize="md" color="white">
                {price.displayValue} {price.symbol}
              </Text>
            </HStack>
          )}
          {actionButtonLabel && (
            <Button {...buttonProps} as="span">
              {actionButtonLabel}
            </Button>
          )}
        </Box>
      </Box>
    </NFTProvider>
  );
}
