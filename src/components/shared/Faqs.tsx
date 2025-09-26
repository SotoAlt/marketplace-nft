"use client";

import { FAQS } from "@/consts/documentation";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  Text,
  VStack,
  Container,
} from "@chakra-ui/react";

export function Faqs() {
  return (
    <Container maxW="7xl" py={12} id="faqs">
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading as="h2" size="xl">
            FAQs
          </Heading>
        </Box>
        <Accordion allowMultiple defaultIndex={[0]}> 
          {FAQS.map((item) => (
            <AccordionItem key={item.id} bg="gray.900" border="1px" borderColor="gray.700" mb={2}>
              <h3>
                <AccordionButton _hover={{ bg: "gray.800" }} py={4}>
                  <Box as="span" flex="1" textAlign="left" fontWeight="semibold" color="white">
                    {item.question}
                  </Box>
                  <AccordionIcon color="white" />
                </AccordionButton>
              </h3>
              <AccordionPanel pb={4} color="gray.300">
                <Text mb={item.links?.length ? 2 : 0}>{item.answer}</Text>
                {item.links?.length ? (
                  <Box>
                    {item.links.map((l) => (
                      <Text as="a" key={l.href} href={l.href} color="purple.300" display="inline-block" mr={4}>
                        {l.label}
                      </Text>
                    ))}
                  </Box>
                ) : null}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
    </Container>
  );
}

export default Faqs;

