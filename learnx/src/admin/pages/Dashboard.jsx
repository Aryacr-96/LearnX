
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Icon,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FiBookOpen,
  FiBook,
  FiImage,
  FiUsers,
  FiPlus,
  FiCode,
  FiArrowUpRight,
  FiLayout,
} from "react-icons/fi";
import { getAll } from "../services/crud";

// Admin role and permission helpers
const getAdminRole = () => localStorage.getItem("learnx_admin_role") || "";

const getAdminPermissions = () => {
  try {
    return JSON.parse(
      localStorage.getItem("learnx_admin_permissions") || "{}"
    );
  } catch {
    return {};
  }
};

const hasPermission = (module) => {
  const role = getAdminRole();

  if (role === "admin") return true;
  if (role !== "subadmin") return false;

  return Boolean(getAdminPermissions()[module]);
};

// Quick actions
const quickActions = [
  {
    label: "Add Blog Post",
    description: "Create and manage blog articles",
    to: "/admin/blogs",
    color: "#5554C8",
    bg: "#EEEEFB",
    key: "blogs",
    icon: FiBookOpen,
  },
  {
    label: "Add Course",
    description: "Manage your learning programs",
    to: "/admin/courses",
    color: "#0D9488",
    bg: "#E6F7F4",
    key: "courses",
    icon: FiBook,
  },
  {
    label: "Upload Image",
    description: "Add images to your gallery",
    to: "/admin/gallery",
    color: "#D97706",
    bg: "#FEF3E2",
    key: "gallery",
    icon: FiImage,
  },
  {
    label: "View Messages",
    description: "Check contact enquiries",
    to: "/admin/contact",
    color: "#DB2777",
    bg: "#FDECF3",
    key: "contacts",
    icon: FiUsers,
  },
  {
    label: "Manage Technologies",
    description: "Update website technologies",
    to: "/admin/technologies",
    color: "#4545A5",
    bg: "#EEEEFB",
    key: "technologies",
    icon: FiCode,
  },
];

