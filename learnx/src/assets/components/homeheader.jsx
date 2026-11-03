
import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Button,
  Icon,
  VStack,
  Drawer,
  Portal,
  CloseButton,
} from "@chakra-ui/react";

import {
  FaPhoneAlt,
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaArrowLeft,
  FaBars,
} from "react-icons/fa";

import EnquiryModal from "./enquirymodal";

const banners = [
  {
    image: "/images/school1.jpg",
    title: "Launch Your Tech Career in Wayanad",
    subtitle:
      "Get industry-ready with hands-on training in Full Stack Development, Software Testing, and Data Science at Appzia LearnX. Learn, build, and innovate—from the heart of Wayanad.",
    cta: "Book A Callback",
  },
  {
    image: "/images/school2.jpg",
    title: "Unlock Your Future with Appzia LearnX in Wayanad",
    subtitle:
      "Explore industry-driven courses—in Full Stack Development, Software Testing, Data Science, Accounting, and Digital Marketing. Get hands-on skills and kickstart your career, right here in Wayanad.",
    cta: "Book A Callback",
  },
];

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Courses", path: "/course" },
  { name: "Blog", path: "/blog" },
  { name: "Careers", path: "/careers" },
  { name: "Gallery", path: "/gallery" },
  { name: "Hire", path: "/hire" },
  { name: "Placements", path: "/placements" },
  { name: "Contact", path: "/contact" },
];

