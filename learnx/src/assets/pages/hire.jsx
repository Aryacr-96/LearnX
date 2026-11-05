import React, { useState } from "react";
import {
  Box,
  Container,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Input,
  Button,
  Tag,
} from "@chakra-ui/react";

import Header from "../components/header";
import Footer from "../components/footer";
import { toaster } from "../../App";

// Localhost setup (commented out):
// const BACKEND_URL = "http://localhost:8000";
import { BACKEND_BASE_URL as BACKEND_URL } from "../../services/publicApi";

const features = [
  {
    icon: "🎓",
    title: "Industry-Ready Talent",
    description: "Our students are trained in modern technologies and real-world projects.",
  },
  {
    icon: "⚡",
    title: "Quick Onboarding",
    description: "Hire candidates who can contribute from day one without long training.",
  },
  {
    icon: "🤝",
    title: "Strong Work Ethic",
    description: "Handpicked graduates with dedication and a passion for problem-solving.",
  },
  {
    icon: "🌍",
    title: "Diverse Skillsets",
    description: "From frontend to full stack, UI/UX, and data — find the right fit for your needs.",
  },
];

const SUGGESTED_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst",
  "Data Scientist", "UI/UX Designer", "Software Tester", "DevOps Engineer",
  "Digital Marketer", "Graphic Designer", "Python Developer", "React Developer",
];

