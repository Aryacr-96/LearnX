
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
  FiMessageSquare,
  FiX,
} from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

const PRIMARY = "#4545A5";
const PRIMARY_DARK = "#353584";

const emptyForm = {
  name: "",
  message: "",
  order: 0,
};

export default function TestimonialList() {
  const [testimonials, setTestimonials] = useState([]);
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

  async function loadTestimonials() {
    setLoading(true);
    setError("");

    try {
      const data = await getAll("testimonials");
      setTestimonials(Array.isArray(data) ? data : data.results ?? []);
      setBrokenImages({});
    } catch (err) {
      setError(err.message || "Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  function changeField(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? value : value,
    }));
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

  function openEdit(testimonial) {
    setEditingId(testimonial.id);

    setForm({
      name: testimonial.name || "",
      message: testimonial.message || "",
      order: testimonial.order ?? 0,
    });

    setImage(null);
    setImagePreview(
      testimonial.image ? resolveImageUrl(testimonial.image) : null
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

    if (!form.name.trim() || !form.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("message", form.message.trim());
    formData.append("order", form.order || 0);

    if (image) {
      formData.append("image", image);
    }

    try {
      if (editingId !== null) {
        await patch("testimonials", editingId, formData);
        setSuccess("Testimonial updated successfully.");
      } else {
        await create("testimonials", formData);
        setSuccess("Testimonial created successfully.");
      }

      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setImage(null);
      setImagePreview(null);

      await loadTestimonials();
    } catch (err) {
      setError(err.message || "Unable to save the testimonial.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    try {
      await remove("testimonials", deleteTarget.id);
      setSuccess("Testimonial deleted successfully.");
      setDeleteTarget(null);
      await loadTestimonials();
    } catch (err) {
      setError(err.message || "Unable to delete the testimonial.");
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
            Testimonials Management
          </Heading>

          <Text color="gray.500" fontSize="sm" mt="8px">
            Manage the student testimonials displayed on the home page.
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
            onClick={loadTestimonials}
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
            minW="190px"
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
            Add Testimonial
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

      {/* TESTIMONIAL LIST */}
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
              All Testimonials
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
              {testimonials.length} Total
            </Badge>
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="22px">
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="16px"
                p="22px"
              >
                <HStack mb="16px">
                  <Skeleton boxSize="48px" borderRadius="full" />
                  <Box flex="1">
                    <Skeleton height="15px" width="50%" mb="8px" />
                    <Skeleton height="12px" width="30%" />
                  </Box>
                </HStack>
                <Skeleton height="65px" mb="16px" />
                <Skeleton height="35px" />
              </Box>
            ))}
          </SimpleGrid>
        ) : testimonials.length === 0 ? (
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
              <Icon as={FiMessageSquare} boxSize="30px" />
            </Flex>

            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No testimonials yet
              </Text>
              <Text color="gray.500" fontSize="sm" mt="5px">
                Add your first testimonial to display on the homepage.
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
              Add Testimonial
            </Button>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="22px">
            {testimonials.map((testimonial) => (
              <Box
                key={testimonial.id}
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
                <Box
                  p="22px"
                  h="100%"
                  display="flex"
                  flexDirection="column"
                >
                  <HStack gap="14px" mb="18px">
                    {testimonial.image && !brokenImages[testimonial.id] ? (
                      <Image
                        src={resolveImageUrl(testimonial.image)}
                        alt={testimonial.name}
                        boxSize="52px"
                        borderRadius="full"
                        objectFit="cover"
                        border="2px solid"
                        borderColor="#EEEEFB"
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [testimonial.id]: true,
                          }))
                        }
                      />
                    ) : (
                      <Flex
                        boxSize="52px"
                        flexShrink="0"
                        borderRadius="full"
                        bg="#EEEEFB"
                        color={PRIMARY}
                        align="center"
                        justify="center"
                        fontWeight="bold"
                        fontSize="lg"
                      >
                        {testimonial.name?.charAt(0)?.toUpperCase() || "?"}
                      </Flex>
                    )}

                    <Box flex="1" minW="0">
                      <Heading
                        size="sm"
                        color="#20243A"
                        noOfLines={1}
                      >
                        {testimonial.name}
                      </Heading>

                      <Text fontSize="xs" color="gray.500" mt="4px">
                        Display order: {testimonial.order}
                      </Text>
                    </Box>

                    <Badge
                      bg="#EEEEFB"
                      color={PRIMARY}
                      borderRadius="full"
                      px="10px"
                      py="4px"
                      fontSize="xs"
                    >
                      #{testimonial.order}
                    </Badge>
                  </HStack>

                  <Box
                    bg="#F8F8FC"
                    borderRadius="12px"
                    p="15px"
                    flex="1"
                    mb="18px"
                  >
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      fontStyle="italic"
                      lineHeight="1.8"
                      noOfLines={4}
                    >
                      “{testimonial.message}”
                    </Text>
                  </Box>

                  <Separator mb="16px" borderColor="gray.100" />

                  <HStack gap="10px">
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="9px"
                      h="38px"
                      flex="1"
                      fontWeight="semibold"
                      borderColor="gray.200"
                      onClick={() => openEdit(testimonial)}
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
                      onClick={() => setDeleteTarget(testimonial)}
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
        size="md"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop
            bg="blackAlpha.700"
            backdropFilter="blur(5px)"
          />

          <Dialog.Positioner p="16px">
            <Dialog.Content
              maxW="560px"
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
                      <Icon as={FiMessageSquare} boxSize="21px" />
                    )}
                  </Flex>

                  <Box>
                    <Dialog.Title
                      color="#20243A"
                      fontSize="xl"
                      fontWeight="bold"
                    >
                      {editingId !== null
                        ? "Edit Testimonial"
                        : "Add New Testimonial"}
                    </Dialog.Title>

                    <Text color="gray.500" fontSize="sm" mt="4px">
                      {editingId !== null
                        ? "Update the student testimonial details."
                        : "Enter the details to add a new testimonial."}
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
                    mb="18px"
                  >
                    {error}
                  </Box>
                )}

                <Box
                  as="form"
                  id="testimonial-form"
                  onSubmit={handleSubmit}
                >
                  <VStack align="stretch" gap="22px">

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

                    <Field.Root required>
                      <Field.Label
                        color="#34384D"
                        fontWeight="semibold"
                        fontSize="sm"
                        mb="7px"
                      >
                        Testimonial Message
                      </Field.Label>

                      <Textarea
                        name="message"
                        value={form.message}
                        onChange={changeField}
                        placeholder="Write the student's testimonial here..."
                        borderRadius="10px"
                        minH="125px"
                        resize="vertical"
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
                        type="number"
                        name="order"
                        value={form.order}
                        onChange={changeField}
                        placeholder="Enter display order"
                        borderRadius="10px"
                        h="46px"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: PRIMARY,
                          boxShadow: `0 0 0 1px ${PRIMARY}`,
                        }}
                      />

                      <Text fontSize="xs" color="gray.500" mt="6px">
                        Lower numbers will appear first.
                      </Text>
                    </Field.Root>

                    {/* IMAGE UPLOAD */}
                    <Field.Root>
                      <Field.Label
                        color="#34384D"
                        fontWeight="semibold"
                        fontSize="sm"
                        mb="7px"
                      >
                        Student Image
                      </Field.Label>

                      <Box
                        border="2px dashed"
                        borderColor={imagePreview ? PRIMARY : "gray.300"}
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
                          document.getElementById("testimonial-upload")?.click()
                        }
                      >
                        <Input
                          id="testimonial-upload"
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
                              w="110px"
                              h="110px"
                              objectFit="cover"
                              borderRadius="full"
                              border="3px solid white"
                              boxShadow="md"
                              mx="auto"
                            />

                            <Text
                              color={PRIMARY}
                              fontWeight="semibold"
                              fontSize="sm"
                            >
                              Click to change image
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
                              <Icon as={FiUploadCloud} boxSize="23px" />
                            </Flex>

                            <Box>
                              <Text
                                fontWeight="semibold"
                                color="#34384D"
                                fontSize="sm"
                              >
                                Click to upload student image
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
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form="testimonial-form"
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
                        Add Testimonial
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
                    Delete this testimonial?
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
                    You are about to permanently delete the testimonial from
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
                    Delete Testimonial
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
