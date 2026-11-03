import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import {
  FiHome,
  FiBookOpen,
  FiBook,
  FiImage,
  FiFileText,
  FiUsers,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiMail,
  FiBriefcase,
  FiUserCheck,
  FiCode,
  FiMessageSquare,
  FiUserPlus,
  FiCheckSquare,
  FiPhoneCall, // ✅ Added for Callback Requests
} from "react-icons/fi";
import { adminLogout } from "../services/api";

const sections = [
  {
    title: "OVERVIEW",
    items: [{ label: "Dashboard", path: "/admin/dashboard", icon: FiHome }],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Blogs", path: "/admin/blogs", icon: FiBookOpen },
      { label: "Courses", path: "/admin/courses", icon: FiBook },
      { label: "Technologies", path: "/admin/technologies", icon: FiCode },
      { label: "Testimonials", path: "/admin/testimonials", icon: FiMessageSquare },
      { label: "Gallery", path: "/admin/gallery", icon: FiImage },
      { label: "Placements", path: "/admin/placements", icon: FiBriefcase },
      { label: "Our Team", path: "/admin/team", icon: FiUserCheck },
      { label: "Careers", path: "/admin/careers", icon: FiCheckSquare },
      {
        label: "Website Content",
        path: "/admin/website-content",
        icon: FiFileText,
      },
    ],
  },
  {
    title: "MANAGE",
    items: [
      { label: "Hire Enquiries", path: "/admin/hire-enquiries", icon: FiUserPlus },
      { label: "Contact Messages", path: "/admin/contact", icon: FiMail },
      { label: "Callback Requests", path: "/admin/callbacks", icon: FiPhoneCall }, // ✅ Added here
      // { label: "Enquiries", path: "/admin/enquiries", icon: FiUsers },
      { label: "Settings", path: "/admin/settings", icon: FiSettings },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("learnx_admin_username") || "Admin"
      : "Admin";

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <Box
      as="aside"
      w={collapsed ? "76px" : "260px"}
      minH="100vh"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      display="flex"
      flexDirection="column"
      transition="width .2s ease"
      flexShrink={0}
      position="sticky"
      top="0"
      alignSelf="flex-start"
    >
      {/* Brand row */}
      <Flex
        align="center"
        justify={collapsed ? "center" : "space-between"}
        px={collapsed ? "0" : "20px"}
        h="76px"
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        {!collapsed && (
          <HStack gap="10px">
            <Flex
              w="34px"
              h="34px"
              borderRadius="10px"
              bg="#4545A5"
              color="white"
              align="center"
              justify="center"
              fontWeight="bold"
              fontSize="sm"
            >
              LX
            </Flex>
            <Box>
              <Heading size="sm" color="#20243A" lineHeight="1.1">
                LearnX
              </Heading>
              <Text
                fontSize="10px"
                color="#4545A5"
                fontWeight="bold"
                letterSpacing="1px"
              >
                ADMIN
              </Text>
            </Box>
          </HStack>
        )}

        <IconButton
          size="sm"
          variant="ghost"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          color="gray.500"
          onClick={() => setCollapsed((c) => !c)}
          _hover={{ bg: "#EEEEFB", color: "#4545A5" }}
        >
          <Icon as={collapsed ? FiChevronRight : FiChevronLeft} />
        </IconButton>
      </Flex>

      {/* Menu */}
      <Box flex="1" overflowY="auto" py="16px" px={collapsed ? "10px" : "14px"}>
        <VStack align="stretch" gap="20px">
          {sections.map((section) => (
            <Box key={section.title}>
              {!collapsed && (
                <Text
                  fontSize="10px"
                  fontWeight="bold"
                  color="gray.400"
                  letterSpacing="1.2px"
                  px="10px"
                  mb="8px"
                >
                  {section.title}
                </Text>
              )}

              <VStack align="stretch" gap="4px">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={{ textDecoration: "none" }}
                  >
                    {({ isActive }) => (
                      <Flex
                        align="center"
                        justify={collapsed ? "center" : "flex-start"}
                        gap="12px"
                        px={collapsed ? "0" : "12px"}
                        py="10px"
                        borderRadius="10px"
                        position="relative"
                        bg={isActive ? "#EEEEFB" : "transparent"}
                        color={isActive ? "#4545A5" : "gray.600"}
                        transition="background .15s, color .15s"
                        _hover={{
                          bg: isActive ? "#EEEEFB" : "gray.50",
                          color: isActive ? "#4545A5" : "#20243A",
                        }}
                      >
                        {isActive && !collapsed && (
                          <Box
                            position="absolute"
                            left="-14px"
                            top="50%"
                            transform="translateY(-50%)"
                            w="3px"
                            h="22px"
                            bg="#4545A5"
                            borderRadius="full"
                          />
                        )}
                        <Icon as={item.icon} boxSize="18px" flexShrink={0} />
                        {!collapsed && (
                          <Text
                            fontSize="sm"
                            fontWeight={isActive ? "semibold" : "medium"}
                            whiteSpace="nowrap"
                          >
                            {item.label}
                          </Text>
                        )}
                      </Flex>
                    )}
                  </NavLink>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* User footer */}
      <Box
        borderTop="1px solid"
        borderColor="gray.100"
        p={collapsed ? "12px 8px" : "14px"}
      >
        <Flex
          align="center"
          justify={collapsed ? "center" : "space-between"}
          gap="10px"
        >
          <HStack gap="10px" minW="0">
            <Flex
              w="32px"
              h="32px"
              borderRadius="full"
              bg="#EEEEFB"
              color="#4545A5"
              align="center"
              justify="center"
              fontWeight="bold"
              fontSize="sm"
              flexShrink={0}
            >
              {username.charAt(0).toUpperCase()}
            </Flex>
            {!collapsed && (
              <Box minW="0">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="#20243A"
                  truncate
                >
                  {username}
                </Text>
                <Text fontSize="xs" color="gray.500" truncate>
                  Administrator
                </Text>
              </Box>
            )}
          </HStack>

          {!collapsed && (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Logout"
              color="gray.500"
              _hover={{ bg: "#FDECF3", color: "#DB2777" }}
              onClick={handleLogout}
            >
              <Icon as={FiLogOut} />
            </IconButton>
          )}
        </Flex>
      </Box>
    </Box>
  );
}