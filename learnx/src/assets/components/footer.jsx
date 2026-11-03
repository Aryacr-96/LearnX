import React from "react";

import {
  Box,
  Container,
  Flex,
  Image,
  Text,
  Heading,
  Link,
  SimpleGrid,
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

function Footer() {
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Courses", path: "/course" },
    { name: "Career", path: "/careers" },
    { name: "Blog", path: "/blog" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <Box
      background="#0b0b0b"
      color="white"
      width="100%"
    >
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
                base: "45px",
                md: "50px",
              }}
              color="#d5d5d5"
              fontSize={{
                base: "15px",
                md: "16px",
              }}
              lineHeight="1.9"
              maxWidth="350px"
            >
              Co-Op Employees Society Building, 24/656,
              <br />
              Near Municipal Stadium,
              <br />
              Sultan Bathery, Kerala 673592
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
              marginTop="27px"
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
                fontSize={{
                  base: "15px",
                  md: "16px",
                }}
              >
                +91 98765 43210
              </Text>
            </Flex>

            {/* EMAIL */}

            <Flex
              alignItems="center"
              gap="15px"
              marginTop="18px"
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
                fontSize={{
                  base: "15px",
                  md: "16px",
                }}
              >
                info@appzialearnx.com
              </Text>
            </Flex>

            {/* LOCATION */}

            <Flex
              alignItems="center"
              gap="15px"
              marginTop="18px"
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
                fontSize={{
                  base: "15px",
                  md: "16px",
                }}
              >
                Sultan Bathery, Kerala
              </Text>
            </Flex>

            {/* ================= SOCIAL ICONS ================= */}

            <Flex
              gap="14px"
              marginTop="50px"
              flexWrap="wrap"
            >
              {/* LINKEDIN */}

              <Link
                href="#"
                width="45px"
                height="45px"
                borderRadius="50%"
                background="#242424"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="17px"
                _hover={{
                  background: "#333333",
                }}
              >
                <FaLinkedinIn />
              </Link>

              {/* YOUTUBE */}

              <Link
                href="#"
                width="45px"
                height="45px"
                borderRadius="50%"
                background="#242424"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="17px"
                _hover={{
                  background: "#333333",
                }}
              >
                <FaYoutube />
              </Link>

              {/* FACEBOOK */}

              <Link
                href="#"
                width="45px"
                height="45px"
                borderRadius="50%"
                background="#242424"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="17px"
                _hover={{
                  background: "#333333",
                }}
              >
                <FaFacebookF />
              </Link>

              {/* INSTAGRAM */}

              <Link
                href="#"
                width="45px"
                height="45px"
                borderRadius="50%"
                background="#242424"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="17px"
                _hover={{
                  background: "#333333",
                }}
              >
                <FaInstagram />
              </Link>

              {/* WHATSAPP */}

              <Link
                href="#"
                width="45px"
                height="45px"
                borderRadius="50%"
                background="#242424"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="17px"
                _hover={{
                  background: "#333333",
                }}
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
          <Box
            as="span"
            color="white"
            fontWeight="600"
          >
            Appzia Tec Solutions
          </Box>
        </Text>
      </Container>
    </Box>
  );
}

export default Footer;