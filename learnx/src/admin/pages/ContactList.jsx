
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Dialog,
  Portal,
  CloseButton,
  Badge,
  Separator,
  Icon,
  Skeleton,
} from "@chakra-ui/react";
import { FiTrash2, FiRefreshCw, FiMail, FiEye } from "react-icons/fi";
import { getAll, patch, remove } from "../services/crud";

export default function ContactList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewTarget, setViewTarget] = useState(null);

  async function loadMessages() {
    setLoading(true);
    setError("");
    try {
      const data = await getAll("contact");
      setMessages(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function toggleRead(message) {
    try {
      await patch("contact", message.id, { is_read: !message.is_read });
      setSuccess(`Message marked as ${!message.is_read ? "read" : "unread"}.`);
      await loadMessages();
    } catch (err) {
      setError(err.message || "Unable to update message status.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove("contact", deleteTarget.id);
      setSuccess("Message deleted successfully.");
      setDeleteTarget(null);
      await loadMessages();
    } catch (err) {
      setError(err.message || "Unable to delete the message.");
      setDeleteTarget(null);
    }
  }

  return (
    <VStack align="stretch" gap="24px">
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="14px"
      >
        <Box>
          <Heading size="lg" color="#20243A">
            Contact Messages
          </Heading>
          <Text color="gray.500" mt="8px">
            Read and manage messages sent from the public contact form.
          </Text>
        </Box>
        <Button variant="outline" borderRadius="10px" onClick={loadMessages} loading={loading}>
          <FiRefreshCw /> Refresh
        </Button>
      </Flex>

      {success && (
        <Box bg="green.50" border="1px solid" borderColor="green.200" color="green.700" p="12px 16px" borderRadius="10px" fontSize="sm">
          {success}
        </Box>
      )}
      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" color="red.700" p="12px 16px" borderRadius="10px" fontSize="sm">
          {error}
        </Box>
      )}

      <Box bg="white" p={{ base: "18px", md: "26px" }} borderRadius="20px" border="1px solid" borderColor="gray.200" boxShadow="sm">
        <Flex justify="space-between" align="center" mb="24px">
          <HStack gap="12px">
            <Heading size="md" color="#20243A">
              All Messages
            </Heading>
            <Badge bg="#EEEEFB" color="#4545A5" px="10px" py="4px" borderRadius="full" fontSize="sm">
              {messages.length} total
            </Badge>
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="24px">
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} border="1px solid" borderColor="gray.100" borderRadius="16px" p="20px">
                <Skeleton height="20px" mb="12px" width="60%" />
                <Skeleton height="16px" mb="8px" width="80%" />
                <Skeleton height="16px" width="40%" />
              </Box>
            ))}
          </SimpleGrid>
        ) : messages.length === 0 ? (
          <VStack py="60px" gap="16px" bg="gray.50" borderRadius="16px" border="1px dashed" borderColor="gray.300">
            <Flex w="64px" h="64px" borderRadius="full" bg="#EEEEFB" color="#4545A5" align="center" justify="center">
              <Icon as={FiMail} boxSize="32px" />
            </Flex>
            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">No messages yet</Text>
              <Text color="gray.500" fontSize="sm" mt="4px">Messages from the contact form will appear here.</Text>
            </Box>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="24px">
            {messages.map((msg) => (
              <Box
                key={msg.id}
                border="1px solid"
                borderColor={msg.is_read ? "gray.200" : "#4545A5"}
                borderRadius="16px"
                bg="white"
                p="20px"
                position="relative"
                boxShadow={msg.is_read ? "sm" : "md"}
                transition="all .2s ease"
              >
                {!msg.is_read && (
                  <Badge position="absolute" top="20px" right="20px" bg="#4545A5" color="white" borderRadius="full">
                    New
                  </Badge>
                )}

                <Heading size="sm" color="#20243A" mb="4px" pr="60px">
                  {msg.subject}
                </Heading>
                <Text fontSize="sm" color="gray.500" mb="12px">
                  From: <Text as="span" fontWeight="semibold" color="#34384D">{msg.full_name}</Text> ({msg.email})
                </Text>

                <Badge bg="gray.100" color="gray.600" px="8px" py="2px" borderRadius="md" fontSize="xs" mb="16px">
                  {new Date(msg.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Badge>

                <Text fontSize="sm" color="gray.600" noOfLines={2} mb="16px" fontStyle="italic">
                  "{msg.message}"
                </Text>

                <Separator mb="16px" borderColor="gray.100" />

                <HStack gap="10px">
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="8px"
                    flex="1"
                    onClick={() => {
                      setViewTarget(msg);
                      if (!msg.is_read) toggleRead(msg);
                    }}
                    _hover={{ bg: "#EEEEFB", borderColor: "#4545A5", color: "#4545A5" }}
                  >
                    <FiEye /> Read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="8px"
                    color="#DB2777"
                    borderColor="red.200"
                    _hover={{ bg: "#FDECF3", borderColor: "#DB2777" }}
                    flex="1"
                    onClick={() => setDeleteTarget(msg)}
                  >
                    <FiTrash2 /> Delete
                  </Button>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Dialog.Root open={Boolean(viewTarget)} onOpenChange={(e) => !e.open && setViewTarget(null)} size="lg">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="20px">
              <Dialog.Header borderBottom="1px solid" borderColor="gray.100" pb="16px" pt="24px" px="24px">
                <Dialog.Title color="#20243A" fontSize="xl">
                  {viewTarget?.subject}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="md" top="18px" right="18px" />
              </Dialog.CloseTrigger>
              <Dialog.Body pt="24px" px="24px">
                <VStack align="stretch" gap="16px">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontSize="sm" color="gray.500">From</Text>
                      <Text fontWeight="semibold" color="#20243A">{viewTarget?.full_name}</Text>
                      <Text fontSize="sm" color="#4545A5">{viewTarget?.email}</Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="sm" color="gray.500">Received</Text>
                      <Text fontSize="sm" fontWeight="medium" color="#20243A">
                        {viewTarget?.submitted_at && new Date(viewTarget.submitted_at).toLocaleString()}
                      </Text>
                    </Box>
                  </HStack>

                  <Separator borderColor="gray.100" />

                  <Text color="gray.700" lineHeight="1.8" whiteSpace="pre-wrap">
                    {viewTarget?.message}
                  </Text>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer pt="20px" pb="24px" px="24px">
                <Button variant="outline" borderRadius="10px" onClick={() => setViewTarget(null)}>
                  Close
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Improved Delete Confirmation Dialog */}
      <Dialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(e) => !e.open && setDeleteTarget(null)}
        role="alertdialog"
        size="md"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />
          <Dialog.Positioner>
            <Dialog.Content
              maxW={{ base: "calc(100% - 32px)", sm: "460px" }}
              borderRadius="20px"
              overflow="hidden"
              boxShadow="2xl"
              p="0"
            >
              <Dialog.Header
                px="28px"
                pt="28px"
                pb="20px"
                display="flex"
                alignItems="center"
                gap="16px"
              >
                <Flex
                  w="52px"
                  h="52px"
                  flexShrink="0"
                  borderRadius="full"
                  bg="#FDECF3"
                  color="#DB2777"
                  align="center"
                  justify="center"
                >
                  <Icon as={FiTrash2} boxSize="23px" />
                </Flex>

                <Box>
                  <Dialog.Title color="#20243A" fontSize="lg" fontWeight="bold">
                    Delete this message?
                  </Dialog.Title>
                  <Text color="gray.500" fontSize="sm" mt="4px">
                    Please confirm this action.
                  </Text>
                </Box>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top="16px"
                  right="16px"
                  borderRadius="full"
                />
              </Dialog.CloseTrigger>

              <Dialog.Body px="28px" pb="24px">
                <Box
                  bg="#FFF7FA"
                  border="1px solid"
                  borderColor="#FBCFE0"
                  borderRadius="12px"
                  p="16px"
                >
                  <Text color="gray.600" fontSize="sm" lineHeight="1.7">
                    You are about to permanently delete the message from:
                  </Text>

                  <Text
                    color="#20243A"
                    fontWeight="semibold"
                    fontSize="md"
                    mt="8px"
                    overflowWrap="anywhere"
                  >
                    {deleteTarget?.full_name}
                  </Text>

                  <Text color="gray.500" fontSize="xs" mt="8px">
                    This action cannot be undone.
                  </Text>
                </Box>
              </Dialog.Body>

              <Dialog.Footer
                px="28px"
                pt="4px"
                pb="28px"
                gap="12px"
                display="flex"
                flexDirection={{ base: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
              >
                <Button
                  variant="outline"
                  borderRadius="10px"
                  w={{ base: "100%", sm: "auto" }}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </Button>

                <Button
                  color="white"
                  bg="#DB2777"
                  _hover={{ bg: "#BE185D" }}
                  borderRadius="10px"
                  w={{ base: "100%", sm: "auto" }}
                  onClick={handleDelete}
                >
                  <FiTrash2 />
                  Delete Message
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
