import React, { useEffect, useState, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Container, Flex, Grid, Heading, Text, Image, Spinner, Center,
  Dialog, Portal, CloseButton, useDisclosure, IconButton,
} from "@chakra-ui/react";
import { FiChevronDown, FiPlayCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Header from "../components/header";
import Footer from "../components/footer";
import { resolveImageUrl, BACKEND_BASE_URL as BACKEND_URL } from "../../services/publicApi";

const pagePadding = {
  base: "20px", sm: "30px", md: "45px", lg: "180px", xl: "190px",
};

const getJobSlug = (title) =>
  title.toLowerCase().trim().replace(/\s+/g, "-");

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getYoutubeThumbnail = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

function Career() {
  const [groupedOpenings, setGroupedOpenings] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState([]);

  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  // Lightbox state
  const { open, onOpen, onClose } = useDisclosure();
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch careers
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

  // Fetch gallery
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

  const openLightbox = (index) => {
    setActiveIndex(index);
    onOpen();
  };

  const showPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const showNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % gallery.length);
  }, [gallery.length]);

  // Keyboard navigation: ← → Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, showPrev, showNext, onClose]);

  const activeItem = gallery[activeIndex];
  const activeYoutubeId = activeItem ? getYoutubeId(activeItem.youtube_url) : null;
  const activeImage = activeItem?.image ? resolveImageUrl(activeItem.image) : null;

  return (
    <Box bg="white" color="#151b2e" width="100%" overflow="hidden">
      <Header />

      {/* Current Openings Section */}
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
                const isOpenDept = expanded.includes(index);
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
                      aria-expanded={isOpenDept}
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
                        transform={isOpenDept ? "rotate(180deg)" : "rotate(0deg)"}
                      />
                    </Flex>

                    {isOpenDept && (
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

      {/* Life @ Learnx Section */}
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
                    as="button"
                    type="button"
                    onClick={() => openLightbox(index)}
                    height={{ base: "240px", sm: "250px", md: "280px" }}
                    borderRadius="12px"
                    overflow="hidden"
                    background="#f1f5f9"
                    position="relative"
                    cursor="pointer"
                    padding="0"
                    border="none"
                    textAlign="left"
                  >
                    <Image
                      src={thumbnail}
                      alt={item.title || "Life at LearnX"}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      transition="transform 0.4s ease"
                      _hover={{ transform: "scale(1.04)" }}
                      loading="lazy"
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

      {/* Lightbox Dialog (Chakra UI v3) */}
      <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} size="full" placement="center">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.900" />
          <Dialog.Positioner>
            <Dialog.Content bg="transparent" boxShadow="none" maxWidth="100vw" height="100vh">
              <Dialog.CloseTrigger asChild>
                <CloseButton 
                  color="white" 
                  zIndex="20" 
                  size="lg" 
                  bg="blackAlpha.600" 
                  borderRadius="full" 
                  _hover={{ bg: "blackAlpha.800" }}
                  position="fixed"
                  top="20px"
                  right="20px"
                />
              </Dialog.CloseTrigger>
              
              <Dialog.Body 
                padding="0" 
                position="relative" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                height="100%"
              >
                {/* Prev Button */}
                {gallery.length > 1 && (
                  <IconButton
                    aria-label="Previous"
                    icon={<FiChevronLeft size={32} />}
                    onClick={showPrev}
                    position="fixed"
                    left={{ base: "10px", md: "40px" }}
                    top="50%"
                    transform="translateY(-50%)"
                    bg="blackAlpha.600"
                    color="white"
                    _hover={{ bg: "blackAlpha.800" }}
                    borderRadius="full"
                    size="xl"
                    zIndex="20"
                  />
                )}

                {/* 
                  Main Content (Image or Video) 
                  We use key={activeIndex} to force React to completely destroy 
                  the old video iframe and load the new one when arrow keys are pressed.
                */}
                {activeYoutubeId ? (
                  <Box
                    as="iframe"
                    key={`video-${activeIndex}`} 
                    title={activeItem?.title || "Life at LearnX"}
                    src={`https://www.youtube.com/embed/${activeYoutubeId}?autoplay=1`}
                    width="100%"
                    maxWidth="1200px"
                    height="70vh"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0, borderRadius: "10px" }}
                  />
                ) : activeImage ? (
                  <Image
                    key={`image-${activeIndex}`}
                    src={activeImage}
                    alt={activeItem?.title || "Life at LearnX"}
                    maxHeight="85vh"
                    maxWidth="90vw"
                    objectFit="contain"
                    borderRadius="10px"
                  />
                ) : null}

                {/* Next Button */}
                {gallery.length > 1 && (
                  <IconButton
                    aria-label="Next"
                    icon={<FiChevronRight size={32} />}
                    onClick={showNext}
                    position="fixed"
                    right={{ base: "10px", md: "40px" }}
                    top="50%"
                    transform="translateY(-50%)"
                    bg="blackAlpha.600"
                    color="white"
                    _hover={{ bg: "blackAlpha.800" }}
                    borderRadius="full"
                    size="xl"
                    zIndex="20"
                  />
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Footer />
    </Box>
  );
}

export default Career;