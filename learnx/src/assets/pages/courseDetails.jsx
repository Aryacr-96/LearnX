import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Image,
  Button,
  Spinner,
} from "@chakra-ui/react";

import { FiArrowRight } from "react-icons/fi";
import { FaImage } from "react-icons/fa";

import Header from "../components/header";
import Footer from "../components/footer";

const BACKEND_URL = "http://localhost:8000";

const features = [
  {
    title: "Practical Training",
    description:
      "Each concept is taught with hands-on coding sessions and real examples.",
  },
  {
    title: "Real-Time Project",
    description:
      "Students get industry experience by working on live projects.",
  },
  {
    title: "Expert Mentors",
    description:
      "Learn from experienced developers and trainers directly.",
  },
  {
    title: "Interview Preparation",
    description:
      "Specialized sessions for technical interviews, resume building, and portfolio development.",
  },
  {
    title: "Flexible Learning",
    description:
      "Support and recorded sessions for both online and offline learning.",
  },
  {
    title: "Placement Assistance",
    description:
      "Guidance and support for internships and job opportunities.",
  },
];

const differences = [
  {
    title: "Industry-Focused Learning",
    description:
      "Our curriculum is designed according to current industry needs and technologies.",
  },
  {
    title: "Learn by Building",
    description:
      "We think that students learn better when they are building real applications, not just learning theory.",
  },
  {
    title: "Personal Guidance",
    description:
      "We mentor and support you throughout your learning journey.",
  },
  {
    title: "Portfolio Development",
    description:
      "Students work on projects that directly contribute to their professional portfolio.",
  },
  {
    title: "Career Support",
    description:
      "We prepare students for actual opportunities in the IT industry, from interview preparation to placement guidance.",
  },
  {
    title: "Friendly Learning Environment",
    description:
      "We want to create a positive and encouraging learning experience for all students.",
  },
];

const containerProps = {
  maxW: "1470px",
  width: "100%",
  px: {
    base: "20px",
    sm: "30px",
    md: "45px",
    lg: "180px",
    xl: "190px",
  },
};

