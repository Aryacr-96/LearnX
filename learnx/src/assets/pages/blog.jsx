
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Image,
  Text,
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaEye } from "react-icons/fa";

import Header from "../components/header";
import Footer from "../components/footer";
import { getPublicBlogs, resolveImageUrl } from "../../services/publicApi";

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPublicBlogs();
        const list = Array.isArray(data) ? data : data.results ?? [];

        if (!cancelled) {
          setPosts(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load blogs.");
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

  return (
    <>
      <Header />

      <Box
        background="#ffffff"
        minHeight="100vh"
        width="100%"
        paddingTop={{ base: "55px", sm: "65px", md: "75px", lg: "85px" }}
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
          <Box
            textAlign="center"
            marginBottom={{ base: "40px", md: "55px" }}
          >
            <Heading
              as="h1"
              color="#202020"
              fontSize={{
                base: "32px",
                sm: "40px",
                md: "48px",
                lg: "54px",
                xl: "60px",
              }}
              fontWeight="800"
              lineHeight="1.1"
              letterSpacing={{ base: "-1px", md: "-2px" }}
            >
              Our Blog
            </Heading>

            <Text
              marginTop={{ base: "16px", md: "20px" }}
              marginX="auto"
              color="#365478"
              fontSize={{ base: "16px", md: "18px", lg: "19px" }}
              lineHeight="1.7"
              maxWidth="600px"
            >
              Explore tutorials, insights, and the latest trends in
              web development and design.
            </Text>
          </Box>

          {loading ? (
            <Flex justify="center" py="60px">
              <Spinner size="lg" color="#8b5cf6" />
            </Flex>
          ) : error ? (
            <Text textAlign="center" color="red.500">
              {error}
            </Text>
          ) : posts.length === 0 ? (
            <Text textAlign="center" color="#64748b">
              No blogs published yet. Check back soon!
            </Text>
          ) : (
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3 }}
              gap={{ base: "25px", md: "25px", lg: "30px" }}
              alignItems="stretch"
            >
              {posts.map((post) => (
                <Box
                  key={post.id}
                  as={RouterLink}
                  to={`/blog-details/${post.slug}`}
                  display="flex"
                  flexDirection="column"
                  height="100%"
                  background="#ffffff"
                  border="1px solid #e5e7eb"
                  borderRadius="14px"
                  overflow="hidden"
                  textDecoration="none"
                  color="#111827"
                  boxShadow="0 3px 6px rgba(0,0,0,0.10)"
                  transition="all 0.25s ease"
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 28px rgba(30,50,80,0.14)",
                  }}
                >
                  <Image
                    src={
                      resolveImageUrl(post.image) ||
                      "/images/school2.jpg"
                    }
                    alt={post.title}
                    width="100%"
                    height={{
                      base: "230px",
                      sm: "190px",
                      md: "200px",
                      lg: "210px",
                    }}
                    objectFit="cover"
                    background="#080808"
                  />

                  <Flex
                    direction="column"
                    flex="1"
                    padding={{ base: "18px", md: "20px" }}
                  >
                    <Flex
                      alignItems="center"
                      gap="4px"
                      marginBottom="8px"
                    >
                      <Text
                        fontSize="13px"
                        fontWeight="700"
                        color="#111111"
                      >
                        Appzia
                      </Text>

                      <Text fontSize="13px" color="#94a3b8">
                        Learnx
                      </Text>
                    </Flex>

                    <Heading
                      as="h2"
                      fontSize={{ base: "19px", md: "20px" }}
                      fontWeight="600"
                      lineHeight="1.45"
                      color="#111827"
                      marginBottom="18px"
                      flex="1"
                    >
                      {post.title}
                    </Heading>

                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap="10px"
                      borderTop="1px solid #eeeeee"
                      paddingTop="13px"
                      color="#64748b"
                    >
                      <Flex alignItems="center" gap="5px">
                        <FaCalendarAlt color="#8b5cf6" size={12} />

                        <Text fontSize="12px">
                          {post.uploaded_at
                            ? new Date(post.uploaded_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "—"}
                        </Text>
                      </Flex>

                      <Flex alignItems="center" gap="5px">
                        <FaClock size={12} />

                        <Text fontSize="12px">
                          5 min
                        </Text>
                      </Flex>

                      <Flex alignItems="center" gap="5px">
                        <FaEye size={12} />

                        <Text fontSize="12px">
                          {post.views != null ? `${post.views}` : "0"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Container>
      </Box>

      <Footer />
    </>
  );
}

export default Blog;
