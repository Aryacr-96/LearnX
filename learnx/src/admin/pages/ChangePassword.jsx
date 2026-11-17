import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  Card,
  HStack,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toaster } from "../../App";
import { apiRequest, adminLogout } from "../services/api";

// 👇 MOVE PasswordField OUTSIDE the main component
const PasswordField = ({ value, onChange, placeholder, show, onToggle, autoComplete }) => (
  <HStack
    border="1px solid"
    borderColor="gray.200"
    borderRadius="lg"
    px="12px"
    bg="gray.50"
    _focusWithin={{
      borderColor: "#4545A5",
      bg: "white",
      boxShadow: "0 0 0 1px #4545A5",
    }}
  >
    <Icon as={FiLock} color="gray.400" />
    <Input
      variant="unstyled"
      h="44px"
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      minLength={6}
      autoComplete={autoComplete}
    />
    <IconButton
      type="button"
      variant="ghost"
      size="sm"
      aria-label={show ? "Hide password" : "Show password"}
      color="gray.400"
      onClick={onToggle}
      _hover={{ bg: "transparent", color: "#4545A5" }}
      minW="auto"
      h="auto"
      px="0"
    >
      <Icon as={show ? FiEyeOff : FiEye} />
    </IconButton>
  </HStack>
);

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForced, setIsForced] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Only subadmins can be forced
    const role = localStorage.getItem("learnx_admin_role");
    const flag = localStorage.getItem("learnx_admin_must_change_password") === "true";
    setIsForced(role === "subadmin" && flag);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toaster.create({ title: "Error", description: "New passwords do not match.", type: "error" });
      return;
    }

    if (currentPassword === newPassword) {
      toaster.create({ title: "Error", description: "New password must be different from current password.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("/change-password/", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (res.token) {
        localStorage.setItem("learnx_admin_token", res.token);
      }

      // Clear the forced flag
      localStorage.removeItem("learnx_admin_must_change_password");

      toaster.create({ title: "Password updated successfully!", type: "success" });
      navigate("/admin/dashboard");
    } catch (err) {
      toaster.create({ title: "Error", description: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isForced) {
      adminLogout();
      navigate("/admin/login", { replace: true });
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Card.Root maxW="md" w="100%" p={8} boxShadow="lg" borderRadius="2xl">
        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <Heading size="lg">Change Password</Heading>

            <Text color="gray.500" textAlign="center">
              {isForced
                ? "For security reasons, you must change your temporary password before accessing the dashboard."
                : "Enter your current password and choose a new one."}
            </Text>

            <PasswordField
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              show={showCurrent}
              onToggle={() => setShowCurrent((p) => !p)}
              autoComplete="current-password"
            />
            <PasswordField
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min 6 chars)"
              show={showNew}
              onToggle={() => setShowNew((p) => !p)}
              autoComplete="new-password"
            />
            <PasswordField
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              show={showConfirm}
              onToggle={() => setShowConfirm((p) => !p)}
              autoComplete="new-password"
            />

            <Button type="submit" colorPalette="purple" w="100%" loading={loading} mt={2}>
              Update Password
            </Button>

            <Button type="button" variant="ghost" w="100%" onClick={handleCancel} color="gray.500">
              {isForced ? "Cancel and Sign Out" : "Cancel"}
            </Button>
          </VStack>
        </form>
      </Card.Root>
    </Box>
  );
}