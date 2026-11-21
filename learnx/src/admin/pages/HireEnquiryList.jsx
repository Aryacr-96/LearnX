
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
  Badge,
} from "@chakra-ui/react";
import {
  FiTrash2,
  FiRefreshCw,
  FiMail,
  FiBriefcase,
  FiPhone,
  FiUser,
  FiInbox,
  FiCheckCircle,
} from "react-icons/fi";

import { getAll, remove, patch } from "../services/crud";

export default function HireEnquiryList() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    try {
      await remove("hire-enquiries", deleteTarget.id);
      setSuccess("Enquiry deleted successfully.");
      setDeleteTarget(null);
      await loadEnquiries();
    } catch (err) {
      setError(err.message || "Unable to delete the enquiry.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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
                <Icon as={FiBriefcase} boxSize={5} />
              </Box>

              <Badge
                bg="#EEEEFB"
                color="#4545A5"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                ENQUIRY MANAGEMENT
              </Badge>
            </HStack>

            <Heading
              size={{ base: "lg", md: "xl" }}
              color="#20243A"
              fontWeight="800"
            >
              Hire Enquiries
            </Heading>

            <Text color="#85869A" fontSize="sm" mt={2}>
              Manage companies looking to hire your students.
            </Text>
          </Box>

          <Button
            bg="#4545A5"
            color="white"
            px={5}
            h="44px"
            borderRadius="10px"
            fontWeight="600"
            onClick={loadEnquiries}
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

        {/* TOTAL ENQUIRIES */}
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
              <Text color="#9293A5" fontSize="sm" fontWeight="600">
                Total Enquiries
              </Text>

              <Heading size="2xl" color="#20243A" mt={2}>
                {enquiries.length}
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
              <Icon as={FiBriefcase} boxSize={6} />
            </Flex>
          </HStack>
        </Box>

        {/* ENQUIRIES SECTION */}
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
                All Enquiries
              </Heading>

              <Text fontSize="sm" color="#9293A5" mt={1}>
                Company registration and hiring requests
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
              {enquiries.length} Total
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
          ) : enquiries.length === 0 ? (
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
                  No enquiries yet
                </Heading>

                <Text color="#9293A5" fontSize="sm" mt={2}>
                  When companies submit hiring enquiries, they will appear here.
                </Text>
              </Box>

              <Button
                variant="outline"
                color="#4545A5"
                borderColor="#4545A5"
                borderRadius="10px"
                onClick={loadEnquiries}
              >
                <Icon as={FiRefreshCw} mr={2} />
                Refresh Enquiries
              </Button>
            </VStack>
          ) : (
            /* ENQUIRY CARDS */
            <SimpleGrid
              columns={{ base: 1, md: 2, xl: 3 }}
              gap={5}
            >
              {enquiries.map((enquiry) => (
                <Box
                  key={enquiry.id}
                  border="1px solid"
                  borderColor={enquiry.is_read ? "#E9EAF1" : "#B5B5E1"}
                  borderRadius="16px"
                  bg="white"
                  p={{ base: 4, md: 5 }}
                  boxShadow={
                    enquiry.is_read
                      ? "0 2px 10px rgba(30,35,80,0.03)"
                      : "0 3px 14px rgba(69,69,165,0.07)"
                  }
                  position="relative"
                  cursor={enquiry.is_read ? "default" : "pointer"}
                  onClick={() => markAsRead(enquiry)}
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
                        <Icon as={FiBriefcase} boxSize={5} />
                      </Flex>

                      <Box minW="0">
                        <Heading
                          size="sm"
                          color="#20243A"
                          wordBreak="break-word"
                          lineHeight="1.5"
                        >
                          {enquiry.company_name || "Unnamed Company"}
                        </Heading>

                        <Text fontSize="xs" color="#9293A5" mt={1}>
                          Company enquiry
                        </Text>
                      </Box>
                    </HStack>

                    {/* <Badge
                      flexShrink={0}
                      bg={enquiry.is_read ? "#E8F8F1" : "#FDECF3"}
                      color={enquiry.is_read ? "#059669" : "#DB2777"}
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="10px"
                    >
                      {enquiry.is_read ? "READ" : "NEW"}
                    </Badge> */}
                  </Flex>

                  <Separator my={4} borderColor="#EEEEF4" />

                  {/* CONTACT PERSON */}
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
                        CONTACT PERSON
                      </Text>

                      <Text
                        fontSize="sm"
                        color="#343653"
                        fontWeight="600"
                        mt={1}
                        wordBreak="break-word"
                      >
                        {enquiry.contact_person || "Not provided"}
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
                        {enquiry.email || "Not provided"}
                      </Text>
                    </Box>
                  </HStack>

                  {/* PHONE */}
                  <HStack gap={3} align="flex-start" mb={3}>
                    <Icon
                      as={FiPhone}
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
                        PHONE NUMBER
                      </Text>

                      <Text
                        fontSize="sm"
                        color="#343653"
                        fontWeight="500"
                        mt={1}
                        wordBreak="break-word"
                      >
                        {enquiry.phone || "Not provided"}
                      </Text>
                    </Box>
                  </HStack>

                  <Separator my={4} borderColor="#EEEEF4" />

                  {/* JOB ROLES */}
                  <Box mb={4}>
                    <HStack gap={2} mb={2}>
                      <Icon as={FiBriefcase} color="#7778A0" />

                      <Text
                        fontSize="xs"
                        color="#9293A5"
                        fontWeight="700"
                      >
                        HIRING ROLES
                      </Text>
                    </HStack>

                    <Box
                      bg="#FAFAFD"
                      borderRadius="10px"
                      p={3}
                      border="1px solid #EEEEF4"
                    >
                      <Text
                        fontSize="sm"
                        color="#4545A5"
                        fontWeight="600"
                        lineHeight="1.7"
                        wordBreak="break-word"
                      >
                        {Array.isArray(enquiry.job_roles)
                          ? enquiry.job_roles.join(", ")
                          : enquiry.job_roles || "No roles specified"}
                      </Text>
                    </Box>
                  </Box>

                  {/* DELETE BUTTON */}
                  <Button
                    size="md"
                    variant="outline"
                    color="#DB2777"
                    borderColor="#F3B8CF"
                    bg="white"
                    borderRadius="10px"
                    w="100%"
                    h="40px"
                    fontWeight="600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(enquiry);
                    }}
                    _hover={{
                      bg: "#FDECF3",
                      borderColor: "#DB2777",
                    }}
                  >
                    <Icon as={FiTrash2} mr={2} />
                    Delete Enquiry
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

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
                    Delete this enquiry?
                  </Dialog.Title>

                  <Text color="#9293A5" fontSize="sm" mt={1}>
                    Confirm before permanently deleting.
                  </Text>
                </Box>
              </Dialog.Header>

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
                    You are about to permanently delete the enquiry from:
                  </Text>

                  <Text
                    color="#20243A"
                    fontWeight="700"
                    fontSize="md"
                    mt={2}
                    wordBreak="break-word"
                  >
                    {deleteTarget?.company_name}
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
                    Delete Enquiry
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
