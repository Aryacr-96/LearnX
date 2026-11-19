
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  Textarea,
  Spinner,
  Flex,
  Icon,
  HStack,
  SimpleGrid,
  Dialog,
  Portal,
  CloseButton,
  IconButton,
  Separator,
  Badge,
} from "@chakra-ui/react";

import {
  FiSave,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiMessageCircle,
  FiMapPin,
  FiClock,
  FiMail,
  FiEdit3,
  FiTrash2,
  FiHome,
  FiPlus,
  FiGlobe,
  FiAlertTriangle,
} from "react-icons/fi";

import { toaster } from "../../App";
import { apiRequest } from "../services/api";

const PRIMARY = "#4545A5";
const PRIMARY_DARK = "#353584";
const LIGHT_PURPLE = "#EEEEFB";
const TEXT_DARK = "#20243A";
const DANGER = "#DB2777";

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  isTextArea = false,
  placeholder = "",
}) => (
  <Box>
    <Text fontWeight="600" fontSize="sm" mb={2} color="#34384D">
      {label}
    </Text>

    {isTextArea ? (
      <Textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        bg="gray.50"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="10px"
        rows={3}
        resize="vertical"
        _hover={{ borderColor: "gray.300" }}
        _focus={{
          bg: "white",
          borderColor: PRIMARY,
          boxShadow: `0 0 0 1px ${PRIMARY}`,
        }}
      />
    ) : (
      <Input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        bg="gray.50"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="10px"
        h="44px"
        _hover={{ borderColor: "gray.300" }}
        _focus={{
          bg: "white",
          borderColor: PRIMARY,
          boxShadow: `0 0 0 1px ${PRIMARY}`,
        }}
      />
    )}
  </Box>
);

