
import React, { useEffect, useState, useRef, useCallback } from "react";

import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Image,
  IconButton,
  Spinner,
  Flex,
} from "@chakra-ui/react";

import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPlayCircle,
} from "react-icons/fi";

import Header from "../components/header";
import Footer from "../components/footer";

import {
  getPublicGallery,
  resolveImageUrl,
} from "../../services/publicApi";

function Gallery() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Touch swipe reference
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // ---- Fetch from Django ----
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPublicGallery();

        const list = Array.isArray(data)
          ? data
          : data.results ?? [];

        if (!cancelled) {
          setGalleryImages(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load gallery.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Previous Image ----
  const showPrevious = useCallback(() => {
    setSelectedMedia((current) => {
      if (!current || galleryImages.length === 0) return current;

      const currentIndex = galleryImages.findIndex(
        (item) => item.id === current.id
      );

      if (currentIndex === -1) return current;

      const previousIndex =
        (currentIndex - 1 + galleryImages.length) %
        galleryImages.length;

      return galleryImages[previousIndex];
    });
  }, [galleryImages]);

  // ---- Next Image ----
  const showNext = useCallback(() => {
    setSelectedMedia((current) => {
      if (!current || galleryImages.length === 0) return current;

      const currentIndex = galleryImages.findIndex(
        (item) => item.id === current.id
      );

      if (currentIndex === -1) return current;

      const nextIndex =
        (currentIndex + 1) % galleryImages.length;

      return galleryImages[nextIndex];
    });
  }, [galleryImages]);

  // ---- Laptop / Desktop Keyboard Navigation ----
  useEffect(() => {
    if (!selectedMedia) return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedMedia(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMedia, showPrevious, showNext]);

  // ---- Mobile Swipe Navigation ----
  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const differenceX = touchStartX.current - touchEndX;
    const differenceY = touchStartY.current - touchEndY;

    // Avoid triggering navigation during vertical scrolling
    if (Math.abs(differenceY) > Math.abs(differenceX)) {
      return;
    }

    // Ignore small movements
    if (Math.abs(differenceX) < 50) return;

    if (differenceX > 0) {
      // Swipe left = Next image
      showNext();
    } else {
      // Swipe right = Previous image
      showPrevious();
    }
  };

  // ---- YouTube Thumbnail ----
  const getYoutubeThumbnail = (url) => {
    if (!url) return null;

    const regExp =
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^#&?]*)/;

    const match = url.match(regExp);

    return match && match[1].length === 11
      ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
      : null;
  };

  // ---- YouTube Embed URL ----
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    return url
      .replace("watch?v=", "embed/")
      .replace("youtu.be/", "youtube.com/embed/");
  };

  return (
    <>
      <Header />

      <Box
        width="100%"
        minHeight="70vh"
        background="#ffffff"
        paddingTop={{
          base: "45px",
          sm: "55px",
          md: "65px",
          lg: "65px",
        }}
        paddingBottom={{ base: "60px", md: "80px" }}
      >
        <Container
          maxWidth="1470px"
          width="100%"
          paddingX={{
            base: "20px",
            sm: "30px",
            md: "45px",
            lg: "180px",
            xl: "190px",
          }}
        >
          {/* PAGE TITLE */}
          <Box
            textAlign="center"
            marginBottom={{ base: "35px", md: "45px" }}
          >
            <Heading
              as="h1"
              fontSize={{
                base: "30px",
                sm: "34px",
                md: "40px",
                lg: "44px",
              }}
              fontWeight="700"
              color="#171717"
              lineHeight="1.2"
              marginBottom="12px"
            >
              Our Gallery
            </Heading>

            <Text
              fontSize={{ base: "14px", md: "16px" }}
              color="#777777"
              lineHeight="1.7"
            >
              A glimpse of our campus, events, and success stories.
              Premium vibes, amazing memories.
            </Text>
          </Box>

          {/* LOADING / ERROR / EMPTY / GRID */}
          {loading ? (
            <Flex justify="center" py="60px">
              <Spinner size="lg" color="#8b5cf6" />
            </Flex>
          ) : error ? (
            <Text textAlign="center" color="red.500">
              {error}
            </Text>
          ) : galleryImages.length === 0 ? (
            <Text textAlign="center" color="#777777">
              No media in the gallery yet. Check back soon!
            </Text>
          ) : (
            <Grid
              templateColumns={{
                base: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              }}
              gap={{
                base: "22px",
                sm: "22px",
                md: "26px",
                lg: "22px",
              }}
              alignItems="start"
            >
              {galleryImages.map((item) => (
                <Box
                  key={item.id}
                  width="100%"
                  height={{
                    base: "260px",
                    sm: "230px",
                    md: "250px",
                    lg: "260px",
                  }}
                  borderRadius="17px"
                  overflow="hidden"
                  background="#f3f3f3"
                  cursor="pointer"
                  position="relative"
                  onClick={() => setSelectedMedia(item)}
                  transition="transform 0.3s ease, box-shadow 0.3s ease"
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                  }}
                >
                  {/* GRID THUMBNAIL LOGIC */}
                  {item.image ? (
                    <Image
                      src={resolveImageUrl(item.image)}
                      alt={item.title}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      transition="transform 0.4s ease"
                      _hover={{ transform: "scale(1.05)" }}
                    />
                  ) : item.youtube_url ? (
                    <>
                      <Image
                        src={getYoutubeThumbnail(item.youtube_url)}
                        alt={item.title}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        transition="transform 0.4s ease"
                        _hover={{ transform: "scale(1.05)" }}
                      />

                      <Box
                        position="absolute"
                        inset="0"
                        bg="blackAlpha.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiPlayCircle
                          size={40}
                          color="white"
                          opacity={0.8}
                        />
                      </Box>
                    </>
                  ) : item.video ? (
                    <>
                      <video
                        src={resolveImageUrl(item.video)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      <Box
                        position="absolute"
                        inset="0"
                        bg="blackAlpha.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        pointerEvents="none"
                      >
                        <FiPlayCircle
                          size={40}
                          color="white"
                          opacity={0.8}
                        />
                      </Box>
                    </>
                  ) : null}

                  {/* IMAGE TITLE */}
                  <Box
                    position="absolute"
                    left="0"
                    right="0"
                    bottom="0"
                    padding={{ base: "18px", md: "20px" }}
                    background="linear-gradient(transparent, rgba(0,0,0,0.72))"
                    pointerEvents="none"
                  >
                    <Text
                      color="#ffffff"
                      fontSize="15px"
                      fontWeight="600"
                    >
                      {item.title}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* LIGHTBOX */}
      {selectedMedia && (
        <Box
          position="fixed"
          inset="0"
          width="100%"
          height="100dvh"
          zIndex="9999"
          background="rgba(0,0,0,0.92)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding={{ base: "16px", md: "40px" }}
          onClick={() => setSelectedMedia(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* CLOSE BUTTON */}
          <IconButton
            aria-label="Close preview"
            position="absolute"
            top={{ base: "15px", md: "25px" }}
            right={{ base: "15px", md: "30px" }}
            color="#ffffff"
            background="rgba(255,255,255,0.12)"
            borderRadius="full"
            size="lg"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedMedia(null);
            }}
            _hover={{
              background: "rgba(255,255,255,0.25)",
            }}
          >
            <FiX size={24} />
          </IconButton>

          {/* PREVIOUS BUTTON */}
          <IconButton
            aria-label="Previous"
            position="absolute"
            left={{ base: "8px", md: "30px" }}
            top="50%"
            transform="translateY(-50%)"
            color="#ffffff"
            background="rgba(255,255,255,0.12)"
            borderRadius="full"
            size={{ base: "md", md: "xl" }}
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            _hover={{
              background: "rgba(255,255,255,0.25)",
            }}
          >
            <FiChevronLeft size={28} />
          </IconButton>

          {/* SELECTED MEDIA */}
          <Box
            width="100%"
            maxWidth="1100px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            onClick={(event) => event.stopPropagation()}
          >
            {/* LIGHTBOX MEDIA LOGIC */}
            {selectedMedia.image ? (
              <Image
                src={resolveImageUrl(selectedMedia.image)}
                alt={selectedMedia.title}
                maxWidth="100%"
                width="auto"
                maxHeight="75dvh"
                objectFit="contain"
                borderRadius="10px"
                boxShadow="0 10px 40px rgba(0,0,0,0.35)"
              />
            ) : selectedMedia.youtube_url ? (
              <iframe
                src={getYoutubeEmbedUrl(selectedMedia.youtube_url)}
                title={selectedMedia.title}
                width="100%"
                height="500px"
                style={{
                  border: 0,
                  borderRadius: "10px",
                  maxWidth: "900px",
                }}
                allowFullScreen
              />
            ) : selectedMedia.video ? (
              <video
                src={resolveImageUrl(selectedMedia.video)}
                controls
                autoPlay
                style={{
                  maxWidth: "100%",
                  maxHeight: "75dvh",
                  borderRadius: "10px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
                }}
              />
            ) : null}

            {/* MEDIA TITLE */}
            <Text
              color="#ffffff"
              fontSize={{ base: "16px", md: "19px" }}
              fontWeight="600"
              marginTop="18px"
              textAlign="center"
            >
              {selectedMedia.title}
            </Text>

            {/* IMAGE COUNT */}
            <Text color="#bdbdbd" fontSize="13px" marginTop="6px">
              {galleryImages.findIndex(
                (item) => item.id === selectedMedia.id
              ) + 1}{" "}
              / {galleryImages.length}
            </Text>

            {/* KEYBOARD HINT */}
            <Text
              color="#999999"
              fontSize="12px"
              marginTop="10px"
              display={{ base: "none", md: "block" }}
            >
              {/* Use ← → arrow keys to navigate | Esc to close */}
            </Text>
          </Box>

          {/* NEXT BUTTON */}
          <IconButton
            aria-label="Next"
            position="absolute"
            right={{ base: "8px", md: "30px" }}
            top="50%"
            transform="translateY(-50%)"
            color="#ffffff"
            background="rgba(255,255,255,0.12)"
            borderRadius="full"
            size={{ base: "md", md: "xl" }}
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            _hover={{
              background: "rgba(255,255,255,0.25)",
            }}
          >
            <FiChevronRight size={28} />
          </IconButton>
        </Box>
      )}

      <Footer />
    </>
  );
}

export default Gallery;
