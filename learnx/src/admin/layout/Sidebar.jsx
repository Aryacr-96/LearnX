import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Box, Flex, Heading, Icon, Text, VStack, HStack, IconButton,
} from "@chakra-ui/react";
import {
  FiHome, FiBookOpen, FiBook, FiImage, FiUsers, FiSettings,
  FiChevronLeft, FiChevronRight, FiLogOut, FiMail, FiBriefcase,
  FiUserCheck, FiCode, FiMessageSquare, FiUserPlus, FiCheckSquare, FiPhoneCall,
  FiFileText, // 👈 Added for Page SEO
} from "react-icons/fi";

// Built-in helper functions
const getAdminRole = () => localStorage.getItem("learnx_admin_role") || "";
const getAdminName = () => localStorage.getItem("learnx_admin_name") || "";
const getAdminPermissions = () => {
  try { return JSON.parse(localStorage.getItem("learnx_admin_permissions") || "{}"); }
  catch { return {}; }
};
const hasPermission = (module) => {
  const role = getAdminRole();
  if (role === "admin") return true;
  if (role !== "subadmin") return false;
  return Boolean(getAdminPermissions()[module]);
};
const adminLogout = () => {
  localStorage.removeItem("learnx_admin_token");
  localStorage.removeItem("learnx_admin_username");
  localStorage.removeItem("learnx_admin_email");
  localStorage.removeItem("learnx_admin_name");
  localStorage.removeItem("learnx_admin_role");
  localStorage.removeItem("learnx_admin_permissions");
};

const sections = [
  { title: "OVERVIEW", items: [{ label: "Dashboard", path: "/admin/dashboard", icon: FiHome }] },
  { title: "CONTENT", items: [
    { label: "Blogs", path: "/admin/blogs", icon: FiBookOpen, perm: "blogs" },
    { label: "Courses", path: "/admin/courses", icon: FiBook, perm: "courses" },
    { label: "Technologies", path: "/admin/technologies", icon: FiCode, perm: "technologies" },
    { label: "Testimonials", path: "/admin/testimonials", icon: FiMessageSquare, perm: "testimonials" },
    { label: "Gallery", path: "/admin/gallery", icon: FiImage, perm: "gallery" },
    { label: "Placements", path: "/admin/placements", icon: FiBriefcase, perm: "placements" },
    { label: "Our Team", path: "/admin/team", icon: FiUserCheck, perm: "team" },
    { label: "Careers", path: "/admin/careers", icon: FiCheckSquare, perm: "careers" },
  ]},
  { title: "MANAGE", items: [
    { label: "Page SEO", path: "/admin/page-seo", icon: FiFileText, perm: "pages" }, // 👈 NEW
    { label: "Hire Enquiries", path: "/admin/hire-enquiries", icon: FiUserPlus, perm: "hire_enquiries" },
    { label: "Contact Messages", path: "/admin/contact", icon: FiMail, perm: "contacts" },
    { label: "Callback Requests", path: "/admin/callbacks", icon: FiPhoneCall, perm: "callbacks" },
    { label: "Manage Users", path: "/admin/users", icon: FiUsers, adminOnly: true },
    { label: "Settings", path: "/admin/settings", icon: FiSettings, adminOnly: true },
  ]},
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const role = getAdminRole();
  const displayName = getAdminName() || "Admin";
  const roleLabel = role === "admin" ? "Administrator" : role === "subadmin" ? "Sub Admin" : "User";

  const handleLogout = () => { adminLogout(); navigate("/admin/login", { replace: true }); };

  return (
    <Box as="aside" w={collapsed ? "76px" : "260px"} minH="100vh" bg="white" borderRight="1px solid" borderColor="gray.200" display="flex" flexDirection="column" flexShrink={0} position="sticky" top="0">
      <Flex align="center" justify={collapsed ? "center" : "space-between"} px={collapsed ? "0" : "20px"} h="76px" borderBottom="1px solid" borderColor="gray.100">
        {!collapsed && (
          <HStack gap="10px">
            <Flex w="34px" h="34px" borderRadius="10px" bg="#4545A5" color="white" align="center" justify="center" fontWeight="bold" fontSize="sm">LX</Flex>
            <Box>
              <Heading size="sm" color="#20243A" lineHeight="1.1">LearnX</Heading>
              <Text fontSize="10px" color="#4545A5" fontWeight="bold" letterSpacing="1px">ADMIN</Text>
            </Box>
          </HStack>
        )}
        <IconButton size="sm" variant="ghost" onClick={() => setCollapsed(!collapsed)}>
          <Icon as={collapsed ? FiChevronRight : FiChevronLeft} />
        </IconButton>
      </Flex>

      <Box flex="1" overflowY="auto" py="16px" px={collapsed ? "10px" : "14px"}>
        <VStack align="stretch" gap="20px">
          {sections.map((section) => {
            const visibleItems = section.items.filter(item => {
              if (item.adminOnly) return role === "admin";
              if (item.perm) return hasPermission(item.perm);
              return true;
            });
            if (visibleItems.length === 0) return null;
            return (
              <Box key={section.title}>
                {!collapsed && <Text fontSize="10px" fontWeight="bold" color="gray.400" px="10px" mb="8px">{section.title}</Text>}
                <VStack align="stretch" gap="4px">
                  {visibleItems.map((item) => (
                    <NavLink key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                      {({ isActive }) => (
                        <Flex align="center" justify={collapsed ? "center" : "flex-start"} gap="12px" px={collapsed ? "0" : "12px"} py="10px" borderRadius="10px" bg={isActive ? "#EEEEFB" : "transparent"} color={isActive ? "#4545A5" : "gray.600"}>
                          <Icon as={item.icon} boxSize="18px" />
                          {!collapsed && <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>{item.label}</Text>}
                        </Flex>
                      )}
                    </NavLink>
                  ))}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </Box>

      <Box borderTop="1px solid" borderColor="gray.100" p="14px">
        <Flex align="center" justify="space-between">
          <HStack gap="10px">
            <Flex w="32px" h="32px" borderRadius="full" bg="#EEEEFB" color="#4545A5" align="center" justify="center" fontWeight="bold">
              {displayName.charAt(0).toUpperCase()}
            </Flex>
            {!collapsed && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold">{displayName}</Text>
                <Text fontSize="xs" color="gray.500">{roleLabel}</Text>
              </Box>
            )}
          </HStack>
          {!collapsed && <IconButton size="sm" variant="ghost" onClick={handleLogout}><Icon as={FiLogOut} /></IconButton>}
        </Flex>
      </Box>
    </Box>
  );
}