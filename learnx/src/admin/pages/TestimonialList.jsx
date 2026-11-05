
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
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiUploadCloud, FiMessageSquare } from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

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

  function openEdit(testimonial) {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name || "",
      message: testimonial.message || "",
      order: testimonial.order || 0,
    });
    setImage(null);
    setImagePreview(testimonial.image ? resolveImageUrl(testimonial.image) : null);
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

    formData.append("name", form.name);
    formData.append("message", form.message);
    formData.append("order", form.order);

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
    if (!deleteTarget) return;
    try {
      await remove("testimonials", deleteTarget.id);
      setSuccess("Testimonial deleted successfully.");
      setDeleteTarget(null);
      await loadTestimonials();
    } catch (err) {
      setError(err.message || "Unable to delete the testimonial.");
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
            Testimonials Management
          </Heading>
          <Text color="gray.500" mt="8px">
            Manage the student testimonials displayed on the home page.
          </Text>
        </Box>
        <HStack gap="10px">
          <Button variant="outline" borderRadius="10px" onClick={loadTestimonials} loading={loading}>
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
            <FiPlus /> Add Testimonial
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

      {/* LIST WINDOW */}
      <Box bg="white" p={{ base: "18px", md: "26px" }} borderRadius="20px" border="1px solid" borderColor="gray.200" boxShadow="sm">
        <Flex justify="space-between" align="center" mb="24px">
          <HStack gap="12px">
            <Heading size="md" color="#20243A">
              All Testimonials
            </Heading>
            <Badge bg="#EEEEFB" color="#4545A5" px="10px" py="4px" borderRadius="full" fontSize="sm">
              {testimonials.length} total
            </Badge>
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {[1, 2, 3].map((i) => (
              <Box key={i} border="1px solid" borderColor="gray.100" borderRadius="16px" overflow="hidden">
                <Box p="20px">
                  <Skeleton height="20px" mb="12px" width="40%" />
                  <Skeleton height="60px" mb="12px" width="100%" />
                  <Skeleton height="20px" width="30%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : testimonials.length === 0 ? (
          <VStack py="60px" gap="16px" bg="gray.50" borderRadius="16px" border="1px dashed" borderColor="gray.300">
            <Flex w="64px" h="64px" borderRadius="full" bg="#EEEEFB" color="#4545A5" align="center" justify="center">
              <Icon as={FiMessageSquare} boxSize="32px" />
            </Flex>
            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">No testimonials yet</Text>
              <Text color="gray.500" fontSize="sm" mt="4px">Add your first testimonial to display on the homepage.</Text>
            </Box>
            <Button bg="#4545A5" color="white" _hover={{ bg: "#353584" }} borderRadius="10px" onClick={openCreate} mt="2">
              <FiPlus /> Add Testimonial
            </Button>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
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
                <Box p="24px" h="100%" display="flex" flexDirection="column">
                  {/* Student Info */}
                  <HStack gap="16px" mb="16px">
                    {testimonial.image && !brokenImages[testimonial.id] ? (
                      <Image
                        src={resolveImageUrl(testimonial.image)}
                        alt={testimonial.name}
                        boxSize="50px"
                        borderRadius="full"
                        objectFit="cover"
                        onError={() => setBrokenImages((prev) => ({ ...prev, [testimonial.id]: true }))}
                      />
                    ) : (
                      <Flex boxSize="50px" borderRadius="full" bg="#EEEEFB" color="#4545A5" align="center" justify="center" fontWeight="bold">
                        {testimonial.name.charAt(0)}
                      </Flex>
                    )}
                    <Box>
                      <Heading size="sm" color="#20243A" noOfLines={1}>
                        {testimonial.name}
                      </Heading>
                      <Text fontSize="xs" color="gray.500">
                        Order: {testimonial.order}
                      </Text>
                    </Box>
                  </HStack>

                  {/* Message Preview */}
                  <Text fontSize="sm" color="gray.600" fontStyle="italic" noOfLines={4} flex="1" mb="20px">
                    "{testimonial.message}"
                  </Text>

                  <Separator mb="16px" borderColor="gray.100" />

                  {/* Actions */}
                  <HStack gap="10px" mt="auto">
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="8px"
                      flex="1"
                      onClick={() => openEdit(testimonial)}
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
                      onClick={() => setDeleteTarget(testimonial)}
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
      <Dialog.Root open={formOpen} onOpenChange={(e) => !e.open && closeForm()} size="md" scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="20px" my="40px" boxShadow="2xl">
              <Dialog.Header borderBottom="1px solid" borderColor="gray.100" pb="16px" pt="24px" px={{ base: "24px", md: "32px" }}>
                <Dialog.Title color="#20243A" fontSize="2xl" fontWeight="bold">
                  {editingId !== null ? "Edit Testimonial" : "Add New Testimonial"}
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="md" top="18px" right="18px" borderRadius="full" bg="gray.50" _hover={{ bg: "gray.100" }} />
              </Dialog.CloseTrigger>

              <Dialog.Body pt="24px" px={{ base: "24px", md: "32px" }}>
                <Box as="form" id="testimonial-form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap="20px">
                    <Field.Root required>
                      <Field.Label fontWeight="semibold" color="#34384D">Student Name</Field.Label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={changeField}
                        // placeholder="e.g. John Doe"
                        borderRadius="10px"
                        required
                      />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label fontWeight="semibold" color="#34384D">Testimonial Message</Field.Label>
                      <Textarea
                        name="message"
                        value={form.message}
                        onChange={changeField}
                        placeholder="Write the testimonial here..."
                        borderRadius="10px"
                        rows={5}
                        required
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label fontWeight="semibold" color="#34384D">Display Order</Field.Label>
                      <Input
                        type="number"
                        name="order"
                        value={form.order}
                        onChange={changeField}
                        placeholder="e.g. 1"
                        borderRadius="10px"
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label fontWeight="semibold" color="#34384D">Student Image</Field.Label>
                      <Box
                        border="2px dashed"
                        borderColor={imagePreview ? "#4545A5" : "gray.300"}
                        borderRadius="12px"
                        bg={imagePreview ? "#F8F8FF" : "gray.50"}
                        p="24px"
                        textAlign="center"
                        cursor="pointer"
                        position="relative"
                        _hover={{ borderColor: "#4545A5", bg: "#F8F8FF" }}
                        onClick={() => document.getElementById("testimonial-upload").click()}
                      >
                        <Input id="testimonial-upload" type="file" accept="image/*" display="none" onChange={pickImage} />

                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            w="100px"
                            h="100px"
                            objectFit="cover"
                            borderRadius="full"
                            mx="auto"
                            onError={() => setImagePreview(null)}
                          />
                        ) : (
                          <VStack gap="10px" py="10px">
                            <Icon as={FiUploadCloud} boxSize="24px" color="#4545A5" />
                            <Text fontWeight="semibold" color="#34384D">Click to upload image</Text>
                          </VStack>
                        )}
                      </Box>
                    </Field.Root>
                  </VStack>
                </Box>
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid" borderColor="gray.100" pt="20px" pb="24px" px={{ base: "24px", md: "32px" }} bg="gray.50" borderBottomRadius="20px">
                <HStack gap="12px" w="100%" justifyContent="flex-end">
                  <Button variant="ghost" borderRadius="10px" onClick={closeForm} disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="testimonial-form"
                    bg="#4545A5"
                    color="white"
                    borderRadius="10px"
                    loading={saving}
                    disabled={saving}
                  >
                    {editingId !== null ? "Save Changes" : "Add Testimonial"}
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
                    Delete this testimonial?
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