const initialCounts = {
  blogs: null,
  courses: null,
  gallery: null,
  contact: null,
  technologies: null,
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [counts, setCounts] = useState(initialCounts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      const modules = [
        "blogs",
        "courses",
        "gallery",
        "contact",
        "technologies",
      ];

      const allowedModules = modules.filter((module) =>
        hasPermission(module)
      );

      if (allowedModules.length === 0) {
        setLoading(false);
        return;
      }

      const results = await Promise.allSettled(
        allowedModules.map((module) => getAll(module))
      );

      if (cancelled) return;

      const next = { ...initialCounts };

      results.forEach((result, index) => {
        const key = allowedModules[index];

        if (result.status === "fulfilled") {
          const value = result.value;
          const list = Array.isArray(value)
            ? value
            : value?.results ?? [];

          next[key] = list.length;
        }
      });

      setCounts(next);
      setLoading(false);
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const statistics = [
    {
      title: "Total Blogs",
      subtitle: "Published blog content",
      value: counts.blogs,
      color: "#5554C8",
      bg: "#EEEEFB",
      icon: FiBookOpen,
      to: "/admin/blogs",
      key: "blogs",
    },
    {
      title: "Total Courses",
      subtitle: "Available learning programs",
      value: counts.courses,
      color: "#0D9488",
      bg: "#E6F7F4",
      icon: FiBook,
      to: "/admin/courses",
      key: "courses",
    },
    {
      title: "Gallery Images",
      subtitle: "Uploaded media files",
      value: counts.gallery,
      color: "#D97706",
      bg: "#FEF3E2",
      icon: FiImage,
      to: "/admin/gallery",
      key: "gallery",
    },
    {
      title: "New Enquiries",
      subtitle: "Contact form submissions",
      value: counts.contact,
      color: "#DB2777",
      bg: "#FDECF3",
      icon: FiUsers,
      to: "/admin/contact",
      key: "contacts",
    },
    {
      title: "Technologies",
      subtitle: "Website technologies",
      value: counts.technologies,
      color: "#4545A5",
      bg: "#EEEEFB",
      icon: FiCode,
      to: "/admin/technologies",
      key: "technologies",
    },
  ];

  const renderValue = (value) => {
    if (loading) {
      return <Spinner size="md" color="#4545A5" />;
    }

    if (value === null || value === undefined) {
      return "—";
    }

    return value;
  };

  const visibleStatistics = statistics.filter((item) =>
    hasPermission(item.key)
  );

  const visibleActions = quickActions.filter((action) =>
    hasPermission(action.key)
  );

  return (
    <VStack align="stretch" gap={{ base: "22px", md: "28px" }} w="100%">
      {/* Dashboard Header */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <HStack gap={2} mb={2}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="11px"
              bg="#EEEEFB"
              color="#4545A5"
              align="center"
              justify="center"
            >
              <Icon as={FiLayout} boxSize="19px" />
            </Flex>

            <Text
              color="#4545A5"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="1.5px"
              textTransform="uppercase"
            >
              LearnX Admin
            </Text>
          </HStack>

          <Heading
            size={{ base: "xl", md: "2xl" }}
            color="#20243A"
            fontWeight="700"
          >
            Dashboard Overview
          </Heading>

          <Text color="gray.500" fontSize="sm" mt={2}>
            Welcome to your LearnX content management dashboard.
          </Text>
        </Box>
      </Flex>

      {/* Statistics */}
      <Box>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          wrap="wrap"
          gap={2}
        >
          <Box>
            <Heading size="md" color="#20243A">
              Overview Statistics
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              A quick summary of your website content
            </Text>
          </Box>

          <Text fontSize="xs" color="gray.400" fontWeight="medium">
            {visibleStatistics.length} MODULES
          </Text>
        </Flex>

        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
          gap={4}
        >
          {visibleStatistics.map((item) => (
            <Box
              key={item.title}
              bg="white"
              p={{ base: 5, md: 6 }}
              borderRadius="18px"
              border="1px solid"
              borderColor="#E8E8F0"
              boxShadow="0 2px 8px rgba(32,36,58,0.03)"
              cursor="pointer"
              position="relative"
              overflow="hidden"
              transition="all .2s ease"
              onClick={() => navigate(item.to)}
              _hover={{
                borderColor: item.color,
                boxShadow: "0 10px 28px rgba(69,69,165,0.10)",
                transform: "translateY(-4px)",
              }}
            >
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text
                    color="gray.500"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {item.title}
                  </Text>

                  <Heading
                    size="2xl"
                    color="#20243A"
                    mt={4}
                    fontWeight="700"
                    lineHeight="1"
                  >
                    {renderValue(item.value)}
                  </Heading>

                  <Text color="gray.400" fontSize="xs" mt={3}>
                    {item.subtitle}
                  </Text>
                </Box>

                <Flex
                  w="48px"
                  h="48px"
                  borderRadius="14px"
                  bg={item.bg}
                  color={item.color}
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={item.icon} boxSize="22px" />
                </Flex>
              </Flex>

              <Flex
                position="absolute"
                bottom="0"
                left="0"
                h="3px"
                w="100%"
                bg={item.color}
                opacity={0.75}
              />
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Quick Actions */}
      <Box
        bg="white"
        p={{ base: 5, md: 6 }}
        borderRadius="18px"
        border="1px solid"
        borderColor="#E8E8F0"
        boxShadow="0 2px 8px rgba(32,36,58,0.03)"
      >
        <Flex
          justify="space-between"
          align="center"
          mb={5}
          wrap="wrap"
          gap={2}
        >
          <Box>
            <Heading size="md" color="#20243A">
              Quick Actions
            </Heading>

            <Text color="gray.500" fontSize="sm" mt={1}>
              Quickly access your frequently used modules
            </Text>
          </Box>

          <Flex
            align="center"
            gap={2}
            color="#4545A5"
            fontSize="xs"
            fontWeight="semibold"
          >
            <Icon as={FiPlus} />
            QUICK ACCESS
          </Flex>
        </Flex>

        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 3 }}
          gap={3}
        >
          {visibleActions.map((action) => (
            <HStack
              key={action.label}
              p={4}
              borderRadius="13px"
              border="1px solid"
              borderColor="#EEEEF4"
              cursor="pointer"
              align="center"
              gap={3}
              transition="all .2s ease"
              onClick={() => navigate(action.to)}
              _hover={{
                borderColor: action.color,
                bg: "#FAFAFF",
                transform: "translateY(-2px)",
                boxShadow: "0 5px 15px rgba(69,69,165,0.07)",
              }}
            >
              <Flex
                w="43px"
                h="43px"
                borderRadius="12px"
                bg={action.bg}
                color={action.color}
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={action.icon} boxSize="20px" />
              </Flex>

              <Box flex="1" minW="0">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="#20243A"
                >
                  {action.label}
                </Text>

                <Text fontSize="xs" color="gray.500" mt={1}>
                  {action.description}
                </Text>
              </Box>

              <Icon
                as={FiArrowUpRight}
                color="gray.400"
                boxSize="17px"
                flexShrink={0}
              />
            </HStack>
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
