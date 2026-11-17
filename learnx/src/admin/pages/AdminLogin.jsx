import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  Field,
  HStack,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import { adminLogin } from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await adminLogin(identifier.trim(), password.trim());

      // 👇 Force password change ONLY for subadmins
      const role = localStorage.getItem("learnx_admin_role");
      if (role === "subadmin" && data.must_change_password) {
        localStorage.setItem("learnx_admin_must_change_password", "true");
        navigate("/admin/change-password", { replace: true });
      } else {
        localStorage.removeItem("learnx_admin_must_change_password");
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="#F7F8FC" align="center" justify="center" px={4}>
      <Box
        w="100%"
        maxW="400px"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        boxShadow="sm"
      >
        <VStack gap={6} align="stretch">
          {/* Brand */}
          <VStack gap={3} align="center" textAlign="center">
            <Flex
              w="48px"
              h="48px"
              borderRadius="14px"
              bg="#4545A5"
              color="white"
              align="center"
              justify="center"
              fontWeight="bold"
              fontSize="md"
            >
              LX
            </Flex>
            <Box>
              <Heading size="lg" color="#20243A">
                Welcome back
              </Heading>
              <Text mt={1} color="gray.500" fontSize="sm">
                Sign in to the LearnX admin panel
              </Text>
            </Box>
          </VStack>

          {/* Form */}
          <Box as="form" onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              <Field.Root required>
                <Field.Label fontWeight="medium" color="#34384D" fontSize="sm">
                  Email or Name
                </Field.Label>
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
                  <Icon as={FiMail} color="gray.400" />
                  <Input
                    variant="unstyled"
                    h="44px"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com or your name"
                    autoComplete="email"
                    required
                  />
                </HStack>
              </Field.Root>

              <Field.Root required>
                <Field.Label fontWeight="medium" color="#34384D" fontSize="sm">
                  Password
                </Field.Label>
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    color="gray.400"
                    onClick={() => setShowPassword((prev) => !prev)}
                    _hover={{ bg: "transparent", color: "#4545A5" }}
                    minW="auto"
                    h="auto"
                    px="0"
                  >
                    <Icon as={showPassword ? FiEyeOff : FiEye} />
                  </IconButton>
                </HStack>
              </Field.Root>

              {error && (
                <Box
                  bg="red.50"
                  color="red.600"
                  p={3}
                  borderRadius="lg"
                  fontSize="sm"
                  role="alert"
                  border="1px solid"
                  borderColor="red.200"
                >
                  {error}
                </Box>
              )}

              <Button
                type="submit"
                bg="#4545A5"
                color="white"
                size="lg"
                w="100%"
                borderRadius="lg"
                loading={loading}
                disabled={!identifier.trim() || !password}
                _hover={{ bg: "#353584" }}
                mt={1}
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          <Text textAlign="center" fontSize="xs" color="gray.400">
            Authorized administrators only
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}