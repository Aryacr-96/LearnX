
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Flex,
  Spinner,
  Textarea,
  NativeSelect,
  Badge,
  Separator,
  Icon,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiSave,
  FiGlobe,
  FiImage,
  FiFileText,
  FiLink,
  FiTag,
  FiCheckCircle,
} from "react-icons/fi";
import { toaster } from "../../App";

const PAGES = [
  { id: "home", label: "Home Page" },
  { id: "about", label: "About Us" },
  { id: "career", label: "Careers Page" },
  { id: "course", label: "Courses Page" },
  { id: "blog", label: "Blog Page" },
  { id: "gallery", label: "Gallery Page" },
  { id: "placements", label: "Placements Page" },
  { id: "hire", label: "Hire Page" },
  { id: "contact", label: "Contact Page" },
];

const API_BASE_URL = "http://127.0.0.1:8000/api";

const makeApiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("learnx_admin_token");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data;
};

const initialFormData = {
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  social_preview_image: null,
};

const FieldLabel = ({ children, required = false }) => (
  <Text
    fontSize="sm"
    fontWeight="600"
    color="#343653"
    mb={2}
  >
    {children}
    {required && (
      <Text as="span" color="red.500" ml={1}>
        *
      </Text>
    )}
  </Text>
);

const inputStyles = {
  borderRadius: "10px",
  borderColor: "#E4E5F0",
  bg: "#FAFAFD",
  color: "#252641",
  _placeholder: { color: "#A0A1B5" },
  _hover: { borderColor: "#A5A5D5" },
  _focus: {
    borderColor: "#4545A5",
    boxShadow: "0 0 0 1px #4545A5",
    bg: "white",
  },
};

