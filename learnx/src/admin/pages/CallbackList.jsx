
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
  FiPhone,
  FiTrash2,
  FiRefreshCw,
  FiEye,
  FiUser,
} from "react-icons/fi";

import { getAll, patch, remove } from "../services/crud";

export default function CallbackList() {
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewTarget, setViewTarget] = useState(null);

  async function loadCallbacks() {
    setLoading(true);
    setError("");

    try {
      const data = await getAll("callbacks");
      setCallbacks(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load callback requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCallbacks();
  }, []);

  async function toggleRead(callback) {
    try {
      await patch("callbacks", callback.id, {
        is_read: !callback.is_read,
      });

      setSuccess(
        `Request marked as ${!callback.is_read ? "read" : "unread"}.`
      );

      await loadCallbacks();
    } catch (err) {
      setError(err.message || "Unable to update status.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await remove("callbacks", deleteTarget.id);

      setSuccess("Callback request deleted successfully.");
      setDeleteTarget(null);

      await loadCallbacks();
    } catch (err) {
      setError(err.message || "Unable to delete the request.");
      setDeleteTarget(null);
    }
  }

  return (
    <VStack align="stretch" gap="24px">

      {/* Page Header */}
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="14px"
      >
        <Box>
          <Heading size="lg" color="#20243A">
            Callback Requests
          </Heading>

          <Text color="gray.500" mt="8px">
            Manage phone numbers submitted via the "Callback Request" popup.
          </Text>
        </Box>

        <Button
          variant="outline"
          borderRadius="10px"
          onClick={loadCallbacks}
          loading={loading}
        >
          <FiRefreshCw /> Refresh
        </Button>
      </Flex>

      {/* Success Message */}
      {success && (
        <Box
          bg="green.50"
          border="1px solid"
          borderColor="green.200"
          color="green.700"
          p="12px 16px"
          borderRadius="10px"
          fontSize="sm"
        >
          {success}
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          color="red.700"
          p="12px 16px"
          borderRadius="10px"
          fontSize="sm"
        >
          {error}
        </Box>
      )}

      {/* Callback Requests */}
      <Box
        bg="white"
        p={{ base: "18px", md: "26px" }}
        borderRadius="20px"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Flex justify="space-between" align="center" mb="24px">
          <HStack gap="12px">
            <Heading size="md" color="#20243A">
              All Requests
            </Heading>

            <Badge
              bg="#EEEEFB"
              color="#4545A5"
              px="10px"
              py="4px"
              borderRadius="full"
              fontSize="sm"
            >
              {callbacks.length} total
            </Badge>
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="24px">
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="16px"
                p="20px"
              >
                <Skeleton height="20px" mb="12px" width="60%" />
                <Skeleton height="16px" mb="8px" width="80%" />
                <Skeleton height="16px" width="40%" />
              </Box>
            ))}
          </SimpleGrid>
        ) : callbacks.length === 0 ? (
          <VStack
            py="60px"
            gap="16px"
            bg="gray.50"
            borderRadius="16px"
            border="1px dashed"
            borderColor="gray.300"
          >
            <Flex
              w="64px"
              h="64px"
              borderRadius="full"
              bg="#EEEEFB"
              color="#4545A5"
              align="center"
              justify="center"
            >
              <Icon as={FiPhone} boxSize="32px" />
            </Flex>

            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No callback requests yet
              </Text>

              <Text color="gray.500" fontSize="sm" mt="4px">
                Requests from the website popup will appear here.
              </Text>
            </Box>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="24px">
            {callbacks.map((cb) => (
              <Box
                key={cb.id}
                border="1px solid"
                borderColor={cb.is_read ? "gray.200" : "#4545A5"}
                borderRadius="16px"
                bg="white"
                p="20px"
                position="relative"
                boxShadow={cb.is_read ? "sm" : "md"}
                transition="all .2s ease"
              >
                {!cb.is_read && (
                  <Badge
                    position="absolute"
                    top="20px"
                    right="20px"
                    bg="#4545A5"
                    color="white"
                    borderRadius="full"
                  >
                    New
                  </Badge>
                )}

                <VStack align="start" gap="8px" mb="16px">
                  <HStack gap="10px">
                    <Flex
                      w="32px"
                      h="32px"
                      borderRadius="full"
                      bg="#EEEEFB"
                      color="#4545A5"
                      align="center"
                      justify="center"
                    >
                      <Icon as={FiUser} size="sm" />
                    </Flex>

                    <Box>
                      <Heading size="sm" color="#20243A">
                        {cb.name}
                      </Heading>
                    </Box>
                  </HStack>

                  <HStack gap="8px" pl="42px">
                    <Icon as={FiPhone} color="gray.400" size="sm" />

                    <Text
                      fontSize="md"
                      fontWeight="semibold"
                      color="#34384D"
                    >
                      {cb.phone}
                    </Text>
                  </HStack>
                </VStack>

                <Badge
                  bg="gray.100"
                  color="gray.600"
                  px="8px"
                  py="2px"
                  borderRadius="md"
                  fontSize="xs"
                  mb="16px"
                >
                  {new Date(cb.submitted_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>

                <Separator mb="16px" borderColor="gray.100" />

                <HStack gap="10px">
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="8px"
                    flex="1"
                    onClick={() => {
                      setViewTarget(cb);
                      if (!cb.is_read) toggleRead(cb);
                    }}
                    _hover={{
                      bg: "#EEEEFB",
                      borderColor: "#4545A5",
                      color: "#4545A5",
                    }}
                  >
                    <FiEye /> View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="8px"
                    color="#DB2777"
                    borderColor="red.200"
                    _hover={{
                      bg: "#FDECF3",
                      borderColor: "#DB2777",
                    }}
                    flex="1"
                    onClick={() => setDeleteTarget(cb)}
                  >
                    <FiTrash2 /> Delete
                  </Button>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* View Details Dialog */}
      <Dialog.Root
        open={Boolean(viewTarget)}
        onOpenChange={(e) => !e.open && setViewTarget(null)}
        size="md"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />

          <Dialog.Positioner>
            <Dialog.Content borderRadius="20px">
              <Dialog.Header
                borderBottom="1px solid"
                borderColor="gray.100"
                pb="16px"
                pt="24px"
                px="24px"
              >
                <Dialog.Title color="#20243A" fontSize="xl">
                  Callback Details
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="md" top="18px" right="18px" />
              </Dialog.CloseTrigger>

              <Dialog.Body pt="24px" px="24px">
                <VStack align="stretch" gap="16px">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        Name
                      </Text>

                      <Text fontWeight="semibold" color="#20243A">
                        {viewTarget?.name}
                      </Text>
                    </Box>

                    <Box textAlign="right">
                      <Text fontSize="sm" color="gray.500">
                        Received
                      </Text>

                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="#20243A"
                      >
                        {viewTarget?.submitted_at &&
                          new Date(viewTarget.submitted_at).toLocaleString()}
                      </Text>
                    </Box>
                  </HStack>

                  <Separator borderColor="gray.100" />

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb="4px">
                      Phone Number
                    </Text>

                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color="#4545A5"
                    >
                      {viewTarget?.phone}
                    </Text>
                  </Box>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer pt="20px" pb="24px" px="24px">
                <Button
                  variant="outline"
                  borderRadius="10px"
                  onClick={() => setViewTarget(null)}
                >
                  Close
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Redesigned Delete Confirmation Dialog */}
      <Dialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(e) => !e.open && setDeleteTarget(null)}
        role="alertdialog"
        size="md"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />

          <Dialog.Positioner px="16px">
            <Dialog.Content
              width="100%"
              maxWidth="440px"
              borderRadius="20px"
              overflow="hidden"
              boxShadow="0 20px 60px rgba(0,0,0,0.18)"
              bg="white"
            >
              {/* Close Button */}
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="md"
                  position="absolute"
                  top="16px"
                  right="16px"
                  color="gray.500"
                  borderRadius="full"
                  _hover={{ bg: "gray.100" }}
                />
              </Dialog.CloseTrigger>

              {/* Dialog Header */}
              <Dialog.Header
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                pt="36px"
                px="28px"
                pb="12px"
              >
                {/* Delete Icon */}
                <Flex
                  width="64px"
                  height="64px"
                  borderRadius="full"
                  background="#FDECF3"
                  color="#DB2777"
                  align="center"
                  justify="center"
                  mb="20px"
                >
                  <Icon as={FiTrash2} boxSize="26px" />
                </Flex>

                <Dialog.Title
                  color="#20243A"
                  fontSize="23px"
                  fontWeight="700"
                  lineHeight="1.3"
                >
                  Delete this request?
                </Dialog.Title>
              </Dialog.Header>

              {/* Dialog Body */}
              <Dialog.Body
                px="28px"
                pt="8px"
                pb="28px"
                textAlign="center"
              >
                <Text
                  color="gray.600"
                  fontSize="sm"
                  lineHeight="1.8"
                  mb="18px"
                >
                  Are you sure you want to permanently delete this callback
                  request? This action cannot be undone.
                </Text>

                {/* Selected Callback Name */}
                <Box
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="12px"
                  padding="14px 18px"
                  width="100%"
                >
                  <Text
                    color="gray.500"
                    fontSize="xs"
                    fontWeight="600"
                    mb="5px"
                  >
                    CALLBACK REQUEST FROM
                  </Text>

                  <Text
                    color="#20243A"
                    fontSize="md"
                    fontWeight="700"
                    wordBreak="break-word"
                  >
                    {deleteTarget?.name}
                  </Text>

                  <Text
                    color="gray.500"
                    fontSize="sm"
                    mt="4px"
                  >
                    {deleteTarget?.phone}
                  </Text>
                </Box>
              </Dialog.Body>

              {/* Dialog Footer */}
              <Dialog.Footer
                px="28px"
                pt="0"
                pb="28px"
                display="flex"
                justifyContent="center"
                gap="12px"
                flexDirection={{ base: "column-reverse", sm: "row" }}
              >
                <Button
                  width={{ base: "100%", sm: "auto" }}
                  minWidth="130px"
                  height="46px"
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  borderRadius="10px"
                  fontWeight="600"
                  onClick={() => setDeleteTarget(null)}
                  _hover={{
                    bg: "gray.100",
                  }}
                >
                  Cancel
                </Button>

                <Button
                  width={{ base: "100%", sm: "auto" }}
                  minWidth="130px"
                  height="46px"
                  color="white"
                  bg="#DB2777"
                  borderRadius="10px"
                  fontWeight="600"
                  onClick={handleDelete}
                  _hover={{
                    bg: "#BE185D",
                  }}
                >
                  <FiTrash2 /> Delete Request
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

    </VStack>
  );
}
