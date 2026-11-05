import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaBriefcase, FaClock } from "react-icons/fa";

import Header from "../components/header";
import Footer from "../components/footer";
import { toaster } from "../../App"; 

// Localhost setup (commented out):
// const BACKEND_URL = "http://localhost:8000";
import { BACKEND_BASE_URL as BACKEND_URL } from "../../services/publicApi";

const pagePadding = {
  base: "20px",
  sm: "30px",
  md: "45px",
  lg: "180px",
  xl: "190px",
};

const fieldStyles = {
  height: "54px",
  borderRadius: "9px",
  border: "1px solid #d2d2d2",
  background: "#ffffff",
  color: "#333333",
  fontSize: "15px",
  paddingX: "15px",
  _placeholder: { color: "#777777" },
  _focusVisible: { borderColor: "#222222", boxShadow: "0 0 0 1px #222222" },
};

function createCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function CareerDetails() {
  const { jobTitle } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false); 

  const [captcha, setCaptcha] = useState(createCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // ✅ Added email state for strict validation

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/careers/`)
      .then((res) => res.json())
      .then((data) => {
        const jobs = Array.isArray(data) ? data : data.results ?? [];
        const foundJob = jobs.find((j) => {
          const slug = j.title.toLowerCase().trim().replace(/\s+/g, "-");
          return slug === jobTitle;
        });
        setJob(foundJob);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [jobTitle]);

  // ✅ Strict Phone Handler (Only digits, max 10)
  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 10) {
      setPhone(numericValue);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 1. Strict Email Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toaster.create({
        title: "Invalid Email Address",
        description: "Please enter a valid email format (e.g. name@example.com).",
        type: "warning",
        meta: { closable: true },
      });
      return;
    }

    // 2. Validate Phone (Exactly 10 digits)
    if (phone.length !== 10) {
      toaster.create({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number.",
        type: "warning",
        meta: { closable: true },
      });
      return;
    }

    // 3. Validate CAPTCHA
    if (captchaInput.trim().toUpperCase() !== captcha) {
      toaster.create({
        title: "Incorrect CAPTCHA",
        description: "Please try again.",
        type: "error",
        meta: { closable: true },
      });
      setCaptcha(createCaptcha());
      setCaptchaInput("");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("contact_number", phone); 
    formData.set("email", email); 

    try {
      const res = await fetch(`${BACKEND_URL}/api/careers/${job.id}/apply/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit application");

      setSubmitted(true);
      
      toaster.create({
        title: "Application Submitted!",
        description: "We will contact you shortly.",
        type: "success",
        meta: { closable: true },
      });
      
    } catch (err) {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
        meta: { closable: true },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center py="100px">
        <Spinner size="xl" color="#4545A5" />
      </Center>
    );
  }

  if (!job) {
    return (
      <Box p="100px" textAlign="center">
        Job not found.{" "}
        <Button onClick={() => navigate("/careers")}>Back to Careers</Button>
      </Box>
    );
  }

  return (
    <Box width="100%" bg="white" color="#292929" overflow="hidden">
      <Header />

      {/* JOB DETAILS */}
      <Box width="100%" background="#ffffff" paddingTop={{ base: "45px", md: "48px", lg: "36px" }} paddingBottom={{ base: "55px", md: "65px" }}>
        <Container maxWidth="1470px" paddingX={pagePadding}>
          <Heading as="h1" fontSize={{ base: "30px", sm: "36px", md: "44px" }} fontWeight="700" lineHeight="1.2" letterSpacing="-1px" color="#252525">
            {job.title}
          </Heading>

          <Text marginTop="7px" fontSize={{ base: "15px", md: "17px" }} color="#555555">
            Location: Sultan Bathery, Kerala
          </Text>

          <Flex direction={{ base: "column", sm: "row" }} alignItems={{ base: "flex-start", sm: "center" }} gap={{ base: "13px", sm: "25px", md: "30px" }} marginTop="23px" color="#666666" fontSize={{ base: "14px", md: "15px" }} flexWrap="wrap">
            <Flex alignItems="center" gap="9px"><Box color="#6093ec"><FaCalendarAlt /></Box><Text>Posted: Recently</Text></Flex>
            <Flex alignItems="center" gap="9px"><Box color="#6093ec"><FaBriefcase /></Box><Text>{job.experience}</Text></Flex>
            <Flex alignItems="center" gap="9px"><Box color="#888888"><FaClock /></Box><Text>Full Time</Text></Flex>
          </Flex>

          <Box marginTop={{ base: "40px", md: "43px" }}>
            <Heading as="h2" fontSize={{ base: "21px", md: "23px" }} fontWeight="600" color="#222222" marginBottom="14px">Job Description</Heading>
            <Text fontSize={{ base: "15px", md: "16px" }} lineHeight="1.6" color="#424242" whiteSpace="pre-line">{job.description}</Text>
          </Box>

          <Box marginTop={{ base: "37px", md: "41px" }}>
            <Heading as="h2" fontSize={{ base: "21px", md: "23px" }} fontWeight="600" color="#222222" marginBottom="12px">Key Responsibilities</Heading>
            <Text fontSize={{ base: "15px", md: "16px" }} lineHeight="1.6" color="#424242" whiteSpace="pre-line">{job.responsibilities}</Text>
          </Box>

          <Box marginTop={{ base: "35px", md: "39px" }}>
            <Heading as="h2" fontSize={{ base: "21px", md: "23px" }} fontWeight="600" color="#222222" marginBottom="12px">Requirements</Heading>
            <Text fontSize={{ base: "15px", md: "16px" }} lineHeight="1.6" color="#424242" whiteSpace="pre-line">{job.requirements}</Text>
          </Box>
        </Container>
      </Box>

      {/* APPLICATION FORM */}
      <Box width="100%" background="#ffffff" paddingTop={{ base: "20px", md: "25px" }} paddingBottom={{ base: "60px", md: "65px" }}>
        <Container maxWidth="1470px" paddingX={pagePadding}>
          <Heading as="h2" fontSize={{ base: "26px", md: "36px" }} fontWeight="700" lineHeight="1.2" color="#252525" marginBottom={{ base: "25px", md: "29px" }}>
            Apply for this Position
          </Heading>

          {submitted ? (
            <Box bg="green.50" border="1px solid" borderColor="green.200" p="40px" borderRadius="12px" textAlign="center">
              <Heading size="lg" color="green.600" mb="16px">Application Submitted Successfully!</Heading>
              <Text fontSize="lg" color="gray.700" mb="24px">
                Thank you for applying for the {job.title} position. Our team will review your application and get back to you shortly.
              </Text>
              <Button onClick={() => navigate("/careers")} bg="#4545A5" color="white" _hover={{ bg: "#353584" }}>
                View Other Openings
              </Button>
            </Box>
          ) : (
            <Box as="form" onSubmit={handleSubmit}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: "16px", md: "21px" }}>
                <Input {...fieldStyles} name="name" placeholder="Name" required />
                
                {/* ✅ Email with state and onChange */}
                <Input 
                  {...fieldStyles} 
                  name="email" 
                  type="email" 
                  placeholder="E-mail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                
                <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                  <Textarea
                    name="address"
                    placeholder="Address"
                    required
                    minHeight="75px"
                    resize="vertical"
                    borderRadius="9px"
                    border="1px solid #d2d2d2"
                    background="white"
                    color="#333333"
                    fontSize="15px"
                    padding="15px"
                    _placeholder={{ color: "#777777" }}
                    _focusVisible={{ borderColor: "#222222", boxShadow: "0 0 0 1px #222222" }}
                  />
                </Box>

                <Input 
                  {...fieldStyles} 
                  name="contact_number" 
                  type="tel" 
                  placeholder="Contact Number (10 digits)" 
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  required 
                />
                <Input {...fieldStyles} name="experience" placeholder="Experience" required />

                <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                  <Input {...fieldStyles} name="qualification" placeholder="Qualification" required />
                </Box>

                <Box gridColumn={{ base: "auto", md: "1 / -1" }} height="57px" border="1px solid #d2d2d2" borderRadius="9px" display="flex" alignItems="center" paddingX="15px" overflow="hidden">
                  <input type="file" name="resume" accept=".pdf,.doc,.docx" required style={{ width: "100%", fontSize: "14px", color: "#333333" }} />
                </Box>
              </SimpleGrid>

              <Flex marginTop="21px" direction={{ base: "column", sm: "row" }} alignItems={{ base: "stretch", sm: "center" }} gap="15px">
                <Flex height="53px" minWidth={{ base: "100%", sm: "128px" }} flex={{ base: "initial", sm: "0 0 128px" }} alignItems="center" justifyContent="center" borderRadius="9px" background="#eeeeee" color="#111111" fontSize="17px" fontWeight="700" letterSpacing="1px">
                  {captcha}
                </Flex>
                <Button type="button" height="53px" minWidth="64px" background="white" color="#111111" border="1px solid #d2d2d2" borderRadius="9px" fontSize="21px" onClick={() => { setCaptcha(createCaptcha()); setCaptchaInput(""); }} aria-label="Refresh CAPTCHA" _hover={{ background: "#f5f5f5" }}>↻</Button>
                <Input {...fieldStyles} flex="1" name="captcha" placeholder="Enter CAPTCHA" value={captchaInput} onChange={(event) => setCaptchaInput(event.target.value)} required />
              </Flex>

              <Button type="submit" width="100%" height="59px" marginTop="29px" background="#050505" color="white" borderRadius="9px" fontSize="16px" fontWeight="600" isLoading={isSubmitting} _hover={{ background: "#292929" }}>
                Apply Now
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

export default CareerDetails;