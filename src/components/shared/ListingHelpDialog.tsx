"use client";

import { LISTING_GUIDE } from "@/consts/documentation";
import {
  Badge,
  Box,
  Button,
  HStack,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Text,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

type Props = {
  label?: string; // Trigger label
  size?: "sm" | "md" | "lg"; // Trigger size
  asBadge?: boolean; // Render trigger like a Badge-style button
};

export function ListingHelpDialog(props: Props) {
  const { label = "How to list?", size = "sm", asBadge = true } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const Trigger = (
    <Button
      onClick={onOpen}
      size={size}
      leftIcon={<InfoIcon />}
      variant={asBadge ? "outline" : "solid"}
      colorScheme={asBadge ? "blue" : "purple"}
    >
      {label}
    </Button>
  );

  return (
    <>
      {asBadge ? <Box>{Trigger}</Box> : Trigger}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.900" border="1px" borderColor="gray.700">
          <ModalHeader>
            <HStack>
              <Badge colorScheme="purple">Guide</Badge>
              <Text>{LISTING_GUIDE.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text color="gray.300" mb={4}>
              {LISTING_GUIDE.intro}
            </Text>

            <Box mb={4}>
              <Text fontWeight="semibold" mb={2}>
                Prerequisites
              </Text>
              <UnorderedList spacing={1} color="gray.300">
                {LISTING_GUIDE.prerequisites.map((p) => (
                  <ListItem key={p}>{p}</ListItem>
                ))}
              </UnorderedList>
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={2}>
                Steps
              </Text>
              <OrderedList spacing={2} color="gray.300">
                {LISTING_GUIDE.steps.map((s) => (
                  <ListItem key={s.title}>
                    <Text fontWeight="semibold" color="gray.100">
                      {s.title}
                    </Text>
                    <Text>{s.details}</Text>
                    {s.tip ? (
                      <Text color="gray.400" mt={1}>
                        Tip: {s.tip}
                      </Text>
                    ) : null}
                  </ListItem>
                ))}
              </OrderedList>
            </Box>

            {LISTING_GUIDE.notes?.length ? (
              <Box mt={5}>
                <Text fontWeight="semibold" mb={2}>
                  Notes
                </Text>
                <UnorderedList spacing={1} color="gray.300">
                  {LISTING_GUIDE.notes.map((n) => (
                    <ListItem key={n}>{n}</ListItem>
                  ))}
                </UnorderedList>
              </Box>
            ) : null}

            {LISTING_GUIDE.links?.length ? (
              <HStack mt={6} spacing={4} wrap="wrap">
                {LISTING_GUIDE.links.map((l) => (
                  <Button key={l.href} as="a" href={l.href} size="sm" variant="link" colorScheme="purple">
                    {l.label}
                  </Button>
                ))}
              </HStack>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ListingHelpDialog;

