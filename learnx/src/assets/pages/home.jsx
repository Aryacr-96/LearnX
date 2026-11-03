
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Image,
  Button,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react";
import { FiArrowLeft, FiArrowRight, FiImage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import EnquiryModal from "../components/enquirymodal";
import HomeHeader from "../components/homeheader";
import Footer from "../components/footer";

// ============================================================
// CENTRAL IMAGE MAP (Kept for other sections)
// ============================================================
const IMG = {
  about1: "/images/pic1.jpg",
  about2: "/images/pic2.jpg",
  about3: "/images/pic3.jpg",
  whyChoose: "/images/svg-06.svg",
  ctaImages: [
    "/images/pic1.jpg",
    "/images/pic2.jpg",
    "/images/pic3.jpg",
    "/images/school2.jpg",
  ],
  certMicrosoft: "/images/microsoft.png",
  certGoogle: "/images/google.webp",
  certIBM: "/images/ibm.png",
  partnerIBM: "/images/ibm.png",
  partnerGoogle: "/images/google.webp",
  partnerMicrosoft: "/images/microsoft.png",
  float1: "/images/school1.jpg",
  float2: "/images/school2.jpg",
  float3: "/images/retreat.webp",
  float4: "/images/pic1.jpg",
  float5: "/images/pic2.jpg",
  float6: "/images/pic3.jpg",
};

const BACKEND_URL = "http://localhost:8000";

const pagePadding = {
  base: "20px",
  sm: "30px",
  md: "45px",
  lg: "180px",
  xl: "190px",
};

// ============================================================
// CERTIFICATES & PARTNERS
// ============================================================
const certificateImages = [
  { name: "Microsoft", image: IMG.certMicrosoft },
  { name: "Google", image: IMG.certGoogle },
  { name: "IBM", image: IMG.certIBM },
  { name: "Google", image: IMG.certGoogle },
  { name: "IBM", image: IMG.certIBM },
];

const partners = [
  { name: "IBM", image: IMG.partnerIBM },
  { name: "Google", image: IMG.partnerGoogle },
  { name: "Microsoft", image: IMG.partnerMicrosoft },
  { name: "Google", image: IMG.partnerGoogle },
  { name: "Microsoft", image: IMG.partnerMicrosoft },
  { name: "IBM", image: IMG.partnerIBM },
];

// ============================================================
// FLOATING AVATARS
// ============================================================
const floatingAvatars = [
  { image: IMG.float1, top: "12%", left: "12%", borderColor: "#f472b6", size: "85px" },
  { image: IMG.float2, top: "12%", right: "12%", borderColor: "#60a5fa", size: "80px" },
  { image: IMG.float3, top: "48%", left: "6%", borderColor: "#fbbf24", size: "95px" },
  { image: IMG.float4, top: "48%", right: "6%", borderColor: "#f87171", size: "95px" },
  { image: IMG.float5, bottom: "8%", left: "18%", borderColor: "#a78bfa", size: "85px" },
  { image: IMG.float6, bottom: "8%", right: "18%", borderColor: "#34d399", size: "85px" },
];

// ============================================================
// HELPERS
// ============================================================
function SectionLabel({ children }) {
  return (
    <Text fontSize="16px" color="#64748b" letterSpacing="0.3px" mb="12px">
      ~ {children}
    </Text>
  );
}

function AboutImages() {
  return (
    <Flex
      width="100%"
      align="center"
      justify="center"
      gap={{ base: "12px", md: "24px" }}
      minWidth={0}
    >
      <Image
        src={IMG.about1}
        alt="Technology"
        width="22%"
        height={{ base: "150px", md: "265px" }}
        objectFit="cover"
        borderRadius="12px"
        flexShrink={0}
      />

      <Image
        src={IMG.about2}
        alt="Student learning"
        width="39%"
        height={{ base: "290px", md: "468px" }}
        objectFit="cover"
        borderRadius="12px"
        flexShrink={0}
      />

      <Image
        src={IMG.about3}
        alt="Student portrait"
        width="30%"
        height={{ base: "235px", md: "366px" }}
        objectFit="cover"
        borderRadius="12px"
        flexShrink={0}
      />
    </Flex>
  );
}

function TechCard({ image, label }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Box
      height={{ base: "180px", md: "270px" }}
      borderRadius="20px"
      overflow="hidden"
      boxShadow="0 10px 22px rgba(0,0,0,0.09)"
      bg="#f3f4f6"
      position="relative"
      cursor="pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={image}
        alt={label}
        width="100%"
        height="100%"
        objectFit="cover"
        transform={hovered ? "scale(1.06)" : "scale(1)"}
        transition="transform 0.4s ease"
        fallback={<Box width="100%" height="100%" bg="gray.200" />}
      />

      <Box
        position="absolute"
        inset="0"
        bg="rgba(0,0,0,0.4)"
        opacity={hovered ? 1 : 0}
        transition="opacity 0.3s ease"
        pointerEvents="none"
      />

      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform={
          hovered
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.9)"
        }
        bg="white"
        color="#111"
        px="22px"
        py="12px"
        borderRadius="6px"
        fontWeight="bold"
        fontSize="14px"
        letterSpacing="0.5px"
        opacity={hovered ? 1 : 0}
        transition="all 0.3s ease"
        pointerEvents="none"
        whiteSpace="nowrap"
        boxShadow="0 4px 12px rgba(0,0,0,0.15)"
      >
        {label}
      </Box>
    </Box>
  );
}

