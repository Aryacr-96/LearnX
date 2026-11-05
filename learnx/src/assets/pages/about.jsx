import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  Spinner,
} from "@chakra-ui/react";

import Header from "../components/header";
import Footer from "../components/footer";

// Replace with your actual Django backend URL
const BACKEND_URL = "http://localhost:8000";

const history = [
  {
    year: "2021",
    title: "Launched",
    description:
      "Opened our doors with a focus on web experiences and rapid prototypes.",
  },
  {
    year: "2023",
    title: "Scaled the Team",
    description:
      "Introduced mobile, data, and DevOps practices to support larger builds.",
  },
  {
    year: "2024 –",
    title: "Product Partnerships",
    description:
      "Began partnering with founders to co-build and scale flagship products.",
  },
];

const missionPoints = [
  "Deliver engaging and impactful learning experiences",
  "Bridge the gap between education and industry requirements",
  "Promote continuous learning and professional growth",
  "Enable digital transformation in education and training",
  "Develop scalable and future-ready learning solutions",
];

const values = [
  { text: "User-centered decisions", color: "#6560ed" },
  { text: "Craftsmanship over shortcuts", color: "#a859e4" },
  { text: "Open communication", color: "#ec2e8d" },
  { text: "Continuous learning", color: "#2fe9ab" },
];

const milestones = [
  {
    number: "21",
    title: "First Release",
    description: "Shipped MVP for our first SaaS client in record time.",
    color: "#6964ff",
  },
  {
    number: "22",
    title: "First Enterprise",
    description:
      "Completed our first multi-team, multi-quarter engagement.",
    color: "#b14cff",
  },
  {
    number: "23",
    title: "Global Team",
    description:
      "Expanded to new regions and added mobile & data practices.",
    color: "#ec4899",
  },
  {
    number: "24",
    title: "Partner Programs",
    description:
      "Launched co-build initiatives with startups and SMBs.",
    color: "#10b981",
  },
];

const cardStyle = {
  border: "1px solid #e0e7f0",
  borderRadius: "22px",
  background: "#ffffff",
  boxShadow: "0 3px 10px rgba(20, 40, 70, 0.035)",
};

