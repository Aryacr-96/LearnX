
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
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiUploadCloud, FiUsers } from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

const emptyForm = {
  name: "",
  role: "",
  bio: "",
  order: 0,
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
      order: member.order || 0,
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
    setImage(null);
    setImagePreview(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("image", image);

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
          <Button variant="outline" borderRadius="10px" onClick={loadMembers} loading={loading}>
            <FiRefreshCw /> Refresh
          </Button>
          <Button
            bg="#4545A5"
            color="white"
            _hover={{ bg: "#353584" }}
            borderRadius="10px"
            onClick={openCreate}
            boxShadow="md"
          >
            <FiPlus /> Add Member
          </Button>
        </HStack>
      </Flex>

      {/* ALERTS */}
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

      {/* ======================= STYLED LIST WINDOW ======================= */}
      <Box bg="white" p={{ base: "18px", md: "26px" }} borderRadius="20px" border="1px solid" borderColor="gray.200" boxShadow="sm">

        {/* List Header */}
        <Flex justify="space-between" align="center" mb="24px">
          <HStack gap="12px">
            <Heading size="md" color="#20243A">
              All Team Members
            </Heading>
            <Badge bg="#EEEEFB" color="#4545A5" px="10px" py="4px" borderRadius="full" fontSize="sm">
              {members.length} total
            </Badge>
          </HStack>
        </Flex>

        {/* Loading / Empty / Grid State */}
        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {[1, 2, 3].map((i) => (
              <Box key={i} border="1px solid" borderColor="gray.100" borderRadius="16px" overflow="hidden">
                <Skeleton height="200px" />
                <Box p="20px">
                  <Skeleton height="20px" mb="12px" width="60%" />
                  <Skeleton height="16px" width="80%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : members.length === 0 ? (
          <VStack py="60px" gap="16px" bg="gray.50" borderRadius="16px" border="1px dashed" borderColor="gray.300">
            <Flex w="64px" h="64px" borderRadius="full" bg="#EEEEFB" color="#4545A5" align="center" justify="center">
              <Icon as={FiUsers} boxSize="32px" />
            </Flex>
            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">No team members yet</Text>
              <Text color="gray.500" fontSize="sm" mt="4px">Add your first team member to get started.</Text>
            </Box>
            <Button bg="#4545A5" color="white" _hover={{ bg: "#353584" }} borderRadius="10px" onClick={openCreate} mt="2">
              <FiPlus /> Add Member
            </Button>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {members.map((member) => (
              <Box
                key={member.id}
                role="group"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="16px"
                overflow="hidden"
                bg="white"
                transition="all .2s ease"
                boxShadow="sm"
                _hover={{
                  borderColor: "#C7C7EE",
                  boxShadow: "0 12px 28px rgba(69,69,165,0.12)",
                  transform: "translateY(-4px)",
                }}
              >
                {/* Image Container with Overlay */}
                <Box position="relative" h="200px" bg="#F5F5FF" overflow="hidden">
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
                      <Icon as={FiUsers} boxSize="40px" color="#A0A0CC" />
                    </Flex>
                  )}

                  {/* Dark Gradient Overlay & Actions */}
                  <Box
                    position="absolute"
                    inset="0"
                    bg="linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity .2s ease"
                  />

                  <HStack
                    position="absolute"
                    top="12px"
                    right="12px"
                    gap="8px"
                    opacity={0}
                    transform="translateY(-10px)"
                    _groupHover={{ opacity: 1, transform: "translateY(0)" }}
                    transition="all .2s ease"
                  >
                    <IconButton
                      size="sm"
                      aria-label="Edit"
                      bg="white"
                      color="#4545A5"
                      borderRadius="8px"
                      boxShadow="lg"
                      _hover={{ bg: "#EEEEFB", transform: "scale(1.05)" }}
                      onClick={() => openEdit(member)}
                    >
                      <FiEdit2 />
                    </IconButton>
                    <IconButton
                      size="sm"
                      aria-label="Delete"
                      bg="white"
                      color="#DB2777"
                      borderRadius="8px"
                      boxShadow="lg"
                      _hover={{ bg: "#FDECF3", transform: "scale(1.05)" }}
                      onClick={() => setDeleteTarget(member)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </HStack>
                </Box>

                {/* Content Container */}
                <Box p="20px">
                  <Heading size="sm" color="#20243A" noOfLines={1} mb="4px">
                    {member.name}
                  </Heading>
                  <Text fontSize="sm" color="#4545A5" fontWeight="semibold" mb="12px">
                    {member.role}
                  </Text>
                  <Text fontSize="sm" color="gray.500" noOfLines={2} mb="16px" h="40px">
                    {member.bio}
                  </Text>

                  <Separator mb="16px" borderColor="gray.100" />

                  <HStack gap="10px">
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      flex="1"
                      onClick={() => openEdit(member)}
                      _hover={{ bg: "#EEEEFB", borderColor: "#4545A5", color: "#4545A5" }}
                    >
                      <FiEdit2 /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      color="#DB2777"
                      borderColor="red.200"
                      _hover={{ bg: "#FDECF3", borderColor: "#DB2777" }}
                      flex="1"
                      onClick={() => setDeleteTarget(member)}
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  </HStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* ======================= CREATE / EDIT MODAL ======================= */}
      <Dialog.Root open={formOpen} onOpenChange={(e) => !e.open && closeForm()} size="lg" scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="20px" my="40px" boxShadow="2xl">

              <Dialog.Header borderBottom="1px solid" borderColor="gray.100" pb="16px" pt="24px" px={{ base: "24px", md: "32px" }}>
                <Dialog.Title color="#20243A" fontSize="2xl" fontWeight="bold">
                  {editingId !== null ? "Edit Team Member" : "Add Team Member"}
                </Dialog.Title>
                <Text fontSize="sm" color="gray.500" mt="1">
                  Fill in the details below to update the About page.
                </Text>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="md" top="18px" right="18px" borderRadius="full" bg="gray.50" _hover={{ bg: "gray.100" }} />
              </Dialog.CloseTrigger>

              <Dialog.Body pt="24px" px={{ base: "24px", md: "32px" }}>
                <Box as="form" id="team-form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap="24px">

                    {/* Custom Upload Zone */}
                    <Field.Root>
                      <Field.Label fontWeight="semibold" color="#34384D">Profile Image</Field.Label>
                      <Box
                        border="2px dashed"
                        borderColor={imagePreview ? "#4545A5" : "gray.300"}
                        borderRadius="12px"
                        bg={imagePreview ? "#F8F8FF" : "gray.50"}
                        p="24px"
                        textAlign="center"
                        cursor="pointer"
                        position="relative"
                        transition="all .2s ease"
                        _hover={{ borderColor: "#4545A5", bg: "#F8F8FF" }}
                        onClick={() => document.getElementById("file-upload").click()}
                      >
                        <Input id="file-upload" type="file" accept="image/*" display="none" onChange={pickImage} />

                        {imagePreview ? (
                          <Box position="relative" borderRadius="8px" overflow="hidden" mx="auto" maxW="300px">
                            <Image
                              src={imagePreview.startsWith("blob:") ? imagePreview : resolveImageUrl(imagePreview)}
                              alt="Preview"
                              w="100%"
                              h="200px"
                              objectFit="cover"
                            />
                            <Box position="absolute" inset="0" bg="blackAlpha.400" display="flex" alignItems="center" justifyContent="center" opacity={0} _hover={{ opacity: 1 }} transition="opacity .2s">
                              <Text color="white" fontWeight="bold">Click to change</Text>
                            </Box>
                          </Box>
                        ) : (
                          <VStack gap="10px" py="10px">
                            <Flex w="48px" h="48px" borderRadius="full" bg="#EEEEFB" color="#4545A5" align="center" justify="center">
                              <Icon as={FiUploadCloud} boxSize="24px" />
                            </Flex>
                            <Box>
                              <Text fontWeight="semibold" color="#34384D">Click to upload image</Text>
                              <Text fontSize="sm" color="gray.500">SVG, PNG, JPG (max. 5MB)</Text>
                            </Box>
                          </VStack>
                        )}
                      </Box>
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label fontWeight="semibold" color="#34384D">Full Name</Field.Label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={changeField}
                        placeholder="e.g. Aarav Sharma"
                        borderRadius="10px"
                        size="lg"
                        required
                        _focus={{ borderColor: "#4545A5", boxShadow: "0 0 0 1px #4545A5" }}
                      />
                    </Field.Root>

                    <HStack gap="20px" align="flex-start">
                      <Field.Root required flex="1">
                        <Field.Label fontWeight="semibold" color="#34384D">Role / Designation</Field.Label>
                        <Input
                          name="role"
                          value={form.role}
                          onChange={changeField}
                          placeholder="e.g. Founder & CEO"
                          borderRadius="10px"
                          required
                          _focus={{ borderColor: "#4545A5", boxShadow: "0 0 0 1px #4545A5" }}
                        />
                      </Field.Root>

                      <Field.Root flex="1">
                        <Field.Label fontWeight="semibold" color="#34384D">Display Order</Field.Label>
                        <Input
                          name="order"
                          type="number"
                          value={form.order}
                          onChange={changeField}
                          placeholder="0"
                          borderRadius="10px"
                          _focus={{ borderColor: "#4545A5", boxShadow: "0 0 0 1px #4545A5" }}
                        />
                        <Text fontSize="xs" color="gray.500" mt="1">Lower numbers appear first.</Text>
                      </Field.Root>
                    </HStack>

                    <Field.Root required>
                      <Field.Label fontWeight="semibold" color="#34384D">Short Bio</Field.Label>
                      <Textarea
                        name="bio"
                        value={form.bio}
                        onChange={changeField}
                        placeholder="e.g. Product strategist with a background in full-stack development..."
                        minH="120px"
                        borderRadius="10px"
                        required
                        p="16px"
                        _focus={{ borderColor: "#4545A5", boxShadow: "0 0 0 1px #4545A5" }}
                      />
                    </Field.Root>

                  </VStack>
                </Box>
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid" borderColor="gray.100" pt="20px" pb="24px" px={{ base: "24px", md: "32px" }} bg="gray.50" borderBottomRadius="20px">
                <HStack gap="12px" w="100%" justifyContent="flex-end">
                  <Button variant="ghost" borderRadius="10px" onClick={closeForm} disabled={saving} color="gray.600" _hover={{ bg: "gray.200" }}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="team-form"
                    bg="#4545A5"
                    color="white"
                    borderRadius="10px"
                    loading={saving}
                    disabled={saving}
                    _hover={{ bg: "#353584" }}
                    boxShadow="md"
                    px="8"
                  >
                    {editingId !== null ? "Save Changes" : "Add Member"}
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* DELETE MODAL */}
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
                    Delete this team member?
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
                    You are about to permanently delete
                  </Text>

                  <Text
                    color="#20243A"
                    fontWeight="bold"
                    fontSize="md"
                    mt="6px"
                    wordBreak="break-word"
                  >
                    “{deleteTarget?.name}”
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
                    Delete Member
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