function CourseDetails() {
  const { slug } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");
        setCourse(null);

        const response = await fetch(
          `${BACKEND_URL}/api/courses/slug/${encodeURIComponent(slug)}/`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Course not found");
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Error fetching course:", err);
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCourse();

    return () => controller.abort();
  }, [slug]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http")) return imagePath;

    return `${BACKEND_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <>
        <Header />

        <Flex height="60vh" align="center" justify="center">
          <Spinner size="xl" color="#111827" />
        </Flex>

        <Footer />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Header />

        <Flex
          height="60vh"
          align="center"
          justify="center"
          direction="column"
        >
          <Text fontSize="xl" color="red.500" fontWeight="bold">
            Course not found.
          </Text>
        </Flex>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <Box bg="white" color="#111827" width="100%" overflow="hidden">
        {/* TOP COURSE INTRODUCTION */}
        <Container
          {...containerProps}
          pt={{ base: "45px", md: "65px", lg: "50px" }}
          pb={{ base: "55px", md: "80px" }}
        >
          <Flex
            alignItems="center"
            gap={{ base: "30px", md: "45px" }}
            direction={{ base: "column", md: "row" }}
          >
            <Box
              width={{ base: "100%", md: "30%" }}
              maxW={{ base: "350px", md: "330px" }}
              flexShrink={0}
            >
              {/* COURSE IMAGE OR PLACEHOLDER */}
              {course.image ? (
                <Image
                  src={getImageUrl(course.image)}
                  alt={course.title}
                  width="100%"
                  height={{ base: "350px", sm: "400px", md: "485px" }}
                  objectFit="cover"
                  borderRadius="25px"
                  boxShadow="0 12px 30px rgba(0,0,0,0.13)"
                />
              ) : (
                <Flex
                  width="100%"
                  height={{ base: "350px", sm: "400px", md: "485px" }}
                  bg="#F1F5F9"
                  borderRadius="25px"
                  boxShadow="0 12px 30px rgba(0,0,0,0.13)"
                  align="center"
                  justify="center"
                  direction="column"
                  gap="12px"
                  color="#94A3B8"
                >
                  <Box fontSize="50px">
                    <FaImage />
                  </Box>

                  <Text fontSize="15px" fontWeight="500">
                    No Image Available
                  </Text>
                </Flex>
              )}
            </Box>

            <Box flex="1" width="100%">
              <Heading
                as="h1"
                fontSize={{
                  base: "30px",
                  sm: "36px",
                  md: "40px",
                  lg: "44px",
                }}
                lineHeight="1.2"
                fontWeight="800"
                color="#050505"
              >
                {course.title}
              </Heading>

              <Flex mt="15px" gap="15px" alignItems="center">
                <Text fontSize="16px" color="#4545A5" fontWeight="600">
                  {course.level}
                </Text>

                <Text fontSize="16px" color="#64748b">
                  •
                </Text>

                <Text fontSize="16px" color="#64748b">
                  {course.duration}
                </Text>
              </Flex>

              <Text
                mt="25px"
                fontSize={{ base: "16px", md: "18px" }}
                lineHeight="1.8"
                color="#111827"
              >
                {course.description}
              </Text>
            </Box>
          </Flex>
        </Container>

        {/* COURSE OVERVIEW */}
        <Container
          {...containerProps}
          pb={{ base: "55px", md: "90px" }}
        >
          <Heading
            as="h2"
            fontSize={{ base: "23px", md: "26px" }}
            fontWeight="700"
            color="#202020"
            mb="20px"
          >
            Course Overview
          </Heading>

          <Box
            fontSize={{ base: "15px", md: "18px" }}
            lineHeight="1.8"
            color="#405775"
            textAlign="justify"
            sx={{
              "& h1, & h2, & h3, & h4": {
                color: "#10243e",
                fontWeight: "700",
                marginTop: "24px",
                marginBottom: "12px",
              },
              "& p": { marginBottom: "16px" },
              "& ul, & ol": {
                paddingLeft: "24px",
                marginBottom: "16px",
              },
              "& li": { marginBottom: "6px" },
              "& img": {
                maxWidth: "100%",
                borderRadius: "8px",
                marginY: "16px",
              },
              "& blockquote": {
                borderLeft: "3px solid #16a34a",
                paddingLeft: "15px",
                my: "20px",
                fontStyle: "italic",
                color: "#64748b",
              },
              "& a": {
                color: "#8b5cf6",
                textDecoration: "underline",
              },
            }}
            dangerouslySetInnerHTML={{ __html: course.overview }}
          />
        </Container>

        {/* MODULES */}
        <Container
          {...containerProps}
          pb={{ base: "60px", md: "90px" }}
        >
          <Box
            bg="white"
            borderRadius="28px"
            boxShadow="0 4px 22px rgba(0,0,0,0.07)"
            px={{ base: "18px", sm: "25px", md: "44px" }}
            py={{ base: "28px", md: "40px" }}
          >
            <Heading
              as="h2"
              fontSize={{ base: "24px", md: "27px" }}
              fontWeight="700"
              mb="28px"
            >
              Modules
            </Heading>

            <Flex direction="column" gap="20px">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module, index) => (
                  <Box
                    key={index}
                    border="1px solid #dce5ef"
                    borderRadius="20px"
                    px={{ base: "18px", md: "26px" }}
                    py={{ base: "22px", md: "25px" }}
                    transition="all 0.25s ease"
                    _hover={{
                      boxShadow: "0 10px 25px rgba(30,50,80,0.08)",
                      borderColor: "#cbd5e1",
                    }}
                  >
                    <Text
                      fontSize={{ base: "16px", md: "19px" }}
                      fontWeight="500"
                      color="#111827"
                    >
                      {index + 1}. {module.title}
                    </Text>

                    <Text
                      mt="12px"
                      fontSize={{ base: "14px", md: "16px" }}
                      lineHeight="1.7"
                      color="#647b98"
                    >
                      {module.description}
                    </Text>
                  </Box>
                ))
              ) : (
                <Text color="gray.500">
                  No modules listed for this course yet.
                </Text>
              )}
            </Flex>
          </Box>
        </Container>

        {/* FEATURES */}
        <Container
          {...containerProps}
          pb={{ base: "70px", md: "110px" }}
        >
          <Heading
            as="h2"
            fontSize={{ base: "25px", md: "27px" }}
            fontWeight="700"
            mb="35px"
          >
            Features
          </Heading>

          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={{ base: "20px", md: "25px" }}
          >
            {features.map((feature) => (
              <Box
                key={feature.title}
                bg="#f3f3ff"
                border="1px solid #d2d7ff"
                borderRadius="27px"
                px={{ base: "22px", md: "27px" }}
                py={{ base: "25px", md: "27px" }}
                minH={{ base: "auto", md: "145px" }}
                boxShadow="0 5px 12px rgba(30,40,80,0.04)"
                transition="all 0.25s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 25px rgba(30,40,80,0.09)",
                }}
              >
                <Heading
                  as="h3"
                  fontSize={{ base: "17px", md: "18px" }}
                  fontWeight="700"
                  mb="15px"
                  color="#111827"
                >
                  {feature.title}
                </Heading>

                <Text
                  fontSize={{ base: "14px", md: "16px" }}
                  lineHeight="1.75"
                  color="#405775"
                >
                  {feature.description}
                </Text>
              </Box>
            ))}
          </Grid>
        </Container>

        {/* WHAT MAKES APPZIA LEARNX DIFFERENT */}
        <Container
          {...containerProps}
          pb={{ base: "75px", md: "110px" }}
        >
          <Heading
            as="h2"
            textAlign="center"
            fontSize={{
              base: "29px",
              sm: "34px",
              md: "42px",
              lg: "46px",
            }}
            lineHeight="1.25"
            fontWeight="800"
            color="#151b2b"
            mb={{ base: "35px", md: "45px" }}
          >
            What Makes Appzia Learnx Different?
          </Heading>

          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={{ base: "20px", md: "30px" }}
          >
            {differences.map((item) => (
              <Box
                key={item.title}
                bg="white"
                borderRadius="24px"
                px={{ base: "25px", md: "32px" }}
                py={{ base: "28px", md: "34px" }}
                minH={{ base: "auto", md: "195px" }}
                boxShadow="0 7px 28px rgba(0,0,0,0.07)"
                transition="all 0.25s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0 14px 32px rgba(0,0,0,0.1)",
                }}
              >
                <Heading
                  as="h3"
                  fontSize={{ base: "19px", md: "21px" }}
                  fontWeight="700"
                  color="#101828"
                  mb="16px"
                >
                  {item.title}
                </Heading>

                <Text
                  color="#64748b"
                  fontSize={{ base: "15px", md: "16px" }}
                  lineHeight="1.8"
                  textAlign="justify"
                >
                  {item.description}
                </Text>
              </Box>
            ))}
          </Grid>
        </Container>

        {/* COURSE DURATION */}
        <Box
          bg="white"
          py={{ base: "65px", md: "85px" }}
          px="20px"
          textAlign="center"
        >
          <Heading
            as="h2"
            fontSize={{ base: "27px", md: "34px" }}
            fontWeight="700"
            color="#202020"
          >
            Course Duration
          </Heading>

          <Text
            mt="18px"
            color="#64748b"
            fontSize={{ base: "17px", md: "21px" }}
          >
            Total Length:{" "}
            <Text as="span" color="#111827" fontWeight="600">
              {course.duration}
            </Text>
          </Text>

          <Button
            mt="30px"
            variant="outline"
            border="1px solid #333333"
            color="#111827"
            borderRadius="10px"
            height="50px"
            px="30px"
            fontSize="14px"
            fontWeight="600"
            bg="white"
            _hover={{ bg: "#111827", color: "white" }}
            onClick={() => {
              window.location.href = "/contact";
            }}
          >
            Explore opportunities

            <Box ml="10px">
              <FiArrowRight />
            </Box>
          </Button>
        </Box>
      </Box>

      <Footer />
    </>
  );
}

export default CourseDetails;
