import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { FiBell, FiLock, FiLogOut } from "react-icons/fi";
import { adminLogout } from "../services/api"; 

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <Flex
      as="header"
      width="100%"
      minHeight="76px"
      paddingX={{ base: "18px", md: "32px" }}
      align="center"
      justify="space-between"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      position="sticky"
      top="0"
      zIndex="10"
    >
      <Box>
        <Text fontSize="xs" color="gray.400" fontWeight="medium">
          Admin Panel
        </Text>
        <Heading size="sm" color="#20243A" mt="2px">
          LearnX Dashboard
        </Heading>
      </Box>

      <HStack gap="10px">
        <IconButton
          variant="ghost"
          aria-label="Notifications"
          size="sm"
          borderRadius="10px"
          color="gray.500"
          _hover={{ bg: "#EEEEFB", color: "#4545A5" }}
        >
          <FiBell />
        </IconButton>

        <Button
          type="button"
          bg="#EEEEFB"
          color="#4545A5"
          borderRadius="full"
          px="14px"
          py="7px"
          fontWeight="semibold"
          fontSize="sm"
          size="sm"
          onClick={() => navigate("/admin/change-password")}
          _hover={{ bg: "#E1E1F8" }}
        >
          <FiLock />
          Change Password
        </Button>

        <Button
          type="button"
          bg="#FFF1F0"
          color="#DC2626"
          borderRadius="full"
          px="14px"
          py="7px"
          fontWeight="semibold"
          fontSize="sm"
          size="sm"
          onClick={handleLogout}
          _hover={{ bg: "#FEE2E2" }}
        >
          <FiLogOut />
          Sign Out
        </Button>
      </HStack>
    </Flex>
  );
}