const SectionHeader = ({ icon, title, subtitle, color, bg }) => (
  <HStack gap={3}>
    <Flex
      w="44px"
      h="44px"
      flexShrink={0}
      borderRadius="12px"
      bg={bg}
      color={color}
      align="center"
      justify="center"
    >
      <Icon as={icon} boxSize={5} />
    </Flex>

    <Box>
      <Heading size="sm" color={TEXT_DARK}>
        {title}
      </Heading>
      <Text fontSize="xs" color="gray.500" mt="3px">
        {subtitle}
      </Text>
    </Box>
  </HStack>
);

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    institute_name: "",
    email: "",
    phone: "",
    address: "",
    working_hours: "",
    google_map_url: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: "",
    whatsapp_url: "",
  });

  const [editSection, setEditSection] = useState(null);
  const [deleteSection, setDeleteSection] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiRequest("/settings/");

        const settings = Array.isArray(data)
          ? data[0]
          : data?.results
            ? data.results[0]
            : data;

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
            whatsapp_url: settings.whatsapp_url || "",
          });
        }
      } catch (err) {
        toaster.create({
          title: "Error loading settings",
          description: err.message,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");

    if (val.length <= 10) {
      setFormData((prev) => ({
        ...prev,
        phone: val,
      }));
    }
  };

  const cleanMapUrl = (url) => {
    if (!url) return "";

    const match = url.match(/src="([^"]+)"/);

    return match ? match[1] : url;
  };

  const handleSave = async () => {
    if (
      editSection === "institute" &&
      formData.phone &&
      formData.phone.length !== 10
    ) {
      toaster.create({
        title: "Invalid Phone",
        description: "Phone number must be exactly 10 digits.",
        type: "warning",
      });
      return;
    }

    let payload = {};

    if (editSection === "institute") {
      payload = {
        institute_name: formData.institute_name,
        email: formData.email,
        phone: formData.phone,
      };
    } else if (editSection === "address") {
      payload = {
        address: formData.address,
        google_map_url: cleanMapUrl(formData.google_map_url),
      };
    } else if (editSection === "hours") {
      payload = {
        working_hours: formData.working_hours,
      };
    } else if (editSection === "social") {
      payload = {
        facebook_url: formData.facebook_url,
        instagram_url: formData.instagram_url,
        linkedin_url: formData.linkedin_url,
        youtube_url: formData.youtube_url,
        whatsapp_url: formData.whatsapp_url,
      };
    }

    setSaving(true);

    try {
      await apiRequest("/settings/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setFormData((prev) => ({
        ...prev,
        ...payload,
      }));

      toaster.create({
        title: "Settings saved successfully!",
        type: "success",
      });

      setEditSection(null);
    } catch (err) {
      console.error("Backend Save Error:", err);

      toaster.create({
        title: "Error saving settings",
        description: err.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const updatedData = { ...formData };
    let payload = {};

    if (deleteSection === "institute") {
      updatedData.institute_name = "";
      updatedData.email = "";
      updatedData.phone = "";

      payload = {
        institute_name: "",
        email: "",
        phone: "",
      };
    }

    if (deleteSection === "address") {
      updatedData.address = "";
      updatedData.google_map_url = "";

      payload = {
        address: "",
        google_map_url: "",
      };
    }

    if (deleteSection === "hours") {
      updatedData.working_hours = "";

      payload = {
        working_hours: "",
      };
    }

    if (deleteSection === "social") {
      updatedData.facebook_url = "";
      updatedData.instagram_url = "";
      updatedData.linkedin_url = "";
      updatedData.youtube_url = "";
      updatedData.whatsapp_url = "";

      payload = {
        facebook_url: "",
        instagram_url: "",
        linkedin_url: "",
        youtube_url: "",
        whatsapp_url: "",
      };
    }

    setSaving(true);

    try {
      await apiRequest("/settings/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setFormData(updatedData);

      toaster.create({
        title: "Section deleted successfully",
        type: "success",
      });

      setDeleteSection(null);
    } catch (err) {
      console.error("Backend Delete Error:", err);

      toaster.create({
        title: "Error deleting section",
        description: err.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const sectionNames = {
    institute: "Institute Info",
    address: "Location",
    hours: "Working Hours",
    social: "Social Media",
  };

  const hasSocialLinks =
    formData.facebook_url ||
    formData.instagram_url ||
    formData.linkedin_url ||
    formData.youtube_url ||
    formData.whatsapp_url;

  const socialItems = [
    {
      key: "facebook_url",
      icon: FiFacebook,
      label: "Facebook",
      color: "#1877F2",
    },
    {
      key: "instagram_url",
      icon: FiInstagram,
      label: "Instagram",
      color: "#E1306C",
    },
    {
      key: "linkedin_url",
      icon: FiLinkedin,
      label: "LinkedIn",
      color: "#0A66C2",
    },
    {
      key: "youtube_url",
      icon: FiYoutube,
      label: "YouTube",
      color: "#FF0000",
    },
    {
      key: "whatsapp_url",
      icon: FiMessageCircle,
      label: "WhatsApp",
      color: "#25D366",
    },
  ];

  const renderCardActions = (section, hasData) => (
    <HStack gap={2}>
      <IconButton
        size="sm"
        variant="ghost"
        aria-label={hasData ? "Edit section" : "Add section"}
        color={PRIMARY}
        borderRadius="9px"
        onClick={() => setEditSection(section)}
        _hover={{ bg: LIGHT_PURPLE }}
      >
        <Icon as={hasData ? FiEdit3 : FiPlus} boxSize={4} />
      </IconButton>

      <IconButton
        size="sm"
        variant="ghost"
        aria-label="Delete section"
        color={DANGER}
        borderRadius="9px"
        disabled={!hasData}
        onClick={() => setDeleteSection(section)}
        _hover={{ bg: "#FDECF3" }}
      >
        <Icon as={FiTrash2} boxSize={4} />
      </IconButton>
    </HStack>
  );

  const renderInfo = (label, value, icon) => (
    <HStack align="start" gap={3}>
      {icon && (
        <Flex
          w="32px"
          h="32px"
          borderRadius="9px"
          bg="gray.50"
          color="gray.500"
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={4} />
        </Flex>
      )}

      <Box minW={0} flex="1">
        <Text fontSize="xs" color="gray.500" mb="3px">
          {label}
        </Text>
        <Text
          fontSize="sm"
          fontWeight="600"
          color={value ? TEXT_DARK : "gray.400"}
          wordBreak="break-word"
        >
          {value || "Not added yet"}
        </Text>
      </Box>
    </HStack>
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack gap={3}>
          <Spinner size="xl" color={PRIMARY} />
          <Text color="gray.500" fontSize="sm">
            Loading website settings...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" gap="24px">
      {/* Page Header */}
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <HStack gap={3}>
            <Flex
              w="46px"
              h="46px"
              borderRadius="13px"
              bg={LIGHT_PURPLE}
              color={PRIMARY}
              align="center"
              justify="center"
            >
              <Icon as={FiGlobe} boxSize={6} />
            </Flex>

            <Box>
              <Heading size="lg" color={TEXT_DARK}>
                Website Settings
              </Heading>

              <Text color="gray.500" fontSize="sm" mt="4px">
                Manage your institute information and website links.
              </Text>
            </Box>
          </HStack>
        </Box>

        <Button
          bg={PRIMARY}
          color="white"
          borderRadius="10px"
          h="44px"
          px={5}
          fontWeight="600"
          onClick={() => setEditSection("institute")}
          _hover={{ bg: PRIMARY_DARK }}
        >
          <FiPlus />
          Add New Info
        </Button>
      </Flex>

      {/* Settings Cards */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
        {/* Institute Information */}
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="18px"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="0 3px 14px rgba(0,0,0,0.035)"
          transition="all .2s"
          _hover={{ boxShadow: "0 6px 22px rgba(0,0,0,0.06)" }}
        >
          <Flex justify="space-between" align="start" mb={5}>
            <SectionHeader
              icon={FiHome}
              title="Institute Info"
              subtitle="Name, email and phone"
              color={PRIMARY}
              bg={LIGHT_PURPLE}
            />

            {renderCardActions(
              "institute",
              !!(
                formData.institute_name ||
                formData.email ||
                formData.phone
              )
            )}
          </Flex>

          <Separator borderColor="gray.100" mb={5} />

          <VStack align="stretch" gap={4}>
            {renderInfo("Institute Name", formData.institute_name)}
            {renderInfo("Email Address", formData.email, FiMail)}
            {renderInfo("Phone Number", formData.phone)}
          </VStack>
        </Box>

        {/* Location */}
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="18px"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="0 3px 14px rgba(0,0,0,0.035)"
          transition="all .2s"
          _hover={{ boxShadow: "0 6px 22px rgba(0,0,0,0.06)" }}
        >
          <Flex justify="space-between" align="start" mb={5}>
            <SectionHeader
              icon={FiMapPin}
              title="Location"
              subtitle="Address and Google Maps"
              color="#2563EB"
              bg="#EFF6FF"
            />

            {renderCardActions(
              "address",
              !!(formData.address || formData.google_map_url)
            )}
          </Flex>

          <Separator borderColor="gray.100" mb={5} />

          <VStack align="stretch" gap={4}>
            {renderInfo("Institute Address", formData.address, FiMapPin)}

            {formData.google_map_url ? (
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="xs" color="gray.500" fontWeight="600">
                    GOOGLE MAP PREVIEW
                  </Text>
                  <Badge
                    bg="#EFF6FF"
                    color="#2563EB"
                    borderRadius="full"
                    px={2}
                  >
                    Map added
                  </Badge>
                </HStack>

                <Box
                  h="145px"
                  borderRadius="12px"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="gray.200"
                  bg="gray.50"
                >
                  <iframe
                    src={cleanMapUrl(formData.google_map_url)}
                    title="Institute location map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </Box>
              </Box>
            ) : (
              <Box
                bg="gray.50"
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="12px"
                py={5}
                textAlign="center"
              >
                <Icon as={FiMapPin} color="gray.400" boxSize={6} mb={2} />
                <Text color="gray.500" fontSize="sm">
                  Google Map not added yet
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Working Hours */}
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="18px"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="0 3px 14px rgba(0,0,0,0.035)"
          transition="all .2s"
          _hover={{ boxShadow: "0 6px 22px rgba(0,0,0,0.06)" }}
        >
          <Flex justify="space-between" align="start" mb={5}>
            <SectionHeader
              icon={FiClock}
              title="Working Hours"
              subtitle="Institute timings"
              color="#EA580C"
              bg="#FFF7ED"
            />

            {renderCardActions("hours", !!formData.working_hours)}
          </Flex>

          <Separator borderColor="gray.100" mb={5} />

          <Box
            bg="#FFF7ED"
            borderRadius="12px"
            p={5}
            minH="95px"
          >
            <HStack align="start" gap={3}>
              <Flex
                w="36px"
                h="36px"
                borderRadius="10px"
                bg="white"
                color="#EA580C"
                align="center"
                justify="center"
              >
                <Icon as={FiClock} boxSize={5} />
              </Flex>

              <Box flex="1">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  BUSINESS HOURS
                </Text>

                <Text
                  fontWeight="600"
                  color={formData.working_hours ? TEXT_DARK : "gray.400"}
                  fontSize="sm"
                  whiteSpace="pre-wrap"
                >
                  {formData.working_hours || "Working hours not added yet"}
                </Text>
              </Box>
            </HStack>
          </Box>
        </Box>

        {/* Social Media */}
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="18px"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="0 3px 14px rgba(0,0,0,0.035)"
          transition="all .2s"
          _hover={{ boxShadow: "0 6px 22px rgba(0,0,0,0.06)" }}
        >
          <Flex justify="space-between" align="start" mb={5}>
            <SectionHeader
              icon={FiGlobe}
              title="Social Media"
              subtitle="Connect your social accounts"
              color="#DB2777"
              bg="#FCE7F3"
            />

            {renderCardActions("social", !!hasSocialLinks)}
          </Flex>

          <Separator borderColor="gray.100" mb={5} />

          {hasSocialLinks ? (
            <VStack align="stretch" gap={3}>
              {socialItems.map((item) =>
                formData[item.key] ? (
                  <HStack key={item.key} gap={3}>
                    <Flex
                      w="36px"
                      h="36px"
                      borderRadius="10px"
                      bg="gray.50"
                      align="center"
                      justify="center"
                    >
                      <Icon
                        as={item.icon}
                        color={item.color}
                        boxSize={5}
                      />
                    </Flex>

                    <Box minW={0} flex="1">
                      <Text fontSize="sm" fontWeight="600" color={TEXT_DARK}>
                        {item.label}
                      </Text>

                      <Text
                        fontSize="xs"
                        color="gray.500"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {formData[item.key]}
                      </Text>
                    </Box>

                    <Badge
                      bg="#ECFDF5"
                      color="#15803D"
                      borderRadius="full"
                    >
                      Added
                    </Badge>
                  </HStack>
                ) : null
              )}
            </VStack>
          ) : (
            <Box
              bg="gray.50"
              border="1px dashed"
              borderColor="gray.300"
              borderRadius="12px"
              py={6}
              textAlign="center"
            >
              <Icon as={FiGlobe} color="gray.400" boxSize={6} mb={2} />
              <Text color="gray.500" fontSize="sm">
                No social links added yet
              </Text>
            </Box>
          )}
        </Box>
      </SimpleGrid>

      {/* Edit Section Dialog */}
      <Dialog.Root
        open={!!editSection}
        onOpenChange={(e) => {
          if (!e.open && !saving) setEditSection(null);
        }}
        size="md"
        placement="center"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />

          <Dialog.Positioner px={4}>
            <Dialog.Content
              borderRadius="20px"
              overflow="hidden"
              bg="white"
              boxShadow="0 20px 60px rgba(0,0,0,0.18)"
              maxW="540px"
              w="100%"
            >
              <Dialog.Header
                px={6}
                py={5}
                bg="#F8F8FD"
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                <HStack gap={3}>
                  <Flex
                    w="42px"
                    h="42px"
                    borderRadius="12px"
                    bg={LIGHT_PURPLE}
                    color={PRIMARY}
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiEdit3} boxSize={5} />
                  </Flex>

                  <Box>
                    <Dialog.Title color={TEXT_DARK} fontSize="lg" fontWeight="700">
                      {editSection === "institute" &&
                        (formData.institute_name
                          ? "Edit Institute Info"
                          : "Add Institute Info")}

                      {editSection === "address" &&
                        (formData.address ? "Edit Location" : "Add Location")}

                      {editSection === "hours" &&
                        (formData.working_hours
                          ? "Edit Working Hours"
                          : "Add Working Hours")}

                      {editSection === "social" &&
                        (hasSocialLinks
                          ? "Edit Social Media"
                          : "Add Social Media")}
                    </Dialog.Title>

                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Update your website information below.
                    </Text>
                  </Box>
                </HStack>
              </Dialog.Header>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  position="absolute"
                  top="17px"
                  right="17px"
                  borderRadius="full"
                  color="gray.500"
                  disabled={saving}
                  _hover={{ bg: "gray.100" }}
                />
              </Dialog.CloseTrigger>

              <Dialog.Body px={6} py={6}>
                <VStack align="stretch" gap={4}>
                  {editSection === "institute" && (
                    <>
                      <FormField
                        label="Institute Name"
                        name="institute_name"
                        value={formData.institute_name}
                        onChange={handleChange}
                        placeholder="Enter institute name"
                      />

                      <FormField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                      />

                      <Box>
                        <Text fontWeight="600" fontSize="sm" mb={2} color="#34384D">
                          Phone Number
                        </Text>

                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          bg="gray.50"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="10px"
                          h="44px"
                          _focus={{
                            bg: "white",
                            borderColor: PRIMARY,
                            boxShadow: `0 0 0 1px ${PRIMARY}`,
                          }}
                        />
                      </Box>
                    </>
                  )}

                  {editSection === "address" && (
                    <>
                      <FormField
                        label="Full Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        isTextArea
                        placeholder="Enter your complete institute address"
                      />

                      <FormField
                        label="Google Map Embed URL"
                        name="google_map_url"
                        value={formData.google_map_url}
                        onChange={handleChange}
                        placeholder="Paste Google Maps embed URL"
                      />

                      <Box bg="#EEEEFB" borderRadius="10px" p={3}>
                        <HStack align="start" gap={2}>
                          <Icon as={FiMapPin} color={PRIMARY} mt="2px" />
                          <Text fontSize="xs" color="#4545A5" lineHeight="1.6">
                            Paste only the src URL from the Google Maps Embed
                            code. The map preview will appear in the Location
                            card after saving.
                          </Text>
                        </HStack>
                      </Box>
                    </>
                  )}

                  {editSection === "hours" && (
                    <FormField
                      label="Working Hours"
                      name="working_hours"
                      value={formData.working_hours}
                      onChange={handleChange}
                      isTextArea
                      placeholder="Example: Monday - Saturday, 9:00 AM - 6:00 PM"
                    />
                  )}

                  {editSection === "social" && (
                    <>
                      <FormField
                        label="Facebook URL"
                        name="facebook_url"
                        value={formData.facebook_url}
                        onChange={handleChange}
                        placeholder="https://facebook.com/..."
                      />

                      <FormField
                        label="Instagram URL"
                        name="instagram_url"
                        value={formData.instagram_url}
                        onChange={handleChange}
                        placeholder="https://instagram.com/..."
                      />

                      <FormField
                        label="LinkedIn URL"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/..."
                      />

                      <FormField
                        label="YouTube URL"
                        name="youtube_url"
                        value={formData.youtube_url}
                        onChange={handleChange}
                        placeholder="https://youtube.com/..."
                      />

                      <FormField
                        label="WhatsApp URL or Phone Number"
                        name="whatsapp_url"
                        value={formData.whatsapp_url}
                        onChange={handleChange}
                        placeholder="https://wa.me/919876543210"
                      />
                    </>
                  )}
                </VStack>
              </Dialog.Body>

              <Dialog.Footer
                px={6}
                py={4}
                bg="#F8F8FD"
                borderTop="1px solid"
                borderColor="gray.100"
              >
                <Flex
                  w="100%"
                  justify="flex-end"
                  gap={3}
                  direction={{ base: "column-reverse", sm: "row" }}
                >
                  <Button
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    borderRadius="10px"
                    h="44px"
                    px={5}
                    onClick={() => setEditSection(null)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    bg={PRIMARY}
                    color="white"
                    borderRadius="10px"
                    h="44px"
                    px={6}
                    loading={saving}
                    onClick={handleSave}
                    _hover={{ bg: PRIMARY_DARK }}
                  >
                    <FiSave />
                    Save Changes
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!deleteSection}
        onOpenChange={(e) => {
          if (!e.open && !saving) setDeleteSection(null);
        }}
        role="alertdialog"
        size="md"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(3px)" />

          <Dialog.Positioner px={4}>
            <Dialog.Content
              maxW="440px"
              w="100%"
              borderRadius="20px"
              overflow="hidden"
              bg="white"
              boxShadow="0 20px 60px rgba(0,0,0,0.18)"
            >
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  position="absolute"
                  top="16px"
                  right="16px"
                  color="gray.500"
                  borderRadius="full"
                  disabled={saving}
                  _hover={{ bg: "gray.100" }}
                />
              </Dialog.CloseTrigger>

              <Dialog.Header
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                pt={9}
                px={6}
                pb={2}
              >
                <Flex
                  w="66px"
                  h="66px"
                  borderRadius="full"
                  bg="#FDECF3"
                  color={DANGER}
                  align="center"
                  justify="center"
                  mb={4}
                >
                  <Icon as={FiAlertTriangle} boxSize={7} />
                </Flex>

                <Dialog.Title
                  color={TEXT_DARK}
                  fontSize="xl"
                  fontWeight="700"
                >
                  Delete {sectionNames[deleteSection]}?
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body px={7} pt={3} pb={6} textAlign="center">
                <Text
                  color="gray.600"
                  fontSize="sm"
                  lineHeight="1.8"
                  mb={5}
                >
                  Are you sure you want to permanently clear this section's
                  information? The changes will also be reflected on your live
                  website.
                </Text>

                <Box
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="12px"
                  p={4}
                >
                  <Text
                    color="gray.500"
                    fontSize="xs"
                    fontWeight="700"
                    letterSpacing="0.5px"
                  >
                    SELECTED SECTION
                  </Text>

                  <Text
                    color={TEXT_DARK}
                    fontWeight="700"
                    fontSize="md"
                    mt={1}
                  >
                    {sectionNames[deleteSection]}
                  </Text>
                </Box>
              </Dialog.Body>

              <Dialog.Footer
                px={7}
                pt={0}
                pb={7}
                justifyContent="center"
                gap={3}
                flexDirection={{ base: "column-reverse", sm: "row" }}
              >
                <Button
                  w={{ base: "100%", sm: "auto" }}
                  minW="130px"
                  h="45px"
                  variant="outline"
                  borderColor="gray.300"
                  borderRadius="10px"
                  onClick={() => setDeleteSection(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  w={{ base: "100%", sm: "auto" }}
                  minW="150px"
                  h="45px"
                  bg={DANGER}
                  color="white"
                  borderRadius="10px"
                  loading={saving}
                  onClick={handleDelete}
                  _hover={{ bg: "#BE185D" }}
                >
                  <FiTrash2 />
                  Yes, Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}

