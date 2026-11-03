
import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Image,
  Heading,
  Text,
  Link,
  Spinner,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaEye,
  FaArrowLeft,
  FaImage,
} from "react-icons/fa";

import Header from "../components/header";
import Footer from "../components/footer";
import {
  getPublicBlog,
  resolveImageUrl,
} from "../../services/publicApi";

function BlogDetails() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= DATE FORMATTER =================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ================= LOAD BLOG =================

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setPost(null);

      try {
        const data = await getPublicBlog(slug);

        if (!cancelled) {
          setPost(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Blog not found.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      load();
    } else {
      setLoading(false);
      setError("Blog not found.");
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const imageUrl = post?.image
    ? resolveImageUrl(post.image)
    : null;

  return (
    <>
      <Header />

      <Box
        width="100%"
        height={{ base: "45px", md: "55px" }}
        background="#050505"
        marginTop="-1px"
      />

      <Box
        width="100%"
        background="#ffffff"
        paddingTop={{
          base: "40px",
          sm: "50px",
          md: "60px",
          lg: "70px",
        }}
        paddingBottom={{ base: "60px", md: "80px" }}
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
          <Box maxWidth="900px" width="100%" margin="0 auto">

            {/* BACK TO BLOG */}
            <Link
              as={RouterLink}
              to="/blog"
              display="inline-flex"
              alignItems="center"
              gap="8px"
              color="#64748b"
              fontSize="14px"
              marginBottom="22px"
              textDecoration="none"
              _hover={{ color: "#f59e0b" }}
            >
              <FaArrowLeft />
              Back to Blog
            </Link>

            {/* LOADING */}
            {loading ? (
              <Flex justify="center" py="60px">
                <Spinner size="lg" color="#8b5cf6" />
              </Flex>
            ) : error || !post ? (
              <Text textAlign="center" color="red.500">
                {error || "Blog not found."}
              </Text>
            ) : (
              <>
                {/* BLOG TITLE */}
                <Heading
                  as="h1"
                  color="#172b45"
                  fontSize={{
                    base: "25px",
                    sm: "30px",
                    md: "36px",
                    lg: "40px",
                  }}
                  fontWeight="800"
                  lineHeight="1.3"
                  letterSpacing={{
                    base: "-0.5px",
                    md: "-1px",
                  }}
                  marginBottom="16px"
                >
                  {post.title}
                </Heading>

                {/* BLOG META INFORMATION */}
                <Flex
                  alignItems="center"
                  flexWrap="wrap"
                  gap={{ base: "12px", md: "18px" }}
                  color="#64748b"
                  fontSize="12px"
                  marginBottom="20px"
                >
                  <Flex alignItems="center" gap="6px">
                    <Text color="#f59e0b">✎</Text>
                    <Text>By Appzia Learnx</Text>
                  </Flex>

                  <Flex alignItems="center" gap="6px">
                    <FaCalendarAlt color="#8b5cf6" />

                    <Text>
                      {formatDate(post.uploaded_at)}
                    </Text>
                  </Flex>

                  <Flex alignItems="center" gap="6px">
                    <FaEye />
                    <Text>{post.views ?? 0} Views</Text>
                  </Flex>
                </Flex>

                {/* BLOG IMAGE OR PLACEHOLDER */}
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    width="100%"
                    height={{
                      base: "220px",
                      sm: "280px",
                      md: "360px",
                    }}
                    objectFit="cover"
                    background="#080808"
                    marginBottom="30px"
                    borderRadius="10px"
                  />
                ) : (
                  <Flex
                    width="100%"
                    height={{
                      base: "220px",
                      sm: "280px",
                      md: "360px",
                    }}
                    align="center"
                    justify="center"
                    direction="column"
                    gap="12px"
                    background="#F1F5F9"
                    color="#94A3B8"
                    borderRadius="10px"
                    marginBottom="30px"
                  >
                    <FaImage size={45} />

                    <Text fontSize="14px" fontWeight="medium">
                      No Image Available
                    </Text>
                  </Flex>
                )}

                {/* RICH TEXT DESCRIPTION FROM EDITOR */}
                <Box
                  fontSize={{ base: "14px", md: "16px" }}
                  lineHeight="1.9"
                  color="#52647a"
                  sx={{
                    "& h1, & h2, & h3, & h4": {
                      color: "#10243e",
                      fontWeight: "700",
                      marginTop: "24px",
                      marginBottom: "12px",
                    },

                    "& p": {
                      marginBottom: "16px",
                    },

                    "& ul, & ol": {
                      paddingLeft: "24px",
                      marginBottom: "16px",
                    },

                    "& li": {
                      marginBottom: "6px",
                    },

                    "& img": {
                      maxWidth: "100%",
                      borderRadius: "8px",
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

                    "& pre": {
                      background: "#1e293b",
                      color: "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px",
                      overflowX: "auto",
                      marginBottom: "16px",
                    },

                    "& code": {
                      background: "#f1f5f9",
                      color: "#ef4444",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.9em",
                    },

                    "& pre code": {
                      background: "transparent",
                      color: "inherit",
                      padding: "0",
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: post.description || "",
                  }}
                />

                {/* SEO KEYWORDS */}
                {post.meta_keywords && (
                  <Flex
                    flexWrap="wrap"
                    gap="10px"
                    marginTop="30px"
                  >
                    {post.meta_keywords.split(",").map((tag) => (
                      <Box
                        key={tag.trim()}
                        background="#d9fbe8"
                        color="#087443"
                        padding="7px 13px"
                        borderRadius="20px"
                        fontSize="12px"
                        fontWeight="700"
                      >
                        #{tag.trim()}
                      </Box>
                    ))}
                  </Flex>
                )}
              </>
            )}
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}

export default BlogDetails;


