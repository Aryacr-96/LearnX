import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Heading, Text, VStack, HStack, Flex, Icon, Spinner,
} from "@chakra-ui/react";
import {
  FiBookOpen, FiBook, FiImage, FiUsers, FiArrowRight, FiPlus,
} from "react-icons/fi";
import { getAll } from "../services/crud";

const quickActions = [
  { label: "Add Blog Post", to: "/admin/blogs", color: "#5554C8" },
  { label: "Add Course", to: "/admin/courses", color: "#0D9488" },
  { label: "Upload Image", to: "/admin/gallery", color: "#D97706" },
  { label: "View Messages", to: "/admin/contact", color: "#DB2777" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ blogs: null, courses: null, gallery: null, contact: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      const modules = ["blogs", "courses", "gallery", "contact"]; // 👈 Changed enquiries to contact
      const results = await Promise.allSettled(modules.map((m) => getAll(m)));
      
      if (cancelled) return;
      const next = { blogs: null, courses: null, gallery: null, contact: null };
      
      results.forEach((result, i) => {
        const key = modules[i];
        if (result.status === "fulfilled") {
          const value = result.value;
          const list = Array.isArray(value) ? value : value?.results ?? [];
          next[key] = list.length;
        }
      });
      
      setCounts(next);
      setLoading(false);
    }
    loadStats();
    return () => { cancelled = true; };
  }, []);

  const statistics = [
    { title: "Total Blogs", value: counts.blogs, color: "#5554C8", bg: "#EEEEFB", icon: FiBookOpen, to: "/admin/blogs" },
    { title: "Total Courses", value: counts.courses, color: "#0D9488", bg: "#E6F7F4", icon: FiBook, to: "/admin/courses" },
    { title: "Gallery Images", value: counts.gallery, color: "#D97706", bg: "#FEF3E2", icon: FiImage, to: "/admin/gallery" },
    { title: "New Enquiries", value: counts.contact, color: "#DB2777", bg: "#FDECF3", icon: FiUsers, to: "/admin/contact" }, // 👈 Updated to contact
  ];

  const renderValue = (value) => {
    if (loading) return <Spinner size="sm" />;
    if (value === null || value === undefined) return "—";
    return value;
  };

  return (
    <VStack align="stretch" gap="28px">
      <Box>
        <Heading size="lg" color="#20243A">Dashboard Overview</Heading>
        <Text color="gray.500" marginTop="8px">Welcome to your LearnX content management dashboard.</Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap="20px">
        {statistics.map((item) => (
          <Box
            key={item.title}
            bg="white" padding="22px" borderRadius="16px" border="1px solid" borderColor="gray.200" boxShadow="sm"
            cursor="pointer" transition="all .18s ease"
            _hover={{ borderColor: "#C7C7EE", boxShadow: "0 8px 24px rgba(69,69,165,0.10)", transform: "translateY(-3px)" }}
            onClick={() => navigate(item.to)}
          >
            <Flex justify="space-between" align="flex-start">
              <Text color="gray.500" fontSize="sm" fontWeight="medium">{item.title}</Text>
              <Flex w="38px" h="38px" borderRadius="10px" bg={item.bg} color={item.color} align="center" justify="center">
                <Icon as={item.icon} boxSize="18px" />
              </Flex>
            </Flex>
            <Heading size="2xl" color={item.color} marginTop="18px">
              {renderValue(item.value)}
            </Heading>
          </Box>
        ))}
      </Grid>

      <Box bg="white" padding="24px" borderRadius="16px" border="1px solid" borderColor="gray.200">
        <Heading size="md" marginBottom="16px" color="#20243A">Quick Actions</Heading>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap="12px">
          {quickActions.map((action) => (
            <HStack
              key={action.label} p="14px" borderRadius="12px" border="1px solid" borderColor="gray.200" cursor="pointer"
              _hover={{ borderColor: action.color, bg: "#FAFAFF" }} transition="all .15s" onClick={() => navigate(action.to)}
            >
              <Flex w="32px" h="32px" borderRadius="8px" bg={`${action.color}14`} color={action.color} align="center" justify="center">
                <FiPlus />
              </Flex>
              <Text fontSize="sm" fontWeight="medium" color="#20243A">{action.label}</Text>
            </HStack>
          ))}
        </Grid>
      </Box>

      {/* <Box bg="white" padding="24px" borderRadius="16px" border="1px solid" borderColor="gray.200">
        <Heading size="md" marginBottom="12px" color="#20243A">Manage your website</Heading>
        <Text color="gray.600" lineHeight="1.8">
          Use the sidebar to access Blogs, Courses, Gallery, Website Content, Enquiries and Settings.
        </Text>
        <HStack mt="16px" color="#4545A5" fontWeight="semibold" fontSize="sm" cursor="pointer" onClick={() => navigate("/admin/blogs")}>
          <Text>Explore modules</Text>
          <FiArrowRight />
        </HStack>
      </Box> */}
    </VStack>
  );
}