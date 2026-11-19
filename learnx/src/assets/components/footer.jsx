
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

        const siteSettings = Array.isArray(data)
          ? data[0]
          : data?.results
          ? data.results[0]
          : data;

        setSettings(siteSettings || {});
      } catch (err) {
        console.error("Failed to load footer settings", err);
        setSettings({});
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

  // Convert WhatsApp number into a WhatsApp link if needed.
  const getWhatsAppUrl = (value) => {
    if (!value) return "";

    const trimmedValue = String(value).trim();

    if (/^https?:\/\//i.test(trimmedValue)) {
      return trimmedValue;
    }

    const phoneNumber = trimmedValue.replace(/\D/g, "");

    return phoneNumber
      ? `https://wa.me/${phoneNumber}`
      : "";
  };

  // Social media links from Website Settings.
  const socialLinks = [
    {
      url: settings?.linkedin_url,
      icon: FaLinkedinIn,
      label: "LinkedIn",
      color: "#0A66C2",
    },
    {
      url: settings?.youtube_url,
      icon: FaYoutube,
      label: "YouTube",
      color: "#FF0000",
    },
    {
      url: settings?.facebook_url,
      icon: FaFacebookF,
      label: "Facebook",
      color: "#1877F2",
    },
    {
      url: settings?.instagram_url,
      icon: FaInstagram,
      label: "Instagram",
      color: "#E1306C",
    },
    {
      url: getWhatsAppUrl(settings?.whatsapp_url),
      icon: FaWhatsapp,
      label: "WhatsApp",
      color: "#25D366",
    },
  ];

  if (loading) {
    return (
      <Box
        background="#0b0b0b"
        color="white"
        width="100%"
        py={10}
        display="flex"
        justifyContent="center"
      >
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

            <Flex
              direction="column"
              gap="13px"
              marginTop="25px"
            >
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
            <Flex
              alignItems="center"
              gap="15px"
              marginTop="16px"
            >
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

              <Text
                color="#d5d5d5"
                fontSize={{ base: "15px", md: "16px" }}
              >
                {settings?.phone || "+91 98765 43210"}
              </Text>
            </Flex>

            {/* EMAIL */}
            <Flex
              alignItems="center"
              gap="15px"
              marginTop="12px"
            >
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

              <Text
                color="#d5d5d5"
                fontSize={{ base: "15px", md: "16px" }}
                wordBreak="break-word"
              >
                {settings?.email || "info@appzialearnx.com"}
              </Text>
            </Flex>

            {/* LOCATION */}
            <Flex
              alignItems="center"
              gap="15px"
              marginTop="12px"
            >
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

              <Text
                color="#d5d5d5"
                fontSize={{ base: "15px", md: "16px" }}
                wordBreak="break-word"
              >
                {settings?.address || "Sultan Bathery, Kerala"}
              </Text>
            </Flex>

            {/* ================= SOCIAL MEDIA LINKS ================= */}
            <Flex
              gap="14px"
              marginTop="24px"
              flexWrap="wrap"
              alignItems="center"
            >
              {socialLinks
                .filter((item) => item.url)
                .map((item) => (
                  <Link
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    width="45px"
                    height="45px"
                    flexShrink="0"
                    borderRadius="50%"
                    background="#242424"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="18px"
                    transition="all 0.3s ease"
                    _hover={{
                      background: item.color,
                      color: "white",
                      transform: "translateY(-5px)",
                    }}
                  >
                    <item.icon />
                  </Link>
                ))}
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
          <Box
            as="span"
            color="white"
            fontWeight="600"
          >
            {settings?.institute_name || "Appzia Tec Solutions"}
          </Box>
        </Text>
      </Container>
    </Box>
  );
}

export default Footer;
