
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
  Separator,
  Skeleton,
  Icon,
} from "@chakra-ui/react";
import {
  FiTrash2,
  FiRefreshCw,
  FiMail,
  FiBriefcase,
} from "react-icons/fi";

import { getAll, remove, patch } from "../services/crud";

export default function HireEnquiryList() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadEnquiries() {
    setLoading(true);
    setError("");

    try {
      const data = await getAll("hire-enquiries");
      setEnquiries(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await remove("hire-enquiries", deleteTarget.id);
      setSuccess("Enquiry deleted successfully.");
      setDeleteTarget(null);
      await loadEnquiries();
    } catch (err) {
      setError(err.message || "Unable to delete the enquiry.");
      setDeleteTarget(null);
    }
  }

  async function markAsRead(enquiry) {
    if (enquiry.is_read) return;

    try {
      await patch("hire-enquiries", enquiry.id, { is_read: true });

      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === enquiry.id ? { ...item, is_read: true } : item
        )
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }

  return (
    <VStack align="stretch" gap="24px">
      <Flex justify="space-between" align="center" wrap="wrap" gap="12px">
        <Box>
          <Heading size="lg" color="#20243A">
            Hire Enquiries
          </Heading>

          <Text color="gray.500" mt="8px">
            Manage companies looking to hire your students.
          </Text>
        </Box>

        <Button
          variant="outline"
          borderRadius="10px"
          onClick={loadEnquiries}
          loading={loading}
        >
          <FiRefreshCw /> Refresh
        </Button>
      </Flex>

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
              All Enquiries
            </Heading>

            <Box
              bg="#EEEEFB"
              color="#4545A5"
              px="10px"
              py="4px"
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
            >
              {enquiries.length} total
            </Box>
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                p="20px"
                border="1px solid"
                borderColor="gray.100"
                borderRadius="16px"
              >
                <Skeleton height="20px" mb="12px" width="60%" />
                <Skeleton height="16px" mb="8px" width="80%" />
                <Skeleton height="16px" width="40%" />
              </Box>
            ))}
          </SimpleGrid>
        ) : enquiries.length === 0 ? (
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
              <Icon as={FiBriefcase} boxSize="32px" />
            </Flex>

            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No enquiries yet
              </Text>

              <Text color="gray.500" fontSize="sm" mt="4px">
                When companies register, they will appear here.
              </Text>
            </Box>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {enquiries.map((enquiry) => (
              <Box
                key={enquiry.id}
                border="1px solid"
                borderColor={enquiry.is_read ? "gray.200" : "#4545A5"}
                borderRadius="16px"
                bg="white"
                p="20px"
                boxShadow="sm"
                position="relative"
                onClick={() => markAsRead(enquiry)}
                cursor={enquiry.is_read ? "default" : "pointer"}
              >
                <Heading size="sm" color="#20243A" mb="4px">
                  {enquiry.company_name}
                </Heading>

                <Text fontSize="sm" color="gray.600" mb="12px">
                  {enquiry.contact_person}
                </Text>

                <HStack fontSize="xs" color="gray.500" mb="12px" gap="12px">
                  <HStack>
                    <Icon as={FiMail} />
                    <Text>{enquiry.email}</Text>
                  </HStack>
                </HStack>

                <Text fontSize="xs" color="gray.500" mb="4px">
                  Phone: {enquiry.phone}
                </Text>

                <Separator my="12px" borderColor="gray.100" />

                <Text
                  fontSize="sm"
                  color="gray.700"
                  fontWeight="500"
                  mb="16px"
                >
                  Roles:{" "}
                  <Text as="span" fontWeight="normal">
                    {Array.isArray(enquiry.job_roles)
                      ? enquiry.job_roles.join(", ")
                      : enquiry.job_roles}
                  </Text>
                </Text>

                <Button
                  size="sm"
                  variant="outline"
                  color="#DB2777"
                  borderColor="red.200"
                  _hover={{ bg: "#FDECF3", borderColor: "#DB2777" }}
                  width="100%"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(enquiry);
                  }}
                >
                  <FiTrash2 /> Delete
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

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
            backdropFilter="blur(3px)"
          />

          <Dialog.Positioner>
            <Dialog.Content
              maxW={{ base: "calc(100% - 32px)", sm: "460px" }}
              borderRadius="20px"
              overflow="hidden"
              boxShadow="2xl"
              p="0"
            >
              {/* HEADER */}
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
                  <Dialog.Title
                    color="#20243A"
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    Delete this enquiry?
                  </Dialog.Title>

                  <Text color="gray.500" fontSize="sm" mt="4px">
                    Please confirm this action.
                  </Text>
                </Box>
              </Dialog.Header>

              {/* BODY */}
              <Dialog.Body px="28px" pb="24px">
                <Box
                  bg="#FFF5F8"
                  border="1px solid"
                  borderColor="#FBCFE0"
                  borderRadius="12px"
                  p="16px"
                >
                  <Text color="gray.600" fontSize="sm" lineHeight="1.8">
                    You are about to permanently delete the enquiry from
                  </Text>

                  <Text
                    color="#20243A"
                    fontWeight="bold"
                    fontSize="md"
                    mt="6px"
                    wordBreak="break-word"
                  >
                    “{deleteTarget?.company_name}”
                  </Text>

                  <Text
                    color="#DB2777"
                    fontSize="sm"
                    fontWeight="medium"
                    mt="10px"
                  >
                    This action cannot be undone.
                  </Text>
                </Box>
              </Dialog.Body>

              {/* FOOTER */}
              <Dialog.Footer
                px="28px"
                pt="18px"
                pb="26px"
                borderTop="1px solid"
                borderColor="gray.100"
                bg="gray.50"
              >
                <Flex
                  w="100%"
                  gap="12px"
                  justify="flex-end"
                  direction={{ base: "column-reverse", sm: "row" }}
                >
                  <Button
                    variant="outline"
                    borderRadius="10px"
                    borderColor="gray.300"
                    color="gray.700"
                    w={{ base: "100%", sm: "auto" }}
                    onClick={() => setDeleteTarget(null)}
                    _hover={{ bg: "gray.100" }}
                  >
                    Cancel
                  </Button>

                  <Button
                    color="white"
                    bg="#DB2777"
                    borderRadius="10px"
                    w={{ base: "100%", sm: "auto" }}
                    onClick={handleDelete}
                    _hover={{ bg: "#BE185D" }}
                  >
                    <FiTrash2 />
                    Delete Enquiry
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
