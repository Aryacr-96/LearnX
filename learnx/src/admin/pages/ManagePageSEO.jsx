import { useState, useEffect } from "react";
import {
  Box, Button, Heading, Input, Text, VStack, Flex, Spinner
} from "@chakra-ui/react";
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

const makeApiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("learnx_admin_token");
  const API_BASE_URL = "http://127.0.0.1:8000/api"; 
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
};

export default function ManagePageSEO() {
  const [selectedPage, setSelectedPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_url: "",
    social_preview_image: null,
  });

  const fetchSEO = async (pageId) => {
    try {
      setFetching(true);
      const data = await makeApiRequest("/admin/page-seo/");
      const existing = data.find((item) => item.page_name === pageId);
      
      if (existing) {
        setFormData({
          meta_title: existing.meta_title || "",
          meta_description: existing.meta_description || "",
          meta_keywords: existing.meta_keywords || "",
          canonical_url: existing.canonical_url || "",
          social_preview_image: null,
        });
      } else {
        setFormData({
          meta_title: "", meta_description: "", meta_keywords: "", canonical_url: "", social_preview_image: null,
        });
      }
    } catch (err) {
      toaster.create({ title: "Error", description: err.message, type: "error" });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSEO(selectedPage);
  }, [selectedPage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
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
        data.append("social_preview_image", formData.social_preview_image);
      }

      await makeApiRequest("/admin/page-seo/", {
        method: "POST",
        body: data,
      });
      toaster.create({ title: "SEO Saved", type: "success" });
    } catch (err) {
      toaster.create({ title: "Error", description: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={8} maxW="800px" mx="auto">
      <Heading mb={2}>Page SEO Settings</Heading>
      <Text color="gray.500" mb={8}>Manage SEO tags for your public website pages.</Text>

      <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" mb={8}>
        <Text fontWeight="bold" mb={2}>Select Page</Text>
        
        {/* 👇 Replaced Chakra <Select> with plain HTML <select> */}
        <select 
          value={selectedPage} 
          onChange={(e) => setSelectedPage(e.target.value)} 
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E2E8F0", marginBottom: "24px", outline: "none", backgroundColor: "white" }}
        >
          {PAGES.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>

        {fetching ? (
          <Flex justify="center" py={10}><Spinner /></Flex>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontWeight="medium" mb={1} fontSize="sm">Meta Title</Text>
                <Input name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="Max 60 characters" />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={1} fontSize="sm">Meta Description</Text>
                <textarea 
                  name="meta_description" 
                  value={formData.meta_description} 
                  onChange={handleChange} 
                  placeholder="Max 160 characters" 
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #E2E8F0", outline: "none" }}
                />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={1} fontSize="sm">Meta Keywords</Text>
                <Input name="meta_keywords" value={formData.meta_keywords} onChange={handleChange} placeholder="e.g., learnx, courses, online" />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={1} fontSize="sm">Canonical URL</Text>
                <Input name="canonical_url" value={formData.canonical_url} onChange={handleChange} placeholder="https://yourdomain.com/page" />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={1} fontSize="sm">Social Preview Image (OG Image)</Text>
                <Input name="social_preview_image" type="file" accept="image/*" onChange={handleChange} p={1} />
              </Box>
              
              <Button type="submit" colorPalette="purple" loading={loading} alignSelf="flex-start" mt={4}>
                Save SEO Settings
              </Button>
            </VStack>
          </form>
        )}
      </Box>
    </Box>
  );
}