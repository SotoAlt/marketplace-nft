'use client';

import { HStack, IconButton, Link, Tooltip } from '@chakra-ui/react';
import { FaXTwitter, FaDiscord, FaGlobe } from 'react-icons/fa6';

interface CollectionSocialsProps {
  twitter?: string;
  discord?: string;
  website?: string;
}

export function CollectionSocials({ twitter, discord, website }: CollectionSocialsProps) {
  if (!twitter && !discord && !website) return null;

  return (
    <HStack spacing={2}>
      {twitter && (
        <Tooltip label="X (Twitter)" placement="bottom">
          <IconButton
            as={Link}
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            icon={<FaXTwitter />}
            variant="ghost"
            size="sm"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
        </Tooltip>
      )}
      {discord && (
        <Tooltip label="Discord" placement="bottom">
          <IconButton
            as={Link}
            href={discord}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            icon={<FaDiscord />}
            variant="ghost"
            size="sm"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
        </Tooltip>
      )}
      {website && (
        <Tooltip label="Website" placement="bottom">
          <IconButton
            as={Link}
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            icon={<FaGlobe />}
            variant="ghost"
            size="sm"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
        </Tooltip>
      )}
    </HStack>
  );
}