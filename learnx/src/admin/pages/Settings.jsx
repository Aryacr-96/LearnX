import { useState, useEffect } from "react";
import {
  Box, Button, Heading, Input, Text, VStack, Textarea, Spinner, 
  Flex, Icon, HStack, SimpleGrid, Dialog, Portal, CloseButton, 
  IconButton
} from "@chakra-ui/react";
import { 
  FiSave, FiFacebook, FiInstagram, FiLinkedin, FiYoutube, FiTwitter, 
  FiMapPin, FiClock, FiMail, FiMap, FiEdit3, FiTrash2, FiHome, FiPlus
} from "react-icons/fi";
import { toaster } from "../../App";
import { apiRequest } from "../services/api";

const FormField = ({ label, name, value, onChange, type = "text", isTextArea = false }) => (
  <Box mb={4}>
    <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.700">{label}</Text>
    {isTextArea ? (
      <Textarea name={name} value={value} onChange={onChange} bg="gray.50" borderRadius="lg" rows={3} _focus={{ bg: "white", borderColor: "purple.500" }} />
    ) : (
      <Input name={name} type={type} value={value} onChange={onChange} bg="gray.50" borderRadius="lg" _focus={{ bg: "white", borderColor: "purple.500" }} />
    )}
  </Box>
);

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    institute_name: "", email: "", phone: "", address: "",
    working_hours: "", google_map_url: "", facebook_url: "",
    instagram_url: "", linkedin_url: "", youtube_url: "", twitter_url: "",
  });

  const [editSection, setEditSection] = useState(null); 
  const [deleteSection, setDeleteSection] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiRequest("/settings/");
        const settings = Array.isArray(data) ? data[0] : (data.results ? data.results[0] : data);
        if (settings) {
          setFormData({
            institute_name: settings.institute_name || "",
            email: settings.email || "",
            phone: settings.phone || "",
            address: settings.address || "",
            working_hours: settings.working_hours || "",
            google_map_url: settings.google_map_url || "",
            facebook_url: settings.facebook_url || "",
            instagram_url: settings.instagram_url || "",
            linkedin_url: settings.linkedin_url || "",
            youtube_url: settings.youtube_url || "",
            twitter_url: settings.twitter_url || "",
          });
        }
      } catch (err) {
        toaster.create({ title: "Error loading settings", description: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); 
    if (val.length <= 10) setFormData({ ...formData, phone: val });
  };

  // 👇 Helper to clean the Google Maps URL (strips out <iframe> tags if pasted)
  const cleanMapUrl = (url) => {
    if (!url) return "";
    // If it contains src="...", extract just the URL
    const match = url.match(/src="([^"]+)"/);
    return match ? match[1] : url;
  };

  const handleSave = async () => {
    if (formData.phone && formData.phone.length !== 10) {
      toaster.create({ title: "Invalid Phone", description: "Phone number must be exactly 10 digits.", type: "warning" });
      return;
    }

    // 👇 Create a specific payload based on the section being edited
    let payload = {};
    if (editSection === 'institute') {
      payload = { institute_name: formData.institute_name, email: formData.email, phone: formData.phone };
    } else if (editSection === 'address') {
      payload = { address: formData.address, google_map_url: cleanMapUrl(formData.google_map_url) };
    } else if (editSection === 'hours') {
      payload = { working_hours: formData.working_hours };
    } else if (editSection === 'social') {
      payload = { 
        facebook_url: formData.facebook_url, instagram_url: formData.instagram_url,
        linkedin_url: formData.linkedin_url, youtube_url: formData.youtube_url, twitter_url: formData.twitter_url 
      };
    }

    setSaving(true);
    try {
      await apiRequest("/settings/", {
        method: "POST", 
        body: JSON.stringify(payload), // Sends ONLY the edited section
      });
      
      // Update local state so the UI reflects changes immediately
      setFormData((prev) => ({ ...prev, ...payload }));
      
      toaster.create({ title: "Settings saved successfully!", type: "success" });
      setEditSection(null); 
    } catch (err) {
      console.error("Backend Save Error:", err); 
      toaster.create({ title: "Error saving", description: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const updatedData = { ...formData };
    
    if (deleteSection === 'institute') { updatedData.institute_name = ""; updatedData.email = ""; updatedData.phone = ""; }
    if (deleteSection === 'address') { updatedData.address = ""; updatedData.google_map_url = ""; }
    if (deleteSection === 'hours') { updatedData.working_hours = ""; }
    if (deleteSection === 'social') { 
      updatedData.facebook_url = ""; updatedData.instagram_url = ""; 
      updatedData.linkedin_url = ""; updatedData.youtube_url = ""; updatedData.twitter_url = ""; 
    }

    // Send only the cleared fields for that section
    let payload = {};
    if (deleteSection === 'institute') payload = { institute_name: "", email: "", phone: "" };
    if (deleteSection === 'address') payload = { address: "", google_map_url: "" };
    if (deleteSection === 'hours') payload = { working_hours: "" };
    if (deleteSection === 'social') payload = { facebook_url: "", instagram_url: "", linkedin_url: "", youtube_url: "", twitter_url: "" };

    setSaving(true);
    try {
      await apiRequest("/settings/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setFormData(updatedData);
      toaster.create({ title: "Section deleted successfully", type: "info" });
      setDeleteSection(null);
    } catch (err) {
      console.error("Backend Delete Error:", err);
      toaster.create({ title: "Error deleting", description: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Flex justify="center" py={20}><Spinner size="xl" color="purple.500" /></Flex>;

  return (
    <Box maxW="1200px" mx="auto">
      
      <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="#20243A">Website Settings</Heading>
          <Text color="gray.500" mt={1}>Manage your institute's information in separate cards.</Text>
        </Box>
        <Button colorPalette="purple" onClick={() => setEditSection('institute')} px={6} borderRadius="lg" shadow="sm">
          <FiPlus /> Add New Info
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        
        {/* 1. Institute Info Card */}
        <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
          <Flex justify="space-between" align="flex-start" mb={4}>
            <HStack gap={3}>
              <Flex w={10} h={10} borderRadius="lg" bg="purple.50" color="purple.600" align="center" justify="center"><FiHome size={20} /></Flex>
              <Box>
                <Heading size="sm" color="gray.800">Institute Info</Heading>
                <Text fontSize="xs" color="gray.500">Name, Email & Phone</Text>
              </Box>
            </HStack>
            <HStack gap={1}>
              <IconButton size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditSection('institute')}>
                {(!formData.institute_name && !formData.email && !formData.phone) ? <FiPlus /> : <FiEdit3 />}
              </IconButton>
              <IconButton size="sm" variant="ghost" colorPalette="red" aria-label="Delete" onClick={() => setDeleteSection('institute')}><FiTrash2 /></IconButton>
            </HStack>
          </Flex>
          <VStack align="stretch" gap={3}>
            <Box><Text fontSize="xs" color="gray.400">Institute Name</Text><Text fontWeight="medium">{formData.institute_name || "—"}</Text></Box>
            <Box><Text fontSize="xs" color="gray.400">Email</Text><Text fontWeight="medium">{formData.email || "—"}</Text></Box>
            <Box><Text fontSize="xs" color="gray.400">Phone</Text><Text fontWeight="medium">{formData.phone || "—"}</Text></Box>
          </VStack>
        </Box>

        {/* 2. Location & Map Card */}
        <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
          <Flex justify="space-between" align="flex-start" mb={4}>
            <HStack gap={3}>
              <Flex w={10} h={10} borderRadius="lg" bg="blue.50" color="blue.600" align="center" justify="center"><FiMapPin size={20} /></Flex>
              <Box>
                <Heading size="sm" color="gray.800">Location</Heading>
                <Text fontSize="xs" color="gray.500">Address & Google Map</Text>
              </Box>
            </HStack>
            <HStack gap={1}>
              <IconButton size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditSection('address')}>
                {(!formData.address && !formData.google_map_url) ? <FiPlus /> : <FiEdit3 />}
              </IconButton>
              <IconButton size="sm" variant="ghost" colorPalette="red" aria-label="Delete" onClick={() => setDeleteSection('address')}><FiTrash2 /></IconButton>
            </HStack>
          </Flex>
          <VStack align="stretch" gap={3}>
            <Box><Text fontSize="xs" color="gray.400">Address</Text><Text fontWeight="medium">{formData.address || "—"}</Text></Box>
            {formData.google_map_url && (
              <Box h="120px" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.200">
                <iframe src={cleanMapUrl(formData.google_map_url)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </Box>
            )}
          </VStack>
        </Box>

        {/* 3. Working Hours Card */}
        <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
          <Flex justify="space-between" align="flex-start" mb={4}>
            <HStack gap={3}>
              <Flex w={10} h={10} borderRadius="lg" bg="orange.50" color="orange.600" align="center" justify="center"><FiClock size={20} /></Flex>
              <Box>
                <Heading size="sm" color="gray.800">Working Hours</Heading>
                <Text fontSize="xs" color="gray.500">Institute timings</Text>
              </Box>
            </HStack>
            <HStack gap={1}>
              <IconButton size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditSection('hours')}>
                {!formData.working_hours ? <FiPlus /> : <FiEdit3 />}
              </IconButton>
              <IconButton size="sm" variant="ghost" colorPalette="red" aria-label="Delete" onClick={() => setDeleteSection('hours')}><FiTrash2 /></IconButton>
            </HStack>
          </Flex>
          <Box><Text fontWeight="medium">{formData.working_hours || "—"}</Text></Box>
        </Box>

        {/* 4. Social Media Card */}
        <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
          <Flex justify="space-between" align="flex-start" mb={4}>
            <HStack gap={3}>
              <Flex w={10} h={10} borderRadius="lg" bg="pink.50" color="pink.600" align="center" justify="center"><FiTwitter size={20} /></Flex>
              <Box>
                <Heading size="sm" color="gray.800">Social Media</Heading>
                <Text fontSize="xs" color="gray.500">Social links</Text>
              </Box>
            </HStack>
            <HStack gap={1}>
              <IconButton size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditSection('social')}>
                {(!formData.facebook_url && !formData.instagram_url && !formData.linkedin_url && !formData.youtube_url && !formData.twitter_url) ? <FiPlus /> : <FiEdit3 />}
              </IconButton>
              <IconButton size="sm" variant="ghost" colorPalette="red" aria-label="Delete" onClick={() => setDeleteSection('social')}><FiTrash2 /></IconButton>
            </HStack>
          </Flex>
          <HStack gap={4} mt={2} wrap="wrap">
            {formData.facebook_url && <Icon as={FiFacebook} boxSize={6} color="#1877F2" />}
            {formData.instagram_url && <Icon as={FiInstagram} boxSize={6} color="#E1306C" />}
            {formData.linkedin_url && <Icon as={FiLinkedin} boxSize={6} color="#0A66C2" />}
            {formData.youtube_url && <Icon as={FiYoutube} boxSize={6} color="#FF0000" />}
            {formData.twitter_url && <Icon as={FiTwitter} boxSize={6} color="#1DA1F2" />}
            {!formData.facebook_url && !formData.instagram_url && !formData.linkedin_url && !formData.youtube_url && !formData.twitter_url && (
              <Text color="gray.400" fontSize="sm">No links added yet.</Text>
            )}
          </HStack>
        </Box>
      </SimpleGrid>

      {/* ================= EDIT MODAL ================= */}
      <Dialog.Root open={!!editSection} onOpenChange={(e) => { if(!e.open) setEditSection(null); }} size="md" placement="center">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(2px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
              
              <Dialog.Header px={6} py={4} bg="gray.50" borderBottomWidth="1px" borderColor="gray.100">
                <Dialog.Title fontWeight="bold" color="#20243A">
                  {editSection === 'institute' && (!formData.institute_name ? "Add Institute Info" : "Edit Institute Info")}
                  {editSection === 'address' && (!formData.address ? "Add Location" : "Edit Location")}
                  {editSection === 'hours' && (!formData.working_hours ? "Add Working Hours" : "Edit Working Hours")}
                  {editSection === 'social' && (!formData.facebook_url && !formData.instagram_url && !formData.linkedin_url ? "Add Social Media" : "Edit Social Media")}
                </Dialog.Title>
              </Dialog.Header>
              
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" mt={3} mr={3} />
              </Dialog.CloseTrigger>

              <Dialog.Body px={6} py={6} maxH="70vh" overflowY="auto">
                {editSection === 'institute' && (
                  <>
                    <FormField label="Institute Name" name="institute_name" value={formData.institute_name} onChange={handleChange} />
                    <FormField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <Box mb={4}>
                       <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.700">Phone Number</Text>
                       <Input name="phone" value={formData.phone} onChange={handlePhoneChange} maxLength={10} placeholder="10-digit number" bg="gray.50" borderRadius="lg" _focus={{ bg: "white", borderColor: "purple.500" }} />
                    </Box>
                  </>
                )}

                {editSection === 'address' && (
                  <>
                    <FormField label="Full Address" name="address" value={formData.address} onChange={handleChange} isTextArea />
                    <FormField label="Google Map Embed URL" name="google_map_url" value={formData.google_map_url} onChange={handleChange} />
                    <Text fontSize="xs" color="gray.500" mt={-2}>Paste the src URL from Google Maps Embed code.</Text>
                  </>
                )}

                {editSection === 'hours' && (
                  <FormField label="Working Hours" name="working_hours" value={formData.working_hours} onChange={handleChange} />
                )}

                {editSection === 'social' && (
                  <>
                    <FormField label="Facebook URL" name="facebook_url" value={formData.facebook_url} onChange={handleChange} />
                    <FormField label="Instagram URL" name="instagram_url" value={formData.instagram_url} onChange={handleChange} />
                    <FormField label="LinkedIn URL" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} />
                    <FormField label="YouTube URL" name="youtube_url" value={formData.youtube_url} onChange={handleChange} />
                    <FormField label="Twitter / X URL" name="twitter_url" value={formData.twitter_url} onChange={handleChange} />
                  </>
                )}
              </Dialog.Body>

              <Dialog.Footer px={6} py={4} bg="gray.50" borderTopWidth="1px" borderColor="gray.100">
                <HStack gap={3} w="full" justify="flex-end">
                  <Button variant="ghost" onClick={() => setEditSection(null)} borderRadius="lg">Cancel</Button>
                  <Button colorPalette="purple" onClick={handleSave} loading={saving} borderRadius="lg" px={6}>
                    <FiSave /> Save Section
                  </Button>
                </HStack>
              </Dialog.Footer>

            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* ================= DELETE MODAL ================= */}
      <Dialog.Root open={!!deleteSection} onOpenChange={(e) => { if(!e.open) setDeleteSection(null); }} size="md" placement="center">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(2px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
              <Dialog.Header px={6} py={4} bg="red.50" borderBottomWidth="1px" borderColor="red.100">
                <Dialog.Title fontWeight="bold" color="red.700">Delete Section Data</Dialog.Title>
              </Dialog.Header>
              
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" mt={3} mr={3} />
              </Dialog.CloseTrigger>

              <Dialog.Body px={6} py={6}>
                <Text fontSize="md" mb={3}>
                  Are you sure you want to delete the data for <strong>{deleteSection === 'institute' ? 'Institute Info' : deleteSection === 'address' ? 'Location' : deleteSection === 'hours' ? 'Working Hours' : 'Social Media'}</strong>?
                </Text>
                <Text fontSize="sm" color="gray.500">
                  This will clear these specific fields and remove them from the live website immediately. This action cannot be undone.
                </Text>
              </Dialog.Body>

              <Dialog.Footer px={6} py={4} bg="gray.50" borderTopWidth="1px" borderColor="gray.100">
                <HStack gap={3} w="full" justify="flex-end">
                  <Button variant="ghost" onClick={() => setDeleteSection(null)} borderRadius="lg">Cancel</Button>
                  <Button colorPalette="red" onClick={handleDelete} loading={saving} borderRadius="lg" px={6}>
                    <FiTrash2 /> Yes, Delete
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

    </Box>
  );
}