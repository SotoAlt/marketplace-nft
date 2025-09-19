'use client';

import { DROP_CONTRACTS } from '@/consts/drop_contracts';
import { Link } from '@chakra-ui/next-js';
import { Box, Card, CardBody, Flex, Heading, Image, Text } from '@chakra-ui/react';

export default function DropDiscoverPage() {
  return (
    <Flex>
      <Box mt="24px" m="auto" maxW="7xl" px={{ base: '20px', md: '0' }}>
        <Heading>Featured drops</Heading>
        <Text color="gray.500" mt="2" mb="8">
          Explore thirdweb drops curated for this marketplace.
        </Text>
        <Flex direction="row" wrap="wrap" gap="6" justifyContent="flex-start">
          {DROP_CONTRACTS.map((drop) => (
            <Card
              key={`${drop.chain.id}-${drop.address}`}
              w={{ base: '100%', sm: '320px' }}
              borderWidth="1px"
              overflow="hidden"
            >
              <Image src={drop.thumbnailUrl} alt={drop.title} height="200px" objectFit="cover" />
              <CardBody display="flex" flexDirection="column" gap="3">
                <Heading size="md">{drop.title}</Heading>
                <Text color="gray.400" noOfLines={2}>
                  {drop.description}
                </Text>
                <Link
                  mt="auto"
                  fontWeight="semibold"
                  href={`/drop/${drop.chain.id}/${drop.address}`}
                  _hover={{ textDecoration: 'none' }}
                >
                  View drop
                </Link>
              </CardBody>
            </Card>
          ))}
          {DROP_CONTRACTS.length === 0 && <Text>No drops configured yet. Check back soon.</Text>}
        </Flex>
      </Box>
    </Flex>
  );
}
