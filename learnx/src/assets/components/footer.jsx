import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Image,
  Text,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLinkedinIn,
  FaYoutube,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

import { getPublicSettings } from "../../services/publicApi";

function Footer() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getPublicSettings();
        const siteSettings = Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : data);
        setSettings(siteSettings || {});
      } catch (err) {
        console.error("Failed to load footer settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Courses", path: "/course" },
    { name: "Career", path: "/careers" },
    { name: "Blog", path: "/blog" },
    { name: "Contact Us", path: "/contact" },
  ];

  if (loading) {
    return (
      <Box background="#0b0b0b" color="white" width="100%" py={10} display="flex" justifyContent="center">
        <Spinner color="white" />
      </Box>
    );
  }

  return (
    <Box background="#0b0b0b" color="white" width="100%">
      <Container
        maxWidth="1470px"
        paddingX={{
          base: "25px",
          sm: "35px",
          md: "60px",
          lg: "90px",
          xl: "100px",
        }}
        paddingTop={{
          base: "60px",
          md: "75px",
          lg: "85px",
        }}
        paddingBottom={{
          base: "25px",
          md: "30px",
        }}
      >
        {/* ================= MAIN FOOTER ================= */}
        <SimpleGrid
          columns={{
            base: 1,
            md: 3,
          }}
          gap={{
            base: "50px",
            md: "45px",
            lg: "80px",
          }}
        >
          {/* ================= COLUMN 1 ================= */}
          <Box>
  <Image
    src="/images/svg-06.svg"
    alt="Appzia LearnX"
    width={{
      base: "125px",
      md: "140px",
    }}
    height="auto"
    objectFit="contain"
  />

  <Text
    // 👇 Reduced margin from 45px/50px down to 20px
    marginTop={{
      base: "-10px",
      md: "-15px",
    }}
    color="#d5d5d5"
    fontSize={{
      base: "15px",
      md: "16px",
    }}
    lineHeight="1.9"
    maxWidth="350px"
  >
    {/* Dynamic Address */}
    {settings?.address || "Address will be updated soon."}
  </Text>
</Box>

          {/* ================= COLUMN 2 ================= */}
          <Box>
            <Heading
              as="h3"
              fontSize={{
                base: "23px",
                md: "25px",
              }}
              fontWeight="700"
              color="white"
              position="relative"
              display="inline-block"
              paddingBottom="10px"
            >
              Quick Links
              <Box
                position="absolute"
                left="0"
                bottom="0"
                width="54px"
                height="4px"
                background="#ffffff"
                borderRadius="10px"
              />
            </Heading>

            <Flex direction="column" gap="13px" marginTop="25px">
              {quickLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  color="#d5d5d5"
                  fontSize={{
                    base: "15px",
                    md: "16px",
                  }}
                  textDecoration="none"
                  width="fit-content"
                  _hover={{
                    color: "#ffffff",
                    textDecoration: "none",
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </Flex>
          </Box>

          {/* ================= COLUMN 3 ================= */}
         <Box>
  <Heading
    as="h3"
    fontSize={{
      base: "23px",
      md: "25px",
    }}
    fontWeight="700"
    color="white"
    position="relative"
    display="inline-block"
    paddingBottom="10px"
  >
    Contact Us
    <Box
      position="absolute"
      left="0"
      bottom="0"
      width="54px"
      height="4px"
      background="#ffffff"
      borderRadius="10px"
    />
  </Heading>

  {/* PHONE */}
  {/* 👇 Reduced from 27px to 16px */}
  <Flex alignItems="center" gap="15px" marginTop="16px">
    <Flex
      width="45px"
      height="45px"
      flexShrink="0"
      borderRadius="50%"
      background="#242424"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontSize="16px"
    >
      <FaPhoneAlt />
    </Flex>
    <Text color="#d5d5d5" fontSize={{ base: "15px", md: "16px" }}>
      {settings?.phone || "+91 98765 43210"}
    </Text>
  </Flex>

  {/* EMAIL */}
  {/* 👇 Reduced from 18px to 12px */}
  <Flex alignItems="center" gap="15px" marginTop="12px">
    <Flex
      width="45px"
      height="45px"
      flexShrink="0"
      borderRadius="50%"
      background="#242424"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontSize="16px"
    >
      <FaEnvelope />
    </Flex>
    <Text color="#d5d5d5" fontSize={{ base: "15px", md: "16px" }}>
      {settings?.email || "info@appzialearnx.com"}
    </Text>
  </Flex>

  {/* LOCATION */}
  {/* 👇 Reduced from 18px to 12px */}
  <Flex alignItems="center" gap="15px" marginTop="12px">
    <Flex
      width="45px"
      height="45px"
      flexShrink="0"
      borderRadius="50%"
      background="#242424"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontSize="17px"
    >
      <FaMapMarkerAlt />
    </Flex>
    <Text color="#d5d5d5" fontSize={{ base: "15px", md: "16px" }}>
      {settings?.address || "Sultan Bathery, Kerala"}
    </Text>
  </Flex>

  {/* ================= SOCIAL ICONS ================= */}
  {/* 👇 Set marginTop to 24px to separate it from the address row */}
  <Flex gap="14px" marginTop="24px" flexWrap="wrap">
    {/* LINKEDIN */}
    <Link
      href={settings?.linkedin_url || "#"}
      isExternal
      width="45px"
      height="45px"
      borderRadius="50%"
      background="#242424"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontSize="17px"
      _hover={{ background: "#333333" }}
    >
      <FaLinkedinIn />
    </Link>

    {/* YOUTUBE */}
    <Link
      href={settings?.youtube_url || "#"}
      isExternal
      width="45px"
      height="45px"
      borderRadius="50%"
      background="#242424"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontSize="17px"
      _hover={{ background: "#333333" }}
    >
      <FaYoutube />
    </Link>

    {/* FACEBOOK */}
    <Link
      href={settings?.facebook_url || "#"}
      isExternal
      width="45px"
      height="45px"
      borderRadius="50%"
      background="#242424"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontSize="17px"
      _hover={{ background: "#333333" }}
    >
      <FaFacebookF />
    </Link>

    {/* INSTAGRAM */}
    <Link
      href={settings?.instagram_url || "#"}
      isExternal
      width="45px"
      height="45px"
      borderRadius="50%"
      background="#242424"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontSize="17px"
      _hover={{ background: "#333333" }}
    >
      <FaInstagram />
    </Link>

    {/* WHATSAPP */}
    <Link
      href="#" // Update this if you add a WhatsApp field to your backend later
      width="45px"
      height="45px"
      borderRadius="50%"
      background="#242424"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontSize="17px"
      _hover={{ background: "#333333" }}
    >
      <FaWhatsapp />
    </Link>
  </Flex>
</Box>
        </SimpleGrid>

        {/* ================= DIVIDER ================= */}
        <Box
          marginTop={{
            base: "55px",
            md: "65px",
          }}
          borderTop="1px solid #242424"
        />

        {/* ================= COPYRIGHT ================= */}
        <Text
          textAlign="center"
          marginTop="22px"
          color="#7fa4c7"
          fontSize={{
            base: "13px",
            md: "14px",
          }}
        >
          Copyright ©2025 All rights reserved | Design by{" "}
          <Box as="span" color="white" fontWeight="600">
            {settings?.institute_name || "Appzia Tec Solutions"}
          </Box>
        </Text>
      </Container>
    </Box>
  );
}

export default Footer;
