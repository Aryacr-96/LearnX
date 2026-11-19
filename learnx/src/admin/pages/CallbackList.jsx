
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
  FiInbox,
  FiCheckCircle,
} from "react-icons/fi";

import { getAll, patch, remove } from "../services/crud";

const PRIMARY = "#4545A5";
const PRIMARY_HOVER = "#353584";
const LIGHT_PURPLE = "#EEEEFB";
const DARK = "#20243A";
const DANGER = "#DB2777";

export default function CallbackList() {
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const updatedStatus = !callback.is_read;

      await patch("callbacks", callback.id, {
        is_read: updatedStatus,
      });

      setCallbacks((prev) =>
        prev.map((item) =>
          item.id === callback.id
            ? { ...item, is_read: updatedStatus }
            : item
        )
      );

      setViewTarget((prev) =>
        prev?.id === callback.id
          ? { ...prev, is_read: updatedStatus }
          : prev
      );

      setSuccess(
        `Request marked as ${updatedStatus ? "read" : "unread"}.`
      );
      setError("");
    } catch (err) {
      setError(err.message || "Unable to update status.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await remove("callbacks", deleteTarget.id);

      setCallbacks((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id)
      );

      setSuccess("Callback request deleted successfully.");
      setError("");
      setDeleteTarget(null);

      if (viewTarget?.id === deleteTarget.id) {
        setViewTarget(null);
      }
    } catch (err) {
      setError(err.message || "Unable to delete the request.");
      setDeleteTarget(null);
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

  const unreadCount = callbacks.filter((cb) => !cb.is_read).length;

  return (
    <VStack align="stretch" gap="24px">

      {/* Page Header */}
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="16px"
      >
        <Box>
          <HStack gap="10px" mb="6px">
            <Box
              w="42px"
              h="42px"
              bg={LIGHT_PURPLE}
              color={PRIMARY}
              borderRadius="12px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiPhone} boxSize="21px" />
            </Box>

            <Heading size="lg" color={DARK}>
              Callback Requests
            </Heading>
          </HStack>

          <Text color="gray.500" fontSize="sm">
            Manage phone numbers submitted through the callback request popup.
          </Text>
        </Box>

        <Button
          onClick={loadCallbacks}
          loading={loading}
          bg={PRIMARY}
          color="white"
          borderRadius="10px"
          px="22px"
          h="44px"
          fontWeight="600"
          _hover={{ bg: PRIMARY_HOVER }}
        >
          <FiRefreshCw />
          Refresh
        </Button>
      </Flex>

      {/* Success Message */}
      {success && (
        <Flex
          align="center"
          justify="space-between"
          gap="12px"
          bg="green.50"
          border="1px solid"
          borderColor="green.200"
          color="green.700"
          p="13px 16px"
          borderRadius="12px"
          fontSize="sm"
        >
          <HStack gap="8px">
            <Icon as={FiCheckCircle} />
            <Text>{success}</Text>
          </HStack>

          <CloseButton
            size="sm"
            onClick={() => setSuccess("")}
          />
        </Flex>
      )}

      {/* Error Message */}
      {error && (
        <Flex
          align="center"
          justify="space-between"
          gap="12px"
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          color="red.700"
          p="13px 16px"
          borderRadius="12px"
          fontSize="sm"
        >
          <Text>{error}</Text>

          <CloseButton
            size="sm"
            onClick={() => setError("")}
          />
        </Flex>
      )}

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="16px"
          p="20px"
          boxShadow="sm"
        >
          <HStack justify="space-between">
            <Box>
              <Text color="gray.500" fontSize="sm" fontWeight="medium">
                Total Requests
              </Text>

              <Heading size="2xl" color={DARK} mt="8px">
                {callbacks.length}
              </Heading>
            </Box>

            <Flex
              w="46px"
              h="46px"
              borderRadius="12px"
              bg={LIGHT_PURPLE}
              color={PRIMARY}
              align="center"
              justify="center"
            >
              <Icon as={FiInbox} boxSize="22px" />
            </Flex>
          </HStack>
        </Box>

        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="16px"
          p="20px"
          boxShadow="sm"
        >
          <HStack justify="space-between">
            <Box>
              <Text color="gray.500" fontSize="sm" fontWeight="medium">
                Unread Requests
              </Text>

              <Heading size="2xl" color={PRIMARY} mt="8px">
                {unreadCount}
              </Heading>
            </Box>

            <Flex
              w="46px"
              h="46px"
              borderRadius="12px"
              bg={LIGHT_PURPLE}
              color={PRIMARY}
              align="center"
              justify="center"
            >
              <Icon as={FiEye} boxSize="22px" />
            </Flex>
          </HStack>
        </Box>

        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="16px"
          p="20px"
          boxShadow="sm"
        >
          <HStack justify="space-between">
            <Box>
              <Text color="gray.500" fontSize="sm" fontWeight="medium">
                Read Requests
              </Text>

              <Heading size="2xl" color="green.600" mt="8px">
                {callbacks.length - unreadCount}
              </Heading>
            </Box>

            <Flex
              w="46px"
              h="46px"
              borderRadius="12px"
              bg="green.50"
              color="green.600"
              align="center"
              justify="center"
            >
              <Icon as={FiCheckCircle} boxSize="22px" />
            </Flex>
          </HStack>
        </Box>
      </SimpleGrid>

      {/* Requests Section */}
      <Box
        bg="white"
        p={{ base: "18px", md: "26px" }}
        borderRadius="20px"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="12px"
          mb="24px"
        >
          <Box>
            <Heading size="md" color={DARK}>
              All Requests
            </Heading>

            <Text color="gray.500" fontSize="sm" mt="5px">
              View and manage callback enquiries.
            </Text>
          </Box>

          <Badge
            bg={LIGHT_PURPLE}
            color={PRIMARY}
            px="12px"
            py="6px"
            borderRadius="full"
            fontSize="sm"
            fontWeight="600"
          >
            {callbacks.length} Total
          </Badge>
        </Flex>

        {loading ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            gap="20px"
          >
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="16px"
                p="20px"
              >
                <Skeleton height="22px" mb="14px" width="60%" />
                <Skeleton height="16px" mb="10px" width="85%" />
                <Skeleton height="16px" mb="18px" width="45%" />
                <Skeleton height="38px" width="100%" />
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
              w="68px"
              h="68px"
              borderRadius="full"
              bg={LIGHT_PURPLE}
              color={PRIMARY}
              align="center"
              justify="center"
            >
              <Icon as={FiPhone} boxSize="30px" />
            </Flex>

            <Box textAlign="center">
              <Text fontWeight="bold" color={DARK} fontSize="lg">
                No callback requests yet
              </Text>

              <Text color="gray.500" fontSize="sm" mt="5px">
                Requests from the website popup will appear here.
              </Text>
            </Box>
          </VStack>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            gap="20px"
          >
            {callbacks.map((cb) => (
              <Box
                key={cb.id}
                border="1px solid"
                borderColor={!cb.is_read ? "#B9B9EA" : "gray.200"}
                borderRadius="16px"
                bg="white"
                p="20px"
                position="relative"
                boxShadow="sm"
                transition="all .2s ease"
                _hover={{
                  boxShadow: "md",
                  transform: "translateY(-2px)",
                  borderColor: PRIMARY,
                }}
              >
                <Flex justify="space-between" align="center" mb="18px">
                  <Flex
                    w="42px"
                    h="42px"
                    borderRadius="12px"
                    bg={LIGHT_PURPLE}
                    color={PRIMARY}
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiUser} boxSize="20px" />
                  </Flex>

                  <Badge
                    bg={cb.is_read ? "green.50" : LIGHT_PURPLE}
                    color={cb.is_read ? "green.700" : PRIMARY}
                    px="10px"
                    py="5px"
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {cb.is_read ? "Read" : "Unread"}
                  </Badge>
                </Flex>

                <VStack align="stretch" gap="10px" mb="18px">
                  <Box>
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                      mb="4px"
                    >
                      Request From
                    </Text>

                    <Heading size="md" color={DARK}>
                      {cb.name || "Unknown"}
                    </Heading>
                  </Box>

                  <HStack gap="10px">
                    <Flex
                      w="30px"
                      h="30px"
                      borderRadius="8px"
                      bg="gray.50"
                      color="gray.500"
                      align="center"
                      justify="center"
                    >
                      <Icon as={FiPhone} boxSize="14px" />
                    </Flex>

                    <Text
                      fontSize="md"
                      fontWeight="semibold"
                      color="#34384D"
                      wordBreak="break-word"
                    >
                      {cb.phone || "No phone number"}
                    </Text>
                  </HStack>
                </VStack>

                <Box
                  bg="gray.50"
                  borderRadius="10px"
                  px="12px"
                  py="10px"
                  mb="18px"
                >
                  <Text color="gray.500" fontSize="xs" mb="3px">
                    Submitted On
                  </Text>

                  <Text color="gray.700" fontSize="sm" fontWeight="medium">
                    {formatDate(cb.submitted_at)}
                  </Text>
                </Box>

                <Separator mb="16px" borderColor="gray.100" />

                <HStack gap="10px">
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="#D5D5EF"
                    color={PRIMARY}
                    borderRadius="9px"
                    flex="1"
                    h="38px"
                    fontWeight="600"
                    onClick={() => {
                      setViewTarget(cb);
                      if (!cb.is_read) toggleRead(cb);
                    }}
                    _hover={{
                      bg: LIGHT_PURPLE,
                      borderColor: PRIMARY,
                    }}
                  >
                    <FiEye />
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="9px"
                    color={DANGER}
                    borderColor="pink.200"
                    flex="1"
                    h="38px"
                    fontWeight="600"
                    onClick={() => setDeleteTarget(cb)}
                    _hover={{
                      bg: "#FDECF3",
                      borderColor: DANGER,
                    }}
                  >
                    <FiTrash2 />
                    Delete
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

          <Dialog.Positioner px="16px">
            <Dialog.Content
              borderRadius="20px"
              overflow="hidden"
              bg="white"
            >
              <Dialog.Header
                borderBottom="1px solid"
                borderColor="gray.100"
                pb="18px"
                pt="24px"
                px="24px"
              >
                <HStack gap="12px">
                  <Flex
                    w="42px"
                    h="42px"
                    bg={LIGHT_PURPLE}
                    color={PRIMARY}
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiPhone} boxSize="20px" />
                  </Flex>

                  <Box>
                    <Dialog.Title color={DARK} fontSize="lg">
                      Callback Details
                    </Dialog.Title>

                    <Text fontSize="xs" color="gray.500" mt="2px">
                      View submitted callback information
                    </Text>
                  </Box>
                </HStack>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="md"
                  top="18px"
                  right="18px"
                  position="absolute"
                />
              </Dialog.CloseTrigger>

              <Dialog.Body py="24px" px="24px">
                <VStack align="stretch" gap="18px">
                  <Box
                    bg="gray.50"
                    borderRadius="12px"
                    p="16px"
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      fontWeight="600"
                      mb="6px"
                    >
                      REQUEST FROM
                    </Text>

                    <Text fontWeight="bold" color={DARK} fontSize="lg">
                      {viewTarget?.name || "Unknown"}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb="6px">
                      Phone Number
                    </Text>

                    <HStack
                      bg={LIGHT_PURPLE}
                      color={PRIMARY}
                      borderRadius="10px"
                      px="14px"
                      py="13px"
                      gap="10px"
                    >
                      <Icon as={FiPhone} />
                      <Text fontWeight="bold" fontSize="lg">
                        {viewTarget?.phone || "Not provided"}
                      </Text>
                    </HStack>
                  </Box>

                  <Separator borderColor="gray.100" />

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb="5px">
                      Submitted Date
                    </Text>

                    <Text color={DARK} fontWeight="medium" fontSize="sm">
                      {formatDate(viewTarget?.submitted_at)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb="6px">
                      Request Status
                    </Text>

                    <Badge
                      bg={viewTarget?.is_read ? "green.50" : LIGHT_PURPLE}
                      color={viewTarget?.is_read ? "green.700" : PRIMARY}
                      px="12px"
                      py="6px"
                      borderRadius="full"
                    >
                      {viewTarget?.is_read ? "Read" : "Unread"}
                    </Badge>
                  </Box>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer
                borderTop="1px solid"
                borderColor="gray.100"
                px="24px"
                py="18px"
              >
                <Button
                  bg={PRIMARY}
                  color="white"
                  borderRadius="10px"
                  px="24px"
                  onClick={() => setViewTarget(null)}
                  _hover={{ bg: PRIMARY_HOVER }}
                >
                  Close
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
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

              <Dialog.Header
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                pt="36px"
                px="28px"
                pb="12px"
              >
                <Flex
                  w="64px"
                  h="64px"
                  borderRadius="full"
                  bg="#FDECF3"
                  color={DANGER}
                  align="center"
                  justify="center"
                  mb="18px"
                >
                  <Icon as={FiTrash2} boxSize="26px" />
                </Flex>

                <Dialog.Title
                  color={DARK}
                  fontSize="23px"
                  fontWeight="700"
                  lineHeight="1.3"
                >
                  Delete this request?
                </Dialog.Title>
              </Dialog.Header>

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

                <Box
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="12px"
                  p="14px 18px"
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
                    color={DARK}
                    fontSize="md"
                    fontWeight="700"
                    wordBreak="break-word"
                  >
                    {deleteTarget?.name}
                  </Text>

                  <Text color="gray.500" fontSize="sm" mt="4px">
                    {deleteTarget?.phone}
                  </Text>
                </Box>
              </Dialog.Body>

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
                  _hover={{ bg: "gray.100" }}
                >
                  Cancel
                </Button>

                <Button
                  width={{ base: "100%", sm: "auto" }}
                  minWidth="150px"
                  height="46px"
                  color="white"
                  bg={DANGER}
                  borderRadius="10px"
                  fontWeight="600"
                  onClick={handleDelete}
                  _hover={{ bg: "#BE185D" }}
                >
                  <FiTrash2 />
                  Delete Request
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
