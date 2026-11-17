import { useState, useEffect } from "react";
import {
  Box, Button, Heading, Input, Text, VStack, Checkbox, Badge, Flex,
  Spinner, HStack, Separator, Grid, GridItem, Avatar, Dialog, Portal,
  CloseButton, IconButton, Icon,
} from "@chakra-ui/react";
import { FiUserPlus, FiUsers, FiShield, FiSearch, FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { toaster } from "../../App";
import { apiRequest } from "../services/api"; 

const AVAILABLE_PERMISSIONS = [
  { key: "blogs", label: "Blogs" },
  { key: "courses", label: "Courses" },
  { key: "gallery", label: "Gallery" },
  { key: "placements", label: "Placements" },
  { key: "team", label: "Team" },
  { key: "technologies", label: "Technologies" },
  { key: "testimonials", label: "Testimonials" },
  { key: "careers", label: "Careers" },
  { key: "contacts", label: "Contact Messages" },
  { key: "hire_enquiries", label: "Hire Enquiries" },
  { key: "callbacks", label: "Callback Requests" },
  { key: "pages", label: "Pages" }, 
];

export default function ManageUsers() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  
  const [open, setOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setFetching(true);
      const data = await apiRequest("/admin/users/");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toaster.create({ title: "Error", description: err.message, type: "error" });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => {
    setEmail(""); setFirstName(""); setLastName("");
    setPassword(""); setPhone(""); setSelectedPerms([]); setShowPassword(false);
  };

  const handleCreate = async () => {
    // Check all mandatory fields
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !phone.trim() || !password.trim()) {
      toaster.create({ title: "Missing Fields", description: "All fields are mandatory.", type: "warning" });
      return;
    }

    if (phone.trim().length !== 10) {
      toaster.create({ title: "Invalid Phone", description: "Mobile number must be exactly 10 digits.", type: "warning" });
      return;
    }

    if (selectedPerms.length === 0) {
      toaster.create({ title: "Select Permissions", description: "Pick at least one module.", type: "warning" });
      return;
    }
    
    if (password.trim().length < 6) {
      toaster.create({ title: "Password too short", description: "Minimum 6 characters.", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/admin/create-subadmin/", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password: password.trim(),
          phone: phone.trim(),
          permissions: selectedPerms,
        }),
      });

      toaster.create({
        title: data.mail_error ? "Created (email failed)" : "Account created!",
        description: data.mail_error
          ? `Account made, but email failed: ${data.mail_error}`
          : data.message || `Credentials emailed to ${email}.`,
        type: data.mail_error ? "warning" : "success",
      });

      resetForm();
      setOpen(false);
      fetchUsers();
    } catch (err) {
      toaster.create({ title: "Could not create account", description: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const togglePerm = (key) =>
    setSelectedPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );

  const toggleActive = async (id) => {
    try {
      await apiRequest(`/admin/users/${id}/toggle/`, { method: "PATCH" });
      fetchUsers();
    } catch (err) {
      toaster.create({ title: "Error", description: err.message, type: "error" });
    }
  };

  // Handle phone input to only allow digits and max 10 chars
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (val.length <= 10) {
      setPhone(val);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box bg="gray.50" minH="100vh" py={10} px={{ base: 4, md: 8 }}>
      <Box maxW="1150px" mx="auto">
        
        <Flex align="center" justify="space-between" mb={8} wrap="wrap" gap={4}>
          <Box>
            <HStack gap={3} mb={1}>
              <Flex w={10} h={10} borderRadius="xl" bg="purple.100" align="center" justify="center" color="purple.600">
                <FiUsers size={20} />
              </Flex>
              <Heading size="xl" letterSpacing="tight">Manage Users</Heading>
            </HStack>
            <Text color="gray.500" ml={13}>Create sub-admin accounts and assign module permissions.</Text>
          </Box>
          <Button colorPalette="purple" borderRadius="lg" px={6} shadow="md" onClick={() => setOpen(true)}>
            <FiUserPlus /> Add Member
          </Button>
        </Flex>

        <Box bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200" boxShadow="0 4px 20px rgba(0,0,0,0.04)" overflow="hidden">
          <Flex px={6} py={4} bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" align="center" justify="space-between" gap={4} wrap="wrap">
            <HStack gap={3}>
              <FiUsers color="#6B46C1" />
              <Heading size="sm">Existing Accounts</Heading>
              <Badge colorPalette="purple" variant="subtle" borderRadius="full" px={3}>{users.length}</Badge>
            </HStack>
            <Flex align="center" gap={2} bg="white" px={3} py={1.5} borderRadius="lg" borderWidth="1px" borderColor="gray.200" minW="220px">
              <FiSearch color="#A0AEC0" />
              <Input size="sm" variant="flushed" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} _focus={{ outline: "none", boxShadow: "none" }} />
            </Flex>
          </Flex>

          {fetching ? (
            <Flex justify="center" py={16}><Spinner color="purple.500" size="lg" /></Flex>
          ) : filteredUsers.length === 0 ? (
            <Flex direction="column" align="center" py={16} gap={3}>
              <Text color="gray.500" fontWeight="medium">{search ? "No users match your search." : "No users created yet."}</Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#FAFAFA" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", color: "#718096", textTransform: "uppercase" }}>User</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", color: "#718096", textTransform: "uppercase" }}>Phone</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", color: "#718096", textTransform: "uppercase" }}>Role</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", color: "#718096", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", color: "#718096", textTransform: "uppercase" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #EDF2F7" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <HStack gap={3}>
                          <Avatar.Root size="sm" bg="purple.100" color="purple.700">
                            <Avatar.Fallback name={u.name || u.email} fontWeight="bold" />
                          </Avatar.Root>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.800">{u.name}</Text>
                            <Text fontSize="xs" color="gray.500">{u.email}</Text>
                          </Box>
                        </HStack>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <Text fontSize="sm" color="gray.700">{u.phone || "-"}</Text>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <Badge colorPalette={u.role === "subadmin" ? "purple" : "gray"} variant="subtle" borderRadius="full" px={3} py={1} textTransform="capitalize">{u.role}</Badge>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <HStack gap={2}>
                          <Box w={2} h={2} borderRadius="full" bg={u.is_active ? "green.400" : "red.400"} />
                          <Text fontSize="sm" fontWeight="medium" color={u.is_active ? "green.600" : "red.600"}>{u.is_active ? "Active" : "Disabled"}</Text>
                        </HStack>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <HStack gap={2} justify="flex-end">
                          {/* 👇 Delete button REMOVED here */}
                          <Button size="sm" variant={u.is_active ? "outline" : "solid"} colorPalette={u.is_active ? "red" : "green"} borderRadius="lg" onClick={() => toggleActive(u.id)}>
                            {u.is_active ? "Disable" : "Enable"}
                          </Button>
                        </HStack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Add Member Modal ── */}
      <Dialog.Root open={open} onOpenChange={(e) => { setOpen(e.open); if (!e.open) resetForm(); }} size="xl" scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="2xl">
              
              <Dialog.Header px={6} py={4} bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" borderTopRadius="2xl">
                <HStack gap={3}>
                  <Flex w={9} h={9} borderRadius="lg" bg="purple.100" align="center" justify="center" color="purple.600">
                    <FiUserPlus size={18} />
                  </Flex>
                  <Box>
                    <Dialog.Title fontWeight="bold">Add New Member</Dialog.Title>
                    <Text fontSize="xs" color="gray.500">Create a sub-admin account and assign permissions.</Text>
                  </Box>
                </HStack>
              </Dialog.Header>
              
              <Dialog.CloseTrigger asChild><CloseButton size="sm" /></Dialog.CloseTrigger>

              <Dialog.Body px={6} py={6}>
                <VStack align="stretch" gap={5}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <GridItem>
                      <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.700">Email <Text as="span" color="red.500">*</Text></Text>
                      <Input type="email" value={email} placeholder="user@example.com" onChange={(e) => setEmail(e.target.value)} borderRadius="lg" bg="gray.50" />
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.700">Password <Text as="span" color="red.500">*</Text></Text>
                      <HStack
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        px="12px"
                        bg="gray.50"
                        _focusWithin={{ borderColor: "#4545A5", bg: "white", boxShadow: "0 0 0 1px #4545A5" }}
                      >
                        <Icon as={FiLock} color="gray.400" />
                        <Input
                          variant="unstyled"
                          h="40px"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={password}
                          placeholder="Min 6 chars"
                          onChange={(e) => setPassword(e.target.value)}
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
                    </GridItem>
                  </Grid>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                    <GridItem>
                      <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.700">First Name <Text as="span" color="red.500">*</Text></Text>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} borderRadius="lg" bg="gray.50" />
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.700">Last Name <Text as="span" color="red.500">*</Text></Text>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} borderRadius="lg" bg="gray.50" />
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.700">Mobile Number <Text as="span" color="red.500">*</Text></Text>
                      <Input 
                        type="tel" 
                        value={phone} 
                        placeholder="10-digit number" 
                        onChange={handlePhoneChange} 
                        maxLength={10} 
                        borderRadius="lg" 
                        bg="gray.50" 
                      />
                    </GridItem>
                  </Grid>

                  <Separator />

                  <Box>
                    <Flex align="center" gap={2} mb={1}>
                      <FiShield size={14} color="#6B46C1" />
                      <Text fontWeight="bold" fontSize="sm" color="gray.700">Permissions <Text as="span" color="red.500">*</Text></Text>
                      {selectedPerms.length > 0 && <Badge colorPalette="purple" variant="subtle" size="sm" borderRadius="full">{selectedPerms.length} selected</Badge>}
                    </Flex>
                    <Text fontSize="xs" color="gray.500" mb={4}>Select which modules this user can access.</Text>

                    <Flex wrap="wrap" gap={2.5}>
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const active = selectedPerms.includes(perm.key);
                        return (
                          <Box key={perm.key} as="label" px={4} py={2.5} borderRadius="lg" cursor="pointer" borderWidth="1.5px" borderColor={active ? "purple.400" : "gray.200"} bg={active ? "purple.50" : "white"} color={active ? "purple.700" : "gray.600"} fontWeight={active ? "semibold" : "medium"} fontSize="sm">
                            <Checkbox.Root checked={active} onCheckedChange={() => togglePerm(perm.key)}>
                              <HStack gap={2}>
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>{perm.label}</Checkbox.Label>
                              </HStack>
                            </Checkbox.Root>
                          </Box>
                        );
                      })}
                    </Flex>
                  </Box>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer px={6} py={4} bg="gray.50" borderTopWidth="1px" borderColor="gray.200" borderBottomRadius="2xl">
                <HStack gap={3}>
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button 
                    type="button" 
                    colorPalette="purple" 
                    loading={loading} 
                    px={6}
                    onClick={handleCreate}
                  >
                    <FiUserPlus /> Create Account
                  </Button>
                </HStack>
              </Dialog.Footer>

            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* 👇 Delete Confirmation Modal has been completely removed */}
      
    </Box>
  );
}