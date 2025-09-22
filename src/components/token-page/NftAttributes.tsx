import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Card,
  Flex,
  Text,
} from '@chakra-ui/react';

type Attribute = {
  trait_type?: string;
  value?: unknown;
  [key: string]: unknown;
};

export function NftAttributes({ attributes }: { attributes: Attribute[] }) {
  /**
   * Assume the NFT attributes follow the conventional format
   */
  const items = attributes.filter((item) => item.trait_type);
  return (
    <AccordionItem>
      <Text>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left">
            Traits
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Text>
      <AccordionPanel pb={4}>
        <Flex direction="row" wrap="wrap" gap="3">
          {items.map((item) => {
            const displayValue =
              item.value == null
                ? ''
                : typeof item.value === 'object'
                  ? JSON.stringify(item.value)
                  : String(item.value);
            return (
              <Card
                key={item.trait_type}
                as={Flex}
                flexDir="column"
                gap={2}
                py={2}
                px={4}
                bg={'transparent'}
                border="1px"
              >
                {item.trait_type && (
                  <Text size="label.sm" textAlign="center" lineHeight={1.2}>
                    {item.trait_type}
                  </Text>
                )}
                <Text size="label.md" textAlign="center" fontWeight="bold">
                  {displayValue}
                </Text>
              </Card>
            );
          })}
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  );
}