export default function ManagePageSEO() {
  const [selectedPage, setSelectedPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [existingImage, setExistingImage] = useState("");

  const selectedPageLabel =
    PAGES.find((page) => page.id === selectedPage)?.label || "Home Page";

  const fetchSEO = async (pageId) => {
    try {
      setFetching(true);
      setFormData(initialFormData);
      setExistingImage("");

      const data = await makeApiRequest("/admin/page-seo/");
      const existing = data.find(
        (item) => item.page_name === pageId
      );

      if (existing) {
        setFormData({
          meta_title: existing.meta_title || "",
          meta_description: existing.meta_description || "",
          meta_keywords: existing.meta_keywords || "",
          canonical_url: existing.canonical_url || "",
          social_preview_image: null,
        });

        setExistingImage(existing.social_preview_image || "");
      }
    } catch (err) {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSEO(selectedPage);
  }, [selectedPage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = new FormData();

      data.append("page_name", selectedPage);
      data.append("meta_title", formData.meta_title);
      data.append("meta_description", formData.meta_description);
      data.append("meta_keywords", formData.meta_keywords);
      data.append("canonical_url", formData.canonical_url);

      if (formData.social_preview_image) {
        data.append(
          "social_preview_image",
          formData.social_preview_image
        );
      }

      await makeApiRequest("/admin/page-seo/", {
        method: "POST",
        body: data,
      });

      toaster.create({
        title: "SEO Settings Saved",
        description: `${selectedPageLabel} SEO settings updated successfully.`,
        type: "success",
      });

      // Refresh the saved image and current SEO values.
      await fetchSEO(selectedPage);
    } catch (err) {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedImagePreview = formData.social_preview_image
    ? URL.createObjectURL(formData.social_preview_image)
    : "";

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  return (
    <Box
      minH="100vh"
      bg="#F6F7FB"
      p={{ base: 3, md: 6, lg: 8 }}
    >
      <Box maxW="1050px" mx="auto">

        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={7}
        >
          <Box>
            <HStack gap={2} mb={2}>
              <Box
                bg="#EEEEFB"
                p={2}
                borderRadius="10px"
                color="#4545A5"
              >
                <Icon as={FiGlobe} boxSize={5} />
              </Box>
              <Badge
                bg="#EEEEFB"
                color="#4545A5"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                WEBSITE SETTINGS
              </Badge>
            </HStack>

            <Heading
              size={{ base: "lg", md: "xl" }}
              color="#20243A"
              fontWeight="800"
            >
              Page SEO Management
            </Heading>

            <Text color="#85869A" fontSize="sm" mt={2}>
              Manage search engine and social sharing settings for your website pages.
            </Text>
          </Box>

          <Badge
            bg="white"
            color="#4545A5"
            border="1px solid #E5E5F4"
            px={4}
            py={2}
            borderRadius="lg"
            fontSize="sm"
          >
            <HStack gap={2}>
              <Icon as={FiCheckCircle} />
              SEO Configuration
            </HStack>
          </Badge>
        </Flex>

        {/* Page Selection */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #EBECF3"
          boxShadow="0 4px 18px rgba(30, 35, 80, 0.04)"
          p={{ base: 4, md: 6 }}
          mb={6}
        >
          <HStack gap={3} mb={4}>
            <Box
              bg="#EEEEFB"
              color="#4545A5"
              p={2}
              borderRadius="10px"
            >
              <Icon as={FiSearch} boxSize={5} />
            </Box>

            <Box>
              <Heading size="md" color="#252641">
                Select Website Page
              </Heading>
              <Text fontSize="xs" color="#9293A5" mt={1}>
                Choose the page whose SEO settings you want to manage.
              </Text>
            </Box>
          </HStack>

          <NativeSelect.Root>
            <NativeSelect.Field
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              borderRadius="10px"
              borderColor="#E4E5F0"
              bg="#FAFAFD"
              color="#252641"
              h="46px"
              fontWeight="600"
              _focus={{
                borderColor: "#4545A5",
                boxShadow: "0 0 0 1px #4545A5",
              }}
            >
              {PAGES.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        {/* SEO Form */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #EBECF3"
          boxShadow="0 4px 18px rgba(30, 35, 80, 0.04)"
          overflow="hidden"
        >
          {/* Form Header */}
          <Flex
            justify="space-between"
            align="center"
            px={{ base: 4, md: 6 }}
            py={5}
            bg="#FCFCFF"
            borderBottom="1px solid #EEEEF4"
            gap={3}
            wrap="wrap"
          >
            <Box>
              <Heading size="md" color="#252641">
                SEO Details
              </Heading>
              <Text fontSize="sm" color="#9293A5" mt={1}>
                Configure metadata for {selectedPageLabel}
              </Text>
            </Box>

            <Badge
              bg="#EEEEFB"
              color="#4545A5"
              px={3}
              py={2}
              borderRadius="lg"
              fontSize="xs"
            >
              {selectedPageLabel}
            </Badge>
          </Flex>

          {fetching ? (
            <Flex
              justify="center"
              align="center"
              direction="column"
              py={20}
              gap={3}
            >
              <Spinner size="xl" color="#4545A5" />
              <Text color="#85869A" fontSize="sm">
                Loading SEO settings...
              </Text>
            </Flex>
          ) : (
            <Box
              as="form"
              onSubmit={handleSubmit}
              p={{ base: 4, md: 6 }}
            >
              <VStack align="stretch" gap={6}>

                {/* Meta Title */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiFileText} color="#4545A5" />
                    <FieldLabel>Meta Title</FieldLabel>
                  </HStack>

                  <Input
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    placeholder="Enter your page title"
                    maxLength={60}
                    {...inputStyles}
                    h="46px"
                  />

                  <Flex justify="space-between" mt={2}>
                    <Text fontSize="xs" color="#999AAD">
                      Recommended maximum: 60 characters
                    </Text>
                    <Text
                      fontSize="xs"
                      color={formData.meta_title.length > 60 ? "red.500" : "#999AAD"}
                    >
                      {formData.meta_title.length}/60
                    </Text>
                  </Flex>
                </Box>

                <Separator borderColor="#EEEEF4" />

                {/* Meta Description */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiFileText} color="#4545A5" />
                    <FieldLabel>Meta Description</FieldLabel>
                  </HStack>

                  <Textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    placeholder="Write a short description of this page..."
                    maxLength={160}
                    rows={4}
                    resize="vertical"
                    {...inputStyles}
                  />

                  <Flex justify="space-between" mt={2}>
                    <Text fontSize="xs" color="#999AAD">
                      Recommended maximum: 160 characters
                    </Text>
                    <Text
                      fontSize="xs"
                      color={formData.meta_description.length > 160 ? "red.500" : "#999AAD"}
                    >
                      {formData.meta_description.length}/160
                    </Text>
                  </Flex>
                </Box>

                <Separator borderColor="#EEEEF4" />

                {/* Meta Keywords */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiTag} color="#4545A5" />
                    <FieldLabel>Meta Keywords</FieldLabel>
                  </HStack>

                  <Input
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleChange}
                    placeholder="e.g., learnx, courses, online learning"
                    {...inputStyles}
                    h="46px"
                  />

                  <Text fontSize="xs" color="#999AAD" mt={2}>
                    Separate keywords with commas.
                  </Text>
                </Box>

                <Separator borderColor="#EEEEF4" />

                {/* Canonical URL */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiLink} color="#4545A5" />
                    <FieldLabel>Canonical URL</FieldLabel>
                  </HStack>

                  <Input
                    name="canonical_url"
                    type="url"
                    value={formData.canonical_url}
                    onChange={handleChange}
                    placeholder="https://yourdomain.com/page"
                    {...inputStyles}
                    h="46px"
                  />

                  <Text fontSize="xs" color="#999AAD" mt={2}>
                    Enter the preferred URL for this page.
                  </Text>
                </Box>

                <Separator borderColor="#EEEEF4" />

                {/* Social Preview Image */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiImage} color="#4545A5" />
                    <FieldLabel>Social Preview Image (OG Image)</FieldLabel>
                  </HStack>

                  <Box
                    border="1px dashed #C9C9E4"
                    borderRadius="xl"
                    p={{ base: 4, md: 5 }}
                    bg="#FAFAFE"
                  >
                    <Input
                      name="social_preview_image"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      p={1}
                      border="1px solid #E4E5F0"
                      bg="white"
                      borderRadius="lg"
                      _file={{
                        mr: 3,
                        border: "none",
                        bg: "#EEEEFB",
                        color: "#4545A5",
                        borderRadius: "md",
                        px: 3,
                        py: 1,
                        fontWeight: "600",
                      }}
                    />

                    <Text fontSize="xs" color="#9293A5" mt={2}>
                      Upload an image to display when this page is shared on social media.
                    </Text>

                    {(selectedImagePreview || existingImage) && (
                      <Box mt={4}>
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color="#343653"
                          mb={2}
                        >
                          Image Preview
                        </Text>

                        <Box
                          maxW="380px"
                          borderRadius="lg"
                          overflow="hidden"
                          border="1px solid #E5E5EF"
                          bg="white"
                        >
                          <img
                            src={selectedImagePreview || existingImage}
                            alt="Social preview"
                            style={{
                              width: "100%",
                              maxHeight: "220px",
                              objectFit: "cover",
                            }}
                          />
                        </Box>

                        {formData.social_preview_image && (
                          <Text fontSize="xs" color="#4545A5" mt={2}>
                            New image selected. Save to update the social preview.
                          </Text>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Submit */}
                <Separator borderColor="#EEEEF4" />

                <Flex
                  justify="space-between"
                  align={{ base: "stretch", sm: "center" }}
                  direction={{ base: "column", sm: "row" }}
                  gap={3}
                  pt={1}
                >
                  <Text fontSize="xs" color="#9293A5">
                    Changes apply to the selected page after saving.
                  </Text>

                  <Button
                    type="submit"
                    bg="#4545A5"
                    color="white"
                    px={7}
                    h="46px"
                    borderRadius="10px"
                    fontWeight="700"
                    loading={loading}
                    loadingText="Saving..."
                    _hover={{
                      bg: "#353584",
                      transform: "translateY(-1px)",
                      boxShadow: "0 5px 12px rgba(69,69,165,0.2)",
                    }}
                    _active={{ transform: "scale(0.98)" }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiSave} mr={2} />
                    Save SEO Settings
                  </Button>
                </Flex>
              </VStack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