function Hire() {
  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
  });

  const [jobRoles, setJobRoles] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Specific handler for phone to block letters
  const handlePhoneChange = (e) => {
    // Remove any character that is not a digit
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setForm((prev) => ({ ...prev, phone: numericValue }));
  };

  const addRole = (role) => {
    const cleanRole = role.trim();
    if (cleanRole && !jobRoles.includes(cleanRole)) {
      setJobRoles((prev) => [...prev, cleanRole]);
    }
    setRoleInput("");
    setShowSuggestions(false);
  };

  const removeRole = (roleToRemove) => {
    setJobRoles((prev) => prev.filter((role) => role !== roleToRemove));
  };

  const handleRoleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (roleInput.trim()) {
        addRole(roleInput);
      }
    } else if (e.key === "Backspace" && !roleInput && jobRoles.length > 0) {
      removeRole(jobRoles[jobRoles.length - 1]);
    }
  };

  const filteredSuggestions = SUGGESTED_ROLES.filter(
    (role) =>
      role.toLowerCase().includes(roleInput.toLowerCase()) &&
      !jobRoles.includes(role)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate phone is exactly 10 digits
    if (form.phone.length !== 10) {
      toaster.create({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number.",
        type: "warning",
        meta: { closable: true },
      });
      return;
    }

    if (jobRoles.length === 0) {
      toaster.create({
        title: "Job Roles Required",
        description: "Please add at least one job role.",
        type: "warning",
        meta: { closable: true },
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        job_roles: jobRoles,
      };

      const res = await fetch(`${BACKEND_URL}/api/hire-enquiries/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.detail ||
            JSON.stringify(errorData) ||
            "Failed to submit request."
        );
      }

      toaster.create({
        title: "Request Submitted!",
        description: "Our team will contact you shortly.",
        type: "success",
        meta: { closable: true },
      });

      setForm({ company_name: "", contact_person: "", email: "", phone: "" });
      setJobRoles([]);
      setRoleInput("");
      event.target.reset();
    } catch (err) {
      toaster.create({
        title: "Submission Failed",
        description: err.message,
        type: "error",
        meta: { closable: true },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box
        width="100%"
        background="#f7f9fc"
        paddingTop={{ base: "45px", md: "65px", lg: "75px" }}
        paddingBottom={{ base: "60px", md: "80px", lg: "90px" }}
      >
        <Container
          maxWidth="1470px"
          paddingX={{ base: "20px", sm: "30px", md: "45px", lg: "180px", xl: "190px" }}
        >
          <Box textAlign="center" marginBottom={{ base: "35px", md: "45px" }}>
            <Heading
              as="h1"
              fontSize={{ base: "30px", sm: "34px", md: "38px", lg: "40px" }}
              lineHeight="1.2"
              fontWeight="800"
              color="#101a30"
            >
              Hire From Us
            </Heading>
            <Text
              marginTop="10px"
              fontSize={{ base: "14px", md: "16px" }}
              lineHeight="1.4"
              color="#40516b"
              maxWidth="650px"
              marginX="auto"
            >
              Looking for skilled and job-ready professionals? Register your
              company and connect with our talented graduates.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: "35px", md: "45px", lg: "46px" }} alignItems="center">
            <Box
              background="#ffffff"
              border="1px solid #dfe6f0"
              borderRadius="16px"
              padding={{ base: "24px", sm: "28px", md: "30px" }}
              boxShadow="0 2px 5px rgba(15, 23, 42, 0.04)"
            >
              <Heading as="h2" fontSize={{ base: "20px", md: "21px" }} fontWeight="600" color="#111827" marginBottom="22px">
                Company Registration
              </Heading>

              <Box as="form" onSubmit={handleSubmit}>
                {/* COMPANY NAME */}
                <Box marginBottom="16px">
                  <Text as="label" htmlFor="company_name" display="block" fontSize="14px" fontWeight="500" color="#17243b" marginBottom="6px">
                    Company Name
                  </Text>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    placeholder="Enter your company name"
                    required
                    height="44px"
                    paddingX="12px"
                    border="1px solid #cbd7e8"
                    borderRadius="11px"
                    background="#ffffff"
                    fontSize="14px"
                    color="#17243b"
                    _placeholder={{ color: "#778397" }}
                    _focus={{ borderColor: "#64748b", boxShadow: "0 0 0 1px #64748b" }}
                  />
                </Box>

                {/* CONTACT PERSON */}
                <Box marginBottom="16px">
                  <Text as="label" htmlFor="contact_person" display="block" fontSize="14px" fontWeight="500" color="#17243b" marginBottom="6px">
                    Contact Person
                  </Text>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    value={form.contact_person}
                    onChange={handleChange}
                    placeholder="Enter contact person name"
                    required
                    height="44px"
                    paddingX="12px"
                    border="1px solid #cbd7e8"
                    borderRadius="11px"
                    background="#ffffff"
                    fontSize="14px"
                    color="#17243b"
                    _placeholder={{ color: "#778397" }}
                    _focus={{ borderColor: "#64748b", boxShadow: "0 0 0 1px #64748b" }}
                  />
                </Box>

                {/* EMAIL */}
                <Box marginBottom="16px">
                  <Text as="label" htmlFor="email" display="block" fontSize="14px" fontWeight="500" color="#17243b" marginBottom="6px">
                    Email
                  </Text>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    height="44px"
                    paddingX="12px"
                    border="1px solid #cbd7e8"
                    borderRadius="11px"
                    background="#ffffff"
                    fontSize="14px"
                    color="#17243b"
                    _placeholder={{ color: "#778397" }}
                    _focus={{ borderColor: "#64748b", boxShadow: "0 0 0 1px #64748b" }}
                  />
                </Box>

                {/* PHONE (Only Digits Allowed) */}
                <Box marginBottom="16px">
                  <Text as="label" htmlFor="phone" display="block" fontSize="14px" fontWeight="500" color="#17243b" marginBottom="6px">
                    Phone
                  </Text>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handlePhoneChange} // ✅ Uses the new handler
                    placeholder="Enter 10-digit phone number"
                    required
                    maxLength="10"
                    height="44px"
                    paddingX="12px"
                    border="1px solid #cbd7e8"
                    borderRadius="11px"
                    background="#ffffff"
                    fontSize="14px"
                    color="#17243b"
                    _placeholder={{ color: "#778397" }}
                    _focus={{ borderColor: "#64748b", boxShadow: "0 0 0 1px #64748b" }}
                  />
                </Box>

                {/* JOB ROLES */}
                <Box marginBottom="22px" position="relative">
                  <Text as="label" display="block" fontSize="14px" fontWeight="500" color="#17243b" marginBottom="6px">
                    Job Roles
                  </Text>
                  <Flex
                    flexWrap="wrap"
                    gap="8px"
                    p="8px 12px"
                    border="1px solid #cbd7e8"
                    borderRadius="11px"
                    background="#ffffff"
                    minH="44px"
                    align="center"
                    _focusWithin={{ borderColor: "#64748b", boxShadow: "0 0 0 1px #64748b" }}
                  >
                    {jobRoles.map((role) => (
                      <Tag.Root key={role} size="md" borderRadius="full" variant="solid" bg="#EEEEFB" color="#4545A5">
                        <Tag.Label>{role}</Tag.Label>
                        <Tag.CloseTrigger onClick={() => removeRole(role)} />
                      </Tag.Root>
                    ))}
                    <Box flex="1" minW="120px">
                      <Input
                        variant="unstyled"
                        value={roleInput}
                        onChange={(e) => {
                          setRoleInput(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onKeyDown={handleRoleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder={jobRoles.length === 0 ? "e.g. Frontend Developer" : ""}
                        height="30px"
                        px="4px"
                        fontSize="14px"
                        color="#17243b"
                        _placeholder={{ color: "#778397" }}
                      />
                    </Box>
                  </Flex>

                  {showSuggestions && roleInput && filteredSuggestions.length > 0 && (
                    <Box
                      position="absolute"
                      top="100%"
                      left="0"
                      right="0"
                      mt="4px"
                      bg="white"
                      borderRadius="12px"
                      boxShadow="xl"
                      border="1px solid"
                      borderColor="gray.100"
                      maxH="200px"
                      overflowY="auto"
                      zIndex="dropdown"
                    >
                      {filteredSuggestions.map((suggestion) => (
                        <Box
                          key={suggestion}
                          px="16px"
                          py="10px"
                          cursor="pointer"
                          _hover={{ bg: "#F8F8FF", color: "#4545A5" }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addRole(suggestion)}
                          fontSize="14px"
                          color="#17243b"
                        >
                          {suggestion}
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Text fontSize="12px" color="#778397" mt="4px">
                    Press Enter or comma (,) to add multiple roles.
                  </Text>
                </Box>

                <Button
                  type="submit"
                  width="100%"
                  height="52px"
                  background="#000000"
                  color="#ffffff"
                  borderRadius="9px"
                  fontSize="15px"
                  fontWeight="600"
                  _hover={{ background: "#222222" }}
                  _active={{ background: "#333333" }}
                  loading={loading}
                >
                  Submit
                </Button>
              </Box>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={{ base: "20px", md: "22px" }}>
              {features.map((feature) => (
                <Flex
                  key={feature.title}
                  direction="column"
                  alignItems="flex-start"
                  background="#ffffff"
                  border="1px solid #dfe6f0"
                  borderRadius="16px"
                  padding={{ base: "24px", md: "23px" }}
                  minHeight={{ base: "210px", sm: "250px", md: "282px" }}
                  boxShadow="0 1px 3px rgba(15, 23, 42, 0.02)"
                  transition="border-color 0.2s ease"
                  _hover={{ borderColor: "#b8c6d9" }}
                >
                  <Flex
                    width="39px"
                    height="39px"
                    flexShrink="0"
                    alignItems="center"
                    justifyContent="center"
                    background="#10182d"
                    borderRadius="9px"
                    fontSize="19px"
                    marginBottom="16px"
                  >
                    {feature.icon}
                  </Flex>
                  <Heading as="h3" fontSize={{ base: "17px", md: "17px" }} fontWeight="600" lineHeight="1.4" color="#111827" marginBottom="7px">
                    {feature.title}
                  </Heading>
                  <Text fontSize="14px" lineHeight="1.5" color="#40516b">
                    {feature.description}
                  </Text>
                </Flex>
              ))}
            </SimpleGrid>
          </SimpleGrid>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default Hire;