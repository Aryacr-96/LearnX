
import { useEffect, useState } from "react";
import {
  Box, Button, Flex, Heading, Input, Text, Textarea, VStack, HStack,
  Image, SimpleGrid, Dialog, Portal, CloseButton, IconButton, Badge,
  Separator, Field, Icon, Skeleton,
} from "@chakra-ui/react";
import {
  FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiUploadCloud, FiBookOpen, FiTrash,
} from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { resolveImageUrl } from "../../services/publicApi";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const emptyForm = {
  title: "",
  duration: "",
  level: "Beginner",
  description: "",
  overview: "",
  modules: [],
  order: 0,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

export default function CourseList() {
  const [courses, setCourses] = useState([]);
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

  async function loadCourses() {
    setLoading(true);
    setError("");
    try {
      const data = await getAll("courses");
      setCourses(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCourses(); }, []);

  function changeField(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleOverviewChange(value) {
    setForm((p) => ({ ...p, overview: value }));
  }

  function addModule() {
    setForm((p) => ({
      ...p,
      modules: [...p.modules, { title: "", description: "" }],
    }));
  }

  function updateModule(index, field, value) {
    const updatedModules = [...form.modules];
    updatedModules[index][field] = value;
    setForm((p) => ({ ...p, modules: updatedModules }));
  }

  function removeModule(index) {
    setForm((p) => ({ ...p, modules: p.modules.filter((_, i) => i !== index) }));
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

  function openEdit(course) {
    setEditingId(course.id);
    setForm({
      title: course.title || "",
      duration: course.duration || "",
      level: course.level || "Beginner",
      description: course.description || "",
      overview: course.overview || "",
      modules: Array.isArray(course.modules) ? course.modules : [],
      order: course.order || 0,
      meta_title: course.meta_title || "",
      meta_description: course.meta_description || "",
      meta_keywords: course.meta_keywords || "",
    });
    setImage(null);
    setImagePreview(course.image || null);
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

    formData.append("title", form.title);
    formData.append("duration", form.duration);
    formData.append("level", form.level);
    formData.append("description", form.description);
    formData.append("overview", form.overview);
    formData.append("order", form.order);
    formData.append("modules", JSON.stringify(form.modules));

    if (editingId !== null) {
      formData.append("meta_title", form.meta_title);
      formData.append("meta_description", form.meta_description);
      formData.append("meta_keywords", form.meta_keywords);
    } else {
      if (form.meta_title) formData.append("meta_title", form.meta_title);
      if (form.meta_description) formData.append("meta_description", form.meta_description);
      if (form.meta_keywords) formData.append("meta_keywords", form.meta_keywords);
    }

    if (image) formData.append("image", image);

    try {
      if (editingId !== null) {
        await patch("courses", editingId, formData);
        setSuccess("Course updated successfully.");
      } else {
        await create("courses", formData);
        setSuccess("Course created successfully.");
      }
      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setImage(null);
      setImagePreview(null);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Unable to save the course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove("courses", deleteTarget.id);
      setSuccess("Course deleted successfully.");
      setDeleteTarget(null);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Unable to delete the course.");
      setDeleteTarget(null);
    }
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
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
          <Heading size="lg" color="#20243A">Course Management</Heading>
          <Text color="gray.500" mt="8px">
            Create, edit and manage your LearnX courses.
          </Text>
        </Box>
        <HStack gap="10px">
          <Button variant="outline" borderRadius="10px" onClick={loadCourses} loading={loading}>
            <FiRefreshCw /> Refresh
          </Button>
          <Button bg="#4545A5" color="white" _hover={{ bg: "#353584" }} borderRadius="10px" onClick={openCreate} boxShadow="md">
            <FiPlus /> Add Course
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
            <Heading size="md" color="#20243A">All Courses</Heading>
            <Badge bg="#EEEEFB" color="#4545A5" px="10px" py="4px" borderRadius="full" fontSize="sm">
              {courses.length} total
            </Badge>
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {[1, 2, 3].map((i) => (
              <Box key={i} border="1px solid" borderColor="gray.100" borderRadius="16px" overflow="hidden">
                <Skeleton height="200px" />
                <Box p="20px">
                  <Skeleton height="20px" mb="12px" width="80%" />
                  <Skeleton height="16px" width="40%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : courses.length === 0 ? (
          <VStack py="60px" gap="16px" bg="gray.50" borderRadius="16px" border="1px dashed" borderColor="gray.300">
            <Flex w="64px" h="64px" borderRadius="full" bg="#EEEEFB" color="#4545A5" align="center" justify="center">
              <Icon as={FiBookOpen} boxSize="32px" />
            </Flex>
            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">No courses yet</Text>
              <Text color="gray.500" fontSize="sm" mt="4px">Create your first course to get started.</Text>
            </Box>
            <Button bg="#4545A5" color="white" _hover={{ bg: "#353584" }} borderRadius="10px" onClick={openCreate} mt="2">
              <FiPlus /> Add Your First Course
            </Button>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {courses.map((course) => {
              const hasMeta = course.meta_title || course.meta_description || course.meta_keywords;
              return (
                <Box
                  key={course.id}
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
                  <Box position="relative" h="200px" bg="#F5F5FF" overflow="hidden">
                    {course.image ? (
                      <Image
                        src={resolveImageUrl(course.image)}
                        alt={course.title}
                        w="100%" h="100%" objectFit="cover"
                        transition="transform .4s ease"
                        _groupHover={{ transform: "scale(1.05)" }}
                      />
                    ) : (
                      <Flex align="center" justify="center" h="100%">
                        <Text color="#A0A0CC" fontSize="sm">No image</Text>
                      </Flex>
                    )}

                    {hasMeta && (
                      <Badge
                        position="absolute" top="12px" left="12px"
                        bg="whiteAlpha.900" color="#0D9488"
                        px="8px" py="2px" borderRadius="full" fontSize="10px" fontWeight="bold"
                      >
                        SEO
                      </Badge>
                    )}

                    <Box
                      position="absolute" inset="0"
                      bg="linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      transition="opacity .2s ease"
                    />

                    <HStack
                      position="absolute" top="12px" right="12px" gap="8px"
                      opacity={0}
                      transform="translateY(-10px)"
                      _groupHover={{ opacity: 1, transform: "translateY(0)" }}
                      transition="all .2s ease"
                    >
                      <IconButton
                        size="sm" aria-label="Edit"
                        bg="white" color="#4545A5" borderRadius="8px" boxShadow="lg"
                        _hover={{ bg: "#EEEEFB", transform: "scale(1.05)" }}
                        onClick={() => openEdit(course)}
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton
                        size="sm" aria-label="Delete"
                        bg="white" color="#DB2777" borderRadius="8px" boxShadow="lg"
                        _hover={{ bg: "#FDECF3", transform: "scale(1.05)" }}
                        onClick={() => setDeleteTarget(course)}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </HStack>
                  </Box>

                  <Box p="20px">
                    <Heading size="sm" color="#20243A" noOfLines={2} lineHeight="1.4" mb="12px">
                      {course.title}
                    </Heading>

                    <HStack gap="12px" fontSize="xs" color="gray.500" mb="16px">
                      <Badge bg="gray.100" color="gray.600" px="8px" py="2px" borderRadius="md">
                        {course.level}
                      </Badge>
                      <Badge bg="gray.100" color="gray.600" px="8px" py="2px" borderRadius="md">
                        {course.duration}
                      </Badge>
                    </HStack>

                    <Separator mb="16px" borderColor="gray.100" />

                    <HStack gap="10px">
                      <Button
                        size="sm" variant="outline" borderRadius="8px" flex="1"
                        onClick={() => openEdit(course)}
                        _hover={{ bg: "#EEEEFB", borderColor: "#4545A5", color: "#4545A5" }}
                      >
                        <FiEdit2 /> Edit
                      </Button>
                      <Button
                        size="sm" variant="outline" borderRadius="8px"
                        color="#DB2777" borderColor="red.200" flex="1"
                        _hover={{ bg: "#FDECF3", borderColor: "#DB2777" }}
                        onClick={() => setDeleteTarget(course)}
                      >
                        <FiTrash2 /> Delete
                      </Button>
                    </HStack>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      {/* CREATE / EDIT MODAL */}
      <Dialog.Root open={formOpen} onOpenChange={(e) => !e.open && closeForm()} size="xl" scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="20px" my="40px" boxShadow="2xl">
              <Dialog.Header borderBottom="1px solid" borderColor="gray.100" pb="16px" pt="24px" px={{ base: "24px", md: "32px" }}>
                <Dialog.Title color="#20243A" fontSize="2xl" fontWeight="bold">
                  {editingId !== null ? "Edit Course" : "Create New Course"}
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="md" top="18px" right="18px" borderRadius="full" bg="gray.50" _hover={{ bg: "gray.100" }} />
              </Dialog.CloseTrigger>

              <Dialog.Body pt="24px" px={{ base: "24px", md: "32px" }}>
                <Box as="form" id="course-form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap="28px">

                    {/* 1. BASIC INFO */}
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="#4545A5" textTransform="uppercase" letterSpacing="wider" mb="16px">
                        1. Basic Information
                      </Text>
                      <VStack align="stretch" gap="20px">
                        <Field.Root required>
                          <Field.Label fontWeight="semibold" color="#34384D">Course Title</Field.Label>
                          <Input
                            name="title" value={form.title} onChange={changeField}
                            placeholder="e.g. Full Stack Development"
                            borderRadius="10px" size="lg" required
                            _focus={{ borderColor: "#4545A5", boxShadow: "0 0 0 1px #4545A5" }}
                          />
                        </Field.Root>

                        <HStack gap="20px" align="flex-start">
                          <Field.Root required flex="1">
                            <Field.Label fontWeight="semibold" color="#34384D">Duration</Field.Label>
                            <Input
                              name="duration" value={form.duration} onChange={changeField}
                              placeholder="e.g. 1h 35m" borderRadius="10px" required
                              _focus={{ borderColor: "#4545A5", boxShadow: "0 0 0 1px #4545A5" }}
                            />
                          </Field.Root>
                          <Field.Root required flex="1">
                            <Field.Label fontWeight="semibold" color="#34384D">Level</Field.Label>
                            <Input
                              name="level" value={form.level} onChange={changeField}
                              placeholder="e.g. Beginner" borderRadius="10px" required
                              _focus={{ borderColor: "#4545A5", boxShadow: "0 0 0 1px #4545A5" }}
                            />
                          </Field.Root>
                        </HStack>

                        <Field.Root required>
                          <Field.Label fontWeight="semibold" color="#34384D">Short Description (For Card)</Field.Label>
                          <Textarea
                            name="description" value={form.description} onChange={changeField}
                            placeholder="Short summary for the course card..."
                            borderRadius="10px" required
                            _focus={{ borderColor: "#4545A5", boxShadow: "0 0 0 1px #4545A5" }}
                          />
                        </Field.Root>

                        <Field.Root>
                          <Field.Label fontWeight="semibold" color="#34384D">Course Image</Field.Label>
                          <Box
                            border="2px dashed"
                            borderColor={imagePreview ? "#4545A5" : "gray.300"}
                            borderRadius="12px"
                            bg={imagePreview ? "#F8F8FF" : "gray.50"}
                            p="24px" textAlign="center" cursor="pointer" position="relative"
                            _hover={{ borderColor: "#4545A5", bg: "#F8F8FF" }}
                            onClick={() => document.getElementById("file-upload").click()}
                          >
                            <Input id="file-upload" type="file" accept="image/*" display="none" onChange={pickImage} />
                            {imagePreview ? (
                              <Image
                                src={imagePreview.startsWith("blob:") ? imagePreview : resolveImageUrl(imagePreview)}
                                alt="Preview" w="100%" h="200px" objectFit="cover" borderRadius="8px"
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

                    <Separator borderColor="gray.100" />

                    {/* 2. OVERVIEW */}
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="#0D9488" textTransform="uppercase" letterSpacing="wider" mb="16px">
                        2. Course Overview (CKEditor)
                      </Text>
                      <Field.Root required>
                        <Box bg="white" borderRadius="10px" overflow="hidden" border="1px solid" borderColor="gray.200" width="100%">
                          <ReactQuill
                            theme="snow"
                            value={form.overview}
                            onChange={handleOverviewChange}
                            modules={quillModules}
                            style={{ height: "350px", paddingBottom: "40px" }}
                          />
                        </Box>
                      </Field.Root>
                    </Box>

                    <Separator borderColor="gray.100" />

                    {/* 3. MODULES */}
                    <Box>
                      <Flex justify="space-between" align="center" mb="16px">
                        <Text fontSize="xs" fontWeight="bold" color="#DB2777" textTransform="uppercase" letterSpacing="wider">
                          3. Modules
                        </Text>
                        <Button size="sm" onClick={addModule} bg="#EEEEFB" color="#4545A5" _hover={{ bg: "#E0E0FA" }}>
                          <FiPlus /> Add Module
                        </Button>
                      </Flex>

                      <VStack align="stretch" gap="16px">
                        {form.modules.map((mod, index) => (
                          <Box key={index} p="16px" border="1px solid" borderColor="gray.200" borderRadius="12px" bg="gray.50" position="relative">
                            <IconButton
                              size="xs" aria-label="Remove Module" icon={<FiTrash />}
                              position="absolute" top="12px" right="12px"
                              colorScheme="red" variant="ghost"
                              onClick={() => removeModule(index)}
                            />
                            <Text fontWeight="bold" fontSize="sm" mb="12px" color="#34384D">Module {index + 1}</Text>
                            <VStack align="stretch" gap="12px">
                              <Input
                                placeholder="Module Title (e.g. Introduction to Web Development)"
                                value={mod.title}
                                onChange={(e) => updateModule(index, "title", e.target.value)}
                                bg="white" required
                              />
                              <Textarea
                                placeholder="Module Description"
                                value={mod.description}
                                onChange={(e) => updateModule(index, "description", e.target.value)}
                                bg="white" required
                              />
                            </VStack>
                          </Box>
                        ))}
                        {form.modules.length === 0 && (
                          <Text fontSize="sm" color="gray.500" textAlign="center" py="4">
                            No modules added yet. Click "Add Module".
                          </Text>
                        )}
                      </VStack>
                    </Box>

                    <Separator borderColor="gray.100" />

                    {/* 4. SEO */}
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="#0D9488" textTransform="uppercase" letterSpacing="wider" mb="16px">
                        4. SEO Settings (Optional)
                      </Text>
                      <VStack align="stretch" gap="20px">
                        <Field.Root>
                          <Flex justify="space-between" w="100%" mb="2">
                            <Field.Label fontWeight="semibold" color="#34384D" mb="0">Meta Title</Field.Label>
                            <Text fontSize="xs" color={form.meta_title.length > 60 ? "red.500" : "gray.500"}>
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
                            _focus={{ borderColor: "#0D9488", boxShadow: "0 0 0 1px #0D9488" }}
                          />
                        </Field.Root>

                        <Field.Root>
                          <Flex justify="space-between" w="100%" mb="2">
                            <Field.Label fontWeight="semibold" color="#34384D" mb="0">Meta Description</Field.Label>
                            <Text fontSize="xs" color={form.meta_description.length > 160 ? "red.500" : "gray.500"}>
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
                            _focus={{ borderColor: "#0D9488", boxShadow: "0 0 0 1px #0D9488" }}
                          />
                        </Field.Root>

                        <Field.Root>
                          <Field.Label fontWeight="semibold" color="#34384D">Meta Keywords</Field.Label>
                          <Input
                            name="meta_keywords"
                            value={form.meta_keywords}
                            onChange={changeField}
                            placeholder="e.g. react, frontend, beginner"
                            borderRadius="10px"
                            _focus={{ borderColor: "#0D9488", boxShadow: "0 0 0 1px #0D9488" }}
                          />
                        </Field.Root>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid" borderColor="gray.100" pt="20px" pb="24px" px={{ base: "24px", md: "32px" }} bg="gray.50" borderBottomRadius="20px">
                <HStack gap="12px" w="100%" justifyContent="flex-end">
                  <Button variant="ghost" borderRadius="10px" onClick={closeForm} disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    type="submit" form="course-form"
                    bg="#4545A5" color="white" borderRadius="10px"
                    loading={saving} disabled={saving}
                    _hover={{ bg: "#353584" }}
                  >
                    {editingId !== null ? "Save Changes" : "Publish Course"}
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* IMPROVED DELETE CONFIRMATION MODAL */}
      <Dialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(e) => !e.open && setDeleteTarget(null)}
        role="alertdialog"
        size="md"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />
          <Dialog.Positioner>
            <Dialog.Content
              maxW={{ base: "calc(100% - 32px)", sm: "460px" }}
              borderRadius="20px"
              overflow="hidden"
              boxShadow="2xl"
              p="0"
            >
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
                  <Dialog.Title color="#20243A" fontSize="lg" fontWeight="bold">
                    Delete this course?
                  </Dialog.Title>
                  <Text color="gray.500" fontSize="sm" mt="4px">
                    Please confirm this action.
                  </Text>
                </Box>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top="16px"
                  right="16px"
                  borderRadius="full"
                />
              </Dialog.CloseTrigger>

              <Dialog.Body px="28px" pb="24px">
                <Box
                  bg="#FFF7FA"
                  border="1px solid"
                  borderColor="#FBCFE0"
                  borderRadius="12px"
                  p="16px"
                >
                  <Text color="gray.600" fontSize="sm" lineHeight="1.7">
                    You are about to permanently delete this course:
                  </Text>

                  <Text
                    color="#20243A"
                    fontWeight="semibold"
                    fontSize="md"
                    mt="8px"
                    overflowWrap="anywhere"
                  >
                    {deleteTarget?.title}
                  </Text>

                  <Text color="gray.500" fontSize="xs" mt="8px">
                    This action cannot be undone.
                  </Text>
                </Box>
              </Dialog.Body>

              <Dialog.Footer
                px="28px"
                pt="4px"
                pb="28px"
                gap="12px"
                display="flex"
                flexDirection={{ base: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
              >
                <Button
                  variant="outline"
                  borderRadius="10px"
                  w={{ base: "100%", sm: "auto" }}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </Button>

                <Button
                  color="white"
                  bg="#DB2777"
                  _hover={{ bg: "#BE185D" }}
                  borderRadius="10px"
                  w={{ base: "100%", sm: "auto" }}
                  onClick={handleDelete}
                >
                  <FiTrash2 />
                  Delete Course
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
