
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  IconButton,
  Input,
  Button,
} from "@chakra-ui/react";

import {
  FiBell,
  FiLock,
  FiLogOut,
  FiX,
} from "react-icons/fi";

import {
  apiRequest,
  adminLogout,
} from "../services/api";

export default function AdminHeader() {
  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // RESET PASSWORD FORM
  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password.");
      return;
    }

    const token = localStorage.getItem("learnx_admin_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      adminLogout();
      navigate("/admin/login", { replace: true });
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/change-password/", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      // Save newly generated authentication token
      if (data.token) {
        localStorage.setItem("learnx_admin_token", data.token);
      }

      setMessage(
        data.message || "Password changed successfully!"
      );

      resetPasswordForm();

    } catch (err) {
      setError(err.message || "Unable to change password.");

      if (!localStorage.getItem("learnx_admin_token")) {
        navigate("/admin/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  // SIGN OUT
  const handleLogout = () => {
    adminLogout();
    resetPasswordForm();

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
      {/* LEFT SIDE */}
      <Box>
        <Text
          fontSize="xs"
          color="gray.400"
          fontWeight="medium"
        >
          Admin Panel
        </Text>

        <Heading size="sm" color="#20243A" mt="2px">
          LearnX Dashboard
        </Heading>
      </Box>

      {/* RIGHT SIDE */}
      <HStack gap="10px">

        {/* NOTIFICATION */}
        <IconButton
          variant="ghost"
          aria-label="Notifications"
          size="sm"
          borderRadius="10px"
          color="gray.500"
          _hover={{
            bg: "#EEEEFB",
            color: "#4545A5",
          }}
        >
          <FiBell />
        </IconButton>

        {/* CHANGE PASSWORD */}
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
          onClick={() => {
            setShowPasswordForm(!showPasswordForm);
            setMessage("");
            setError("");
          }}
          _hover={{
            bg: "#E1E1F8",
          }}
        >
          <FiLock />
          Change Password
        </Button>

        {/* SIGN OUT */}
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
          _hover={{
            bg: "#FEE2E2",
          }}
        >
          <FiLogOut />
          Sign Out
        </Button>

      </HStack>

      {/* CHANGE PASSWORD POPUP */}
      {showPasswordForm && (
        <Box
          position="absolute"
          top="65px"
          right={{ base: "12px", md: "32px" }}
          width={{ base: "calc(100vw - 24px)", sm: "340px" }}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="xl"
          boxShadow="0 8px 30px rgba(0,0,0,0.12)"
          padding="5"
          zIndex="30"
        >

          {/* POPUP HEADER */}
          <Flex justify="space-between" align="center" mb="4">
            <Box>
              <Heading size="md" color="#20243A">
                Change Password
              </Heading>

              <Text fontSize="sm" color="gray.500" mt="1">
                Update your admin password.
              </Text>
            </Box>

            <IconButton
              aria-label="Close password form"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPasswordForm(false);
                setError("");
                setMessage("");
              }}
            >
              <FiX />
            </IconButton>
          </Flex>

          {/* PASSWORD FORM */}
          <form onSubmit={handleChangePassword}>

            <Text fontSize="sm" fontWeight="medium" mb="1">
              Current Password
            </Text>

            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              mb="3"
              required
              autoComplete="current-password"
            />

            <Text fontSize="sm" fontWeight="medium" mb="1">
              New Password
            </Text>

            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              mb="3"
              required
              autoComplete="new-password"
            />

            <Text fontSize="sm" fontWeight="medium" mb="1">
              Confirm New Password
            </Text>

            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              mb="3"
              required
              autoComplete="new-password"
            />

            {/* ERROR MESSAGE */}
            {error && (
              <Box
                bg="#FFF1F0"
                color="red.600"
                borderRadius="md"
                padding="2"
                mb="3"
                fontSize="sm"
              >
                {error}
              </Box>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <Box
                bg="#ECFDF3"
                color="green.700"
                borderRadius="md"
                padding="2"
                mb="3"
                fontSize="sm"
              >
                {message}
              </Box>
            )}

            {/* ACTION BUTTONS */}
            <HStack justify="flex-end" mt="2">

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPasswordForm(false);
                  setError("");
                  setMessage("");
                  resetPasswordForm();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                size="sm"
                bg="#4545A5"
                color="white"
                loading={loading}
                disabled={loading}
                _hover={{
                  bg: "#36368B",
                }}
              >
                Update Password
              </Button>

            </HStack>
          </form>
        </Box>
      )}
    </Flex>
  );
}
