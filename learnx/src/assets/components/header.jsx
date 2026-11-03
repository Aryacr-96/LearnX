import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  IconButton,
  Button,
  VStack,
  Drawer,
  Portal,
  CloseButton,
} from "@chakra-ui/react";

import { FiMenu } from "react-icons/fi";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Courses", path: "/course" },
  { name: "Blog", path: "/blog" },
  { name: "Careers", path: "/careers" },
  { name: "Gallery", path: "/gallery" },
  { name: "Hire", path: "/hire" },
  { name: "Placements", path: "/placements" },
  { name: "Contact", path: "/contact" },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Box
      position="relative"
      width="100%"
      height={{
        base: "730px",
        sm: "580px",
        md: "600px",
        lg: "630px",
      }}
      background="#000000"
      overflow="hidden"
      marginTop="-80px"
    >
      {/* PENCIL BACKGROUND */}
      <Image
        src="/images/pencil.png"
        alt="Pencil"
        position="absolute"
        zIndex="99"
        left={{
          base: "-100px",
          sm: "-70px",
          md: "120px",
          lg: "150px",
        }}
       bottom={{
          base: "-490px",
          md: "-290px",
        }}
        width={{
          base: "630px",
          sm: "480px",
          md: "530px",
          lg: "470px",
        }}
           height={{
          base: "700px",
          md: "770px",
        }}
        objectFit="contain"
        transform="rotate(7deg)"
        opacity="0.7"
      />

      {/* DARK OVERLAY */}
      <Box
        position="absolute"
        inset="0"
        zIndex="1"
        background="rgba(0, 0, 0, 0.72)"
        pointerEvents="none"
      />

      {/* MAIN CONTAINER */}
      <Box
        position="relative"
        zIndex="2"
        width="100%"
        maxWidth="1370px"
        margin="0 auto"
        paddingX={{
          base: "20px",
          sm: "30px",
          md: "45px",
          lg: "60px",
          xl: "70px",
        }}
      >
        {/* NAVBAR */}
        <Flex
          position="relative"
          zIndex="10"
          width="100%"
          paddingTop={{
            base: "25px",
            sm: "30px",
            md: "45px",
          }}
          marginTop="45px"
          alignItems="center"
          justifyContent="space-between"
          gap="12px"
        >
          {/* LOGO */}
          <Link
            to="/"
            onClick={closeMenu}
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Image
              src="/images/svg-06.svg"
              alt="Appzia LearnX"
              width={{
                base: "120px",
                sm: "160px",
                md: "170px",
              }}
              height="auto"
              objectFit="contain"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <Flex
            display={{
              base: "none",
              lg: "flex",
            }}
            position="relative"
            zIndex="20"
            alignItems="center"
            justifyContent="center"
            gap={{
              lg: "2px",
              xl: "6px",
            }}
            border="1px solid rgba(255,255,255,0.25)"
            borderRadius="50px"
            paddingX="8px"
            paddingY="6px"
            background="rgba(0,0,0,0.25)"
            flexWrap="nowrap"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: "block",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "700",
                  padding: "7px 9px",
                  borderRadius: "30px",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                {item.name}
              </Link>
            ))}
          </Flex>

          {/* MOBILE MENU BUTTON */}
          <IconButton
            display={{
              base: "flex",
              lg: "none",
            }}
            aria-label="Open navigation menu"
            onClick={() => setIsMenuOpen(true)}
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.4)"
            borderRadius="50%"
            width="45px"
            height="45px"
            minWidth="45px"
            flexShrink="0"
            background="rgba(0,0,0,0.35)"
            _hover={{
              background: "rgba(255,255,255,0.12)",
            }}
          >
            <FiMenu size={23} />
          </IconButton>
        </Flex>

        {/* MOBILE NAVIGATION DRAWER */}
        <Drawer.Root
          open={isMenuOpen}
          onOpenChange={(details) => setIsMenuOpen(details.open)}
          placement="end"
          size="xs"
        >
          <Portal>
            <Drawer.Backdrop />

            <Drawer.Positioner>
              <Drawer.Content
                background="#111111"
                color="white"
                maxWidth="320px"
              >
                {/* DRAWER HEADER */}
                <Drawer.Header
                  borderBottom="1px solid rgba(255,255,255,0.15)"
                  padding="20px"
                >
                  <Flex
                    width="100%"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Link to="/" onClick={closeMenu}>
                      <Image
                        src="/images/svg-06.svg"
                        alt="Appzia LearnX"
                        width="125px"
                        height="auto"
                        objectFit="contain"
                      />
                    </Link>

                    <Drawer.CloseTrigger asChild>
                      <CloseButton
                        aria-label="Close navigation menu"
                        color="white"
                        size="lg"
                      />
                    </Drawer.CloseTrigger>
                  </Flex>
                </Drawer.Header>

                {/* NAVIGATION LINKS */}
                <Drawer.Body padding="20px">
                  <VStack
                    alignItems="stretch"
                    gap="0"
                    width="100%"
                  >
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={closeMenu}
                        style={{
                          display: "block",
                          width: "100%",
                          textDecoration: "none",
                        }}
                      >
                        <Text
                          fontSize="16px"
                          fontWeight="700"
                          paddingY="15px"
                          paddingX="10px"
                          borderBottom="1px solid rgba(255,255,255,0.12)"
                          cursor="pointer"
                          _hover={{
                            background: "rgba(255,255,255,0.08)",
                            color: "#ffffff",
                          }}
                        >
                          {item.name}
                        </Text>
                      </Link>
                    ))}

                    {/* COURSES BUTTON */}
                    <Link
                      to="/course"
                      onClick={closeMenu}
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: "24px",
                      }}
                    >
                      <Button
                        width="100%"
                        height="46px"
                        background="white"
                        color="#111111"
                        borderRadius="full"
                        fontWeight="700"
                        _hover={{
                          background: "#e5e5e5",
                        }}
                      >
                        Explore Courses
                      </Button>
                    </Link>
                  </VStack>
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>

        {/* HERO CONTENT */}
        <Flex
          width="100%"
          height={{
            base: "350px",
            sm: "380px",
            md: "410px",
            lg: "420px",
          }}
          direction="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          paddingX={{
            base: "5px",
            sm: "10px",
          }}
          transform={{
            base: "translateY(-25px)",
            md: "translateY(-40px)",
          }}
        >
          <Heading
            as="h1"
            color="white"
            fontSize={{
              base: "30px",
              sm: "36px",
              md: "44px",
              lg: "52px",
              xl: "56px",
            }}
            lineHeight="1.1"
            fontWeight="700"
            letterSpacing={{
              base: "-1px",
              md: "-1.5px",
            }}
            maxWidth="900px"
          >
            Learn IT Skills for the Future
          </Heading>

          <Text
            color="rgba(255,255,255,0.9)"
            fontSize={{
              base: "15px",
              sm: "17px",
              md: "19px",
              lg: "20px",
            }}
            lineHeight="1.5"
            maxWidth="650px"
            marginTop={{
              base: "14px",
              md: "18px",
            }}
          >
            Explore our trending IT courses and secure top opportunities
            in the tech industry.
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

export default Header;