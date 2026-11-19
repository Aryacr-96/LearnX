
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  HStack,
  Image,
  SimpleGrid,
  Dialog,
  Portal,
  CloseButton,
  IconButton,
  Badge,
  Separator,
  Field,
  Icon,
  Skeleton,
} from "@chakra-ui/react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

const emptyForm = {
  name: "",
  role: "",
  bio: "",
  order: 0,
};

/* ============================================================
   SHARED SOFT BUTTON STYLES — MATCH GALLERY
   ============================================================ */

const softPrimary = {
  bg: "#EEEEFB",
  color: "#4545A5",
  fontWeight: "700",
  fontSize: "sm",
  borderRadius: "full",
  border: "1px solid transparent",
  transition: "all .2s ease",
  _hover: { bg: "#4545A5", color: "white" },
  _active: { bg: "#353584", color: "white" },
};

const softOutline = {
  variant: "outline",
  borderRadius: "full",
  border: "1px solid",
  borderColor: "gray.200",
  color: "gray.600",
  fontWeight: "600",
  fontSize: "sm",
  bg: "white",
  transition: "all .2s ease",
  _hover: {
    bg: "gray.50",
    borderColor: "gray.300",
    color: "gray.800",
  },
};

const softDanger = {
  bg: "#FDF2F8",
  color: "#DB2777",
  fontWeight: "700",
  fontSize: "sm",
  borderRadius: "full",
  border: "1px solid transparent",
  transition: "all .2s ease",
  _hover: { bg: "#DB2777", color: "white" },
};

