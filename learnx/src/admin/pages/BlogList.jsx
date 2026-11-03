
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
  FiImage,
} from "react-icons/fi";

import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const emptyForm = {
  title: "",
  description: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
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

  // ================= LOAD BLOGS =================

  async function loadBlogs() {
    setLoading(true);
    setError("");

    try {
      const data = await getAll("blogs");
      setBlogs(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  // ================= FORM HANDLERS =================

  function changeField(e) {
    const { name, value } = e.target;

    setForm((p) => ({
      ...p,
      [name]: value,
    }));
  }

  // Rich Text Editor handler
  function handleDescriptionChange(value) {
    setForm((p) => ({
      ...p,
      description: value,
    }));
  }

  // Image upload handler
  function pickImage(e) {
    const file = e.target.files?.[0] || null;

    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  // ================= CREATE BLOG =================

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });

    setImage(null);
    setImagePreview(null);

    setError("");
    setSuccess("");

    setFormOpen(true);
  }

  // ================= EDIT BLOG =================

  function openEdit(blog) {
    setEditingId(blog.id);

    setForm({
      title: blog.title || "",
      description: blog.description || "",
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || "",
      meta_keywords: blog.meta_keywords || "",
    });

    setImage(null);
    setImagePreview(blog.image || null);

    setError("");
    setSuccess("");

    setFormOpen(true);
  }

  // ================= CLOSE FORM =================

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);

    setForm({ ...emptyForm });

    setImage(null);
    setImagePreview(null);

    setError("");
  }

  // ================= SAVE BLOG =================

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
        await patch("blogs", editingId, formData);
        setSuccess("Blog updated successfully.");
      } else {
        await create("blogs", formData);
        setSuccess("Blog created successfully.");
      }

      setFormOpen(false);
      setEditingId(null);

      setForm({ ...emptyForm });

      setImage(null);
      setImagePreview(null);

      await loadBlogs();
    } catch (err) {
      setError(err.message || "Unable to save the blog.");
    } finally {
      setSaving(false);
    }
  }

  // ================= DELETE BLOG =================

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await remove("blogs", deleteTarget.id);

      setSuccess("Blog deleted successfully.");
      setDeleteTarget(null);

      await loadBlogs();
    } catch (err) {
      setError(err.message || "Unable to delete the blog.");
      setDeleteTarget(null);
    }
  }

  // ================= QUILL TOOLBAR =================

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  return (
    <VStack align="stretch" gap="24px">

      {/* ================= HEADER ================= */}

      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="14px"
      >
        <Box>
          <Heading size="lg" color="#20243A">
            Blog Management
          </Heading>

          <Text color="gray.500" mt="8px">
            Create, edit and manage your LearnX blog posts.
          </Text>
        </Box>

        <HStack gap="10px">
          <Button
            variant="outline"
            borderRadius="10px"
            onClick={loadBlogs}
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
            <FiPlus /> Add Blog
          </Button>
        </HStack>
      </Flex>

      {/* ================= ALERTS ================= */}

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

      {/* ================= BLOG LIST ================= */}

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
              All Blog Posts
            </Heading>

            <Badge
              bg="#EEEEFB"
              color="#4545A5"
              px="10px"
              py="4px"
              borderRadius="full"
              fontSize="sm"
            >
              {blogs.length} total
            </Badge>
          </HStack>
        </Flex>

        {/* Loading / Empty / Grid */}

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Box
                key={i}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="16px"
                overflow="hidden"
              >
                <Skeleton height="200px" />

                <Box p="20px">
                  <Skeleton height="20px" mb="12px" width="80%" />
                  <Skeleton height="16px" width="40%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : blogs.length === 0 ? (
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
              <Icon as={FiImage} boxSize="32px" />
            </Flex>

            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No blog posts yet
              </Text>

              <Text color="gray.500" fontSize="sm" mt="4px">
                Create your first post to get started.
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
              <FiPlus /> Add Your First Blog
            </Button>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {blogs.map((blog) => (
              <Box
                key={blog.id}
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

                {/* Image Container */}

                <Box
                  position="relative"
                  h="200px"
                  bg="#F5F5FF"
                  overflow="hidden"
                >
                  {blog.image ? (
                    <Image
                      src={resolveImageUrl(blog.image)}
                      alt={blog.title}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="transform .4s ease"
                      _groupHover={{ transform: "scale(1.05)" }}
                    />
                  ) : (
                    <Flex align="center" justify="center" h="100%">
                      <Text color="#A0A0CC" fontSize="sm">
                        No image
                      </Text>
                    </Flex>
                  )}

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
                      _hover={{
                        bg: "#EEEEFB",
                        transform: "scale(1.05)",
                      }}
                      onClick={() => openEdit(blog)}
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
                      _hover={{
                        bg: "#FDECF3",
                        transform: "scale(1.05)",
                      }}
                      onClick={() => setDeleteTarget(blog)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </HStack>
                </Box>

                {/* Content Container */}

                <Box p="20px">
                  <Heading
                    size="sm"
                    color="#20243A"
                    noOfLines={2}
                    lineHeight="1.4"
                    mb="12px"
                  >
                    {blog.title}
                  </Heading>

                  <HStack
                    gap="12px"
                    fontSize="xs"
                    color="gray.500"
                    mb="16px"
                  >
                    <Badge
                      bg="gray.100"
                      color="gray.600"
                      px="8px"
                      py="2px"
                      borderRadius="md"
                    >
                      {blog.uploaded_at
                        ? new Date(blog.uploaded_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </Badge>

                    <HStack gap="4px">
                      <Icon as={FiImage} boxSize="12px" />
                      <Text>{blog.views ?? 0} views</Text>
                    </HStack>
                  </HStack>

                  <Separator mb="16px" borderColor="gray.100" />

                  <HStack gap="10px">
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      flex="1"
                      onClick={() => openEdit(blog)}
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
                      onClick={() => setDeleteTarget(blog)}
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

      {/* ================= CREATE / EDIT MODAL ================= */}

      <Dialog.Root
        open={formOpen}
        onOpenChange={(e) => !e.open && closeForm()}
        size="xl"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop
            bg="blackAlpha.700"
            backdropFilter="blur(4px)"
          />

          <Dialog.Positioner>
            <Dialog.Content
              borderRadius="20px"
              my="40px"
              boxShadow="2xl"
            >

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
                    ? "Edit Blog Post"
                    : "Create New Blog"}
                </Dialog.Title>

                <Text fontSize="sm" color="gray.500" mt="1">
                  Fill in the details below to publish your article.
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
                  id="blog-form"
                  onSubmit={handleSubmit}
                >
                  <VStack align="stretch" gap="28px">

                    {/* BASIC INFORMATION */}

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

                      <VStack align="stretch" gap="20px">

                        <Field.Root required>
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                          >
                            Blog Title
                          </Field.Label>

                          <Input
                            name="title"
                            value={form.title}
                            onChange={changeField}
                            placeholder="e.g. How AI is changing web development"
                            borderRadius="10px"
                            size="lg"
                            required
                            _focus={{
                              borderColor: "#4545A5",
                              boxShadow: "0 0 0 1px #4545A5",
                            }}
                          />
                        </Field.Root>

                        {/* IMAGE UPLOAD */}

                        <Field.Root>
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                          >
                            Featured Image
                          </Field.Label>

                          <Box
                            border="2px dashed"
                            borderColor={
                              imagePreview ? "#4545A5" : "gray.300"
                            }
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
                              document
                                .getElementById("file-upload")
                                .click()
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
                                position="relative"
                                borderRadius="8px"
                                overflow="hidden"
                              >
                                <Image
                                  src={
                                    imagePreview.startsWith("blob:")
                                      ? imagePreview
                                      : resolveImageUrl(imagePreview)
                                  }
                                  alt="Preview"
                                  w="100%"
                                  h="200px"
                                  objectFit="cover"
                                />

                                <Box
                                  position="absolute"
                                  inset="0"
                                  bg="blackAlpha.400"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  opacity={0}
                                  _hover={{ opacity: 1 }}
                                  transition="opacity .2s"
                                >
                                  <Text
                                    color="white"
                                    fontWeight="bold"
                                  >
                                    Click to change image
                                  </Text>
                                </Box>
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
                                  <Icon
                                    as={FiUploadCloud}
                                    boxSize="24px"
                                  />
                                </Flex>

                                <Box>
                                  <Text
                                    fontWeight="semibold"
                                    color="#34384D"
                                  >
                                    Click to upload image
                                  </Text>

                                  <Text
                                    fontSize="sm"
                                    color="gray.500"
                                  >
                                    SVG, PNG, JPG or GIF (max. 5MB)
                                  </Text>
                                </Box>
                              </VStack>
                            )}
                          </Box>
                        </Field.Root>

                        {/* RICH TEXT EDITOR */}

                        <Field.Root required>
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                            mb="2"
                          >
                            Description
                          </Field.Label>

                          <Box
                            bg="white"
                            borderRadius="10px"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="gray.200"
                            width="100%"
                          >
                            <ReactQuill
                              theme="snow"
                              value={form.description}
                              onChange={handleDescriptionChange}
                              modules={quillModules}
                              style={{
                                height: "250px",
                                paddingBottom: "40px",
                              }}
                            />
                          </Box>
                        </Field.Root>
                      </VStack>
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

                        {/* META TITLE */}

                        <Field.Root>
                          <Flex
                            justify="space-between"
                            w="100%"
                            mb="2"
                          >
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
                                form.meta_title.length > 60
                                  ? "red.500"
                                  : "gray.500"
                              }
                            >
                              {form.meta_title.length}/60
                            </Text>
                          </Flex>

                          <Input
                            name="meta_title"
                            value={form.meta_title}
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

                        {/* META DESCRIPTION */}

                        <Field.Root>
                          <Flex
                            justify="space-between"
                            w="100%"
                            mb="2"
                          >
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
                                form.meta_description.length > 160
                                  ? "red.500"
                                  : "gray.500"
                              }
                            >
                              {form.meta_description.length}/160
                            </Text>
                          </Flex>

                          <Textarea
                            name="meta_description"
                            value={form.meta_description}
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

                        {/* META KEYWORDS */}

                        <Field.Root>
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                          >
                            Meta Keywords
                          </Field.Label>

                          <Input
                            name="meta_keywords"
                            value={form.meta_keywords}
                            onChange={changeField}
                            placeholder="e.g. AI, Web Development, React"
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

              {/* FORM FOOTER */}

              <Dialog.Footer
                borderTop="1px solid"
                borderColor="gray.100"
                pt="20px"
                pb="24px"
                px={{ base: "24px", md: "32px" }}
                bg="gray.50"
                borderBottomRadius="20px"
              >
                <HStack
                  gap="12px"
                  w="100%"
                  justifyContent="flex-end"
                >
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
                    form="blog-form"
                    bg="#4545A5"
                    color="white"
                    borderRadius="10px"
                    loading={saving}
                    disabled={saving}
                    _hover={{ bg: "#353584" }}
                    boxShadow="md"
                    px="8"
                  >
                    {editingId !== null
                      ? "Save Changes"
                      : "Publish Blog"}
                  </Button>
                </HStack>
              </Dialog.Footer>

            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* ================= REDESIGNED DELETE MODAL ================= */}

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

              {/* CLOSE BUTTON */}

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

              {/* HEADER */}

              <Dialog.Header
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                pt="36px"
                px="28px"
                pb="12px"
              >
                {/* DELETE ICON */}

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
                  Delete this blog?
                </Dialog.Title>
              </Dialog.Header>

              {/* BODY */}

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
                  Are you sure you want to permanently delete this blog
                  post? This action cannot be undone.
                </Text>

                {/* BLOG DETAILS */}

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
                    BLOG POST
                  </Text>

                  <Text
                    color="#20243A"
                    fontSize="md"
                    fontWeight="700"
                    wordBreak="break-word"
                  >
                    {deleteTarget?.title}
                  </Text>
                </Box>
              </Dialog.Body>

              {/* FOOTER BUTTONS */}

              <Dialog.Footer
                px="28px"
                pt="0"
                pb="28px"
                display="flex"
                justifyContent="center"
                gap="12px"
                flexDirection={{
                  base: "column-reverse",
                  sm: "row",
                }}
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
                  <FiTrash2 /> Delete Blog
                </Button>
              </Dialog.Footer>

            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

    </VStack>
  );
}
