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

/* ============================================================
   SHARED SOFT BUTTON STYLES  (match BlogList & CareerList)
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
          <Button {...softOutline} onClick={loadCourses} loading={loading} h="40px" px="18px">
            <FiRefreshCw /> Refresh
          </Button>
          <Button {...softPrimary} onClick={openCreate} h="40px" px="20px">
            <FiPlus /> Add Course
          </Button>
        </HStack>
      </Flex>

      {/* ALERTS */}
      {success && (
        <Box bg="green.50" border="1px solid" borderColor="green.200"
          color="green.700" p="12px 16px" borderRadius="12px" fontSize="sm">
          {success}
        </Box>
      )}
      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200"
          color="red.700" p="12px 16px" borderRadius="12px" fontSize="sm">
          {error}
        </Box>
      )}

      {/* LIST WINDOW */}
      <Box bg="white" p={{ base: "18px", md: "26px" }} borderRadius="20px"
        border="1px solid" borderColor="gray.200" boxShadow="sm">
        <Flex justify="space-between" align="center" mb="24px">
          <HStack gap="12px">
            <Heading size="md" color="#20243A">All Courses</Heading>
            <Badge bg="#EEEEFB" color="#4545A5" px="10px" py="4px"
              borderRadius="full" fontSize="sm">
              {courses.length} total
            </Badge>
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {[1, 2, 3].map((i) => (
              <Box key={i} border="1px solid" borderColor="gray.100"
                borderRadius="16px" overflow="hidden">
                <Skeleton height="200px" />
                <Box p="20px">
                  <Skeleton height="20px" mb="12px" width="80%" />
                  <Skeleton height="16px" width="40%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : courses.length === 0 ? (
          <VStack py="60px" gap="16px" bg="gray.50" borderRadius="16px"
            border="1px dashed" borderColor="gray.300">
            <Flex w="64px" h="64px" borderRadius="full" bg="#EEEEFB"
              color="#4545A5" align="center" justify="center">
              <Icon as={FiBookOpen} boxSize="32px" />
            </Flex>
            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No courses yet
              </Text>
              <Text color="gray.500" fontSize="sm" mt="4px">
                Create your first course to get started.
              </Text>
            </Box>
            <Button {...softPrimary} onClick={openCreate} mt="2">
              <FiPlus /> Add Your First Course
            </Button>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {courses.map((course) => {
              const hasMeta = course.meta_title || course.meta_description || course.meta_keywords;
              return (
                <Box key={course.id} role="group" border="1px solid"
                  borderColor="gray.200" borderRadius="16px" overflow="hidden"
                  bg="white" transition="all .2s ease" boxShadow="sm"
                  _hover={{ borderColor: "#C7C7EE",
                    boxShadow: "0 12px 28px rgba(69,69,165,0.12)",
                    transform: "translateY(-4px)" }}>

                  <Box position="relative" h="200px" bg="#F5F5FF" overflow="hidden">
                    {course.image ? (
                      <Image src={resolveImageUrl(course.image)} alt={course.title}
                        w="100%" h="100%" objectFit="cover"
                        transition="transform .4s ease"
                        _groupHover={{ transform: "scale(1.05)" }} />
                    ) : (
                      <Flex align="center" justify="center" h="100%">
                        <Text color="#A0A0CC" fontSize="sm">No image</Text>
                      </Flex>
                    )}
                    {hasMeta && (
                      <Badge position="absolute" top="12px" left="12px"
                        bg="whiteAlpha.900" color="#0D9488" px="8px" py="2px"
                        borderRadius="full" fontSize="10px" fontWeight="bold">
                        SEO
                      </Badge>
                    )}
                    <Box position="absolute" inset="0"
                      bg="linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)"
                      opacity={0} _groupHover={{ opacity: 1 }}
                      transition="opacity .2s ease" />
                    <HStack position="absolute" top="12px" right="12px"
                      gap="8px" opacity={0} transform="translateY(-10px)"
                      _groupHover={{ opacity: 1, transform: "translateY(0)" }}
                      transition="all .2s ease">
                      <IconButton size="sm" aria-label="Edit" bg="white"
                        color="#4545A5" borderRadius="full" boxShadow="md"
                        _hover={{ bg: "#EEEEFB" }} onClick={() => openEdit(course)}>
                        <FiEdit2 />
                      </IconButton>
                      <IconButton size="sm" aria-label="Delete" bg="white"
                        color="#DB2777" borderRadius="full" boxShadow="md"
                        _hover={{ bg: "#FDECF3" }}
                        onClick={() => setDeleteTarget(course)}>
                        <FiTrash2 />
                      </IconButton>
                    </HStack>
                  </Box>

                  <Box p="20px">
                    <Heading size="sm" color="#20243A" noOfLines={2}
                      lineHeight="1.4" mb="12px">
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
                      <Button {...softOutline} size="sm" flex="1" onClick={() => openEdit(course)}>
                        <FiEdit2 /> Edit
                      </Button>
                      <Button {...softDanger} size="sm" flex="1" onClick={() => setDeleteTarget(course)}>
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

      {/* ============================================================
          CREATE / EDIT MODAL — soft floating card, pill tabs
          ============================================================ */}
      <Dialog.Root open={formOpen} onOpenChange={(e) => !e.open && closeForm()}
        size="xl" scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop bg="rgba(32,36,58,0.4)" backdropFilter="blur(8px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="28px" my="40px"
              boxShadow="0 30px 80px rgba(32,36,58,0.18)" bg="white" overflow="hidden">

              {/* HEADER — pill tabs */}
              <Box pt="24px" px={{ base: "22px", md: "32px" }} pb="0">
                <Flex justify="space-between" align="center" mb="18px">
                  <HStack bg="gray.100" p="4px" borderRadius="full" gap="2px">
                    <Box px="16px" py="6px" borderRadius="full" bg="white"
                      boxShadow="sm" fontSize="xs" fontWeight="700" color="#4545A5">
                      {editingId !== null ? "Editing" : "New Course"}
                    </Box>
                    <Box px="16px" py="6px" borderRadius="full" fontSize="xs"
                      fontWeight="600" color="gray.400">
                      Details
                    </Box>
                  </HStack>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" borderRadius="full" color="gray.400"
                      _hover={{ bg: "gray.100", color: "gray.700" }} />
                  </Dialog.CloseTrigger>
                </Flex>

                <Dialog.Title color="#20243A" fontSize="2xl" fontWeight="700"
                  lineHeight="1.2" letterSpacing="-0.02em">
                  {editingId !== null ? "Edit Course" : "Create New Course"}
                </Dialog.Title>
                <Text fontSize="sm" color="gray.500" mt="6px" mb="20px">
                  {editingId !== null
                    ? "Update the details of your course below."
                    : "Fill in the details below to publish your course."}
                </Text>
              </Box>

              {/* BODY */}
              <Dialog.Body pt="4px" px={{ base: "22px", md: "32px" }} pb="8px">
                <Box as="form" id="course-form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap="28px">

                    {/* 1. BASIC INFO */}
                    <Box>
                      <HStack gap="8px" mb="14px">
                        <Box w="3px" h="14px" bg="#4545A5" borderRadius="full" />
                        <Text fontSize="xs" fontWeight="700" color="gray.500"
                          textTransform="uppercase" letterSpacing="wider">
                          1. Basic Information
                        </Text>
                      </HStack>

                      <VStack align="stretch" gap="18px">
                        <Field.Root required>
                          <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                            Course Title
                          </Field.Label>
                          <Input
                            name="title" value={form.title} onChange={changeField}
                            placeholder="e.g. Full Stack Development"
                            borderRadius="12px" h="48px" fontSize="sm" required
                            bg="gray.50" border="1px solid" borderColor="transparent"
                            _hover={{ borderColor: "gray.200" }}
                            _focus={{
                              bg: "white",
                              borderColor: "#4545A5",
                              boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                            }}
                          />
                        </Field.Root>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="18px">
                          <Field.Root required>
                            <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                              Duration
                            </Field.Label>
                            <Input
                              name="duration" value={form.duration} onChange={changeField}
                              placeholder="e.g. 1h 35m" borderRadius="12px" h="48px"
                              fontSize="sm" required bg="gray.50" border="1px solid"
                              borderColor="transparent" _hover={{ borderColor: "gray.200" }}
                              _focus={{
                                bg: "white",
                                borderColor: "#4545A5",
                                boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                              }}
                            />
                          </Field.Root>
                          <Field.Root required>
                            <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                              Level
                            </Field.Label>
                            <Input
                              name="level" value={form.level} onChange={changeField}
                              placeholder="e.g. Beginner" borderRadius="12px" h="48px"
                              fontSize="sm" required bg="gray.50" border="1px solid"
                              borderColor="transparent" _hover={{ borderColor: "gray.200" }}
                              _focus={{
                                bg: "white",
                                borderColor: "#4545A5",
                                boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                              }}
                            />
                          </Field.Root>
                        </SimpleGrid>

                        <Field.Root required>
                          <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                            Short Description (For Card)
                          </Field.Label>
                          <Textarea
                            name="description" value={form.description} onChange={changeField}
                            placeholder="Short summary for the course card..."
                            borderRadius="12px" required bg="gray.50"
                            border="1px solid" borderColor="transparent"
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
                            Course Image
                          </Field.Label>
                          <Box
                            border="1px dashed"
                            borderColor={imagePreview ? "#4545A5" : "gray.300"}
                            borderRadius="16px"
                            bg={imagePreview ? "#FAFAFF" : "gray.50"}
                            p="24px" textAlign="center" cursor="pointer"
                            transition="all .15s ease"
                            _hover={{ borderColor: "#4545A5", bg: "#FAFAFF" }}
                            onClick={() => document.getElementById("file-upload").click()}
                          >
                            <Input id="file-upload" type="file" accept="image/*"
                              display="none" onChange={pickImage} />
                            {imagePreview ? (
                              <Image
                                src={imagePreview.startsWith("blob:") ? imagePreview : resolveImageUrl(imagePreview)}
                                alt="Preview" w="100%" h="200px" objectFit="cover" borderRadius="12px"
                              />
                            ) : (
                              <VStack gap="8px" py="8px">
                                <Flex w="48px" h="48px" borderRadius="full" bg="white"
                                  border="1px solid" borderColor="gray.200"
                                  color="#4545A5" align="center" justify="center">
                                  <Icon as={FiUploadCloud} boxSize="20px" />
                                </Flex>
                                <Box>
                                  <Text fontWeight="600" color="#34384D" fontSize="sm">
                                    Click to upload image
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" mt="2px">
                                    SVG, PNG, JPG or GIF (max. 5MB)
                                  </Text>
                                </Box>
                              </VStack>
                            )}
                          </Box>
                        </Field.Root>
                      </VStack>
                    </Box>

                    <Separator borderColor="gray.100" />

                    {/* 2. OVERVIEW */}
                    <Box>
                      <HStack gap="8px" mb="14px">
                        <Box w="3px" h="14px" bg="#0D9488" borderRadius="full" />
                        <Text fontSize="xs" fontWeight="700" color="gray.500"
                          textTransform="uppercase" letterSpacing="wider">
                          2. Course Overview
                        </Text>
                      </HStack>
                      <Field.Root required>
                        <Box bg="white" borderRadius="12px" overflow="hidden"
                          border="1px solid" borderColor="gray.200" width="100%"
                          _focusWithin={{
                            borderColor: "#4545A5",
                            boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                          }}>
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
                      <Flex justify="space-between" align="center" mb="14px">
                        <HStack gap="8px">
                          <Box w="3px" h="14px" bg="#DB2777" borderRadius="full" />
                          <Text fontSize="xs" fontWeight="700" color="gray.500"
                            textTransform="uppercase" letterSpacing="wider">
                            3. Modules
                          </Text>
                        </HStack>
                        <Button size="sm" onClick={addModule} {...softPrimary} h="32px">
                          <FiPlus /> Add Module
                        </Button>
                      </Flex>

                      <VStack align="stretch" gap="16px">
                        {form.modules.map((mod, index) => (
                          <Box key={index} p="16px" border="1px solid"
                            borderColor="gray.200" borderRadius="12px"
                            bg="gray.50" position="relative">
                            <IconButton
                              size="xs" aria-label="Remove Module" icon={<FiTrash />}
                              position="absolute" top="12px" right="12px"
                              color="#DB2777" variant="ghost" borderRadius="full"
                              _hover={{ bg: "#FDECF3" }}
                              onClick={() => removeModule(index)}
                            />
                            <Text fontWeight="600" fontSize="sm" mb="12px" color="#34384D">
                              Module {index + 1}
                            </Text>
                            <VStack align="stretch" gap="12px">
                              <Input
                                placeholder="Module Title (e.g. Introduction to Web Development)"
                                value={mod.title}
                                onChange={(e) => updateModule(index, "title", e.target.value)}
                                bg="white" borderRadius="10px" required
                              />
                              <Textarea
                                placeholder="Module Description"
                                value={mod.description}
                                onChange={(e) => updateModule(index, "description", e.target.value)}
                                bg="white" borderRadius="10px" required
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
                  </VStack>
                </Box>
              </Dialog.Body>

              {/* FOOTER */}
              <Dialog.Footer pt="20px" pb="24px"
                px={{ base: "22px", md: "32px" }} bg="white"
                borderTop="1px solid" borderColor="gray.100">
                <HStack gap="10px" w="100%" justifyContent="flex-end">
                  <Button {...softOutline} onClick={closeForm} disabled={saving}
                    h="42px" px="22px">
                    Cancel
                  </Button>
                  <Button type="submit" form="course-form" bg="#4545A5"
                    color="white" fontWeight="700" fontSize="sm" borderRadius="full"
                    h="42px" px="26px" loading={saving} disabled={saving}
                    _hover={{ bg: "#353584" }} _active={{ bg: "#2C2C6E" }}>
                    {editingId !== null ? "Save Changes" : "Publish Course"}
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
      <Dialog.Root open={Boolean(deleteTarget)}
        onOpenChange={(e) => !e.open && setDeleteTarget(null)}
        role="alertdialog" size="md">
        <Portal>
          <Dialog.Backdrop bg="rgba(32,36,58,0.4)" backdropFilter="blur(8px)" />
          <Dialog.Positioner px="16px">
            <Dialog.Content width="100%" maxWidth="440px" borderRadius="24px"
              overflow="hidden" boxShadow="0 30px 80px rgba(32,36,58,0.18)"
              bg="white">
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top="14px" right="14px"
                  color="gray.400" borderRadius="full"
                  _hover={{ bg: "gray.100", color: "gray.700" }} />
              </Dialog.CloseTrigger>

              <Dialog.Header display="flex" flexDirection="column"
                alignItems="center" textAlign="center" pt="32px" px="24px" pb="10px">
                <Flex width="56px" height="56px" borderRadius="full"
                  background="#FDF2F8" color="#DB2777" align="center"
                  justify="center" mb="16px">
                  <Icon as={FiTrash2} boxSize="24px" />
                </Flex>
                <Dialog.Title color="#20243A" fontSize="lg" fontWeight="700"
                  lineHeight="1.3">
                  Delete this course?
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body px="24px" pt="6px" pb="22px">
                <VStack align="stretch" gap="14px">
                  <Box bg="gray.50" border="1px solid" borderColor="gray.200"
                    borderRadius="12px" padding="12px 16px" textAlign="left">
                    <Text color="gray.500" fontSize="xs" fontWeight="600" mb="4px">
                      COURSE
                    </Text>
                    <Text color="#20243A" fontSize="sm" fontWeight="600"
                      wordBreak="break-word">
                      {deleteTarget?.title}
                    </Text>
                  </Box>

                  <Text color="gray.600" fontSize="sm" textAlign="center"
                    lineHeight="1.7">
                    This action is permanent and cannot be undone.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer px="24px" pt="0" pb="24px" display="flex"
                justifyContent="center" gap="10px"
                flexDirection={{ base: "column-reverse", sm: "row" }}>
                <Button width={{ base: "100%", sm: "auto" }} minWidth="120px"
                  height="40px" {...softOutline}
                  onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button width={{ base: "100%", sm: "auto" }} minWidth="120px"
                  height="40px" bg="#DB2777" color="white" fontWeight="700"
                  fontSize="sm" borderRadius="full"
                  _hover={{ bg: "#BE185D" }} _active={{ bg: "#9D174D" }}
                  onClick={handleDelete}>
                  <FiTrash2 /> Delete Course
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}