export default function TeamMember() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadMembers() {
    setLoading(true);
    setError("");

    try {
      const data = await getAll("team");
      setMembers(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function changeField(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function pickImage(e) {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setImage(null);
    setImagePreview(null);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEdit(member) {
    setEditingId(member.id);

    setForm({
      name: member.name || "",
      role: member.role || "",
      bio: member.bio || "",
      order: member.order ?? 0,
    });

    setImage(null);
    setImagePreview(member.image || null);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    const formData = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      formData.append(k, v);
    });

    if (image) {
      formData.append("image", image);
    }

    try {
      if (editingId !== null) {
        await patch("team", editingId, formData);
        setSuccess("Team member updated successfully.");
      } else {
        await create("team", formData);
        setSuccess("Team member added successfully.");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImage(null);
      setImagePreview(null);

      await loadMembers();
    } catch (err) {
      setError(err.message || "Unable to save the team member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await remove("team", deleteTarget.id);

      setSuccess("Team member deleted successfully.");
      setDeleteTarget(null);

      await loadMembers();
    } catch (err) {
      setError(err.message || "Unable to delete the team member.");
      setDeleteTarget(null);
    }
  }

  return (
    <VStack align="stretch" gap="24px">

      {/* HEADER */}
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="14px"
      >
        <Box>
          <Heading size="lg" color="#20243A">
            Team Management
          </Heading>

          <Text color="gray.500" mt="8px">
            Manage the team members displayed on the public About page.
          </Text>
        </Box>

        <HStack gap="10px">
          <Button
            {...softOutline}
            onClick={loadMembers}
            loading={loading}
            h="40px"
            px="18px"
          >
            <FiRefreshCw /> Refresh
          </Button>

          <Button
            {...softPrimary}
            onClick={openCreate}
            h="40px"
            px="20px"
          >
            <FiPlus /> Add Member
          </Button>
        </HStack>
      </Flex>

      {/* ALERTS */}
      {success && (
        <Box
          bg="green.50"
          border="1px solid"
          borderColor="green.200"
          color="green.700"
          p="12px 16px"
          borderRadius="12px"
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
          borderRadius="12px"
          fontSize="sm"
        >
          {error}
        </Box>
      )}

      {/* LIST WINDOW */}
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
              All Team Members
            </Heading>

            <Badge
              bg="#EEEEFB"
              color="#4545A5"
              px="10px"
              py="4px"
              borderRadius="full"
              fontSize="sm"
            >
              {members.length} total
            </Badge>
          </HStack>
        </Flex>

        {/* LOADING */}
        {loading ? (
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3 }}
            gap="20px"
          >
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="16px"
                overflow="hidden"
              >
                <Skeleton height="200px" />

                <Box p="16px">
                  <Skeleton height="20px" mb="10px" />
                  <Skeleton height="16px" width="60%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>

        ) : members.length === 0 ? (

          /* EMPTY STATE */
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
              <Icon as={FiUsers} boxSize="32px" />
            </Flex>

            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No team members yet
              </Text>

              <Text color="gray.500" fontSize="sm" mt="4px">
                Add your first team member to get started.
              </Text>
            </Box>

            <Button
              {...softPrimary}
              onClick={openCreate}
              mt="2"
            >
              <FiPlus /> Add Your First Member
            </Button>
          </VStack>

        ) : (

          /* TEAM GRID */
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3 }}
            gap="20px"
          >
            {members.map((member) => (
              <Box
                key={member.id}
                role="group"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="16px"
                overflow="hidden"
                bg="white"
                boxShadow="sm"
                transition="all .2s ease"
                _hover={{
                  borderColor: "#C7C7EE",
                  boxShadow: "0 12px 28px rgba(69,69,165,0.12)",
                  transform: "translateY(-4px)",
                }}
              >

                {/* IMAGE */}
                <Box
                  position="relative"
                  h="200px"
                  bg="#F5F5FF"
                  overflow="hidden"
                >
                  {member.image ? (
                    <Image
                      src={resolveImageUrl(member.image)}
                      alt={member.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="transform .4s ease"
                      _groupHover={{ transform: "scale(1.05)" }}
                    />
                  ) : (
                    <Flex align="center" justify="center" h="100%">
                      <Icon
                        as={FiUsers}
                        boxSize="40px"
                        color="#A0A0CC"
                      />
                    </Flex>
                  )}

                  <Box
                    position="absolute"
                    inset="0"
                    bg="linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity .2s ease"
                  />

                  {/* HOVER ACTIONS */}
                  <HStack
                    position="absolute"
                    top="12px"
                    right="12px"
                    gap="8px"
                    opacity={0}
                    transform="translateY(-10px)"
                    _groupHover={{
                      opacity: 1,
                      transform: "translateY(0)",
                    }}
                    transition="all .2s ease"
                  >
                    <IconButton
                      size="sm"
                      aria-label="Edit"
                      bg="white"
                      color="#4545A5"
                      borderRadius="full"
                      boxShadow="md"
                      _hover={{ bg: "#EEEEFB" }}
                      onClick={() => openEdit(member)}
                    >
                      <FiEdit2 />
                    </IconButton>

                    <IconButton
                      size="sm"
                      aria-label="Delete"
                      bg="white"
                      color="#DB2777"
                      borderRadius="full"
                      boxShadow="md"
                      _hover={{ bg: "#FDECF3" }}
                      onClick={() => setDeleteTarget(member)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </HStack>
                </Box>

                {/* CONTENT */}
                <Box p="16px">
                  <Heading
                    size="sm"
                    color="#20243A"
                    noOfLines={1}
                    lineHeight="1.4"
                    mb="5px"
                  >
                    {member.name}
                  </Heading>

                  <Text
                    fontSize="sm"
                    color="#4545A5"
                    fontWeight="semibold"
                    mb="10px"
                    noOfLines={1}
                  >
                    {member.role}
                  </Text>

                  <Text
                    fontSize="sm"
                    color="gray.500"
                    noOfLines={2}
                    lineHeight="1.6"
                    minH="44px"
                  >
                    {member.bio}
                  </Text>

                  <Separator
                    mt="12px"
                    mb="10px"
                    borderColor="gray.100"
                  />

                  <HStack gap="8px">
                    <Button
                      {...softOutline}
                      size="sm"
                      flex="1"
                      onClick={() => openEdit(member)}
                    >
                      Edit
                    </Button>

                    <Button
                      {...softDanger}
                      size="sm"
                      flex="1"
                      onClick={() => setDeleteTarget(member)}
                    >
                      Delete
                    </Button>
                  </HStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* ============================================================
          CREATE / EDIT MODAL — MATCH GALLERY
          ============================================================ */}

      <Dialog.Root
        open={formOpen}
        onOpenChange={(e) => !e.open && closeForm()}
        size="xl"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop
            bg="rgba(32,36,58,0.4)"
            backdropFilter="blur(8px)"
          />

          <Dialog.Positioner>
            <Dialog.Content
              borderRadius="28px"
              my="40px"
              boxShadow="0 30px 80px rgba(32,36,58,0.18)"
              bg="white"
              overflow="hidden"
            >

              {/* HEADER */}
              <Box
                pt="24px"
                px={{ base: "22px", md: "32px" }}
                pb="0"
              >
                <Flex justify="space-between" align="center" mb="18px">
                  <HStack bg="gray.100" p="4px" borderRadius="full" gap="2px">
                    <Box
                      px="16px"
                      py="6px"
                      borderRadius="full"
                      bg="white"
                      boxShadow="sm"
                      fontSize="xs"
                      fontWeight="700"
                      color="#4545A5"
                    >
                      {editingId !== null ? "Editing" : "New Member"}
                    </Box>

                    <Box
                      px="16px"
                      py="6px"
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                      color="gray.400"
                    >
                      Details
                    </Box>
                  </HStack>

                  <Dialog.CloseTrigger asChild>
                    <CloseButton
                      size="sm"
                      borderRadius="full"
                      color="gray.400"
                      _hover={{
                        bg: "gray.100",
                        color: "gray.700",
                      }}
                    />
                  </Dialog.CloseTrigger>
                </Flex>

                <Dialog.Title
                  color="#20243A"
                  fontSize="2xl"
                  fontWeight="700"
                  lineHeight="1.2"
                  letterSpacing="-0.02em"
                >
                  {editingId !== null
                    ? "Edit Team Member"
                    : "Add New Team Member"}
                </Dialog.Title>

                <Text fontSize="sm" color="gray.500" mt="6px" mb="20px">
                  {editingId !== null
                    ? "Update the details of your team member below."
                    : "Fill in the details below to add a new team member."}
                </Text>
              </Box>

              {/* BODY */}
              <Dialog.Body
                pt="4px"
                px={{ base: "22px", md: "32px" }}
                pb="8px"
              >
                <Box as="form" id="team-form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap="22px">

                    {/* PROFILE INFORMATION */}
                    <Box>
                      <HStack gap="8px" mb="14px">
                        <Box
                          w="3px"
                          h="14px"
                          bg="#4545A5"
                          borderRadius="full"
                        />

                        <Text
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.500"
                          textTransform="uppercase"
                          letterSpacing="wider"
                        >
                          Profile Information
                        </Text>
                      </HStack>

                      <VStack align="stretch" gap="18px">

                        {/* IMAGE UPLOAD */}
                        <Field.Root>
                          <Field.Label
                            fontWeight="600"
                            color="#34384D"
                            fontSize="sm"
                          >
                            Profile Image
                          </Field.Label>

                          <Box
                            border="1px dashed"
                            borderColor={
                              imagePreview ? "#4545A5" : "gray.300"
                            }
                            borderRadius="16px"
                            bg={imagePreview ? "#FAFAFF" : "gray.50"}
                            p="24px"
                            textAlign="center"
                            cursor="pointer"
                            transition="all .15s ease"
                            _hover={{
                              borderColor: "#4545A5",
                              bg: "#FAFAFF",
                            }}
                            onClick={() =>
                              document.getElementById("team-img-upload").click()
                            }
                          >
                            <Input
                              id="team-img-upload"
                              type="file"
                              accept="image/*"
                              display="none"
                              onChange={pickImage}
                            />

                            {imagePreview ? (
                              <Box
                                position="relative"
                                borderRadius="12px"
                                overflow="hidden"
                              >
                                <Image
                                  src={
                                    imagePreview.startsWith("blob:")
                                      ? imagePreview
                                      : resolveImageUrl(imagePreview)
                                  }
                                  alt="Profile Preview"
                                  w="100%"
                                  h="180px"
                                  objectFit="contain"
                                />

                                <Box
                                  position="absolute"
                                  inset="0"
                                  bg="blackAlpha.500"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  opacity={0}
                                  _hover={{ opacity: 1 }}
                                  transition="opacity .15s"
                                >
                                  <Text
                                    color="white"
                                    fontWeight="600"
                                    fontSize="sm"
                                  >
                                    Click to change
                                  </Text>
                                </Box>
                              </Box>
                            ) : (
                              <VStack gap="8px" py="8px">
                                <Flex
                                  w="48px"
                                  h="48px"
                                  borderRadius="full"
                                  bg="white"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  color="#4545A5"
                                  align="center"
                                  justify="center"
                                >
                                  <Icon
                                    as={FiUploadCloud}
                                    boxSize="20px"
                                  />
                                </Flex>

                                <Box>
                                  <Text
                                    fontWeight="600"
                                    color="#34384D"
                                    fontSize="sm"
                                  >
                                    Click to upload profile image
                                  </Text>

                                  <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    mt="2px"
                                  >
                                    SVG, PNG, JPG or GIF
                                  </Text>
                                </Box>
                              </VStack>
                            )}
                          </Box>
                        </Field.Root>

                        {/* NAME */}
                        <Field.Root required>
                          <Field.Label
                            fontWeight="600"
                            color="#34384D"
                            fontSize="sm"
                          >
                            Full Name
                          </Field.Label>

                          <Input
                            name="name"
                            value={form.name}
                            onChange={changeField}
                            placeholder="Enter full name"
                            borderRadius="12px"
                            h="48px"
                            fontSize="sm"
                            required
                            bg="gray.50"
                            border="1px solid"
                            borderColor="transparent"
                            _hover={{ borderColor: "gray.200" }}
                            _focus={{
                              bg: "white",
                              borderColor: "#4545A5",
                              boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                            }}
                          />
                        </Field.Root>

                        {/* ROLE */}
                        <Field.Root required>
                          <Field.Label
                            fontWeight="600"
                            color="#34384D"
                            fontSize="sm"
                          >
                            Role / Designation
                          </Field.Label>

                          <Input
                            name="role"
                            value={form.role}
                            onChange={changeField}
                            placeholder="e.g. Founder & CEO"
                            borderRadius="12px"
                            h="48px"
                            fontSize="sm"
                            required
                            bg="gray.50"
                            border="1px solid"
                            borderColor="transparent"
                            _hover={{ borderColor: "gray.200" }}
                            _focus={{
                              bg: "white",
                              borderColor: "#4545A5",
                              boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                            }}
                          />
                        </Field.Root>

                        {/* BIO */}
                        <Field.Root required>
                          <Field.Label
                            fontWeight="600"
                            color="#34384D"
                            fontSize="sm"
                          >
                            Short Bio
                          </Field.Label>

                          <Textarea
                            name="bio"
                            value={form.bio}
                            onChange={changeField}
                            placeholder="Enter a short biography..."
                            minH="120px"
                            borderRadius="12px"
                            fontSize="sm"
                            required
                            p="14px"
                            bg="gray.50"
                            border="1px solid"
                            borderColor="transparent"
                            _hover={{ borderColor: "gray.200" }}
                            _focus={{
                              bg: "white",
                              borderColor: "#4545A5",
                              boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                            }}
                          />
                        </Field.Root>

                        {/* ORDER */}
                        <Field.Root>
                          <Field.Label
                            fontWeight="600"
                            color="#34384D"
                            fontSize="sm"
                          >
                            Display Order
                          </Field.Label>

                          <Input
                            name="order"
                            type="number"
                            value={form.order}
                            onChange={changeField}
                            placeholder="0"
                            borderRadius="12px"
                            h="48px"
                            fontSize="sm"
                            bg="gray.50"
                            border="1px solid"
                            borderColor="transparent"
                            _hover={{ borderColor: "gray.200" }}
                            _focus={{
                              bg: "white",
                              borderColor: "#4545A5",
                              boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                            }}
                          />

                          <Text fontSize="xs" color="gray.500" mt="4px">
                            Lower numbers appear first.
                          </Text>
                        </Field.Root>

                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </Dialog.Body>

              {/* FOOTER */}
              <Dialog.Footer
                pt="20px"
                pb="24px"
                px={{ base: "22px", md: "32px" }}
                bg="white"
                borderTop="1px solid"
                borderColor="gray.100"
              >
                <HStack gap="10px" w="100%" justifyContent="flex-end">
                  <Button
                    {...softOutline}
                    onClick={closeForm}
                    disabled={saving}
                    h="42px"
                    px="22px"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form="team-form"
                    bg="#4545A5"
                    color="white"
                    fontWeight="700"
                    fontSize="sm"
                    borderRadius="full"
                    h="42px"
                    px="26px"
                    loading={saving}
                    disabled={saving}
                    _hover={{ bg: "#353584" }}
                    _active={{ bg: "#2C2C6E" }}
                  >
                    {editingId !== null
                      ? "Save Changes"
                      : "Add Member"}
                  </Button>
                </HStack>
              </Dialog.Footer>

            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* ============================================================
          DELETE MODAL — MATCH GALLERY
          ============================================================ */}

      <Dialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(e) => !e.open && setDeleteTarget(null)}
        role="alertdialog"
        size="md"
      >
        <Portal>
          <Dialog.Backdrop
            bg="rgba(32,36,58,0.4)"
            backdropFilter="blur(8px)"
          />

          <Dialog.Positioner px="16px">
            <Dialog.Content
              width="100%"
              maxWidth="440px"
              borderRadius="24px"
              overflow="hidden"
              boxShadow="0 30px 80px rgba(32,36,58,0.18)"
              bg="white"
            >
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top="14px"
                  right="14px"
                  color="gray.400"
                  borderRadius="full"
                  _hover={{
                    bg: "gray.100",
                    color: "gray.700",
                  }}
                />
              </Dialog.CloseTrigger>

              {/* HEADER */}
              <Dialog.Header
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                pt="32px"
                px="24px"
                pb="10px"
              >
                <Flex
                  width="56px"
                  height="56px"
                  borderRadius="full"
                  background="#FDF2F8"
                  color="#DB2777"
                  align="center"
                  justify="center"
                  mb="16px"
                >
                  <Icon as={FiTrash2} boxSize="24px" />
                </Flex>

                <Dialog.Title
                  color="#20243A"
                  fontSize="lg"
                  fontWeight="700"
                  lineHeight="1.3"
                >
                  Delete this team member?
                </Dialog.Title>
              </Dialog.Header>

              {/* BODY */}
              <Dialog.Body px="24px" pt="6px" pb="22px">
                <VStack align="stretch" gap="14px">
                  <Box
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="12px"
                    padding="12px 16px"
                    textAlign="left"
                  >
                    <Text
                      color="gray.500"
                      fontSize="xs"
                      fontWeight="600"
                      mb="4px"
                    >
                      TEAM MEMBER
                    </Text>

                    <Text
                      color="#20243A"
                      fontSize="sm"
                      fontWeight="600"
                      wordBreak="break-word"
                    >
                      {deleteTarget?.name}
                    </Text>
                  </Box>

                  <Text
                    color="gray.600"
                    fontSize="sm"
                    textAlign="center"
                    lineHeight="1.7"
                  >
                    This action is permanent and cannot be undone.
                  </Text>
                </VStack>
              </Dialog.Body>

              {/* FOOTER */}
              <Dialog.Footer
                px="24px"
                pt="0"
                pb="24px"
                display="flex"
                justifyContent="center"
                gap="10px"
                flexDirection={{ base: "column-reverse", sm: "row" }}
              >
                <Button
                  width={{ base: "100%", sm: "auto" }}
                  minWidth="120px"
                  height="40px"
                  {...softOutline}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </Button>

                <Button
                  width={{ base: "100%", sm: "auto" }}
                  minWidth="120px"
                  height="40px"
                  bg="#DB2777"
                  color="white"
                  fontWeight="700"
                  fontSize="sm"
                  borderRadius="full"
                  _hover={{ bg: "#BE185D" }}
                  _active={{ bg: "#9D174D" }}
                  onClick={handleDelete}
                >
                  <FiTrash2 /> Delete Member
                </Button>
              </Dialog.Footer>

            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

    </VStack>
  );
}
