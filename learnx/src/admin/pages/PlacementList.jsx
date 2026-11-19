
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
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
  Textarea,
} from "@chakra-ui/react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiUploadCloud,
  FiUser,
  FiX,
} from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

const PRIMARY = "#4545A5";
const PRIMARY_DARK = "#353584";

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
  const [deleting, setDeleting] = useState(false);
  const [brokenImages, setBrokenImages] = useState({});

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const data = await getAll("placements");
      setStudents(Array.isArray(data) ? data : data.results ?? []);
      setBrokenImages({});
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
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function pickImage(e) {
    const file = e.target.files?.[0] || null;

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

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
      order: student.order ?? 0,
      meta_title: student.meta_title || "",
      meta_description: student.meta_description || "",
      meta_keywords: student.meta_keywords || "",
    });

    setImage(null);
    setImagePreview(
      student.image ? resolveImageUrl(student.image) : null
    );

    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setImage(null);
    setImagePreview(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.role.trim() ||
      !form.batch.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });

    if (image) {
      formData.append("image", image);
    }

    try {
      if (editingId !== null) {
        await patch("placements", editingId, formData);
        setSuccess("Student updated successfully.");
      } else {
        await create("placements", formData);
        setSuccess("Student added successfully.");
      }

      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
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
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    try {
      await remove("placements", deleteTarget.id);
      setSuccess("Student deleted successfully.");
      setDeleteTarget(null);
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to delete the student.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <VStack align="stretch" gap="24px">

      {/* PAGE HEADER */}
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="16px"
      >
        <Box>
          <Heading size="lg" color="#20243A" fontWeight="bold">
            Placement Management
          </Heading>

          <Text color="gray.500" fontSize="sm" mt="8px">
            Manage the students displayed on the public Placements page.
          </Text>
        </Box>

        <HStack gap="12px" flexWrap="wrap">
          <Button
            variant="outline"
            borderRadius="11px"
            px="20px"
            h="46px"
            fontWeight="semibold"
            borderColor="gray.300"
            onClick={loadStudents}
            loading={loading}
            _hover={{ bg: "gray.50", borderColor: PRIMARY }}
          >
            <FiRefreshCw />
            Refresh
          </Button>

          <Button
            bg={PRIMARY}
            color="white"
            borderRadius="11px"
            px="26px"
            h="48px"
            minW="170px"
            fontWeight="semibold"
            fontSize="sm"
            boxShadow="0 5px 14px rgba(69,69,165,0.22)"
            onClick={openCreate}
            _hover={{
              bg: PRIMARY_DARK,
              transform: "translateY(-2px)",
              boxShadow: "0 8px 18px rgba(69,69,165,0.28)",
            }}
            transition="all .2s ease"
          >
            <FiPlus size={18} />
            Add Student
          </Button>
        </HStack>
      </Flex>

      {/* ALERT MESSAGES */}
      {success && (
        <Flex
          bg="green.50"
          border="1px solid"
          borderColor="green.200"
          color="green.700"
          px="16px"
          py="13px"
          borderRadius="12px"
          align="center"
          justify="space-between"
        >
          <Text fontSize="sm" fontWeight="medium">
            {success}
          </Text>

          <Button
            size="xs"
            variant="ghost"
            onClick={() => setSuccess("")}
          >
            <FiX />
          </Button>
        </Flex>
      )}

      {error && !formOpen && (
        <Flex
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          color="red.700"
          px="16px"
          py="13px"
          borderRadius="12px"
          align="center"
          justify="space-between"
        >
          <Text fontSize="sm">{error}</Text>

          <Button
            size="xs"
            variant="ghost"
            onClick={() => setError("")}
          >
            <FiX />
          </Button>
        </Flex>
      )}

      {/* PLACEMENT LIST */}
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
          align="center"
          mb="24px"
          flexWrap="wrap"
          gap="12px"
        >
          <HStack gap="12px">
            <Heading size="md" color="#20243A">
              Placed Students
            </Heading>

            <Badge
              bg="#EEEEFB"
              color={PRIMARY}
              px="12px"
              py="5px"
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
            >
              {students.length} Total
            </Badge>
          </HStack>
        </Flex>

        {/* LOADING */}
        {loading ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, xl: 3, "2xl": 4 }}
            gap="22px"
          >
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="16px"
                overflow="hidden"
              >
                <Skeleton height="180px" />
                <Box p="20px">
                  <Skeleton height="20px" mb="12px" width="60%" />
                  <Skeleton height="16px" width="80%" />
                  <Skeleton height="35px" mt="18px" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : students.length === 0 ? (
          <VStack
            py="65px"
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
              bg="#EEEEFB"
              color={PRIMARY}
              align="center"
              justify="center"
            >
              <Icon as={FiUser} boxSize="30px" />
            </Flex>

            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No students added yet
              </Text>

              <Text color="gray.500" fontSize="sm" mt="5px">
                Add your first placed student to get started.
              </Text>
            </Box>

            <Button
              bg={PRIMARY}
              color="white"
              px="24px"
              h="44px"
              borderRadius="10px"
              onClick={openCreate}
              _hover={{ bg: PRIMARY_DARK }}
            >
              <FiPlus />
              Add Student
            </Button>
          </VStack>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, xl: 3, "2xl": 4 }}
            gap="22px"
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
                {/* STUDENT IMAGE */}
                <Box
                  position="relative"
                  h="180px"
                  bg="#F5F5FF"
                  overflow="hidden"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {student.image && !brokenImages[student.id] ? (
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
                      onError={() =>
                        setBrokenImages((prev) => ({
                          ...prev,
                          [student.id]: true,
                        }))
                      }
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

                  {/* HOVER OVERLAY */}
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
                    opacity={{ base: 1, md: 0 }}
                    transform={{ base: "none", md: "translateY(-10px)" }}
                    _groupHover={{
                      opacity: 1,
                      transform: "translateY(0)",
                    }}
                    transition="all .2s ease"
                  >
                    <IconButton
                      size="sm"
                      aria-label="Edit student"
                      bg="white"
                      color={PRIMARY}
                      borderRadius="8px"
                      boxShadow="lg"
                      onClick={() => openEdit(student)}
                      _hover={{
                        bg: "#EEEEFB",
                        transform: "scale(1.05)",
                      }}
                    >
                      <FiEdit2 />
                    </IconButton>

                    <IconButton
                      size="sm"
                      aria-label="Delete student"
                      bg="white"
                      color="#DB2777"
                      borderRadius="8px"
                      boxShadow="lg"
                      onClick={() => setDeleteTarget(student)}
                      _hover={{
                        bg: "#FDECF3",
                        transform: "scale(1.05)",
                      }}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </HStack>
                </Box>

                {/* STUDENT DETAILS */}
                <Box p="20px" textAlign="center">
                  <Heading
                    size="md"
                    color="#20243A"
                    noOfLines={1}
                    mb="5px"
                  >
                    {student.name}
                  </Heading>

                  <Text
                    fontSize="sm"
                    color={PRIMARY}
                    fontWeight="medium"
                    noOfLines={2}
                    mb="12px"
                  >
                    {student.role}
                  </Text>

                  <Badge
                    bg="gray.100"
                    color="gray.600"
                    px="12px"
                    py="4px"
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
                      borderRadius="9px"
                      h="38px"
                      flex="1"
                      fontWeight="semibold"
                      borderColor="gray.200"
                      onClick={() => openEdit(student)}
                      _hover={{
                        bg: "#EEEEFB",
                        borderColor: PRIMARY,
                        color: PRIMARY,
                      }}
                    >
                      <FiEdit2 />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="9px"
                      h="38px"
                      flex="1"
                      fontWeight="semibold"
                      color="#DB2777"
                      borderColor="red.200"
                      onClick={() => setDeleteTarget(student)}
                      _hover={{
                        bg: "#FDECF3",
                        borderColor: "#DB2777",
                      }}
                    >
                      <FiTrash2 />
                      Delete
                    </Button>
                  </HStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* ADD / EDIT DIALOG */}
      <Dialog.Root
        open={formOpen}
        onOpenChange={(e) => !e.open && closeForm()}
        size="lg"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop
            bg="blackAlpha.700"
            backdropFilter="blur(5px)"
          />

          <Dialog.Positioner p="16px">
            <Dialog.Content
              maxW="650px"
              w="100%"
              borderRadius="20px"
              overflow="hidden"
              boxShadow="2xl"
              my="auto"
            >
              {/* MODAL HEADER */}
              <Dialog.Header
                px={{ base: "22px", md: "30px" }}
                pt="26px"
                pb="20px"
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                <HStack gap="14px" align="center">
                  <Flex
                    w="46px"
                    h="46px"
                    flexShrink="0"
                    borderRadius="12px"
                    bg="#EEEEFB"
                    color={PRIMARY}
                    align="center"
                    justify="center"
                  >
                    {editingId !== null ? (
                      <Icon as={FiEdit2} boxSize="21px" />
                    ) : (
                      <Icon as={FiUser} boxSize="22px" />
                    )}
                  </Flex>

                  <Box>
                    <Dialog.Title
                      color="#20243A"
                      fontSize="xl"
                      fontWeight="bold"
                    >
                      {editingId !== null
                        ? "Edit Placed Student"
                        : "Add New Student"}
                    </Dialog.Title>

                    <Text color="gray.500" fontSize="sm" mt="4px">
                      {editingId !== null
                        ? "Update the student's placement information."
                        : "Enter the student details to add a placement."}
                    </Text>
                  </Box>
                </HStack>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="md"
                  top="18px"
                  right="18px"
                  borderRadius="full"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                  disabled={saving}
                />
              </Dialog.CloseTrigger>

              {/* MODAL BODY */}
              <Dialog.Body
                px={{ base: "22px", md: "30px" }}
                py="26px"
              >
                {error && (
                  <Box
                    bg="red.50"
                    color="red.700"
                    border="1px solid"
                    borderColor="red.200"
                    borderRadius="10px"
                    p="12px"
                    fontSize="sm"
                    mb="20px"
                  >
                    {error}
                  </Box>
                )}

                <Box
                  as="form"
                  id="placement-form"
                  onSubmit={handleSubmit}
                >
                  <VStack align="stretch" gap="24px">

                    {/* BASIC INFORMATION */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={PRIMARY}
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb="18px"
                      >
                        01. Student Information
                      </Text>

                      <VStack align="stretch" gap="20px">

                        {/* PHOTO UPLOAD */}
                        <Field.Root>
                          <Field.Label
                            color="#34384D"
                            fontWeight="semibold"
                            fontSize="sm"
                            mb="7px"
                          >
                            Student Photo
                          </Field.Label>

                          <Box
                            border="2px dashed"
                            borderColor={
                              imagePreview ? PRIMARY : "gray.300"
                            }
                            borderRadius="14px"
                            bg={imagePreview ? "#F8F8FF" : "gray.50"}
                            p="22px"
                            textAlign="center"
                            cursor="pointer"
                            transition="all .2s ease"
                            _hover={{
                              borderColor: PRIMARY,
                              bg: "#F8F8FF",
                            }}
                            onClick={() =>
                              document
                                .getElementById("placement-upload")
                                ?.click()
                            }
                          >
                            <Input
                              id="placement-upload"
                              type="file"
                              accept="image/*"
                              display="none"
                              onChange={pickImage}
                            />

                            {imagePreview ? (
                              <VStack gap="12px">
                                <Image
                                  src={imagePreview}
                                  alt="Student preview"
                                  boxSize="110px"
                                  borderRadius="full"
                                  objectFit="cover"
                                  border="3px solid white"
                                  boxShadow="md"
                                  mx="auto"
                                />

                                <Text
                                  color={PRIMARY}
                                  fontWeight="semibold"
                                  fontSize="sm"
                                >
                                  Click to change student photo
                                </Text>
                              </VStack>
                            ) : (
                              <VStack gap="10px" py="12px">
                                <Flex
                                  w="48px"
                                  h="48px"
                                  borderRadius="full"
                                  bg="#EEEEFB"
                                  color={PRIMARY}
                                  align="center"
                                  justify="center"
                                >
                                  <Icon
                                    as={FiUploadCloud}
                                    boxSize="23px"
                                  />
                                </Flex>

                                <Box>
                                  <Text
                                    fontWeight="semibold"
                                    color="#34384D"
                                    fontSize="sm"
                                  >
                                    Click to upload student photo
                                  </Text>

                                  <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    mt="5px"
                                  >
                                    PNG, JPG or JPEG
                                  </Text>
                                </Box>
                              </VStack>
                            )}
                          </Box>
                        </Field.Root>

                        {/* STUDENT NAME */}
                        <Field.Root required>
                          <Field.Label
                            color="#34384D"
                            fontWeight="semibold"
                            fontSize="sm"
                            mb="7px"
                          >
                            Student Name
                          </Field.Label>

                          <Input
                            name="name"
                            value={form.name}
                            onChange={changeField}
                            placeholder="Enter student name"
                            borderRadius="10px"
                            h="46px"
                            borderColor="gray.300"
                            _focus={{
                              borderColor: PRIMARY,
                              boxShadow: `0 0 0 1px ${PRIMARY}`,
                            }}
                            required
                          />
                        </Field.Root>

                        {/* ROLE */}
                        <Field.Root required>
                          <Field.Label
                            color="#34384D"
                            fontWeight="semibold"
                            fontSize="sm"
                            mb="7px"
                          >
                            Role & Company
                          </Field.Label>

                          <Input
                            name="role"
                            value={form.role}
                            onChange={changeField}
                            placeholder="e.g. Frontend Developer @ Infosys"
                            borderRadius="10px"
                            h="46px"
                            borderColor="gray.300"
                            _focus={{
                              borderColor: PRIMARY,
                              boxShadow: `0 0 0 1px ${PRIMARY}`,
                            }}
                            required
                          />
                        </Field.Root>

                        {/* BATCH AND ORDER */}
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="16px">
                          <Field.Root required>
                            <Field.Label
                              color="#34384D"
                              fontWeight="semibold"
                              fontSize="sm"
                              mb="7px"
                            >
                              Batch
                            </Field.Label>

                            <Input
                              name="batch"
                              value={form.batch}
                              onChange={changeField}
                              placeholder="e.g. Batch 2024"
                              borderRadius="10px"
                              h="46px"
                              borderColor="gray.300"
                              _focus={{
                                borderColor: PRIMARY,
                                boxShadow: `0 0 0 1px ${PRIMARY}`,
                              }}
                              required
                            />
                          </Field.Root>

                          <Field.Root>
                            <Field.Label
                              color="#34384D"
                              fontWeight="semibold"
                              fontSize="sm"
                              mb="7px"
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
                              h="46px"
                              borderColor="gray.300"
                              _focus={{
                                borderColor: PRIMARY,
                                boxShadow: `0 0 0 1px ${PRIMARY}`,
                              }}
                            />

                            <Text fontSize="xs" color="gray.500" mt="6px">
                              Lower numbers appear first.
                            </Text>
                          </Field.Root>
                        </SimpleGrid>
                      </VStack>
                    </Box>

                    <Separator borderColor="gray.100" />

                    {/* SEO INFORMATION */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={PRIMARY}
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb="18px"
                      >
                        02. SEO Information
                      </Text>

                      <VStack align="stretch" gap="18px">
                        <Field.Root>
                          <Field.Label
                            color="#34384D"
                            fontWeight="semibold"
                            fontSize="sm"
                            mb="7px"
                          >
                            Meta Title
                          </Field.Label>

                          <Input
                            name="meta_title"
                            value={form.meta_title}
                            onChange={changeField}
                            placeholder="Enter SEO title"
                            borderRadius="10px"
                            h="46px"
                            borderColor="gray.300"
                            _focus={{
                              borderColor: PRIMARY,
                              boxShadow: `0 0 0 1px ${PRIMARY}`,
                            }}
                          />

                          <Text fontSize="xs" color="gray.500" mt="5px">
                            Recommended: up to 60 characters.
                          </Text>
                        </Field.Root>

                        <Field.Root>
                          <Field.Label
                            color="#34384D"
                            fontWeight="semibold"
                            fontSize="sm"
                            mb="7px"
                          >
                            Meta Description
                          </Field.Label>

                          <Textarea
                            name="meta_description"
                            value={form.meta_description}
                            onChange={changeField}
                            placeholder="Enter SEO description"
                            borderRadius="10px"
                            minH="90px"
                            resize="vertical"
                            borderColor="gray.300"
                            _focus={{
                              borderColor: PRIMARY,
                              boxShadow: `0 0 0 1px ${PRIMARY}`,
                            }}
                          />

                          <Text fontSize="xs" color="gray.500" mt="5px">
                            Recommended: up to 160 characters.
                          </Text>
                        </Field.Root>

                        <Field.Root>
                          <Field.Label
                            color="#34384D"
                            fontWeight="semibold"
                            fontSize="sm"
                            mb="7px"
                          >
                            Meta Keywords
                          </Field.Label>

                          <Input
                            name="meta_keywords"
                            value={form.meta_keywords}
                            onChange={changeField}
                            placeholder="e.g. placements, students, careers"
                            borderRadius="10px"
                            h="46px"
                            borderColor="gray.300"
                            _focus={{
                              borderColor: PRIMARY,
                              boxShadow: `0 0 0 1px ${PRIMARY}`,
                            }}
                          />
                        </Field.Root>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </Dialog.Body>

              {/* MODAL FOOTER */}
              <Dialog.Footer
                px={{ base: "22px", md: "30px" }}
                py="20px"
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
                    h="44px"
                    px="24px"
                    borderColor="gray.300"
                    onClick={closeForm}
                    disabled={saving}
                    _hover={{ bg: "gray.100" }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form="placement-form"
                    bg={PRIMARY}
                    color="white"
                    borderRadius="10px"
                    h="44px"
                    px="28px"
                    fontWeight="semibold"
                    loading={saving}
                    disabled={saving}
                    _hover={{ bg: PRIMARY_DARK }}
                  >
                    {editingId !== null ? (
                      <>
                        <FiEdit2 />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <FiPlus />
                        Add Student
                      </>
                    )}
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* DELETE CONFIRMATION */}
      <Dialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(e) => !e.open && !deleting && setDeleteTarget(null)}
        role="alertdialog"
        size="md"
      >
        <Portal>
          <Dialog.Backdrop
            bg="blackAlpha.600"
            backdropFilter="blur(4px)"
          />

          <Dialog.Positioner p="16px">
            <Dialog.Content
              maxW="460px"
              w="100%"
              borderRadius="20px"
              overflow="hidden"
              boxShadow="2xl"
              p="0"
            >
              <Dialog.Header
                px="26px"
                pt="26px"
                pb="20px"
                display="flex"
                alignItems="center"
                gap="15px"
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

              <Dialog.Body px="26px" pb="24px">
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

              <Dialog.Footer
                px="26px"
                pt="18px"
                pb="24px"
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
                    h="42px"
                    px="22px"
                    borderColor="gray.300"
                    color="gray.700"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    _hover={{ bg: "gray.100" }}
                  >
                    Cancel
                  </Button>

                  <Button
                    color="white"
                    bg="#DB2777"
                    borderRadius="10px"
                    h="42px"
                    px="22px"
                    onClick={handleDelete}
                    loading={deleting}
                    disabled={deleting}
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