function About() {
  // ================= DYNAMIC TEAM STATE =================
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/team/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch team");
        return res.json();
      })
      .then((data) => {
        setTeam(data);
        setTeamLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching team:", err);
        setTeamLoading(false);
      });
  }, []);

  // Helper to format Django image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  // Helper to build initials for the placeholder
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Header />

      <Box
        background="#ffffff"
        width="100%"
        minHeight="100vh"
        paddingTop={{
          base: "55px",
          sm: "65px",
          md: "75px",
          lg: "85px",
        }}
        paddingBottom="80px"
        color="#101828"
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
          {/* ================= ABOUT INTRODUCTION ================= */}

          <Grid
            templateColumns={{
              base: "1fr",
              lg: "1fr 1fr",
            }}
            gap={{
              base: "35px",
              md: "50px",
              lg: "70px",
            }}
            alignItems="center"
            marginBottom="42px"
          >
            <Grid
              templateColumns="0.65fr 1.15fr 1fr"
              gap={{
                base: "10px",
                md: "15px",
              }}
              alignItems="start"
            >
              <Image
                src="/images/retreat.webp"
                alt="Technology and learning"
                width="100%"
                height={{
                  base: "150px",
                  md: "225px",
                }}
                objectFit="cover"
                borderRadius="14px"
                marginTop="0"
              />

              <Image
                src="/images/school2.jpg"
                alt="Student reading a book"
                width="100%"
                height={{
                  base: "200px",
                  md: "290px",
                }}
                objectFit="cover"
                borderRadius="14px"
                marginTop="0"
              />

              <Image
                src="/images/school1.jpg"
                alt="Learning and professional development"
                width="100%"
                height={{
                  base: "245px",
                  md: "365px",
                }}
                objectFit="cover"
                borderRadius="14px"
                marginTop="0"
              />
            </Grid>

            <Box>
              <Text
                fontSize="16px"
                letterSpacing="0.3px"
                color="#64748b"
                marginBottom="12px"
              >
                ~ About Us
              </Text>

              <Heading
                as="h1"
                fontSize={{
                  base: "30px",
                  sm: "35px",
                  md: "40px",
                  lg: "44px",
                  xl: "44px",
                }}
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
                marginBottom="30px"
                textAlign="justify"
              >
                In this fast-moving digital world, staying ahead means
                mastering the skills that employers are actively searching
                for. At Appzia LearnX, recognized as the best training
                institute in Wayanad, we are on a mission to forge a new era
                of talent and expertise. Backed by experienced founders from
                Appzia Tec Solution, we bring years of industry insight and
                a genuine passion for nurturing young minds right here in
                our community.
              </Text>

              <Text
                color="#64748b"
                fontSize={{ base: "15px", md: "17px" }}
                lineHeight="1.85"
                textAlign="justify"
              >
                We understand that traditional education often leaves a gap
                between classroom learning and real-world demands. That's
                exactly where we step in. Our trending IT courses are
                handpicked to bridge that gap — offering comprehensive
                training in Full Stack Development, Software Testing, Data
                Science, Accounting, and Digital Marketing. Whether you dream
                of building websites, ensuring software quality, diving into
                data, managing finances, or crafting digital campaigns, we
                offer some of the best IT courses in Wayanad designed just
                for you.
              </Text>
            </Box>
          </Grid>

          <Box marginBottom="85px">
            <Text
              color="#64748b"
              fontSize={{ base: "15px", md: "17px" }}
              lineHeight="1.85"
              marginBottom="25px"
              textAlign="justify"
            >
              What makes Appzia LearnX truly unique? It's our commitment to
              practical, project-based learning. We believe the best way to
              learn tech is by building stuff — tackling real challenges,
              creating real projects, and gaining real confidence. Our
              founders, with their deep roots in the tech industry, have
              designed every course to reflect what companies actually need
              today. That's why students from across the district choose us
              as their preferred best training institute in Wayanad to
              launch their careers.
            </Text>

            <Text
              color="#64748b"
              fontSize={{ base: "15px", md: "17px" }}
              lineHeight="1.85"
              marginBottom="25px"
              textAlign="justify"
            >
              And let's be honest: landing a job isn't just about technical
              skills. That's why our programs go beyond coding and software.
              We weave in soft skills training, resume workshops, and mock
              interviews so you walk into any interview with confidence.
              We'll help you communicate your ideas clearly, present your
              work effectively, and navigate the hiring process with a little
              less stress and a lot more self-belief.
            </Text>

            <Text
              color="#64748b"
              fontSize={{ base: "15px", md: "17px" }}
              lineHeight="1.85"
              textAlign="justify"
            >
              As we pave the path for a more promising future in the sector,
              we invite you to realize your potential and reach new heights
              with our certified courses in Wayanad. Join us at Appzia
              LearnX and become part of a community that learns, builds,
              and grows together. Your journey into the world of technology
              starts here — right in the heart of Wayanad.
            </Text>
          </Box>

          {/* ================= COMPANY HISTORY ================= */}

          <Box marginBottom="75px">
            <Heading
              as="h2"
              fontSize={{
                base: "20px",
                md: "35px",
              }}
              fontWeight="750"
              marginBottom="12px"
            >
              Company Brief History
            </Heading>

            <Text
              color="#64748b"
              fontSize={{ base: "15px", md: "17px" }}
              lineHeight="1.8"
              mt={{ base: "5px", md: "30px" }}
              marginBottom="40px"
            >
              Appzia LearnX is a forward-thinking learning and technology
              solutions company committed to transforming education,
              training, and skill development through innovative digital
              platforms and modern learning experiences. We specialize in
              delivering high-quality e-learning solutions, corporate
              training, educational technology services, and
              industry-oriented skill development programs designed to
              empower individuals, institutions, and organizations in the
              digital era. By combining technology, creativity, and
              practical learning methodologies, Appzia LearnX helps learners
              and businesses adapt, grow, and succeed in an evolving world.
            </Text>

            <SimpleGrid
              columns={{
                base: 1,
                md: 3,
              }}
              gap="18px"
            >
              {history.map((item) => (
                <Box
                  key={item.year}
                  {...cardStyle}
                  padding="23px"
                  minHeight="140px"
                >
                  <Text
                    color="#64748b"
                    fontSize="14px"
                    fontWeight="600"
                    letterSpacing="0.5px"
                    marginBottom="8px"
                  >
                    {item.year}
                  </Text>

                  <Heading
                    as="h3"
                    fontSize={{ base: "21px", md: "24px" }}
                    fontWeight="600"
                    marginBottom="10px"
                  >
                    {item.title}
                  </Heading>

                  <Text
                    color="#64748b"
                    fontSize={{ base: "15px", md: "17px" }}
                    lineHeight="1.7"
                  >
                    {item.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* ================= MISSION & VISION ================= */}

          <Box marginBottom="80px">
            <Heading
              as="h2"
              fontSize={{
                base: "20px",
                md: "35px",
              }}
              fontWeight="750"
              marginBottom="22px"
            >
              Mission &amp; Vision
            </Heading>

            <Grid
              templateColumns={{
                base: "1fr",
                lg: "1.05fr 1fr",
              }}
              gap={{
                base: "22px",
                lg: "48px",
              }}
              alignItems="center"
            >
              <Flex direction="column" gap="16px">
                <Box {...cardStyle} padding="25px">
                  <Heading
                    as="h3"
                    fontSize={{ base: "21px", md: "24px" }}
                    fontWeight="600"
                    marginBottom="14px"
                  >
                    Mission
                  </Heading>

                  <Flex direction="column" gap="14px">
                    {missionPoints.map((point) => (
                      <Text
                        key={point}
                        color="#64748b"
                        fontSize={{ base: "15px", md: "17px" }}
                        lineHeight="1.7"
                      >
                        • &nbsp;{point}
                      </Text>
                    ))}
                  </Flex>
                </Box>

                <Box {...cardStyle} padding="25px">
                  <Heading
                    as="h3"
                    fontSize={{ base: "21px", md: "24px" }}
                    fontWeight="600"
                    marginBottom="10px"
                  >
                    Vision
                  </Heading>

                  <Text
                    color="#64748b"
                    fontSize={{ base: "15px", md: "17px" }}
                    lineHeight="1.8"
                  >
                    To become a leading digital learning and skill
                    development platform that empowers individuals and
                    organizations through innovative, accessible, and
                    technology-driven education.
                  </Text>
                </Box>
              </Flex>

              <Box {...cardStyle} padding="25px">
                <Heading
                  as="h3"
                  fontSize={{ base: "21px", md: "24px" }}
                  fontWeight="600"
                  marginBottom="15px"
                >
                  Values
                </Heading>

                <Flex direction="column" gap="11px">
                  {values.map((value) => (
                    <Flex
                      key={value.text}
                      alignItems="center"
                      gap="10px"
                    >
                      <Box
                        width="8px"
                        height="8px"
                        borderRadius="full"
                        background={value.color}
                        flexShrink="0"
                      />

                      <Text
                        color="#64748b"
                        fontSize={{ base: "15px", md: "17px" }}
                      >
                        {value.text}
                      </Text>
                    </Flex>
                  ))}
                </Flex>

                <Grid
                  templateColumns="1fr 1fr"
                  gap="15px"
                  marginTop="25px"
                >
                  <Box
                    background="#f7f9fc"
                    borderRadius="16px"
                    textAlign="center"
                    padding="20px 10px"
                  >
                    <Text
                      color="#64748b"
                      fontSize="13px"
                      marginBottom="5px"
                    >
                      Uptime
                    </Text>

                    <Heading
                      fontSize="28px"
                      fontWeight="750"
                    >
                      99.9%
                    </Heading>
                  </Box>

                  <Box
                    background="#f7f9fc"
                    borderRadius="16px"
                    textAlign="center"
                    padding="20px 10px"
                  >
                    <Text
                      color="#64748b"
                      fontSize="13px"
                      marginBottom="5px"
                    >
                      NPS
                    </Text>

                    <Heading
                      fontSize="28px"
                      fontWeight="750"
                    >
                      68
                    </Heading>
                  </Box>
                </Grid>

                <Text
                  color="#64748b"
                  fontSize="13px"
                  marginTop="14px"
                >
                  * Replace with your real value metrics.
                </Text>
              </Box>
            </Grid>
          </Box>

          {/* ================= OUR PATH ================= */}

          <Box marginBottom="80px">
            <Heading
              as="h2"
              fontSize={{
                base: "20px",
                md: "35px",
              }}
              fontWeight="750"
              marginBottom="10px"
            >
              Our Path
            </Heading>

            <Text
              color="#64748b"
              fontSize={{ base: "15px", md: "17px" }}
              marginBottom="40px"
            >
              A quick timeline of milestones that shaped our journey.
            </Text>

            <Box position="relative">
              <Box
                position="absolute"
                left={{
                  base: "16px",
                  md: "32px",
                }}
                top="15px"
                bottom="15px"
                borderLeft="2px dotted #dbe3ee"
              />

              <Flex direction="column" gap="30px">
                {milestones.map((item) => (
                  <Flex
                    key={item.number}
                    gap={{
                      base: "16px",
                      md: "18px",
                    }}
                    alignItems="flex-start"
                    position="relative"
                  >
                    <Flex
                      width={{
                        base: "34px",
                        md: "64px",
                      }}
                      flexShrink="0"
                      justifyContent="center"
                    >
                      <Flex
                        width="30px"
                        height="30px"
                        borderRadius="full"
                        border={`1px solid ${item.color}`}
                        color={item.color}
                        background="#ffffff"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="13px"
                        fontWeight="600"
                      >
                        {item.number}
                      </Flex>
                    </Flex>

                    <Box
                      {...cardStyle}
                      flex="1"
                      padding="18px"
                    >
                      <Heading
                        as="h3"
                        fontSize={{ base: "21px", md: "24px" }}
                        fontWeight="600"
                        marginBottom="8px"
                      >
                        {item.title}
                      </Heading>

                      <Text
                        color="#64748b"
                        fontSize={{ base: "15px", md: "17px" }}
                        lineHeight="1.7"
                      >
                        {item.description}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </Flex>
            </Box>

            <Flex
              gap="12px"
              marginTop="40px"
              flexWrap="wrap"
            >
              <Button
                background="#101828"
                color="#ffffff"
                borderRadius="30px"
                paddingX="24px"
                height="40px"
                fontSize="14px"
                _hover={{ background: "#263247" }}
              >
                Work with us
              </Button>

              <Button
                variant="outline"
                border="1px solid #e0e7f0"
                color="#101828"
                borderRadius="30px"
                paddingX="24px"
                height="40px"
                fontSize="14px"
                _hover={{ background: "#f7f9fc" }}
              >
                Meet the team
              </Button>
            </Flex>
          </Box>

          {/* ================= OUR TEAM (DYNAMIC) ================= */}

          <Box marginBottom="40px">
            <Heading
              as="h2"
              fontSize={{
                base: "20px",
                md: "35px",
              }}
              fontWeight="750"
              marginBottom="10px"
            >
              Our Team
            </Heading>

            <Text
              color="#64748b"
              fontSize={{ base: "15px", md: "17px" }}
              marginBottom="40px"
            >
              A small, senior team obsessed with details and outcomes.
            </Text>

            {teamLoading ? (
              <Flex justify="center" py="40px">
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : team.length === 0 ? (
              <Text color="gray.500">No team members added yet.</Text>
            ) : (
              <SimpleGrid
                columns={{
                  base: 1,
                  sm: 2,
                  lg: 3,
                }}
                gap="20px"
              >
                {team.map((member) => (
                  <Box
                    key={member.id}
                    {...cardStyle}
                    padding="20px"
                    transition="all 0.25s ease"
                    _hover={{
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 28px rgba(20,40,70,0.08)",
                    }}
                  >
                    {member.image ? (
                      <Image
                        src={getImageUrl(member.image)}
                        alt={member.name}
                        width="100%"
                        height={{ base: "250px", md: "225px" }}
                        objectFit="cover"
                        borderRadius="16px"
                        marginBottom="15px"
                        fallback={
                          <Box
                            height={{ base: "250px", md: "225px" }}
                            bg="#eff6ff"
                            borderRadius="16px"
                            marginBottom="15px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize={{ base: "48px", md: "56px" }}
                            fontWeight="700"
                            color="#2563eb"
                          >
                            {getInitials(member.name)}
                          </Box>
                        }
                      />
                    ) : (
                      <Box
                        height={{ base: "250px", md: "225px" }}
                        bg="#eff6ff"
                        borderRadius="16px"
                        marginBottom="15px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize={{ base: "48px", md: "56px" }}
                        fontWeight="700"
                        color="#2563eb"
                      >
                        {getInitials(member.name)}
                      </Box>
                    )}

                    <Heading
                      as="h3"
                      fontSize={{ base: "21px", md: "24px" }}
                      fontWeight="600"
                      marginBottom="8px"
                    >
                      {member.name}
                    </Heading>

                    <Box
                      display="inline-block"
                      background="#eff6ff"
                      color="#2563eb"
                      borderRadius="30px"
                      paddingX="12px"
                      paddingY="5px"
                      fontSize="13px"
                      fontWeight="500"
                      marginBottom="14px"
                    >
                      {member.role}
                    </Box>

                    <Text
                      color="#64748b"
                      fontSize={{ base: "15px", md: "17px" }}
                      lineHeight="1.8"
                    >
                      {member.bio}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

          {/* ================= JOIN US ================= */}

          <Flex
            {...cardStyle}
            padding={{
              base: "22px",
              md: "25px",
            }}
            marginTop="40px"
            alignItems={{
              base: "flex-start",
              sm: "center",
            }}
            justifyContent="space-between"
            gap="20px"
            direction={{
              base: "column",
              sm: "row",
            }}
          >
            <Box>
              <Heading
                as="h3"
                fontSize={{ base: "21px", md: "24px" }}
                fontWeight="600"
                marginBottom="5px"
              >
                Want to join us?
              </Heading>

              <Text
                color="#64748b"
                fontSize={{ base: "15px", md: "17px" }}
              >
                We're always looking for curious people who care about craft.
              </Text>
            </Box>

            <Button
              as={RouterLink}
              to="/careers"
              background="#101828"
              color="#ffffff"
              borderRadius="30px"
              paddingX="22px"
              height="36px"
              fontSize="13px"
              flexShrink="0"
              _hover={{ background: "#263247" }}
            >
              See Open Roles
            </Button>
          </Flex>
        </Container>
      </Box>

      <Footer />
    </>
  );
}

export default About;