function HomeHeader() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isEnquiryOpen, setIsEnquiryOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const openEnquiry = () => {
    setIsMobileMenuOpen(false);
    setIsEnquiryOpen(true);
  };

  const closeEnquiry = () => setIsEnquiryOpen(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Box
        position="relative"
        width="100%"
        height={{ base: "auto", md: "100vh" }}
        minH={{ base: "680px", md: "700px" }}
        overflow="hidden"
        fontFamily="'Inter', sans-serif"
      >
        {/* BACKGROUND BANNER SLIDES */}
        {banners.map((banner, index) => (
          <Box
            key={index}
            position="absolute"
            inset="0"
            opacity={index === activeIndex ? 1 : 0}
            transition="opacity 1s ease-in-out"
            zIndex={0}
            pointerEvents="none"
          >
            <Image
              src={banner.image}
              alt={banner.title}
              width="100%"
              height="100%"
              objectFit="cover"
              objectPosition="center"
            />

            <Box
              position="absolute"
              inset="0"
              bg="rgba(0, 0, 0, 0.45)"
            />
          </Box>
        ))}

        {/* TOP NAVIGATION */}
        <Box
          position="relative"
          zIndex={10}
          pt={{ base: "16px", md: "30px" }}
          px={{ base: "16px", sm: "22px", md: "40px" }}
        >
          <Flex
            align="center"
            justify="space-between"
            gap="12px"
          >
            {/* LOGO */}
            <Link
              to="/"
              style={{ display: "block", flexShrink: 0 }}
            >
              <Image
                src="/images/svg-06.svg"
                alt="Appzia LearnX"
                width={{ base: "125px", sm: "145px", md: "170px" }}
                mt={{ base: "0", md: "-35px" }}
                height="auto"
                objectFit="contain"
              />
            </Link>

            {/* DESKTOP NAVIGATION */}
            <Flex
              align="center"
              gap={{ lg: "5px", xl: "8px" }}
              mr={{ lg: "40px", xl: "100px" }}
              bg="rgba(255,255,255,0.08)"
              backdropFilter="blur(12px)"
              border="1px solid rgba(255,255,255,0.15)"
              borderRadius="full"
              px={{ lg: "12px", xl: "20px" }}
              py="10px"
              mt="-35px"
              flexWrap="wrap"
              display={{ base: "none", lg: "flex" }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ textDecoration: "none" }}
                >
                  <Text
                    color="white"
                    fontFamily="'Inter', sans-serif"
                    fontSize="15px"
                    fontWeight="700"
                    cursor="pointer"
                    px={{ lg: "6px", xl: "10px" }}
                    transition="opacity 0.2s ease"
                    _hover={{ opacity: 0.7 }}
                  >
                    {link.name}
                  </Text>
                </Link>
              ))}

              <Button
                type="button"
                onClick={openEnquiry}
                cursor="pointer"
                bg="white"
                color="#111"
                borderRadius="full"
                fontSize="14px"
                fontWeight="700"
                px="20px"
                height="38px"
                _hover={{ bg: "#f3f4f6" }}
                ml="6px"
              >
                Enquire Now
              </Button>
            </Flex>

            {/* MOBILE MENU BUTTON */}
            <Button
              display={{ base: "flex", lg: "none" }}
              alignItems="center"
              justifyContent="center"
              aria-label="Open navigation menu"
              onClick={() => setIsMobileMenuOpen(true)}
              bg="rgba(255,255,255,0.15)"
              color="white"
              border="1px solid rgba(255,255,255,0.4)"
              borderRadius="12px"
              boxSize="46px"
              minW="46px"
              p="0"
              _hover={{ bg: "rgba(255,255,255,0.25)" }}
            >
              <Icon as={FaBars} boxSize="21px" />
            </Button>
          </Flex>
        </Box>

        {/* MOBILE DRAWER MENU - CHAKRA UI */}
        <Drawer.Root
          open={isMobileMenuOpen}
          onOpenChange={(details) =>
            setIsMobileMenuOpen(details.open)
          }
          placement="end"
          size="xs"
        >
          <Portal>
            <Drawer.Backdrop zIndex={1000} />
            <Drawer.Positioner zIndex={1001}>
              <Drawer.Content
                bg="#111827"
                color="white"
                maxW="320px"
              >
                <Drawer.Header
                  borderBottom="1px solid rgba(255,255,255,0.15)"
                  py="20px"
                >
                  <Flex align="center" justify="space-between">
                    <Image
                      src="/images/svg-06.svg"
                      alt="Appzia LearnX"
                      width="135px"
                      height="auto"
                      objectFit="contain"
                    />

                    <Drawer.CloseTrigger asChild>
                      <CloseButton
                        size="lg"
                        color="white"
                        aria-label="Close navigation menu"
                      />
                    </Drawer.CloseTrigger>
                  </Flex>
                </Drawer.Header>

                <Drawer.Body py="20px" px="20px">
                  <VStack align="stretch" gap="0">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ textDecoration: "none" }}
                      >
                        <Text
                          fontSize="16px"
                          fontWeight="700"
                          py="13px"
                          px="10px"
                          borderBottom="1px solid rgba(255,255,255,0.1)"
                          transition="background 0.2s ease"
                          _hover={{
                            bg: "rgba(255,255,255,0.1)",
                          }}
                        >
                          {link.name}
                        </Text>
                      </Link>
                    ))}

                    <Button
                      mt="24px"
                      width="100%"
                      height="46px"
                      bg="white"
                      color="#111827"
                      borderRadius="full"
                      fontWeight="700"
                      onClick={openEnquiry}
                      _hover={{ bg: "#e5e7eb" }}
                    >
                      Enquire Now
                    </Button>
                  </VStack>
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>

        {/* LEFT SOCIAL ICON STRIP - DESKTOP ONLY */}
        <VStack
          position="absolute"
          left={{ base: "10px", md: "20px" }}
          top="50%"
          transform="translateY(-50%)"
          gap="25px"
          zIndex={5}
          display={{ base: "none", md: "flex" }}
        >
          {[
            FaArrowLeft,
            FaPhoneAlt,
            FaWhatsapp,
            FaInstagram,
            FaFacebookF,
            FaYoutube,
            FaLinkedinIn,
          ].map((IconComponent, index) => (
            <Flex
              key={index}
              align="center"
              justify="center"
              color="white"
              fontSize="22px"
              cursor="pointer"
              transition="transform 0.2s ease"
              _hover={{ transform: "scale(1.2)" }}
            >
              <Icon as={IconComponent} />
            </Flex>
          ))}
        </VStack>

        {/* HERO CONTENT */}
        <Flex
          position="relative"
          zIndex={3}
          direction="column"
          align="flex-end"
          justify="center"
          textAlign="right"
          width="100%"
          px={{ base: "20px", sm: "28px", md: "60px" }}
          pt={{ base: "30px", md: "0" }}
          minH={{
            base: "490px",
            sm: "500px",
            md: "calc(100vh - 200px)",
          }}
        >
          <Heading
            as="h1"
            color="white"
            fontFamily="'Inter', sans-serif"
            fontSize={{
              base: "32px",
              sm: "38px",
              md: "46px",
              lg: "56px",
            }}
            fontWeight="800"
            lineHeight="1.15"
            maxWidth="1000px"
            mb={{ base: "18px", md: "24px" }}
            key={`title-${activeIndex}`}
          >
            {banners[activeIndex].title}
          </Heading>

          <Text
            color="rgba(255,255,255,0.9)"
            fontFamily="'Inter', sans-serif"
            fontSize={{ base: "14px", sm: "16px", md: "18px" }}
            lineHeight="1.7"
            maxWidth="900px"
            mb={{ base: "24px", md: "36px" }}
            key={`sub-${activeIndex}`}
          >
            {banners[activeIndex].subtitle}
          </Text>

          {/* BOOK A CALLBACK BUTTON */}
          <Button
            type="button"
            onClick={openEnquiry}
            cursor="pointer"
            bg="rgba(255,255,255,0.1)"
            color="white"
            border="1px solid rgba(255,255,255,0.5)"
            backdropFilter="blur(10px)"
            borderRadius="full"
            height={{ base: "48px", md: "54px" }}
            px={{ base: "24px", md: "34px" }}
            mr={{ base: "0", md: "250px" }}
            fontFamily="'Inter', sans-serif"
            fontSize={{ base: "14px", md: "16px" }}
            fontWeight="600"
            _hover={{ bg: "rgba(255,255,255,0.2)" }}
            position="relative"
            zIndex={5}
          >
            {banners[activeIndex].cta}
          </Button>
        </Flex>

        {/* BOTTOM-LEFT CALL CARD */}
        <Flex
          position="absolute"
          bottom={{ base: "22px", md: "60px" }}
          left={{ base: "18px", md: "90px" }}
          align="center"
          gap="12px"
          zIndex={5}
          color="white"
          fontFamily="'Inter', sans-serif"
        >
          <Flex
            align="center"
            justify="center"
            boxSize={{ base: "40px", md: "48px" }}
            flexShrink={0}
            borderRadius="full"
            border="2px solid rgba(255,255,255,0.6)"
          >
            <Icon as={FaPhoneAlt} fontSize="16px" />
          </Flex>

          <Box>
            <Text
              fontSize={{ base: "11px", md: "13px" }}
              color="rgba(255,255,255,0.8)"
            >
              Have any questions?
            </Text>

            <Text
              fontSize={{ base: "14px", md: "18px" }}
              fontWeight="700"
              letterSpacing="0.5px"
            >
              98765 43210
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* ENQUIRY MODAL */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={closeEnquiry}
      />
    </>
  );
}

export default HomeHeader;
