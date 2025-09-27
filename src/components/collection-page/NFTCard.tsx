import { client, NFT_PLACEHOLDER_IMAGE } from '@/consts/client';
import { Link } from '@chakra-ui/next-js';
import { Box, Text, HStack, Button, type ButtonProps } from '@chakra-ui/react';
import { MediaRenderer } from 'thirdweb/react';
import { FiZap } from 'react-icons/fi';

interface NFTCardProps {
  nft: {
    id: bigint;
    metadata: {
      name?: string;
      image?: string;
    };
  };
  href: string;
  showPrice?: boolean;
  price?: {
    displayValue: string;
    symbol: string;
  };
  containerProps?: any;
  actionButtonLabel?: string;
  actionButtonProps?: ButtonProps;
}

export function NFTCard({
  nft,
  href,
  showPrice = false,
  price,
  containerProps,
  actionButtonLabel,
  actionButtonProps,
}: NFTCardProps) {
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
    <Box
      as={Link}
      href={href}
      role="group"
      _hover={{
        textDecoration: 'none',
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
      transition="all 0.2s"
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
          <MediaRenderer
            client={client}
            src={nft.metadata.image || NFT_PLACEHOLDER_IMAGE}
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
          {nft.metadata?.name ?? 'Unnamed NFT'}
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
  );
}
