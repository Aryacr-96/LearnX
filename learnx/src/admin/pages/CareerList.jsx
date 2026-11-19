import { useEffect, useState } from "react";
import {
  Box, Button, Flex, Heading, Text, VStack, HStack, Input, SimpleGrid,
  Dialog, Portal, CloseButton, IconButton, Badge, Separator, Field, Skeleton,
  NativeSelect, Icon,
} from "@chakra-ui/react";
import {
  FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiEye, FiMail, FiBriefcase,
  FiFileText, FiAlertTriangle,
} from "react-icons/fi";
import { getAll, create, patch, remove } from "../services/crud";
import { API_BASE_URL, BACKEND_BASE_URL } from "../../services/publicApi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const emptyForm = {
  category: "",
  title: "",
  experience: "",
  description: "",
  responsibilities: "",
  requirements: "",
  order: 0,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

/* ============================================================
   SHARED SOFT BUTTON STYLES  (match BlogList)
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

export default function CareerList() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const [viewAppsOpen, setViewAppsOpen] = useState(false);
  const [viewApps, setViewApps] = useState([]);
  const [viewJobTitle, setViewJobTitle] = useState("");
  const [viewJobId, setViewJobId] = useState(null);

  const existingCategories = [...new Set(careers.map((c) => c.category))];

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

  async function loadCareers() {
    setLoading(true);
    setError("");
    try {
      const data = await getAll("careers");
      setCareers(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCareers();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setIsNewCategory(false);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEdit(job) {
    setEditingId(job.id);
    setForm({
      category: job.category || "",
      title: job.title || "",
      experience: job.experience || "",
      description: job.description || "",
      responsibilities: job.responsibilities || "",
      requirements: job.requirements || "",
      order: job.order || 0,
      meta_title: job.meta_title || "",
      meta_description: job.meta_description || "",
      meta_keywords: job.meta_keywords || "",
    });
    setIsNewCategory(false);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setIsNewCategory(false);
    setError("");
  }

  const handleCategoryDropdownChange = (e) => {
    const val = e.target.value;
    if (val === "NEW_CATEGORY") {
      setIsNewCategory(true);
      setForm({ ...form, category: "" });
    } else {
      setIsNewCategory(false);
      setForm({ ...form, category: val });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category.trim()) {
      setError("Please provide a category name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await patch("careers", editingId, form);
        setSuccess("Job updated.");
      } else {
        await create("careers", form);
        setSuccess("Job created.");
      }
      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadCareers();
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove("careers", deleteTarget.id);
      setSuccess("Job deleted.");
      setDeleteTarget(null);
      await loadCareers();
    } catch (err) {
      setError("Delete failed.");
      setDeleteTarget(null);
    }
  }

  function handleViewApplications(job) {
    setViewApps(job.applications || []);
    setViewJobTitle(job.title);
    setViewJobId(job.id);
    setViewAppsOpen(true);
  }

  const deleteApplication = async (appId) => {
    if (!viewJobId) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/careers/${viewJobId}/applications/${appId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${localStorage.getItem("learnx_admin_token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Unable to delete application.");
      setViewApps((prev) => prev.filter((a) => a.id !== appId));
      await loadCareers();
    } catch (err) {
      console.error(err);
    }
  };

  const groupedCareers = careers.reduce((acc, job) => {
    if (!acc[job.category]) acc[job.category] = [];
    acc[job.category].push(job);
    return acc;
  }, {});

  const totalApplications = careers.reduce(
    (n, j) => n + (j.applications?.length || 0), 0
  );

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
          <Heading size="lg" color="#20243A">Careers Management</Heading>
          <Text color="gray.500" mt="8px">
            Create, edit and manage your LearnX job openings.
          </Text>
        </Box>

        <HStack gap="10px">
          <Button {...softOutline} onClick={loadCareers} loading={loading} h="40px" px="18px">
            <FiRefreshCw /> Refresh
          </Button>
          <Button {...softPrimary} onClick={openCreate} h="40px" px="20px">
            <FiPlus /> Add Job
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

      {/* JOB LIST */}
      <Box bg="white" p={{ base: "18px", md: "26px" }} borderRadius="20px"
        border="1px solid" borderColor="gray.200" boxShadow="sm">
        <Flex justify="space-between" align="center" mb="24px" wrap="wrap" gap="12px">
          <HStack gap="12px">
            <Heading size="md" color="#20243A">All Job Openings</Heading>
            <Badge bg="#EEEEFB" color="#4545A5" px="10px" py="4px"
              borderRadius="full" fontSize="sm">
              {careers.length} total
            </Badge>
            {totalApplications > 0 && (
              <Badge bg="#E6F9F4" color="#0D9488" px="10px" py="4px"
                borderRadius="full" fontSize="sm">
                {totalApplications} applications
              </Badge>
            )}
          </HStack>
        </Flex>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Box key={i} border="1px solid" borderColor="gray.100"
                borderRadius="16px" overflow="hidden">
                <Skeleton height="140px" />
                <Box p="20px">
                  <Skeleton height="20px" mb="12px" width="80%" />
                  <Skeleton height="16px" width="40%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : careers.length === 0 ? (
          <VStack py="60px" gap="16px" bg="gray.50" borderRadius="16px"
            border="1px dashed" borderColor="gray.300">
            <Flex w="64px" h="64px" borderRadius="full" bg="#EEEEFB"
              color="#4545A5" align="center" justify="center">
              <Icon as={FiBriefcase} boxSize="32px" />
            </Flex>
            <Box textAlign="center">
              <Text fontWeight="bold" color="#20243A" fontSize="lg">
                No job openings yet
              </Text>
              <Text color="gray.500" fontSize="sm" mt="4px">
                Create your first opening to get started.
              </Text>
            </Box>
            <Button {...softPrimary} onClick={openCreate} mt="2">
              <FiPlus /> Add Your First Job
            </Button>
          </VStack>
        ) : (
          <VStack align="stretch" gap="32px">
            {Object.entries(groupedCareers).map(([category, jobs]) => (
              <Box key={category}>
                <HStack mb="16px" pb="10px" borderBottom="1px solid"
                  borderColor="gray.200" justify="space-between">
                  <Heading size="sm" color="#20243A">{category}</Heading>
                  <Badge bg="#EEEEFB" color="#4545A5" px="10px" py="2px"
                    borderRadius="full" fontSize="xs">
                    {jobs.length} {jobs.length === 1 ? "opening" : "openings"}
                  </Badge>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="24px">
                  {jobs.map((job) => {
                    const appCount = job.applications?.length || 0;
                    return (
                      <Box key={job.id} role="group" border="1px solid"
                        borderColor="gray.200" borderRadius="16px" overflow="hidden"
                        bg="white" transition="all .2s ease" boxShadow="sm"
                        _hover={{ borderColor: "#C7C7EE",
                          boxShadow: "0 12px 28px rgba(69,69,165,0.12)",
                          transform: "translateY(-4px)" }}>

                        <Box position="relative" h="120px"
                          bgGradient="linear(135deg, #4545A5 0%, #6C6CDB 100%)"
                          overflow="hidden">
                          <Flex position="absolute" inset="0" align="center"
                            justify="center" color="whiteAlpha.900">
                            <Icon as={FiBriefcase} boxSize="42px" opacity={0.55} />
                          </Flex>
                          <Badge position="absolute" top="12px" left="12px"
                            bg="whiteAlpha.900" color="#4545A5" px="10px" py="4px"
                            borderRadius="full" fontSize="xs" fontWeight="bold">
                            <HStack gap="4px">
                              <Icon as={FiEye} boxSize="12px" />
                              <Text>{appCount} {appCount === 1 ? "app" : "apps"}</Text>
                            </HStack>
                          </Badge>
                          <HStack position="absolute" top="12px" right="12px"
                            gap="8px" opacity={0} transform="translateY(-10px)"
                            _groupHover={{ opacity: 1, transform: "translateY(0)" }}
                            transition="all .2s ease">
                            <IconButton size="sm" aria-label="Edit" bg="white"
                              color="#4545A5" borderRadius="full" boxShadow="md"
                              _hover={{ bg: "#EEEEFB" }} onClick={() => openEdit(job)}>
                              <FiEdit2 />
                            </IconButton>
                            <IconButton size="sm" aria-label="Delete" bg="white"
                              color="#DB2777" borderRadius="full" boxShadow="md"
                              _hover={{ bg: "#FDECF3" }}
                              onClick={() => setDeleteTarget(job)}>
                              <FiTrash2 />
                            </IconButton>
                          </HStack>
                        </Box>

                        <Box p="20px">
                          <Heading size="sm" color="#20243A" noOfLines={2}
                            lineHeight="1.4" mb="10px">
                            {job.title}
                          </Heading>
                          <HStack gap="8px" fontSize="xs" color="gray.600" mb="16px" wrap="wrap">
                            <Badge bg="gray.100" color="gray.600" px="8px" py="2px"
                              borderRadius="md">
                              {job.experience || "—"}
                            </Badge>
                            {job.order !== undefined && (
                              <Badge bg="gray.100" color="gray.600" px="8px"
                                py="2px" borderRadius="md">
                                #{job.order}
                              </Badge>
                            )}
                          </HStack>
                          <Separator mb="16px" borderColor="gray.100" />
                          <Button {...softTeal} size="sm" width="100%" mb="10px"
                            onClick={() => handleViewApplications(job)}>
                            <FiEye /> View Applications ({appCount})
                          </Button>
                          <HStack gap="10px">
                            <Button {...softOutline} size="sm" flex="1"
                              onClick={() => openEdit(job)}>
                              <FiEdit2 /> Edit
                            </Button>
                            <Button {...softDanger} size="sm" flex="1"
                              onClick={() => setDeleteTarget(job)}>
                              <FiTrash2 /> Delete
                            </Button>
                          </HStack>
                        </Box>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
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
                      {editingId ? "Editing" : "New Job"}
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
                  {editingId ? "Edit Job Opening" : "Create New Job Opening"}
                </Dialog.Title>
                <Text fontSize="sm" color="gray.500" mt="6px" mb="20px">
                  {editingId
                    ? "Update the details of this opening below."
                    : "Fill in the details below to publish this opening."}
                </Text>
              </Box>

              {/* BODY */}
              <Dialog.Body pt="4px" px={{ base: "22px", md: "32px" }} pb="8px">
                <Box as="form" id="career-form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap="22px">

                    <Box>
                      <HStack gap="8px" mb="14px">
                        <Box w="3px" h="14px" bg="#4545A5" borderRadius="full" />
                        <Text fontSize="xs" fontWeight="700" color="gray.500"
                          textTransform="uppercase" letterSpacing="wider">
                          Basic Information
                        </Text>
                      </HStack>

                      <VStack align="stretch" gap="18px">

                        <Field.Root required>
                          <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                            Category
                          </Field.Label>
                          {!isNewCategory ? (
                            <NativeSelect.Root>
                              <NativeSelect.Field
                                value={form.category}
                                onChange={handleCategoryDropdownChange}
                                required
                                borderRadius="12px"
                                h="48px"
                                fontSize="sm"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="transparent"
                                _hover={{ borderColor: "gray.200" }}
                                _focus={{
                                  bg: "white",
                                  borderColor: "#4545A5",
                                  boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                                }}
                              >
                                <option value="">Select a Category</option>
                                {existingCategories.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="NEW_CATEGORY">
                                  + Create New Category…
                                </option>
                              </NativeSelect.Field>
                            </NativeSelect.Root>
                          ) : (
                            <HStack width="100%">
                              <Input
                                value={form.category}
                                onChange={(e) =>
                                  setForm({ ...form, category: e.target.value })
                                }
                                placeholder="e.g. Sales & Marketing"
                                borderRadius="12px"
                                h="48px"
                                fontSize="sm"
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
                              <Button size="sm" variant="ghost" borderRadius="full"
                                onClick={() => {
                                  setIsNewCategory(false);
                                  setForm({ ...form, category: "" });
                                }}>
                                Cancel
                              </Button>
                            </HStack>
                          )}
                        </Field.Root>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="18px">
                          <Field.Root required>
                            <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                              Job Title
                            </Field.Label>
                            <Input
                              value={form.title}
                              onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                              }
                              placeholder="e.g. Business Analyst"
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

                          <Field.Root required>
                            <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                              Experience
                            </Field.Label>
                            <Input
                              value={form.experience}
                              onChange={(e) =>
                                setForm({ ...form, experience: e.target.value })
                              }
                              placeholder="e.g. 4+ Years of experience"
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
                        </SimpleGrid>

                        {[
                          { key: "description", label: "Job Description" },
                          { key: "responsibilities", label: "Key Responsibilities" },
                          { key: "requirements", label: "Requirements" },
                        ].map(({ key, label }) => (
                          <Field.Root required key={key}>
                            <Field.Label fontWeight="600" color="#34384D"
                              fontSize="sm" mb="2">
                              {label}
                            </Field.Label>
                            <Box bg="white" borderRadius="12px" overflow="hidden"
                              border="1px solid" borderColor="gray.200" width="100%"
                              _focusWithin={{
                                borderColor: "#4545A5",
                                boxShadow: "0 0 0 3px rgba(69,69,165,0.12)",
                              }}>
                              <ReactQuill theme="snow" value={form[key]}
                                onChange={(val) => setForm({ ...form, [key]: val })}
                                modules={quillModules}
                                style={{ height: "250px", paddingBottom: "40px" }} />
                            </Box>
                          </Field.Root>
                        ))}
                      </VStack>
                    </Box>

                    <Separator borderColor="gray.100" />

                    <Box>
                      <HStack gap="8px" mb="14px">
                        <Box w="3px" h="14px" bg="#DB2777" borderRadius="full" />
                        <Text fontSize="xs" fontWeight="700" color="gray.500"
                          textTransform="uppercase" letterSpacing="wider">
                          Display Settings
                        </Text>
                      </HStack>

                      <Field.Root>
                        <Field.Label fontWeight="600" color="#34384D" fontSize="sm">
                          Display Order
                        </Field.Label>
                        <Input
                          type="number"
                          value={form.order}
                          onChange={(e) =>
                            setForm({ ...form, order: e.target.value })
                          }
                          borderRadius="12px"
                          h="48px"
                          fontSize="sm"
                          bg="gray.50"
                          border="1px solid"
                          borderColor="transparent"
                          _hover={{ borderColor: "gray.200" }}
                          _focus={{
                            bg: "white",
                            borderColor: "#DB2777",
                            boxShadow: "0 0 0 3px rgba(219,39,119,0.12)",
                          }}
                        />
                      </Field.Root>
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
                  <Button type="submit" form="career-form" bg="#4545A5"
                    color="white" fontWeight="700" fontSize="sm" borderRadius="full"
                    h="42px" px="26px" loading={saving} disabled={saving}
                    _hover={{ bg: "#353584" }} _active={{ bg: "#2C2C6E" }}>
                    {editingId ? "Save Changes" : "Publish Job"}
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
                  <Icon as={FiAlertTriangle} boxSize="24px" />
                </Flex>
                <Dialog.Title color="#20243A" fontSize="lg" fontWeight="700"
                  lineHeight="1.3">
                  Delete this job opening?
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body px="24px" pt="6px" pb="22px">
                <VStack align="stretch" gap="14px">
                  <Box bg="gray.50" border="1px solid" borderColor="gray.200"
                    borderRadius="12px" padding="12px 16px" textAlign="left">
                    <Text color="gray.500" fontSize="xs" fontWeight="600" mb="4px">
                      JOB OPENING
                    </Text>
                    <Text color="#20243A" fontSize="sm" fontWeight="600"
                      wordBreak="break-word">
                      {deleteTarget?.title}
                    </Text>
                    {deleteTarget?.category && (
                      <Badge mt="8px" bg="#EEEEFB" color="#4545A5"
                        borderRadius="full" px="8px" py="2px" fontSize="xs">
                        {deleteTarget.category}
                      </Badge>
                    )}
                  </Box>

                  {deleteTarget?.applications?.length > 0 && (
                    <Box bg="#FFF7ED" border="1px solid" borderColor="#FED7AA"
                      borderRadius="12px" p="12px 16px">
                      <Text color="#9A3412" fontSize="sm" lineHeight="1.6">
                        This job has{" "}
                        <Text as="span" fontWeight="bold">
                          {deleteTarget.applications.length} application
                          {deleteTarget.applications.length === 1 ? "" : "s"}
                        </Text>
                        . Deleting this job may also remove its associated applications.
                      </Text>
                    </Box>
                  )}

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
                  <FiTrash2 /> Yes, Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* ============================================================
          APPLICATIONS MODAL — soft floating card
          ============================================================ */}
      <Dialog.Root open={viewAppsOpen}
        onOpenChange={(e) => !e.open && setViewAppsOpen(false)}
        size="xl" scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop bg="rgba(32,36,58,0.4)" backdropFilter="blur(8px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="28px" my="40px"
              boxShadow="0 30px 80px rgba(32,36,58,0.18)" bg="white"
              overflow="hidden">
              <Box pt="24px" px={{ base: "22px", md: "32px" }} pb="20px"
                borderBottom="1px solid" borderColor="gray.100">
                <Flex justify="space-between" align="center" mb="12px">
                  <HStack bg="gray.100" p="4px" borderRadius="full" gap="2px">
                    <Box px="16px" py="6px" borderRadius="full" bg="white"
                      boxShadow="sm" fontSize="xs" fontWeight="700" color="#4545A5">
                      Applications
                    </Box>
                    <Box px="16px" py="6px" borderRadius="full" fontSize="xs"
                      fontWeight="600" color="gray.400">
                      {viewApps.length} total
                    </Box>
                  </HStack>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" borderRadius="full" color="gray.400"
                      _hover={{ bg: "gray.100", color: "gray.700" }} />
                  </Dialog.CloseTrigger>
                </Flex>
                <Dialog.Title color="#20243A" fontSize="2xl" fontWeight="700"
                  lineHeight="1.2" letterSpacing="-0.02em">
                  Applications
                </Dialog.Title>
                <Text fontSize="sm" color="gray.500" mt="6px">
                  For{" "}
                  <Text as="span" fontWeight="600" color="#4545A5">
                    {viewJobTitle}
                  </Text>
                </Text>
              </Box>

              <Dialog.Body pt="24px" px={{ base: "22px", md: "32px" }} pb="24px">
                {viewApps.length === 0 ? (
                  <VStack py="60px" gap="16px" bg="gray.50" borderRadius="16px"
                    border="1px dashed" borderColor="gray.300">
                    <Flex w="64px" h="64px" borderRadius="full" bg="#E6F9F4"
                      color="#0D9488" align="center" justify="center">
                      <Icon as={FiMail} boxSize="32px" />
                    </Flex>
                    <Box textAlign="center">
                      <Text fontWeight="bold" color="#20243A" fontSize="lg">
                        No applications yet
                      </Text>
                      <Text color="gray.500" fontSize="sm" mt="4px">
                        Applicants will appear here once they apply.
                      </Text>
                    </Box>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap="16px">
                    {viewApps.map((app) => (
                      <Box key={app.id} border="1px solid" borderColor="gray.200"
                        borderRadius="16px" p="20px" bg="white"
                        transition="all .2s ease"
                        _hover={{ borderColor: "#C7C7EE",
                          boxShadow: "0 6px 20px rgba(69,69,165,0.08)" }}>
                        <Flex justify="space-between" align="flex-start" gap="12px">
                          <Box flex="1" minW="0">
                            <Heading size="sm" color="#20243A" mb="8px">
                              {app.name}
                            </Heading>
                            <HStack fontSize="xs" color="gray.600" mb="2">
                              <Icon as={FiMail} boxSize="12px" />
                              <Text>{app.email}</Text>
                            </HStack>
                            <HStack fontSize="xs" color="gray.600" wrap="wrap"
                              gap="8px" mt="6px">
                              {app.contact_number && (
                                <Badge bg="gray.100" color="gray.700" px="8px"
                                  py="2px" borderRadius="md">
                                  {app.contact_number}
                                </Badge>
                              )}
                              {app.experience && (
                                <Badge bg="#EEEEFB" color="#4545A5" px="8px"
                                  py="2px" borderRadius="md">
                                  {app.experience}
                                </Badge>
                              )}
                              {app.qualification && (
                                <Badge bg="#E6F9F4" color="#0D9488" px="8px"
                                  py="2px" borderRadius="md">
                                  {app.qualification}
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                          <HStack gap="8px" flexShrink={0}>
                            {app.resume_url && (
                              <Button size="xs" as="a"
                                href={`${BACKEND_BASE_URL}${app.resume_url}`}
                                target="_blank" rel="noreferrer"
                                {...softPrimary} h="30px" px="12px" fontSize="xs">
                                <FiFileText /> Resume
                              </Button>
                            )}
                            <IconButton size="sm" aria-label="Delete application"
                              color="#DB2777" variant="ghost" borderRadius="full"
                              _hover={{ bg: "#FDECF3" }}
                              onClick={() => deleteApplication(app.id)}>
                              <FiTrash2 />
                            </IconButton>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}