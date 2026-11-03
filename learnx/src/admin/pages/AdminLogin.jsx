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
} from "@chakra-ui/react";
import { FiLock, FiUser } from "react-icons/fi";
import { adminLogin } from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(username.trim(), password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="#F7F8FC">
      {/* Left brand panel */}
      <Box
        flex="1"
        display={{ base: "none", lg: "flex" }}
        bgGradient="linear(135deg, #4545A5, #6B6BD6)"
        color="white"
        align="center"
        justify="center"
        p="60px"
      >
        <VStack align="flex-start" gap="24px" maxW="420px">
          <Flex
            w="52px"
            h="52px"
            borderRadius="14px"
            bg="whiteAlpha.200"
            align="center"
            justify="center"
            fontWeight="bold"
            fontSize="lg"
          >
            LX
          </Flex>
          <Heading size="2xl" lineHeight="1.2">
            LearnX Admin Console
          </Heading>
          <Text color="whiteAlpha.800" fontSize="md" lineHeight="1.7">
            Manage your blogs, courses, gallery, enquiries and website content
            — all in one place.
          </Text>
        </VStack>
      </Box>

      {/* Right form panel */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        px={{ base: 4, md: 8 }}
        py={8}
      >
        <Box w="100%" maxW="420px">
          <VStack gap={6} align="stretch">
            <Box>
              <Heading size="xl" color="#20243A">
                Welcome back
              </Heading>
              <Text mt={2} color="gray.500" fontSize="sm">
                Sign in with your Django superuser account
              </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                <Field.Root required>
                  <Field.Label fontWeight="medium" color="#34384D">
                    Username
                  </Field.Label>
                  <HStack
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    px="12px"
                    bg="white"
                    _focusWithin={{
                      borderColor: "#4545A5",
                      boxShadow: "0 0 0 1px #4545A5",
                    }}
                  >
                    <Icon as={FiUser} color="gray.400" />
                    <Input
                      variant="unstyled"
                      h="46px"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      required
                    />
                  </HStack>
                </Field.Root>

                <Field.Root required>
                  <Field.Label fontWeight="medium" color="#34384D">
                    Password
                  </Field.Label>
                  <HStack
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    px="12px"
                    bg="white"
                    _focusWithin={{
                      borderColor: "#4545A5",
                      boxShadow: "0 0 0 1px #4545A5",
                    }}
                  >
                    <Icon as={FiLock} color="gray.400" />
                    <Input
                      variant="unstyled"
                      h="46px"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
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
                  disabled={!username.trim() || !password}
                  _hover={{ bg: "#353584" }}
                  mt={2}
                >
                  Sign In
                </Button>
              </VStack>
            </Box>

            <Text textAlign="center" fontSize="xs" color="gray.500">
              Authorized administrators only
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}