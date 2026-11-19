
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

import {
  FiTrash2,
  FiRefreshCw,
  FiMail,
  FiEye,
  FiUser,
  FiClock,
  FiInbox,
  FiCheckCircle,
  FiMessageSquare,
} from "react-icons/fi";

import { getAll, patch, remove } from "../services/crud";

export default function ContactList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
      await patch("contact", message.id, {
        is_read: !message.is_read,
      });

      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id
            ? { ...item, is_read: !message.is_read }
            : item
        )
      );

      setSuccess(
        `Message marked as ${!message.is_read ? "read" : "unread"}.`
      );

      if (viewTarget?.id === message.id) {
        setViewTarget((prev) =>
          prev ? { ...prev, is_read: !message.is_read } : null
        );
      }
    } catch (err) {
      setError(err.message || "Unable to update message status.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    try {
      await remove("contact", deleteTarget.id);

      setSuccess("Message deleted successfully.");
      setDeleteTarget(null);

      if (viewTarget?.id === deleteTarget.id) {
        setViewTarget(null);
      }

      await loadMessages();
    } catch (err) {
      setError(err.message || "Unable to delete the message.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      minH="100vh"
      bg="#F6F7FB"
      p={{ base: 3, md: 6, lg: 8 }}
    >
      <VStack align="stretch" gap={6} maxW="1600px" mx="auto">

        {/* PAGE HEADER */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Box>
            <HStack gap={2} mb={2}>
              <Box
                bg="#EEEEFB"
                color="#4545A5"
                p={2}
                borderRadius="10px"
              >
                <Icon as={FiMail} boxSize={5} />
              </Box>

              <Badge
                bg="#EEEEFB"
                color="#4545A5"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                CONTACT MANAGEMENT
              </Badge>
            </HStack>

            <Heading
              size={{ base: "lg", md: "xl" }}
              color="#20243A"
              fontWeight="800"
            >
              Contact Messages
            </Heading>

            <Text color="#85869A" fontSize="sm" mt={2}>
              Read and manage messages submitted through your website contact form.
            </Text>
          </Box>

          <Button
            bg="#4545A5"
            color="white"
            px={5}
            h="44px"
            borderRadius="10px"
            fontWeight="600"
            onClick={loadMessages}
            loading={loading}
            _hover={{
              bg: "#353584",
              transform: "translateY(-1px)",
            }}
            transition="all 0.2s"
          >
            <Icon as={FiRefreshCw} mr={2} />
            Refresh
          </Button>
        </Flex>

        {/* SUCCESS MESSAGE */}
        {success && (
          <Flex
            align="center"
            gap={3}
            bg="#ECFDF5"
            border="1px solid #A7F3D0"
            color="#047857"
            p={4}
            borderRadius="12px"
          >
            <Icon as={FiCheckCircle} boxSize={5} />

            <Text fontSize="sm" fontWeight="600">
              {success}
            </Text>

            <Box flex="1" />

            <Button
              size="xs"
              variant="ghost"
              color="#047857"
              onClick={() => setSuccess("")}
            >
              Dismiss
            </Button>
          </Flex>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <Flex
            align="center"
            gap={3}
            bg="#FFF1F2"
            border="1px solid #FECDD3"
            color="#BE123C"
            p={4}
            borderRadius="12px"
          >
            <Icon as={FiInbox} boxSize={5} />

            <Text fontSize="sm" fontWeight="600">
              {error}
            </Text>

            <Box flex="1" />

            <Button
              size="xs"
              variant="ghost"
              color="#BE123C"
              onClick={() => setError("")}
            >
              Dismiss
            </Button>
          </Flex>
        )}

        {/* TOTAL MESSAGES */}
        <Box
          bg="white"
          p={5}
          borderRadius="16px"
          border="1px solid #EBECF3"
          boxShadow="0 3px 14px rgba(30,35,80,0.03)"
          maxW={{ base: "100%", sm: "280px" }}
        >
          <HStack justify="space-between">
            <Box>
              <Text
                color="#9293A5"
                fontSize="sm"
                fontWeight="600"
              >
                Total Messages
              </Text>

              <Heading size="2xl" color="#20243A" mt={2}>
                {messages.length}
              </Heading>
            </Box>

            <Flex
              w="48px"
              h="48px"
              bg="#EEEEFB"
              color="#4545A5"
              borderRadius="13px"
              align="center"
              justify="center"
            >
              <Icon as={FiMail} boxSize={6} />
            </Flex>
          </HStack>
        </Box>

        {/* MESSAGES SECTION */}
        <Box
          bg="white"
          p={{ base: 4, md: 6 }}
          borderRadius="20px"
          border="1px solid #EBECF3"
          boxShadow="0 4px 18px rgba(30,35,80,0.04)"
        >
          <Flex
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            direction={{ base: "column", sm: "row" }}
            gap={3}
            mb={6}
          >
            <Box>
              <Heading size="md" color="#20243A">
                All Messages
              </Heading>

              <Text fontSize="sm" color="#9293A5" mt={1}>
                Messages received through the contact form
              </Text>
            </Box>

            <Badge
              bg="#EEEEFB"
              color="#4545A5"
              px={3}
              py={2}
              borderRadius="lg"
              fontSize="sm"
            >
              {messages.length} Total
            </Badge>
          </Flex>

          <Separator borderColor="#EEEEF4" mb={6} />

          {/* LOADING */}
          {loading ? (
            <SimpleGrid
              columns={{ base: 1, md: 2, xl: 3 }}
              gap={5}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Box
                  key={i}
                  p={5}
                  border="1px solid #EEEEF4"
                  borderRadius="16px"
                >
                  <Skeleton height="22px" mb={4} width="65%" />
                  <Skeleton height="14px" mb={3} width="85%" />
                  <Skeleton height="14px" mb={3} width="70%" />
                  <Skeleton height="14px" mb={5} width="50%" />
                  <Skeleton height="38px" borderRadius="9px" />
                </Box>
              ))}
            </SimpleGrid>
          ) : messages.length === 0 ? (
            /* EMPTY STATE */
            <VStack
              py={16}
              gap={4}
              bg="#FAFAFD"
              borderRadius="16px"
              border="1px dashed #D9DAE8"
            >
              <Flex
                w="70px"
                h="70px"
                borderRadius="20px"
                bg="#EEEEFB"
                color="#4545A5"
                align="center"
                justify="center"
              >
                <Icon as={FiInbox} boxSize={8} />
              </Flex>

              <Box textAlign="center">
                <Heading size="md" color="#20243A">
                  No messages yet
                </Heading>

                <Text color="#9293A5" fontSize="sm" mt={2}>
                  Messages from your website contact form will appear here.
                </Text>
              </Box>

              <Button
                variant="outline"
                color="#4545A5"
                borderColor="#4545A5"
                borderRadius="10px"
                onClick={loadMessages}
              >
                <Icon as={FiRefreshCw} mr={2} />
                Refresh Messages
              </Button>
            </VStack>
          ) : (
            /* MESSAGE CARDS */
            <SimpleGrid
              columns={{ base: 1, md: 2, xl: 3 }}
              gap={5}
            >
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  border="1px solid"
                  borderColor={msg.is_read ? "#E9EAF1" : "#B5B5E1"}
                  borderRadius="16px"
                  bg="white"
                  p={{ base: 4, md: 5 }}
                  boxShadow={
                    msg.is_read
                      ? "0 2px 10px rgba(30,35,80,0.03)"
                      : "0 3px 14px rgba(69,69,165,0.07)"
                  }
                  transition="all 0.2s"
                  _hover={{
                    borderColor: "#9999D0",
                    boxShadow: "0 6px 18px rgba(30,35,80,0.07)",
                    transform: "translateY(-2px)",
                  }}
                >
                  {/* CARD HEADER */}
                  <Flex
                    justify="space-between"
                    align="flex-start"
                    gap={2}
                  >
                    <HStack align="flex-start" gap={3}>
                      <Flex
                        w="42px"
                        h="42px"
                        flexShrink={0}
                        borderRadius="12px"
                        bg="#EEEEFB"
                        color="#4545A5"
                        align="center"
                        justify="center"
                      >
                        <Icon as={FiMessageSquare} boxSize={5} />
                      </Flex>

                      <Box minW="0">
                        <Heading
                          size="sm"
                          color="#20243A"
                          wordBreak="break-word"
                          lineHeight="1.5"
                        >
                          {msg.subject || "No Subject"}
                        </Heading>

                        <Text fontSize="xs" color="#9293A5" mt={1}>
                          Contact message
                        </Text>
                      </Box>
                    </HStack>

                    <Badge
                      flexShrink={0}
                      bg={msg.is_read ? "#E8F8F1" : "#FDECF3"}
                      color={msg.is_read ? "#059669" : "#DB2777"}
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="10px"
                    >
                      {msg.is_read ? "READ" : "NEW"}
                    </Badge>
                  </Flex>

                  <Separator my={4} borderColor="#EEEEF4" />

                  {/* SENDER */}
                  <HStack gap={3} align="flex-start" mb={3}>
                    <Icon
                      as={FiUser}
                      color="#7778A0"
                      mt="3px"
                      flexShrink={0}
                    />

                    <Box minW="0">
                      <Text
                        fontSize="xs"
                        color="#9293A5"
                        fontWeight="600"
                      >
                        SENDER
                      </Text>

                      <Text
                        fontSize="sm"
                        color="#343653"
                        fontWeight="600"
                        mt={1}
                        wordBreak="break-word"
                      >
                        {msg.full_name || "Unknown"}
                      </Text>
                    </Box>
                  </HStack>

                  {/* EMAIL */}
                  <HStack gap={3} align="flex-start" mb={3}>
                    <Icon
                      as={FiMail}
                      color="#7778A0"
                      mt="3px"
                      flexShrink={0}
                    />

                    <Box minW="0">
                      <Text
                        fontSize="xs"
                        color="#9293A5"
                        fontWeight="600"
                      >
                        EMAIL ADDRESS
                      </Text>

                      <Text
                        fontSize="sm"
                        color="#4545A5"
                        fontWeight="500"
                        mt={1}
                        wordBreak="break-word"
                      >
                        {msg.email || "Not provided"}
                      </Text>
                    </Box>
                  </HStack>

                  {/* DATE */}
                  <HStack gap={3} align="flex-start" mb={3}>
                    <Icon
                      as={FiClock}
                      color="#7778A0"
                      mt="3px"
                      flexShrink={0}
                    />

                    <Box minW="0">
                      <Text
                        fontSize="xs"
                        color="#9293A5"
                        fontWeight="600"
                      >
                        RECEIVED ON
                      </Text>

                      <Text
                        fontSize="sm"
                        color="#343653"
                        fontWeight="500"
                        mt={1}
                      >
                        {formatDate(msg.submitted_at)}
                      </Text>
                    </Box>
                  </HStack>

                  <Separator my={4} borderColor="#EEEEF4" />

                  {/* MESSAGE PREVIEW */}
                  <Box mb={4}>
                    <Text
                      fontSize="xs"
                      color="#9293A5"
                      fontWeight="700"
                      mb={2}
                    >
                      MESSAGE PREVIEW
                    </Text>

                    <Box
                      bg="#FAFAFD"
                      borderRadius="10px"
                      p={3}
                      border="1px solid #EEEEF4"
                    >
                      <Text
                        fontSize="sm"
                        color="#62637A"
                        lineHeight="1.7"
                        lineClamp={3}
                      >
                        {msg.message || "No message content"}
                      </Text>
                    </Box>
                  </Box>

                  {/* ACTION BUTTONS */}
                  <HStack gap={3}>
                    <Button
                      size="md"
                      bg="#4545A5"
                      color="white"
                      borderRadius="10px"
                      flex="1"
                      h="40px"
                      fontWeight="600"
                      onClick={() => {
                        setViewTarget(msg);

                        if (!msg.is_read) {
                          toggleRead(msg);
                        }
                      }}
                      _hover={{ bg: "#353584" }}
                    >
                      <Icon as={FiEye} mr={2} />
                      View Message
                    </Button>

                    <Button
                      size="md"
                      variant="outline"
                      color="#DB2777"
                      borderColor="#F3B8CF"
                      borderRadius="10px"
                      h="40px"
                      px={3}
                      onClick={() => setDeleteTarget(msg)}
                      _hover={{
                        bg: "#FDECF3",
                        borderColor: "#DB2777",
                      }}
                    >
                      <Icon as={FiTrash2} />
                    </Button>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      {/* VIEW MESSAGE DIALOG */}
      <Dialog.Root
        open={Boolean(viewTarget)}
        onOpenChange={(e) => !e.open && setViewTarget(null)}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop
            bg="blackAlpha.600"
            backdropFilter="blur(4px)"
          />

          <Dialog.Positioner>
            <Dialog.Content
              maxW={{ base: "calc(100% - 28px)", sm: "650px" }}
              borderRadius="20px"
              overflow="hidden"
              boxShadow="2xl"
            >
              {/* DIALOG HEADER */}
              <Dialog.Header
                px={{ base: 5, md: 7 }}
                py={5}
                bg="#FCFCFF"
                borderBottom="1px solid #EEEEF4"
              >
                <HStack gap={3} align="center">
                  <Flex
                    w="44px"
                    h="44px"
                    flexShrink={0}
                    borderRadius="12px"
                    bg="#EEEEFB"
                    color="#4545A5"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiMail} boxSize={5} />
                  </Flex>

                  <Box minW="0">
                    <Dialog.Title
                      color="#20243A"
                      fontSize="lg"
                      fontWeight="800"
                      wordBreak="break-word"
                    >
                      {viewTarget?.subject || "No Subject"}
                    </Dialog.Title>

                    <Text fontSize="xs" color="#9293A5" mt={1}>
                      Contact Message Details
                    </Text>
                  </Box>
                </HStack>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top="20px"
                  right="20px"
                  borderRadius="full"
                />
              </Dialog.CloseTrigger>

              {/* DIALOG BODY */}
              <Dialog.Body
                px={{ base: 5, md: 7 }}
                py={6}
              >
                <VStack align="stretch" gap={5}>

                  {/* SENDER DETAILS */}
                  <Box
                    bg="#FAFAFD"
                    border="1px solid #EEEEF4"
                    borderRadius="14px"
                    p={4}
                  >
                    <Text
                      fontSize="xs"
                      color="#9293A5"
                      fontWeight="700"
                      mb={3}
                    >
                      SENDER INFORMATION
                    </Text>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      <Box>
                        <HStack gap={2} mb={1}>
                          <Icon as={FiUser} color="#4545A5" />
                          <Text fontSize="xs" color="#9293A5">
                            Full Name
                          </Text>
                        </HStack>

                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color="#20243A"
                          wordBreak="break-word"
                        >
                          {viewTarget?.full_name || "Not provided"}
                        </Text>
                      </Box>

                      <Box>
                        <HStack gap={2} mb={1}>
                          <Icon as={FiMail} color="#4545A5" />
                          <Text fontSize="xs" color="#9293A5">
                            Email Address
                          </Text>
                        </HStack>

                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color="#4545A5"
                          wordBreak="break-word"
                        >
                          {viewTarget?.email || "Not provided"}
                        </Text>
                      </Box>

                      <Box gridColumn={{ base: "1", sm: "1 / -1" }}>
                        <HStack gap={2} mb={1}>
                          <Icon as={FiClock} color="#4545A5" />
                          <Text fontSize="xs" color="#9293A5">
                            Received Date
                          </Text>
                        </HStack>

                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color="#20243A"
                        >
                          {formatDate(viewTarget?.submitted_at)}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* MESSAGE CONTENT */}
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="#20243A"
                      >
                        Message Content
                      </Text>

                      <Badge
                        bg={viewTarget?.is_read ? "#E8F8F1" : "#FDECF3"}
                        color={viewTarget?.is_read ? "#059669" : "#DB2777"}
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {viewTarget?.is_read ? "READ" : "NEW"}
                      </Badge>
                    </HStack>

                    <Box
                      bg="white"
                      border="1px solid #E8E9F1"
                      borderRadius="14px"
                      p={{ base: 4, md: 5 }}
                      minH="150px"
                    >
                      <Text
                        color="#45465D"
                        fontSize="sm"
                        lineHeight="1.9"
                        whiteSpace="pre-wrap"
                        wordBreak="break-word"
                      >
                        {viewTarget?.message || "No message content."}
                      </Text>
                    </Box>
                  </Box>
                </VStack>
              </Dialog.Body>

              {/* DIALOG FOOTER */}
              <Dialog.Footer
                px={{ base: 5, md: 7 }}
                py={5}
                borderTop="1px solid #EEEEF4"
                bg="#FAFAFD"
              >
                <Button
                  bg="#4545A5"
                  color="white"
                  borderRadius="10px"
                  px={6}
                  h="42px"
                  onClick={() => setViewTarget(null)}
                  _hover={{ bg: "#353584" }}
                >
                  Close
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(e) => !e.open && setDeleteTarget(null)}
        role="alertdialog"
        size="md"
      >
        <Portal>
          <Dialog.Backdrop
            bg="blackAlpha.600"
            backdropFilter="blur(4px)"
          />

          <Dialog.Positioner>
            <Dialog.Content
              maxW={{ base: "calc(100% - 28px)", sm: "460px" }}
              borderRadius="20px"
              overflow="hidden"
              boxShadow="2xl"
              p={0}
            >
              <Dialog.Header
                px={{ base: 5, md: 7 }}
                pt={7}
                pb={5}
                display="flex"
                alignItems="center"
                gap={4}
              >
                <Flex
                  w="52px"
                  h="52px"
                  flexShrink={0}
                  borderRadius="15px"
                  bg="#FDECF3"
                  color="#DB2777"
                  align="center"
                  justify="center"
                >
                  <Icon as={FiTrash2} boxSize={6} />
                </Flex>

                <Box>
                  <Dialog.Title
                    color="#20243A"
                    fontSize="lg"
                    fontWeight="800"
                  >
                    Delete this message?
                  </Dialog.Title>

                  <Text color="#9293A5" fontSize="sm" mt={1}>
                    Confirm before permanently deleting.
                  </Text>
                </Box>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top="18px"
                  right="18px"
                  borderRadius="full"
                />
              </Dialog.CloseTrigger>

              <Dialog.Body
                px={{ base: 5, md: 7 }}
                pb={6}
              >
                <Box
                  bg="#FFF5F8"
                  border="1px solid #FBCFE0"
                  borderRadius="12px"
                  p={4}
                >
                  <Text
                    color="#77778A"
                    fontSize="sm"
                    lineHeight="1.7"
                  >
                    You are about to permanently delete the message from:
                  </Text>

                  <Text
                    color="#20243A"
                    fontWeight="700"
                    fontSize="md"
                    mt={2}
                    wordBreak="break-word"
                  >
                    {deleteTarget?.full_name}
                  </Text>

                  <Text
                    color="#DB2777"
                    fontSize="sm"
                    fontWeight="600"
                    mt={3}
                  >
                    This action cannot be undone.
                  </Text>
                </Box>
              </Dialog.Body>

              <Dialog.Footer
                px={{ base: 5, md: 7 }}
                py={5}
                borderTop="1px solid #EEEEF4"
                bg="#FAFAFD"
              >
                <Flex
                  w="100%"
                  gap={3}
                  justify="flex-end"
                  direction={{ base: "column-reverse", sm: "row" }}
                >
                  <Button
                    variant="outline"
                    borderRadius="10px"
                    borderColor="#D9DAE5"
                    color="#55566B"
                    h="44px"
                    w={{ base: "100%", sm: "auto" }}
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    _hover={{ bg: "#F0F0F5" }}
                  >
                    Cancel
                  </Button>

                  <Button
                    color="white"
                    bg="#DB2777"
                    borderRadius="10px"
                    h="44px"
                    px={5}
                    w={{ base: "100%", sm: "auto" }}
                    loading={deleting}
                    loadingText="Deleting..."
                    onClick={handleDelete}
                    _hover={{ bg: "#BE185D" }}
                  >
                    <Icon as={FiTrash2} mr={2} />
                    Delete Message
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
