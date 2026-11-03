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
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiUploadCloud, FiUser } from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

const emptyForm = {
  name: "",
  role: "",
  batch: "",
  order: 0,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

export default function PlacementList() {
  const [students, setStudents] = useState([]);
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

  async function loadStudents() {
    setLoading(true);
    setError("");
    try {
      const data = await getAll("placements");
      setStudents(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load placements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
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

  function openEdit(student) {
    setEditingId(student.id);
    setForm({
      name: student.name || "",
      role: student.role || "",
      batch: student.batch || "",
      order: student.order || 0,
      meta_title: student.meta_title || "",
      meta_description: student.meta_description || "",
      meta_keywords: student.meta_keywords || "",
    });
    setImage(null);
    setImagePreview(student.image || null);
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
        await patch("placements", editingId, formData);
        setSuccess("Student updated successfully.");
      } else {
        await create("placements", formData);
        setSuccess("Student added successfully.");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setImage(null);
      setImagePreview(null);
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to save the student.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await remove("placements", deleteTarget.id);
      setSuccess("Student deleted successfully.");
      setDeleteTarget(null);
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to delete the student.");
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
            Placement Management
          </Heading>
          <Text color="gray.500" mt="8px">
            Manage the students displayed on the public Placements page.
          </Text>
        </Box>

        <HStack gap="10px">
          <Button
            variant="outline"
            borderRadius="10px"
            onClick={loadStudents}
            loading={loading}
          >
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
            <FiPlus /> Add Student
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

      {/* STYLED LIST WINDOW */}
      <Box
        bg="white"
        p={{ base: "18px", md: "26px" }}
        borderRadius="20px"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
      >
        {/* List Header */}
        <Flex justify="space-between" align="center" mb="24px">
          <HStack gap="12px">
            <Heading size="md" color="#20243A">
              Placed Students
            </Heading>

            <Badge
              bg="#EEEEFB"
              color="#4545A5"
              px="10px"
              py="4px"
              borderRadius="full"
              fontSize="sm"
            >
              {students.length} total
            </Badge>
          </HStack>
        </Flex>

        {/* Loading / Empty / Grid State */}
        {loading ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, xl: 3, "2xl": 4 }}
            gap="24px"
          >
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="16px"
                overflow="hidden"
              >
                <Skeleton height="160px" />
                <Box p="20px">
                  <Skeleton height="20px" mb="12px" width="60%" />
                  <Skeleton height="16px" width="80%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : students.length === 0 ? (
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
              <Icon as={FiUser} boxSize="32px" />
            </Flex>

            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No students added yet
              </Text>
              <Text color="gray.500" fontSize="sm" mt="4px">
                Add your first placed student to get started.
              </Text>
            </Box>

            <Button
              bg="#4545A5"
              color="white"
              _hover={{ bg: "#353584" }}
              borderRadius="10px"
              onClick={openCreate}
              mt="2"
            >
              <FiPlus /> Add Student
            </Button>
          </VStack>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, xl: 3, "2xl": 4 }}
            gap="24px"
          >
            {students.map((student) => (
              <Box
                key={student.id}
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
                <Box
                  position="relative"
                  h="180px"
                  bg="#F5F5FF"
                  overflow="hidden"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {student.image ? (
                    <Image
                      src={resolveImageUrl(student.image)}
                      alt={student.name}
                      boxSize="120px"
                      borderRadius="full"
                      objectFit="cover"
                      border="4px solid white"
                      boxShadow="md"
                      transition="transform .4s ease"
                      _groupHover={{ transform: "scale(1.05)" }}
                    />
                  ) : (
                    <Flex
                      boxSize="120px"
                      borderRadius="full"
                      bg="#E2E8F0"
                      align="center"
                      justify="center"
                      border="4px solid white"
                    >
                      <Icon as={FiUser} boxSize="40px" color="gray.400" />
                    </Flex>
                  )}

                  {/* Dark Gradient Overlay & Actions */}
                  <Box
                    position="absolute"
                    inset="0"
                    bg="blackAlpha.400"
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
                      borderRadius="8px"
                      boxShadow="lg"
                      _hover={{ bg: "#EEEEFB", transform: "scale(1.05)" }}
                      onClick={() => openEdit(student)}
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
                      onClick={() => setDeleteTarget(student)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </HStack>
                </Box>

                {/* Content Container */}
                <Box p="20px" textAlign="center">
                  <Heading size="md" color="#20243A" noOfLines={1} mb="4px">
                    {student.name}
                  </Heading>

                  <Text
                    fontSize="sm"
                    color="#4545A5"
                    fontWeight="medium"
                    noOfLines={1}
                    mb="12px"
                  >
                    {student.role}
                  </Text>

                  <Badge
                    bg="gray.100"
                    color="gray.600"
                    px="10px"
                    py="3px"
                    borderRadius="md"
                    fontSize="xs"
                  >
                    {student.batch}
                  </Badge>

                  <Separator my="16px" borderColor="gray.100" />

                  <HStack gap="10px">
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      flex="1"
                      onClick={() => openEdit(student)}
                      _hover={{
                        bg: "#EEEEFB",
                        borderColor: "#4545A5",
                        color: "#4545A5",
                      }}
                    >
                      <FiEdit2 /> Edit
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
                      onClick={() => setDeleteTarget(student)}
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

      {/* CREATE / EDIT MODAL */}
      <Dialog.Root
        open={formOpen}
        onOpenChange={(e) => !e.open && closeForm()}
        size="lg"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop
            bg="blackAlpha.700"
            backdropFilter="blur(4px)"
          />

          <Dialog.Positioner>
            <Dialog.Content borderRadius="20px" my="40px" boxShadow="2xl">
              <Dialog.Header
                borderBottom="1px solid"
                borderColor="gray.100"
                pb="16px"
                pt="24px"
                px={{ base: "24px", md: "32px" }}
              >
                <Dialog.Title
                  color="#20243A"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  {editingId !== null
                    ? "Edit Placed Student"
                    : "Add Placed Student"}
                </Dialog.Title>

                <Text fontSize="sm" color="gray.500" mt="1">
                  Fill in the details below to update the placements page.
                </Text>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="md"
                  top="18px"
                  right="18px"
                  borderRadius="full"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                />
              </Dialog.CloseTrigger>

              <Dialog.Body
                pt="24px"
                px={{ base: "24px", md: "32px" }}
              >
                <Box
                  as="form"
                  id="placement-form"
                  onSubmit={handleSubmit}
                >
                  <VStack align="stretch" gap="24px">
                    {/* BASIC INFO */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="#4545A5"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb="16px"
                      >
                        1. Basic Information
                      </Text>

                      <Field.Root>
                        <Field.Label
                          fontWeight="semibold"
                          color="#34384D"
                        >
                          Student Photo
                        </Field.Label>

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
                          _hover={{
                            borderColor: "#4545A5",
                            bg: "#F8F8FF",
                          }}
                          onClick={() =>
                            document.getElementById("file-upload").click()
                          }
                        >
                          <Input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            display="none"
                            onChange={pickImage}
                          />

                          {imagePreview ? (
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                            >
                              <Image
                                src={
                                  imagePreview.startsWith("blob:")
                                    ? imagePreview
                                    : resolveImageUrl(imagePreview)
                                }
                                alt="Preview"
                                boxSize="120px"
                                borderRadius="full"
                                objectFit="cover"
                                border="3px solid white"
                                boxShadow="md"
                              />

                              <Text
                                mt="3"
                                fontSize="sm"
                                color="#4545A5"
                                fontWeight="medium"
                              >
                                Click to change photo
                              </Text>
                            </Box>
                          ) : (
                            <VStack gap="10px" py="10px">
                              <Flex
                                w="48px"
                                h="48px"
                                borderRadius="full"
                                bg="#EEEEFB"
                                color="#4545A5"
                                align="center"
                                justify="center"
                              >
                                <Icon as={FiUploadCloud} boxSize="24px" />
                              </Flex>

                              <Box>
                                <Text
                                  fontWeight="semibold"
                                  color="#34384D"
                                >
                                  Click to upload photo
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  Square images work best (max 2MB)
                                </Text>
                              </Box>
                            </VStack>
                          )}
                        </Box>
                      </Field.Root>

                      <Field.Root required mt="20px">
                        <Field.Label
                          fontWeight="semibold"
                          color="#34384D"
                        >
                          Student Name
                        </Field.Label>

                        <Input
                          name="name"
                          value={form.name}
                          onChange={changeField}
                          placeholder="e.g. Rahul Sharma"
                          borderRadius="10px"
                          size="lg"
                          required
                          _focus={{
                            borderColor: "#4545A5",
                            boxShadow: "0 0 0 1px #4545A5",
                          }}
                        />
                      </Field.Root>

                      <Field.Root required mt="20px">
                        <Field.Label
                          fontWeight="semibold"
                          color="#34384D"
                        >
                          Role & Company
                        </Field.Label>

                        <Input
                          name="role"
                          value={form.role}
                          onChange={changeField}
                          placeholder="e.g. Frontend Developer @ Infosys"
                          borderRadius="10px"
                          required
                          _focus={{
                            borderColor: "#4545A5",
                            boxShadow: "0 0 0 1px #4545A5",
                          }}
                        />
                      </Field.Root>

                      <HStack gap="20px" align="flex-start" mt="20px">
                        <Field.Root required flex="1">
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                          >
                            Batch
                          </Field.Label>

                          <Input
                            name="batch"
                            value={form.batch}
                            onChange={changeField}
                            placeholder="e.g. Batch 2024"
                            borderRadius="10px"
                            required
                            _focus={{
                              borderColor: "#4545A5",
                              boxShadow: "0 0 0 1px #4545A5",
                            }}
                          />
                        </Field.Root>

                        <Field.Root flex="1">
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                          >
                            Display Order
                          </Field.Label>

                          <Input
                            name="order"
                            type="number"
                            value={form.order}
                            onChange={changeField}
                            placeholder="0"
                            borderRadius="10px"
                            _focus={{
                              borderColor: "#4545A5",
                              boxShadow: "0 0 0 1px #4545A5",
                            }}
                          />

                          <Text fontSize="xs" color="gray.500" mt="1">
                            Lower numbers appear first.
                          </Text>
                        </Field.Root>
                      </HStack>
                    </Box>

                    <Separator borderColor="gray.100" />

                    {/* SEO SETTINGS */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="#0D9488"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb="16px"
                      >
                        2. SEO Settings (Optional)
                      </Text>

                      <VStack align="stretch" gap="20px">
                        <Field.Root>
                          <Flex justify="space-between" w="100%" mb="2">
                            <Field.Label
                              fontWeight="semibold"
                              color="#34384D"
                              mb="0"
                            >
                              Meta Title
                            </Field.Label>

                            <Text
                              fontSize="xs"
                              color={
                                (form.meta_title || "").length > 60
                                  ? "red.500"
                                  : "gray.500"
                              }
                            >
                              {(form.meta_title || "").length}/60
                            </Text>
                          </Flex>

                          <Input
                            name="meta_title"
                            value={form.meta_title || ""}
                            onChange={changeField}
                            maxLength={60}
                            placeholder="SEO title (max 60 characters)"
                            borderRadius="10px"
                            _focus={{
                              borderColor: "#0D9488",
                              boxShadow: "0 0 0 1px #0D9488",
                            }}
                          />
                        </Field.Root>

                        <Field.Root>
                          <Flex justify="space-between" w="100%" mb="2">
                            <Field.Label
                              fontWeight="semibold"
                              color="#34384D"
                              mb="0"
                            >
                              Meta Description
                            </Field.Label>

                            <Text
                              fontSize="xs"
                              color={
                                (form.meta_description || "").length > 160
                                  ? "red.500"
                                  : "gray.500"
                              }
                            >
                              {(form.meta_description || "").length}/160
                            </Text>
                          </Flex>

                          <Textarea
                            name="meta_description"
                            value={form.meta_description || ""}
                            onChange={changeField}
                            maxLength={160}
                            placeholder="SEO description (max 160 characters)"
                            borderRadius="10px"
                            _focus={{
                              borderColor: "#0D9488",
                              boxShadow: "0 0 0 1px #0D9488",
                            }}
                          />
                        </Field.Root>

                        <Field.Root>
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                          >
                            Meta Keywords
                          </Field.Label>

                          <Input
                            name="meta_keywords"
                            value={form.meta_keywords || ""}
                            onChange={changeField}
                            placeholder="e.g. placements, alumni, hiring"
                            borderRadius="10px"
                            _focus={{
                              borderColor: "#0D9488",
                              boxShadow: "0 0 0 1px #0D9488",
                            }}
                          />
                        </Field.Root>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </Dialog.Body>

              <Dialog.Footer
                borderTop="1px solid"
                borderColor="gray.100"
                pt="20px"
                pb="24px"
                px={{ base: "24px", md: "32px" }}
                bg="gray.50"
                borderBottomRadius="20px"
              >
                <HStack gap="12px" w="100%" justifyContent="flex-end">
                  <Button
                    variant="ghost"
                    borderRadius="10px"
                    onClick={closeForm}
                    disabled={saving}
                    color="gray.600"
                    _hover={{ bg: "gray.200" }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form="placement-form"
                    bg="#4545A5"
                    color="white"
                    borderRadius="10px"
                    loading={saving}
                    disabled={saving}
                    _hover={{ bg: "#353584" }}
                    boxShadow="md"
                    px="8"
                  >
                    {editingId !== null ? "Save Changes" : "Add Student"}
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
                    Delete this student?
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
                    You are about to permanently delete this placed student:
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
                    Delete Student
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