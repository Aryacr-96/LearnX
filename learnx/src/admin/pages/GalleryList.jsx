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

/* ============================================================
   SHARED SOFT BUTTON STYLES  (match all other lists)
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
  _hover: { bg: "gray.50", borderColor: "gray.300", color: "gray.800" },
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

const softTeal = {
  bg: "#E6F9F4",
  color: "#0D9488",
  fontWeight: "600",
  fontSize: "sm",
  borderRadius: "full",
  border: "1px solid transparent",
  transition: "all .2s ease",
  _hover: { bg: "#0D9488", color: "white" },
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
      {/* HEADER */}
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
            Add, edit and remove images and videos shown on your website gallery.
          </Text>
        </Box>

        <HStack gap="10px">
          <Button
            {...softOutline}
            onClick={loadItems}
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
            <FiPlus /> Add Media
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
                borderRadius="16px"
                overflow="hidden"
              >
                <Skeleton height="190px" />
                <Box p="16px">
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
            <Flex
              w="64px"
              h="64px"
              borderRadius="full"
              bg="#EEEEFB"
              color="#4545A5"
              align="center"
              justify="center"
            >
              <Icon as={FiPlayCircle} boxSize="32px" />
            </Flex>
            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No gallery items yet
              </Text>
              <Text color="gray.500" fontSize="sm" mt="4px">
                Upload your first image or video to get started.
              </Text>
            </Box>
            <Button {...softPrimary} onClick={openCreate} mt="2">
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
                    _groupHover={{ opacity: 1, transform: "translateY(0)" }}
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
                      onClick={() => openEdit(item)}
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
                      onClick={() => setDeleteTarget(item)}
                    >
                      <FiTrash2 />
                    </IconButton>
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
                      {...softOutline}
                      size="sm"
                      flex="1"
                      onClick={() => openEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      {...softDanger}
                      size="sm"
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

      {/* ============================================================
          CREATE / EDIT MODAL — soft floating card, pill tabs
          ============================================================ */}
      <Dialog.Root
        open={formOpen}
        onOpenChange={(e) => !e.open && closeForm()}
        size="xl"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop bg="rgba(32,36,58,0.4)" backdropFilter="blur(8px)" />
          <Dialog.Positioner>
            <Dialog.Content
              borderRadius="28px"
              my="40px"
              boxShadow="0 30px 80px rgba(32,36,58,0.18)"
              bg="white"
              overflow="hidden"
            >
              {/* HEADER — pill tabs */}
              <Box pt="24px" px={{ base: "22px", md: "32px" }} pb="0">
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
                      {editingId !== null ? "Editing" : "New Media"}
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
                      _hover={{ bg: "gray.100", color: "gray.700" }}
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
                  {editingId !== null ? "Edit Media" : "Add New Media"}
                </Dialog.Title>
                <Text fontSize="sm" color="gray.500" mt="6px" mb="20px">
                  {editingId !== null
                    ? "Update the details of your media below."
                    : "Fill in the details below to publish your media."}
                </Text>
              </Box>

              {/* BODY */}
              <Dialog.Body pt="4px" px={{ base: "22px", md: "32px" }} pb="8px">
                <Box as="form" id="gallery-form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap="22px">
                    <Box>
                      <HStack gap="8px" mb="14px">
                        <Box w="3px" h="14px" bg="#4545A5" borderRadius="full" />
                        <Text
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.500"
                          textTransform="uppercase"
                          letterSpacing="wider"
                        >
                          Media Information
                        </Text>
                      </HStack>

                      <VStack align="stretch" gap="18px">
                        <Field.Root required>
                          <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                            Title
                          </Field.Label>
                          <Input
                            name="title"
                            value={form.title}
                            onChange={changeField}
                            placeholder="Enter title"
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

                        <Field.Root>
                          <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                            Image File (Optional)
                          </Field.Label>
                          <Box
                            border="1px dashed"
                            borderColor={imagePreview ? "#4545A5" : "gray.300"}
                            borderRadius="16px"
                            bg={imagePreview ? "#FAFAFF" : "gray.50"}
                            p="24px"
                            textAlign="center"
                            cursor="pointer"
                            transition="all .15s ease"
                            _hover={{ borderColor: "#4545A5", bg: "#FAFAFF" }}
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
                                borderRadius="12px"
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
                                  bg="blackAlpha.500"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  opacity={0}
                                  _hover={{ opacity: 1 }}
                                  transition="opacity .15s"
                                >
                                  <Text color="white" fontWeight="600" fontSize="sm">
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
                                  <Icon as={FiUploadCloud} boxSize="20px" />
                                </Flex>
                                <Box>
                                  <Text fontWeight="600" color="#34384D" fontSize="sm">
                                    Click to upload image
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" mt="2px">
                                    SVG, PNG, JPG or GIF
                                  </Text>
                                </Box>
                              </VStack>
                            )}
                          </Box>
                        </Field.Root>

                        <Separator borderColor="gray.100" />

                        <HStack gap="8px" mb="4px">
                          <Box w="3px" h="14px" bg="#0D9488" borderRadius="full" />
                          <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="gray.500"
                            textTransform="uppercase"
                            letterSpacing="wider"
                          >
                            Video Settings
                          </Text>
                        </HStack>

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
                            <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                              YouTube URL
                            </Field.Label>
                            <Input
                              name="youtube_url"
                              value={form.youtube_url}
                              onChange={changeField}
                              placeholder="https://youtube.com/watch?v=..."
                              borderRadius="12px"
                              h="48px"
                              fontSize="sm"
                              bg="gray.50"
                              border="1px solid"
                              borderColor="transparent"
                              _hover={{ borderColor: "gray.200" }}
                              _focus={{
                                bg: "white",
                                borderColor: "#0D9488",
                                boxShadow: "0 0 0 3px rgba(13,148,136,0.12)",
                              }}
                            />
                          </Field.Root>
                        ) : (
                          <Field.Root>
                            <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                              Video File
                            </Field.Label>
                            <Box
                              border="1px dashed"
                              borderColor={videoPreview ? "#0D9488" : "gray.300"}
                              borderRadius="16px"
                              bg={videoPreview ? "#F0FDFA" : "gray.50"}
                              p="24px"
                              textAlign="center"
                              cursor="pointer"
                              transition="all .15s ease"
                              _hover={{ borderColor: "#0D9488", bg: "#F0FDFA" }}
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
                                    borderRadius: "12px",
                                  }}
                                />
                              ) : (
                                <VStack gap="8px" py="8px">
                                  <Flex
                                    w="48px"
                                    h="48px"
                                    borderRadius="full"
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    color="#0D9488"
                                    align="center"
                                    justify="center"
                                  >
                                    <Icon as={FiUploadCloud} boxSize="20px" />
                                  </Flex>
                                  <Box>
                                    <Text fontWeight="600" color="#34384D" fontSize="sm">
                                      Click to upload video
                                    </Text>
                                  </Box>
                                </VStack>
                              )}
                            </Box>
                          </Field.Root>
                        )}
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
                    form="gallery-form"
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
                    {editingId !== null ? "Save Changes" : "Publish Media"}
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* ============================================================
          DELETE MODAL — soft floating card
          ============================================================ */}
      <Dialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(e) => !e.open && setDeleteTarget(null)}
        role="alertdialog"
        size="md"
      >
        <Portal>
          <Dialog.Backdrop bg="rgba(32,36,58,0.4)" backdropFilter="blur(8px)" />
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
                  _hover={{ bg: "gray.100", color: "gray.700" }}
                />
              </Dialog.CloseTrigger>

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
                  Delete this item?
                </Dialog.Title>
              </Dialog.Header>

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
                    <Text color="gray.500" fontSize="xs" fontWeight="600" mb="4px">
                      MEDIA ITEM
                    </Text>
                    <Text
                      color="#20243A"
                      fontSize="sm"
                      fontWeight="600"
                      wordBreak="break-word"
                    >
                      {deleteTarget?.title}
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
                  <FiTrash2 /> Delete Item
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}