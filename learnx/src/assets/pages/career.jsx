import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Container, Flex, Grid, Heading, Text, Image, Spinner, Center,
} from "@chakra-ui/react";
import { FiChevronDown, FiPlayCircle } from "react-icons/fi";
import Header from "../components/header";
import Footer from "../components/footer";
import { resolveImageUrl, BACKEND_BASE_URL as BACKEND_URL } from "../../services/publicApi";

// Localhost setup (commented out):
// const BACKEND_URL = "http://localhost:8000";

const pagePadding = {
  base: "20px", sm: "30px", md: "45px", lg: "180px", xl: "190px",
};

const getJobSlug = (title) =>
  title.toLowerCase().trim().replace(/\s+/g, "-");

const getYoutubeThumbnail = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    : null;
};

function Career() {
  const [groupedOpenings, setGroupedOpenings] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState([]);

  // ✅ Life @ Learnx now comes from /api/gallery/
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/careers/`)
      .then((res) => res.json())
      .then((data) => {
        const jobs = Array.isArray(data) ? data : data.results ?? [];
        const grouped = jobs.reduce((acc, job) => {
          if (!acc[job.category]) acc[job.category] = [];
          acc[job.category].push(job);
          return acc;
        }, {});
        setGroupedOpenings(grouped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching careers:", err);
        setLoading(false);
      });
  }, []);

  // ✅ Fetch gallery items for the "Life @ Learnx" grid
  useEffect(() => {
    let cancelled = false;
    fetch(`${BACKEND_URL}/api/gallery/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Gallery error (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data.results ?? [];
        // Only keep items we can render as a tile: image or YouTube
        setGallery(items.filter((item) => item.image || item.youtube_url));
      })
      .catch((err) => {
        console.error("Error fetching gallery:", err);
        if (!cancelled) setGallery([]);
      })
      .finally(() => {
        if (!cancelled) setGalleryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleOpening = (index) => {
    setExpanded((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    );
  };

  return (
    <Box bg="white" color="#151b2e" width="100%" overflow="hidden">
      <Header />

      <Box
        background="#ffffff"
        minHeight="100vh"
        width="100%"
        paddingTop={{ base: "55px", sm: "65px", md: "75px", lg: "85px" }}
        paddingBottom="80px"
      >
        <Container maxWidth="1470px" paddingX={pagePadding}>
          <Box width="100%" textAlign="center" marginBottom={{ base: "45px", md: "55px" }}>
            <Heading
              as="h1"
              color="#202020"
              fontSize={{ base: "24px", sm: "24px", md: "32px", lg: "38px" }}
              fontWeight="700"
              lineHeight="1.1"
              letterSpacing="-1.5px"
            >
              Current Openings
            </Heading>
            <Text
              marginTop={{ base: "16px", md: "20px" }}
              color="#365478"
              fontSize={{ base: "16px", md: "18px" }}
              lineHeight="1.7"
            >
              Become part of a high-performing &amp; collaborative team
            </Text>
          </Box>

          {loading ? (
            <Center py="100px">
              <Spinner size="xl" color="#4545A5" />
            </Center>
          ) : Object.keys(groupedOpenings).length === 0 ? (
            <Text textAlign="center" color="gray.500" py="20">
              No open positions right now. Check back later!
            </Text>
          ) : (
            <Box width="100%" maxWidth="915px" marginX="auto">
              {Object.entries(groupedOpenings).map(([department, jobs], index) => {
                const isOpen = expanded.includes(index);
                return (
                  <Box
                    key={department}
                    width="100%"
                    marginBottom="25px"
                    border="1px solid #d5dbe3"
                    borderRadius="12px"
                    overflow="hidden"
                    background="white"
                  >
                    <Flex
                      as="button"
                      type="button"
                      width="100%"
                      minHeight={{ base: "68px", md: "73px" }}
                      alignItems="center"
                      justifyContent="space-between"
                      textAlign="left"
                      paddingX={{ base: "18px", md: "27px" }}
                      paddingY="18px"
                      background="white"
                      cursor="pointer"
                      onClick={() => toggleOpening(index)}
                      aria-expanded={isOpen}
                      _hover={{ background: "#fafafa" }}
                    >
                      <Text fontSize={{ base: "16px", md: "20px" }} fontWeight="500" color="#111827">
                        {department} ({jobs.length})
                      </Text>
                      <Box
                        as={FiChevronDown}
                        boxSize="22px"
                        flexShrink={0}
                        color="#111827"
                        transition="transform 0.25s ease"
                        transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                      />
                    </Flex>

                    {isOpen && (
                      <Box
                        borderTop="1px solid #e5e7eb"
                        paddingX={{ base: "18px", md: "27px" }}
                        paddingY="8px"
                      >
                        {jobs.map((job, jobIndex) => (
                          <Flex
                            key={job.id}
                            direction={{ base: "column", sm: "row" }}
                            alignItems={{ base: "flex-start", sm: "center" }}
                            justifyContent="space-between"
                            gap="12px"
                            paddingY="18px"
                            borderBottom={
                              jobIndex === jobs.length - 1 ? "none" : "1px solid #edf0f3"
                            }
                          >
                            <Box>
                              <Heading
                                as="h3"
                                fontSize={{ base: "16px", md: "18px" }}
                                fontWeight="600"
                                color="#151b2e"
                              >
                                {job.title}
                              </Heading>
                              <Text color="#64748b" fontSize="14px" marginTop="5px">
                                {job.experience}
                              </Text>
                            </Box>
                            <Box
                              as={RouterLink}
                              to={`/career-details/${getJobSlug(job.title)}`}
                              display="inline-flex"
                              alignItems="center"
                              justifyContent="center"
                              border="1px solid #151b2e"
                              borderRadius="7px"
                              paddingX="18px"
                              paddingY="9px"
                              color="#151b2e"
                              fontSize="14px"
                              fontWeight="600"
                              textDecoration="none"
                              flexShrink={0}
                              cursor="pointer"
                              transition="all 0.2s ease"
                              _hover={{
                                background: "#151b2e",
                                color: "white",
                                textDecoration: "none",
                              }}
                            >
                              View Job
                            </Box>
                          </Flex>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Container>
      </Box>

      {/* Life @ Learnx — now powered by /api/gallery/ */}
      <Box width="100%" background="white" paddingTop="0" paddingBottom="80px">
        <Container maxWidth="1470px" paddingX={pagePadding} mt={{ base: "-50px", md: "-75px" }}>
          <Box width="100%" textAlign="center" marginBottom={{ base: "45px", md: "55px" }}>
            <Heading
              as="h2"
              color="#202020"
              fontSize={{ base: "24px", sm: "24px", md: "32px", lg: "38px" }}
              fontWeight="700"
              lineHeight="1.1"
              letterSpacing="-1.5px"
            >
              Life @ Learnx
            </Heading>
            <Text
              maxWidth="760px"
              marginX="auto"
              marginTop={{ base: "16px", md: "20px" }}
              color="#365478"
              fontSize={{ base: "16px", md: "18px" }}
              lineHeight="1.7"
            >
              A place where you can realise your full potential, nurture your dreams,
              and follow your passion! All of that with a daily dose of fun and laughter.
            </Text>
          </Box>

          {galleryLoading ? (
            <Center py="60px">
              <Spinner size="lg" color="#4545A5" />
            </Center>
          ) : gallery.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              No life-at-LearnX moments yet. Check back soon!
            </Text>
          ) : (
            <Grid
              width="100%"
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              }}
              gap={{ base: "25px", md: "30px", lg: "34px" }}
              alignItems="stretch"
            >
              {gallery.map((item, index) => {
                const thumbnail = item.image
                  ? resolveImageUrl(item.image)
                  : getYoutubeThumbnail(item.youtube_url);

                if (!thumbnail) return null;

                return (
                  <Box
                    key={item.id}
                    height={{ base: "240px", sm: "250px", md: "280px" }}
                    gridColumn={{
                      base: "auto",
                      sm: "auto",
                      lg: index === 2 ? "3" : "auto",
                    }}
                    gridRow={{ lg: index === 2 ? "1 / span 2" : "auto" }}
                    borderRadius="12px"
                    overflow="hidden"
                    background="#f1f5f9"
                    position="relative"
                  >
                    <Image
                      src={thumbnail}
                      alt={item.title || "Life at LearnX"}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      transition="transform 0.4s ease"
                      _hover={{ transform: "scale(1.04)" }}
                    />

                    {item.youtube_url && !item.image && (
                      <Box
                        position="absolute"
                        inset="0"
                        bg="blackAlpha.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        pointerEvents="none"
                      >
                        <Box as={FiPlayCircle} size={44} color="white" opacity={0.9} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

export default Career;