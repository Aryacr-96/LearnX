
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
  Spinner,
  SimpleGrid,
  Dialog,
  Portal,
  CloseButton,
  Badge,
  Field,
  Separator,
  Icon,
  Skeleton,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiRefreshCw,
  FiPlayCircle,
  FiUploadCloud,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

const emptyForm = {
  title: "",
  youtube_url: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

export default function GalleryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [videoType, setVideoType] = useState("file");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const data = await getAll("gallery");
      setItems(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
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

  function pickVideo(e) {
    const file = e.target.files?.[0] || null;
    setVideo(file);
    setVideoPreview(file ? URL.createObjectURL(file) : null);
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setVideoType("file");
    setImage(null);
    setImagePreview(null);
    setVideo(null);
    setVideoPreview(null);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      youtube_url: item.youtube_url || "",
      meta_title: item.meta_title || "",
      meta_description: item.meta_description || "",
      meta_keywords: item.meta_keywords || "",
    });

    if (item.youtube_url) {
      setVideoType("youtube");
    } else {
      setVideoType("file");
    }

    setImage(null);
    setImagePreview(item.image || null);
    setVideo(null);
    setVideoPreview(item.video || null);
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
    setVideo(null);
    setVideoPreview(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!editingId && !image && !video && !form.youtube_url) {
      setError(
        "Please provide at least an image, a video file, or a YouTube link."
      );
      setSaving(false);
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    if (image) {
      formData.append("image", image);
    }

    if (videoType === "youtube") {
      formData.append("youtube_url", form.youtube_url);
    } else {
      if (video) {
        formData.append("video", video);
      }
    }

    try {
      if (editingId !== null) {
        await patch("gallery", editingId, formData);
        setSuccess("Gallery item updated successfully.");
      } else {
        await create("gallery", formData);
        setSuccess("Gallery item added successfully.");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setImage(null);
      setImagePreview(null);
      setVideo(null);
      setVideoPreview(null);

      await loadItems();
    } catch (err) {
      setError(err.message || "Unable to save the gallery item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await remove("gallery", deleteTarget.id);
      setSuccess("Gallery item deleted successfully.");
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      setError(err.message || "Unable to delete the gallery item.");
      setDeleteTarget(null);
    }
  }

  const getYoutubeThumbnail = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

    const match = url.match(regExp);

    return match && match[2].length === 11
      ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
      : null;
  };

  return (
    <VStack align="stretch" gap="24px">
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="14px"
      >
        <Box>
          <Heading size="lg" color="#20243A">
            Gallery Management
          </Heading>

          <Text color="gray.500" mt="8px">
            Add, edit and remove images and videos shown on your website
            gallery.
          </Text>
        </Box>

        <HStack gap="10px">
          <Button
            variant="outline"
            borderRadius="10px"
            onClick={loadItems}
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
          >
            <FiPlus /> Add Media
          </Button>
        </HStack>
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
              All Media
            </Heading>

            <Badge
              bg="#EEEEFB"
              color="#4545A5"
              px="10px"
              py="4px"
              borderRadius="full"
              fontSize="sm"
            >
              {items.length} total
            </Badge>
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} gap="20px">
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="14px"
                overflow="hidden"
              >
                <Skeleton height="190px" />
                <Box p="14px">
                  <Skeleton height="20px" mb="10px" />
                  <Skeleton height="16px" width="50%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : items.length === 0 ? (
          <VStack
            py="60px"
            gap="16px"
            bg="gray.50"
            borderRadius="16px"
            border="1px dashed"
            borderColor="gray.300"
          >
            <Text fontWeight="bold" color="#20243A" fontSize="lg">
              No gallery items yet
            </Text>

            <Text color="gray.500" fontSize="sm">
              Upload your first image or video to get started.
            </Text>

            <Button
              bg="#4545A5"
              color="white"
              _hover={{ bg: "#353584" }}
              borderRadius="10px"
              onClick={openCreate}
            >
              <FiPlus /> Add Your First Media
            </Button>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} gap="20px">
            {items.map((item) => (
              <Box
                key={item.id}
                role="group"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="14px"
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
                <Box
                  position="relative"
                  h="190px"
                  bg="#F5F5FF"
                  overflow="hidden"
                >
                  {item.image ? (
                    <Image
                      src={resolveImageUrl(item.image)}
                      alt={item.title}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="transform .4s ease"
                      _groupHover={{ transform: "scale(1.05)" }}
                    />
                  ) : item.video ? (
                    <video
                      src={resolveImageUrl(item.video)}
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : item.youtube_url ? (
                    <Image
                      src={getYoutubeThumbnail(item.youtube_url)}
                      alt={item.title}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="transform .4s ease"
                      _groupHover={{ transform: "scale(1.05)" }}
                    />
                  ) : (
                    <Flex align="center" justify="center" h="100%">
                      <Text color="#A0A0CC" fontSize="sm">
                        No media
                      </Text>
                    </Flex>
                  )}

                  {/* Overlay & Actions */}
                  <Box
                    position="absolute"
                    inset="0"
                    bg="linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity .2s ease"
                  />

                  {item.youtube_url && (
                    <Box
                      position="absolute"
                      inset="0"
                      bg="blackAlpha.300"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      pointerEvents="none"
                    >
                      <FiPlayCircle size={44} color="white" opacity={0.9} />
                    </Box>
                  )}

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
                    <Button
                      size="sm"
                      bg="white"
                      color="#4545A5"
                      borderRadius="8px"
                      boxShadow="lg"
                      _hover={{ bg: "#EEEEFB" }}
                      onClick={() => openEdit(item)}
                    >
                      <FiEdit2 />
                    </Button>

                    <Button
                      size="sm"
                      bg="white"
                      color="#DB2777"
                      borderRadius="8px"
                      boxShadow="lg"
                      _hover={{ bg: "#FDECF3" }}
                      onClick={() => setDeleteTarget(item)}
                    >
                      <FiTrash2 />
                    </Button>
                  </HStack>
                </Box>

                <Box p="16px">
                  <Heading
                    size="sm"
                    color="#20243A"
                    noOfLines={2}
                    lineHeight="1.4"
                    mb="8px"
                  >
                    {item.title}
                  </Heading>

                  <Text color="gray.500" fontSize="xs">
                    {item.uploaded_at
                      ? new Date(item.uploaded_at).toLocaleDateString()
                      : "—"}
                  </Text>

                  <Separator mt="12px" mb="10px" borderColor="gray.100" />

                  <HStack gap="8px">
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      flex="1"
                      onClick={() => openEdit(item)}
                      _hover={{
                        bg: "#EEEEFB",
                        borderColor: "#4545A5",
                        color: "#4545A5",
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      color="#DB2777"
                      borderColor="red.200"
                      _hover={{ bg: "#FDECF3" }}
                      flex="1"
                      onClick={() => setDeleteTarget(item)}
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

      {/* CREATE / EDIT MODAL */}
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
                  {editingId !== null ? "Edit Media" : "Add New Media"}
                </Dialog.Title>

                <Text fontSize="sm" color="gray.500" mt="1">
                  Fill in the details below to publish your media.
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
                <Box as="form" id="gallery-form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap="28px">
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
                        1. Media Information
                      </Text>

                      <VStack align="stretch" gap="20px">
                        <Field.Root required>
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                          >
                            Title
                          </Field.Label>

                          <Input
                            name="title"
                            value={form.title}
                            onChange={changeField}
                            placeholder="Enter title"
                            borderRadius="10px"
                            size="lg"
                            required
                            _focus={{ borderColor: "#4545A5" }}
                          />
                        </Field.Root>

                        {/* IMAGE UPLOAD */}
                        <Field.Root>
                          <Field.Label
                            fontWeight="semibold"
                            color="#34384D"
                          >
                            Image File (Optional)
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
                            _hover={{ borderColor: "#4545A5" }}
                            onClick={() =>
                              document.getElementById("img-upload").click()
                            }
                          >
                            <Input
                              id="img-upload"
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
                                  h="150px"
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
                                  <Text color="white" fontWeight="bold">
                                    Click to change
                                  </Text>
                                </Box>
                              </Box>
                            ) : (
                              <VStack gap="10px" py="6px">
                                <Flex
                                  w="40px"
                                  h="40px"
                                  borderRadius="full"
                                  bg="#EEEEFB"
                                  color="#4545A5"
                                  align="center"
                                  justify="center"
                                >
                                  <Icon
                                    as={FiUploadCloud}
                                    boxSize="20px"
                                  />
                                </Flex>

                                <Text
                                  fontWeight="semibold"
                                  color="#34384D"
                                  fontSize="sm"
                                >
                                  Click to upload image
                                </Text>
                              </VStack>
                            )}
                          </Box>
                        </Field.Root>

                        <Separator />

                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color="#0D9488"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          mb="4px"
                        >
                          Video Settings
                        </Text>

                        <HStack gap="6">
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name="videoType"
                              value="file"
                              checked={videoType === "file"}
                              onChange={() => setVideoType("file")}
                            />
                            <Text fontSize="sm" fontWeight="medium">
                              Upload Video File
                            </Text>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name="videoType"
                              value="youtube"
                              checked={videoType === "youtube"}
                              onChange={() => setVideoType("youtube")}
                            />
                            <Text fontSize="sm" fontWeight="medium">
                              YouTube Link
                            </Text>
                          </label>
                        </HStack>

                        {videoType === "youtube" ? (
                          <Field.Root>
                            <Field.Label
                              fontWeight="semibold"
                              color="#34384D"
                            >
                              YouTube URL
                            </Field.Label>

                            <Input
                              name="youtube_url"
                              value={form.youtube_url}
                              onChange={changeField}
                              placeholder="https://youtube.com/watch?v=..."
                              borderRadius="10px"
                              _focus={{ borderColor: "#0D9488" }}
                            />
                          </Field.Root>
                        ) : (
                          <Field.Root>
                            <Field.Label
                              fontWeight="semibold"
                              color="#34384D"
                            >
                              Video File
                            </Field.Label>

                            <Box
                              border="2px dashed"
                              borderColor={
                                videoPreview ? "#0D9488" : "gray.300"
                              }
                              borderRadius="12px"
                              bg={videoPreview ? "#F0FDFA" : "gray.50"}
                              p="20px"
                              textAlign="center"
                              cursor="pointer"
                              _hover={{ borderColor: "#0D9488" }}
                              onClick={() =>
                                document.getElementById("vid-upload").click()
                              }
                            >
                              <Input
                                id="vid-upload"
                                type="file"
                                accept="video/*"
                                display="none"
                                onChange={pickVideo}
                              />

                              {videoPreview ? (
                                <video
                                  src={
                                    videoPreview.startsWith("blob:")
                                      ? videoPreview
                                      : resolveImageUrl(videoPreview)
                                  }
                                  controls
                                  style={{
                                    width: "100%",
                                    height: "150px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                              ) : (
                                <Text
                                  fontWeight="semibold"
                                  color="#34384D"
                                  fontSize="sm"
                                >
                                  Click to upload video
                                </Text>
                              )}
                            </Box>
                          </Field.Root>
                        )}
                      </VStack>
                    </Box>

                    <Separator borderColor="gray.100" />

                    {/* SEO SECTION */}
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
                            placeholder="e.g. Campus, Students, Events"
                            borderRadius="10px"
                            _focus={{ borderColor: "#0D9488" }}
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
                    form="gallery-form"
                    bg="#4545A5"
                    color="white"
                    borderRadius="10px"
                    loading={saving}
                    disabled={saving}
                    _hover={{ bg: "#353584" }}
                    boxShadow="md"
                    px="8"
                  >
                    {editingId !== null ? "Save Changes" : "Publish Media"}
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
                    Delete this item?
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
                    “{deleteTarget?.title}”
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
                    Delete Item
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
