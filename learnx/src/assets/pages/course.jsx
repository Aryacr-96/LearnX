
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Input,
  Button,
  Image,
  NativeSelect,
  Spinner,
} from "@chakra-ui/react";

import { FiSearch, FiClock } from "react-icons/fi";

import Header from "../components/header";
import Footer from "../components/footer";

const BACKEND_URL = "http://localhost:8000";

function Course() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [duration, setDuration] = useState("All durations");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/courses/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then((data) => {
        setCourses(Array.isArray(data) ? data : data.results ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });
  }, []);

  // Image URL handler
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;

    const cleanPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

    return `${BACKEND_URL}${cleanPath}`;
  };

  // Search and duration filter
  const filteredCourses = courses.filter((course) => {
    const searchLower = search.toLowerCase();

    const matchesSearch =
      course.title?.toLowerCase().includes(searchLower) ||
      course.description?.toLowerCase().includes(searchLower);

    let matchesDuration = true;

    if (duration === "Under 1 hour") {
      matchesDuration =
        course.duration?.includes("m") &&
        !course.duration?.includes("h");

      if (course.duration === "1h") matchesDuration = true;
    }

    if (duration === "1 - 2 hours") {
      matchesDuration =
        course.duration === "1h" ||
        course.duration === "1h 35m" ||
        course.duration === "1h 45m" ||
        course.duration?.startsWith("1h");
    }

    if (duration === "Over 2 hours") {
      matchesDuration =
        course.duration === "2h" ||
        course.duration === "2h 15m" ||
        course.duration === "2h 30m" ||
        course.duration?.startsWith("2h") ||
        course.duration?.startsWith("3h");
    }

    return matchesSearch && matchesDuration;
  });

  // Navigate to course details using slug
  const handleViewDetails = (course) => {
    if (!course.slug || !course.slug.trim()) {
      console.error("Course slug is missing:", course);

      alert(
        "Course URL is not available yet. Please generate the course slug in Django."
      );

      return;
    }

    navigate(`/course/${course.slug}`);
  };

  return (
    <>
      <Header />

      <Box
        background="#ffffff"
        minHeight="100vh"
        width="100%"
        paddingTop={{ base: "15px", sm: "25px", md: "35px", lg: "45px" }}
        paddingBottom="80px"
      >
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
          {/* TOP SECTION */}
          <Flex
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            gap="50px"
            marginBottom={{ base: "45px", md: "55px" }}
            direction={{ base: "column", lg: "row" }}
          >
            {/* LEFT HEADING */}
            <Box width={{ base: "100%", lg: "48%" }}>
              <Heading
                as="h1"
                color="#202020"
                fontSize={{
                  base: "22px",
                  sm: "30px",
                  md: "38px",
                  lg: "48px",
                  xl: "50px",
                }}
                fontWeight="800"
                lineHeight="1.1"
                letterSpacing="0.1px"
                maxWidth="650px"
              >
                Level up with
                <br />
                beautifully crafted
                <br />
                courses
              </Heading>

              <Text
                marginTop={{ base: "22px", md: "25px" }}
                color="#365478"
                fontSize={{ base: "16px", md: "18px", lg: "19px" }}
                lineHeight="1.7"
                maxWidth="650px"
              >
                Browse our hand-picked catalog. Each tile shows the title,
                duration, and a quick summary so you can choose fast.
              </Text>
            </Box>

            {/* SEARCH AND FILTER BOX */}
            <Box
              width={{ base: "100%", lg: "48%" }}
              maxWidth={{ base: "100%", lg: "670px" }}
              border="1px solid #e2e8f0"
              borderRadius="28px"
              padding={{ base: "20px", sm: "24px", md: "28px" }}
              boxShadow="0 5px 18px rgba(30, 50, 80, 0.06)"
            >
              <Flex gap="16px" direction={{ base: "column", sm: "row" }}>
                {/* SEARCH */}
                <Flex
                  flex="1"
                  height="55px"
                  alignItems="center"
                  border="1px solid #cbd5e1"
                  borderRadius="16px"
                  paddingX="16px"
                  background="white"
                >
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses..."
                    border="none"
                    outline="none"
                    boxShadow="none"
                    fontSize="16px"
                    color="#1e293b"
                    _placeholder={{ color: "#64748b" }}
                    _focus={{ border: "none", boxShadow: "none" }}
                  />

                  <Box color="#8da0bb" fontSize="22px">
                    <FiSearch />
                  </Box>
                </Flex>

                {/* DURATION FILTER */}
                <Box
                  width={{ base: "100%", sm: "245px" }}
                  height="55px"
                  border="1px solid #cbd5e1"
                  borderRadius="16px"
                  overflow="hidden"
                >
                  <NativeSelect.Root
                    height="100%"
                    width="100%"
                    variant="plain"
                  >
                    <NativeSelect.Field
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      height="100%"
                      width="100%"
                      paddingX="16px"
                      fontSize="16px"
                      color="#111827"
                      border="none"
                      outline="none"
                      cursor="pointer"
                    >
                      <option value="All durations">All durations</option>
                      <option value="Under 1 hour">Under 1 hour</option>
                      <option value="1 - 2 hours">1 - 2 hours</option>
                      <option value="Over 2 hours">Over 2 hours</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>
              </Flex>
            </Box>
          </Flex>

          {/* LOADING STATE */}
          {loading ? (
            <Flex justify="center" py="80px">
              <Spinner size="xl" color="#111827" />
            </Flex>
          ) : (
            <>
              {/* COURSE GRID */}
              <Grid
                templateColumns={{
                  base: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                }}
                gap={{ base: "25px", md: "30px", lg: "34px" }}
                alignItems="stretch"
              >
                {filteredCourses.map((course) => (
                  <Box
                    key={course.id}
                    height="100%"
                    background="#ffffff"
                    border="1px solid #dfe5ec"
                    borderRadius="26px"
                    overflow="hidden"
                    transition="all 0.25s ease"
                    display="flex"
                    flexDirection="column"
                    _hover={{
                      transform: "translateY(-5px)",
                      boxShadow: "0 15px 35px rgba(30, 50, 80, 0.10)",
                    }}
                  >
                    {/* COURSE IMAGE */}
                    <Image
                      src={getImageUrl(course.image)}
                      alt={course.title}
                      width="100%"
                      height={{
                        base: "210px",
                        sm: "190px",
                        md: "200px",
                        lg: "190px",
                      }}
                      objectFit="cover"
                      fallback={
                        <Flex
                          height="190px"
                          bg="gray.100"
                          align="center"
                          justify="center"
                          color="gray.500"
                          fontSize="sm"
                          fontWeight="500"
                        >
                          Image Not Found
                        </Flex>
                      }
                    />

                    {/* CARD CONTENT */}
                    <Flex
                      direction="column"
                      height="350px"
                      padding={{ base: "20px", md: "22px" }}
                    >
                      {/* TITLE AND DURATION */}
                      <Flex
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap="10px"
                      >
                        <Heading
                          as="h2"
                          fontSize={{ base: "20px", md: "21px" }}
                          lineHeight="1.15"
                          fontWeight="600"
                          color="#111827"
                        >
                          {course.title}
                        </Heading>

                        <Flex
                          flexShrink="0"
                          alignItems="center"
                          justifyContent="center"
                          gap="5px"
                          background="#f1f5f9"
                          borderRadius="30px"
                          paddingX="12px"
                          paddingY="7px"
                          minWidth="65px"
                        >
                          <Box color="#64748b" fontSize="12px">
                            <FiClock />
                          </Box>

                          <Text
                            fontSize="12px"
                            lineHeight="1.1"
                            fontWeight="600"
                            color="#26384d"
                            textAlign="center"
                          >
                            {course.duration}
                          </Text>
                        </Flex>
                      </Flex>

                      {/* DESCRIPTION */}
                      <Text
                        marginTop="18px"
                        color="#405775"
                        fontSize="15px"
                        lineHeight="1.7"
                        display="-webkit-box"
                        WebkitLineClamp="6"
                        WebkitBoxOrient="vertical"
                        overflow="hidden"
                      >
                        {course.description}
                      </Text>

                      {/* CARD BOTTOM */}
                      <Flex
                        marginTop="auto"
                        paddingTop="22px"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="10px"
                      >
                        <Text
                          color="#718096"
                          fontSize="13px"
                          fontWeight="500"
                        >
                          {course.level}
                        </Text>

                        {/* VIEW DETAILS BUTTON */}
                        <Button
                          type="button"
                          background="#111827"
                          color="white"
                          borderRadius="13px"
                          height="38px"
                          paddingX="18px"
                          fontSize="13px"
                          fontWeight="600"
                          cursor="pointer"
                          flexShrink="0"
                          onClick={() => handleViewDetails(course)}
                          _hover={{
                            background: "#263247",
                            transform: "translateY(-2px)",
                          }}
                          transition="all 0.2s ease"
                        >
                          View details
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                ))}
              </Grid>

              {/* NO RESULTS */}
              {filteredCourses.length === 0 && (
                <Box textAlign="center" paddingY="80px">
                  <Text
                    fontSize="20px"
                    fontWeight="600"
                    color="#334155"
                  >
                    No courses found
                  </Text>

                  <Text marginTop="8px" color="#64748b">
                    Try a different search term or duration.
                  </Text>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      <Footer />
    </>
  );
}

export default Course;
