
import React, { useEffect, useState } from "react";

import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Image,
  Spinner,
} from "@chakra-ui/react";

import Header from "../components/header";
import Footer from "../components/footer";

// Localhost setup (commented out):
// const BACKEND_URL = "http://localhost:8000";
import { BACKEND_BASE_URL as BACKEND_URL } from "../../services/publicApi";

const placementCompanies = [
  {
    name: "Google",
    image: "/images/google.webp",
  },
  {
    name: "IBM",
    image: "/images/ibm.png",
  },
  {
    name: "Microsoft",
    image: "/images/microsoft.png",
  },
  {
    name: "Google",
    image: "/images/google.webp",
  },
  {
    name: "IBM",
    image: "/images/ibm.png",
  },
  {
    name: "Microsoft",
    image: "/images/microsoft.png",
  },
];

function Placements() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track images that fail to load
  const [failedImages, setFailedImages] = useState([]);

  // Fetch placement students from Django API
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/placements/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch placements");
        }
        return res.json();
      })
      .then((data) => {
        setStudents(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching placements:", err);
        setLoading(false);
      });
  }, []);

  // Get backend image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `${BACKEND_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  // Handle image loading failure
  const handleImageError = (studentId) => {
    setFailedImages((prev) =>
      prev.includes(studentId) ? prev : [...prev, studentId]
    );
  };

  return (
    <>
      <Header />

      {/* PLACEMENTS SECTION */}
      <Box
        width="100%"
        background="#ffffff"
        paddingTop={{
          base: "45px",
          sm: "55px",
          md: "65px",
          lg: "65px",
        }}
        paddingBottom={{
          base: "60px",
          md: "80px",
        }}
      >
        {/* MAIN CONTAINER */}
        <Container
          maxWidth="1470px"
          paddingX={{
            base: "20px",
            sm: "30px",
            md: "45px",
            lg: "180px",
            xl: "190px",
          }}
        >
          {/* PAGE HEADING */}
          <Box textAlign="center" marginBottom="42px">
            <Heading
              as="h1"
              fontSize={{
                base: "30px",
                sm: "34px",
                md: "38px",
              }}
              lineHeight="1.2"
              fontWeight="800"
              color="#101a30"
            >
              Our Placements
            </Heading>

            <Text
              marginTop="10px"
              fontSize={{
                base: "14px",
                md: "16px",
              }}
              lineHeight="1.5"
              color="#405775"
            >
              Meet our successful students and the companies they are placed in.
            </Text>
          </Box>

          {/* PLACED STUDENTS */}
          <Box marginBottom="60px">
            <Heading
              as="h2"
              fontSize="18px"
              fontWeight="600"
              color="#111827"
              marginBottom="20px"
            >
              Placed Students
            </Heading>

            {/* LOADING STATE */}
            {loading ? (
              <Flex justify="center" align="center" minHeight="200px">
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : students.length === 0 ? (
              <Text color="gray.500">
                No placements added yet.
              </Text>
            ) : (
              <Grid
                templateColumns={{
                  base: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={{
                  base: "20px",
                  md: "25px",
                  lg: "30px",
                }}
              >
                {students.map((student) => (
                  <Flex
                    key={student.id}
                    direction="column"
                    alignItems="center"
                    textAlign="center"
                    background="#ffffff"
                    border="1px solid #dfe6f0"
                    borderRadius="16px"
                    minHeight="238px"
                    padding="20px"
                    transition="all 0.2s ease"
                    _hover={{
                      boxShadow: "0 8px 24px rgba(30, 50, 80, 0.07)",
                      transform: "translateY(-3px)",
                    }}
                  >
                    {/* STUDENT IMAGE / PLACEHOLDER */}
                    {student.image && !failedImages.includes(student.id) ? (
                      <Image
                        src={getImageUrl(student.image)}
                        alt={student.name || "Student"}
                        width="122px"
                        height="122px"
                        borderRadius="50%"
                        objectFit="cover"
                        border="4px solid #edf2f7"
                        marginBottom="15px"
                        onError={() => handleImageError(student.id)}
                      />
                    ) : (
                      <Flex
                        width="122px"
                        height="122px"
                        borderRadius="50%"
                        background="#e2e8f0"
                        border="4px solid #edf2f7"
                        marginBottom="15px"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize="35px"
                          fontWeight="700"
                          color="#94a3b8"
                        >
                          {student.name
                            ? student.name.charAt(0).toUpperCase()
                            : "?"}
                        </Text>
                      </Flex>
                    )}

                    {/* STUDENT NAME */}
                    <Heading
                      as="h3"
                      fontSize="16px"
                      fontWeight="600"
                      color="#101a30"
                      lineHeight="1.4"
                    >
                      {student.name}
                    </Heading>

                    {/* STUDENT ROLE */}
                    <Text
                      fontSize="13px"
                      color="#536b8c"
                      marginTop="3px"
                      lineHeight="1.5"
                    >
                      {student.role}
                    </Text>

                    {/* BATCH */}
                    <Text
                      fontSize="12px"
                      color="#94a3b8"
                      marginTop="5px"
                    >
                      {student.batch}
                    </Text>
                  </Flex>
                ))}
              </Grid>
            )}
          </Box>

          {/* PLACEMENT COMPANIES */}
          <Box>
            <Heading
              as="h2"
              fontSize="18px"
              fontWeight="600"
              color="#111827"
              marginBottom="20px"
            >
              Placement Companies
            </Heading>

            <Grid
              templateColumns={{
                base: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                lg: "repeat(6, 1fr)",
              }}
              gap={{
                base: "20px",
                md: "25px",
              }}
              alignItems="center"
            >
              {placementCompanies.map((company, index) => (
                <Flex
                  key={`${company.name}-${index}`}
                  alignItems="center"
                  justifyContent="center"
                  minHeight="55px"
                  padding="5px"
                >
                  <Image
                    src={company.image}
                    alt={company.name}
                    maxWidth="105px"
                    width="100%"
                    maxHeight="100px"
                    objectFit="contain"
                    fallback={
                      <Text
                        fontSize="16px"
                        fontWeight="700"
                        color="#64748b"
                      >
                        {company.name}
                      </Text>
                    }
                  />
                </Flex>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}

export default Placements;