function CTAImageRotator({ images }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <Box
      width="100%"
      height={{ base: "300px", md: "550px" }}
      borderRadius="8px"
      overflow="hidden"
      position="relative"
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`LearnX student ${i + 1}`}
          position="absolute"
          inset="0"
          width="100%"
          height="100%"
          objectFit="cover"
          opacity={i === index ? 1 : 0}
          transition="opacity 0.8s ease-in-out"
        />
      ))}
    </Box>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
function Home() {
  const navigate = useNavigate();
  const [activeStudent, setActiveStudent] = React.useState(0);

  const [dbCourses, setDbCourses] = useState([]);
  const [dbTechs, setDbTechs] = useState([]);
  const [dbTestimonials, setDbTestimonials] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/courses/`)
      .then((res) => res.json())
      .then((data) =>
        setDbCourses(Array.isArray(data) ? data : data.results ?? [])
      )
      .catch((err) => console.error("Error fetching home courses:", err));

    fetch(`${BACKEND_URL}/api/technologies/`)
      .then((res) => res.json())
      .then((data) =>
        setDbTechs(Array.isArray(data) ? data : data.results ?? [])
      )
      .catch((err) => console.error("Error fetching technologies:", err));

    fetch(`${BACKEND_URL}/api/testimonials/`)
      .then((res) => res.json())
      .then((data) =>
        setDbTestimonials(Array.isArray(data) ? data : data.results ?? [])
      )
      .catch((err) => console.error("Error fetching testimonials:", err));
  }, []);

  // Auto-Scroll Logic
  useEffect(() => {
    if (dbTestimonials.length <= 1) return;

    const timer = setInterval(() => {
      setActiveStudent((current) =>
        current === dbTestimonials.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [dbTestimonials.length, activeStudent]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;

    const cleanPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

    return `${BACKEND_URL}${cleanPath}`;
  };

  const previousStudent = () => {
    if (dbTestimonials.length === 0) return;

    setActiveStudent((current) =>
      current === 0 ? dbTestimonials.length - 1 : current - 1
    );
  };

  const nextStudent = () => {
    if (dbTestimonials.length === 0) return;

    setActiveStudent((current) =>
      current === dbTestimonials.length - 1 ? 0 : current + 1
    );
  };

  const currentStudent = dbTestimonials[activeStudent] || {};

  return (
    <Box bg="white" color="#151b2e" overflow="hidden">
      <HomeHeader />

      {/* ABOUT SECTION */}
      <Container
        maxWidth="1470px"
        paddingX={pagePadding}
        pt={{ base: "60px", md: "95px" }}
        pb={{ base: "70px", md: "100px" }}
      >
        <Grid
          templateColumns={{ base: "1fr", lg: "1.15fr 0.85fr" }}
          gap={{ base: "45px", lg: "70px" }}
          alignItems="center"
        >
          <AboutImages />

          <Box>
            <SectionLabel>About Us</SectionLabel>

            <Heading
              fontSize={{ base: "30px", md: "44px" }}
              fontWeight="700"
              lineHeight="1.2"
              letterSpacing="-0.7px"
              marginBottom="26px"
            >
              Our Trending IT Courses
            </Heading>

            <Text
              color="#64748b"
              fontSize={{ base: "15px", md: "17px" }}
              lineHeight="1.85"
              textAlign="justify"
              mb="32px"
            >
              And let's be honest: landing a job isn't just about technical
              skills. That's why our programs go beyond coding and software.
              We weave in soft skills training, resume workshops, and mock
              interviews so you walk into any interview with confidence. We'll
              help you communicate your ideas clearly, present your work
              effectively, and navigate the hiring process with a little less
              stress and a lot more self-belief.
            </Text>

            <Text
              color="#64748b"
              fontSize={{ base: "15px", md: "17px" }}
              lineHeight="1.85"
              textAlign="justify"
            >
              As we pave the path for a more promising future in the sector, we
              invite you to realize your potential and reach new heights with
              our certified courses in Wayanad. Join us at Appzia LearnX and
              become part of a community that learns, builds, and grows
              together. Your journey into the world of technology starts here
              — right in the heart of Wayanad.
            </Text>
          </Box>
        </Grid>
      </Container>

      {/* TRENDING COURSES */}
      <Container
        maxWidth="1470px"
        paddingX={pagePadding}
        mt={{ base: "-50px", md: "-75px" }}
        py={{ base: "60px", md: "90px" }}
      >
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap="25px"
          mb="50px"
        >
          <Box maxWidth="420px">
            <SectionLabel>Courses</SectionLabel>

            <Heading
              color="#262626"
              fontSize={{ base: "34px", md: "44px" }}
              lineHeight="1.2"
            >
              Our Trending IT Courses
            </Heading>
          </Box>

          <Text
            maxWidth="625px"
            color="#64748b"
            fontSize="17px"
            lineHeight="1.8"
            textAlign="justify"
          />
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="34px">
          {dbCourses.length > 0 ? (
            dbCourses.map((course) => (
              <Box
                key={course.id}
                cursor="pointer"
                onClick={() => navigate(`/course/${course.slug}`)}
                transition="transform 0.3s ease"
                _hover={{ transform: "translateY(-5px)" }}
              >
                {/* COURSE IMAGE OR PLACEHOLDER */}
                {course.image ? (
                  <Image
                    src={getImageUrl(course.image)}
                    alt={course.title}
                    w="100%"
                    h="220px"
                    objectFit="cover"
                    borderRadius="12px"
                  />
                ) : (
                  <Flex
                    width="100%"
                    height="220px"
                    bg="#F1F5F9"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                    direction="column"
                    gap="10px"
                    color="#94A3B8"
                  >
                    <Box fontSize="35px">
                      <FiImage />
                    </Box>

                    <Text fontSize="14px" fontWeight="500">
                      No Image Available
                    </Text>
                  </Flex>
                )}

                <Heading mt={4} size="lg">
                  {course.title}
                </Heading>

                <Text mt={2} color="gray.600">
                  {course.duration}
                </Text>
              </Box>
            ))
          ) : (
            <Text color="gray.500">
              No courses available right now.
            </Text>
          )}
        </SimpleGrid>
      </Container>

      {/* WHY CHOOSE US */}
      <Container
        maxWidth="1470px"
        paddingX={pagePadding}
        py={{ base: "60px", md: "90px" }}
      >
        <Grid
          templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }}
          gap={{ base: "45px", lg: "80px" }}
          alignItems="center"
        >
          <Box>
            <SectionLabel>WHY CHOOSE US</SectionLabel>

            <Heading
              fontSize={{ base: "30px", md: "40px" }}
              color="#262626"
              mb="20px"
            >
              We Help To Get Solutions
            </Heading>

            <Text
              color="#64748b"
              fontSize="17px"
              lineHeight="1.8"
              textAlign="justify"
              mb="32px"
            >
              So, what sets Appzia LearnX apart from other institutions? For
              us, it’s all about learning through projects. We believe that
              learning technology is all about building things, solving
              problems, and gaining confidence. Our founders, being from the
              tech industry themselves, have designed each and every course
              based on what’s actually required by companies today. This is
              why students from all over the district prefer us as their first
              choice for the best training institute in Wayanad.
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="25px">
              {[
                ["Industry-Ready Skills", "We teach you what industry needs."],
                ["Expert Trainers", "Get trained by industry experts."],
                ["Internship", "Get industry experience in just two months."],
                ["Placement Support", "We assist in resume creation and interview skills."],
                ["Hands-On Learning", "Get practical experience on live projects using latest tools."],
                ["Certified Courses", "Get certified and add value to your career."],
              ].map(([title, description]) => (
                <Flex key={title} gap="14px" align="flex-start">
                  <Text fontSize="27px" color="#111" lineHeight="1">
                    ✦
                  </Text>

                  <Box>
                    <Text
                      color="#111"
                      fontSize="18px"
                      fontWeight="600"
                      mb="3px"
                    >
                      {title}
                    </Text>

                    <Text color="#64748b" fontSize="15px" lineHeight="1.5">
                      {description}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>

          <Box position="relative" pb="35px">
            <Image
              src={IMG.whyChoose}
              alt="Technology training"
              width="100%"
              height={{ base: "300px", md: "540px" }}
              objectFit="cover"
              borderRadius="14px"
              bg="black"
            />

            <Box
              position="absolute"
              bottom="0"
              left="50%"
              transform="translateX(-50%)"
              bg="black"
              color="white"
              width="260px"
              maxWidth="85%"
              p="25px"
              borderRadius="14px"
              textAlign="center"
              boxShadow="0 10px 25px rgba(0,0,0,0.15)"
            >
              <Heading fontSize="18px" mb="8px">
                Looking for help?
              </Heading>

              <Text fontSize="14px" lineHeight="1.4">
                Lorem Ipsum is simply dummy text of the printing and
                typesetting industry.
              </Text>
            </Box>
          </Box>
        </Grid>
      </Container>

      {/* TECHNOLOGIES */}
      <Container
        maxWidth="1470px"
        paddingX={pagePadding}
        mt={{ base: "-10px", md: "-30px" }}
        py={{ base: "60px", md: "90px" }}
      >
        <SectionLabel>TECHNOLOGIES</SectionLabel>

        <Heading
          color="#262626"
          fontSize={{ base: "30px", md: "38px" }}
          mb="35px"
        >
          We Help To Get Solutions
        </Heading>

        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap="25px"
        >
          {dbTechs.length > 0 ? (
            dbTechs.map((tech) => (
              <TechCard
                key={tech.id}
                image={getImageUrl(tech.image)}
                label={tech.title}
              />
            ))
          ) : (
            <Text color="gray.500">No technologies added yet.</Text>
          )}
        </Grid>
      </Container>

      {/* CERTIFICATES */}
      <Container
        maxWidth="1470px"
        paddingX={pagePadding}
        py={{ base: "60px", md: "90px" }}
      >
        <SectionLabel>CERTIFICATES</SectionLabel>

        <Heading
          color="#262626"
          fontSize={{ base: "30px", md: "36px" }}
          mb="55px"
        >
          We Providing Certificates
        </Heading>

        <Box width="100%" overflow="hidden" position="relative" py="15px">
          <Box
            display="flex"
            width="max-content"
            animation="certificateScroll 20s linear infinite"
            _hover={{ animationPlayState: "paused" }}
          >
            {[...certificateImages, ...certificateImages].map(
              (company, index) => (
                <Flex
                  key={`${company.name}-${index}`}
                  width={{ base: "160px", md: "220px" }}
                  height={{ base: "90px", md: "120px" }}
                  align="center"
                  justify="center"
                  flexShrink={0}
                  px="25px"
                >
                  <Image
                    src={company.image}
                    alt={company.name}
                    width="100%"
                    height="100%"
                    maxWidth="200px"
                    maxHeight="185px"
                    objectFit="contain"
                  />
                </Flex>
              )
            )}
          </Box>
        </Box>

        <style>
          {`
            @keyframes certificateScroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}
        </style>
      </Container>

      {/* TESTIMONIALS */}
      <Box
        bg="#fafbfc"
        mt={{ base: "-130px", md: "-150px" }}
        py={{ base: "70px", md: "150px" }}
        position="relative"
        overflow="hidden"
      >
        <Container
          maxWidth="1470px"
          paddingX={pagePadding}
          position="relative"
          minH={{ base: "auto", md: "640px" }}
        >
          <Box
            position="absolute"
            top="8%"
            left="6%"
            w="180px"
            h="180px"
            backgroundImage="radial-gradient(#cbd5e1 2px, transparent 2px)"
            backgroundSize="22px 22px"
            opacity={0.5}
            display={{ base: "none", lg: "block" }}
          />

          <Box
            position="absolute"
            bottom="8%"
            right="6%"
            w="180px"
            h="180px"
            backgroundImage="radial-gradient(#cbd5e1 2px, transparent 2px)"
            backgroundSize="22px 22px"
            opacity={0.5}
            display={{ base: "none", lg: "block" }}
          />

          {floatingAvatars.map((avatar, index) => (
            <Box
              key={index}
              position="absolute"
              top={avatar.top}
              left={avatar.left}
              right={avatar.right}
              bottom={avatar.bottom}
              display={{ base: "none", md: "block" }}
              zIndex={1}
            >
              <Image
                src={avatar.image}
                alt={`Student ${index + 1}`}
                width={avatar.size}
                height={avatar.size}
                objectFit="cover"
                borderRadius="full"
                border={`4px solid ${avatar.borderColor}`}
                boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
                transition="transform 0.3s ease"
                _hover={{ transform: "scale(1.08)" }}
              />
            </Box>
          ))}

          {/* PREVIOUS BUTTON */}
          <IconButton
            aria-label="Previous student testimonial"
            onClick={previousStudent}
            position="absolute"
            left={{ base: "5px", md: "2%", lg: "4%" }}
            top="50%"
            transform="translateY(-50%)"
            borderRadius="full"
            variant="solid"
            bg="white"
            color="#4545A5"
            size="lg"
            zIndex={2}
            _hover={{
              bg: "#EEEEFB",
              color: "#353584",
              transform: "translateY(-50%) scale(1.1)",
            }}
            boxShadow="0 4px 12px rgba(0,0,0,0.1)"
          >
            <FiArrowLeft />
          </IconButton>

          {/* NEXT BUTTON */}
          <IconButton
            aria-label="Next student testimonial"
            onClick={nextStudent}
            position="absolute"
            right={{ base: "5px", md: "2%", lg: "4%" }}
            top="50%"
            transform="translateY(-50%)"
            borderRadius="full"
            variant="solid"
            bg="white"
            color="#4545A5"
            size="lg"
            zIndex={2}
            _hover={{
              bg: "#EEEEFB",
              color: "#353584",
              transform: "translateY(-50%) scale(1.1)",
            }}
            boxShadow="0 4px 12px rgba(0,0,0,0.1)"
          >
            <FiArrowRight />
          </IconButton>

          <Box
            textAlign="center"
            maxWidth="720px"
            mx="auto"
            position="relative"
            zIndex={2}
            pt={{ base: "20px", md: "60px" }}
          >
            <SectionLabel>TESTIMONIALS</SectionLabel>

            <Heading
              fontSize={{ base: "32px", md: "42px" }}
              fontWeight="extrabold"
              color="#0f172a"
              mb="40px"
            >
              Students
            </Heading>

            <Text
              color="#f59e0b"
              fontSize="24px"
              letterSpacing="6px"
              mb="30px"
            >
              ★★★★★
            </Text>

            {dbTestimonials.length > 0 ? (
              <>
                <Text
                  color="#64748b"
                  fontSize={{ base: "15px", md: "17px" }}
                  lineHeight="1.9"
                  mb="30px"
                  px={{ base: 4, md: 0 }}
                  key={`message-${activeStudent}`}
                >
                  “{currentStudent.message}”
                </Text>

                <Heading
                  fontSize="22px"
                  fontWeight="bold"
                  color="#0f172a"
                  mb="35px"
                  key={`name-${activeStudent}`}
                >
                  {currentStudent.name}
                </Heading>
              </>
            ) : (
              <Text color="gray.500" mb="30px">
                No testimonials added yet.
              </Text>
            )}

            <Flex justify="center" align="center" gap="10px" flexWrap="wrap">
              {dbTestimonials.map((student, index) => (
                <Box
                  key={student.id}
                  as="button"
                  type="button"
                  aria-label={`Show testimonial from ${student.name}`}
                  title={student.name}
                  onClick={() => setActiveStudent(index)}
                  w="8px"
                  h="8px"
                  minW="8px"
                  borderRadius="full"
                  bg={activeStudent === index ? "#3b82f6" : "#e2e8f0"}
                  cursor="pointer"
                  transition="background 0.2s ease"
                  _hover={{ bg: "#3b82f6" }}
                />
              ))}
            </Flex>

            {dbTestimonials.length > 0 && (
              <Text mt="18px" fontSize="13px" color="#94a3b8">
                {activeStudent + 1} / {dbTestimonials.length}
              </Text>
            )}
          </Box>
        </Container>
      </Box>

      {/* PARTNER COMPANIES */}
      <Container
        maxWidth="1470px"
        paddingX={pagePadding}
        mt={{ base: "-130px", md: "-150px" }}
        py={{ base: "70px", md: "110px" }}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "1.4fr 0.9fr" }}
          gap="45px"
          alignItems="center"
        >
          <Box>
            <SectionLabel>COMPANIES</SectionLabel>

            <Heading
              color="#262626"
              fontSize={{ base: "38px", md: "50px" }}
              lineHeight="1.15"
              mb="35px"
              maxWidth="350px"
            >
              Partner Companies
            </Heading>

            <Text
              color="#64748b"
              fontSize="17px"
              lineHeight="1.85"
              textAlign="justify"
            >
              This year's theme is the Shaping Hospitality's Future, so we've
              partnered with some true industry innovators that are best
              placed to do exactly that.This year's theme is the Shaping
              Hospitality's Future, so we've partnered with some true industry
              innovators that are best placed to do exactly that.
            </Text>
          </Box>

          <SimpleGrid columns={3} gap="16px">
            {partners.map((partner, index) => (
              <Flex
                key={`${partner.name}-${index}`}
                height={{ base: "95px", md: "142px" }}
                align="center"
                justify="center"
                bg="#e5e7eb"
                borderRadius="14px"
                p="15px"
              >
                <Image
                  src={partner.image}
                  alt={partner.name}
                  width="100%"
                  height="100%"
                  maxWidth="130px"
                  maxHeight="80px"
                  objectFit="contain"
                />
              </Flex>
            ))}
          </SimpleGrid>
        </Grid>
      </Container>

      {/* FINAL CALL TO ACTION */}
      <Container
        maxWidth="1470px"
        paddingX={pagePadding}
        mt={{ base: "-50px", md: "-70px" }}
        py={{ base: "60px", md: "100px" }}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "1.3fr 0.7fr" }}
          gap="45px"
          alignItems="center"
        >
          <Box>
            <Heading
              fontSize={{ base: "36px", md: "54px" }}
              fontWeight="400"
              lineHeight="1.2"
              mb="25px"
              color="#262626"
            >
              You Will Like It Here!
            </Heading>

            <Text
              color="#64748b"
              fontSize="17px"
              lineHeight="1.8"
              mb="30px"
            >
              Create wireframes, mockups, and prototypes to visualize the user
              interface and user experience. Learn practical skills, work on
              projects, and prepare for your future career.
            </Text>

            <Button
              as="a"
              href="/careers"
              variant="outline"
              border="1px solid #262626"
              color="#111"
              bg="transparent"
              height="48px"
              px="25px"
              borderRadius="7px"
              _hover={{ bg: "#111", color: "white" }}
            >
              Explore opportunities&nbsp; →
            </Button>
          </Box>

          <CTAImageRotator images={IMG.ctaImages} />
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}

export default Home;
