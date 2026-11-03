import React, { useState } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { FiMapPin, FiPhoneCall, FiAtSign } from "react-icons/fi";

import Header from "../components/header";
import Footer from "../components/footer";
import { sendContactMessage } from "../../services/publicApi";

const contactDetails = [
  {
    icon: <FiMapPin />,
    title: "Our Office",
    description: "123 Innovation Street, Tech Park, Bengaluru, India",
  },
  {
    icon: <FiPhoneCall />,
    title: "Call Us",
    description: "+91 98765 43210",
  },
  {
    icon: <FiAtSign />,
    title: "Email Us",
    description: "contact@yourdomain.com",
  },
];

function Contact() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    // 👇 1. Save the form element to a variable BEFORE the await
    const formElement = event.currentTarget; 
    
    const formData = new FormData(formElement);
    const contactData = Object.fromEntries(formData.entries());

    try {
      // Send data to Django
      await sendContactMessage(contactData);
      
      setStatus({
        type: "success",
        message: "Thank you! Your message has been submitted successfully.",
      });
      
      // 👇 2. Use the saved variable to clear the form safely
      formElement.reset();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      {/* CONTACT PAGE */}
      <Box
        width="100%"
        background="#f8fafc"
        minHeight="750px"
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
          <Box textAlign="center" marginBottom="48px">
            <Heading
              as="h1"
              color="#101a30"
              fontSize={{
                base: "30px",
                sm: "34px",
                md: "38px",
                lg: "40px",
              }}
              fontWeight="800"
              lineHeight="1.2"
            >
              Get In Touch
            </Heading>

            <Text
              marginTop="12px"
              color="#405775"
              fontSize={{
                base: "14px",
                md: "16px",
              }}
              lineHeight="1.7"
              maxWidth="680px"
              marginX="auto"
            >
              Have questions or want to connect? We'd love to hear from you.
              Reach out and let's start a conversation.
            </Text>
          </Box>

          {/* CONTACT DETAILS AND MESSAGE FORM */}
          <Grid
            templateColumns={{
              base: "1fr",
              lg: "1fr 1fr",
            }}
            gap={{
              base: "30px",
              md: "35px",
              lg: "38px",
            }}
            alignItems="stretch"
          >
            {/* LEFT SIDE */}
            <Flex direction="column" gap="22px">
              {contactDetails.map((detail) => (
                <Flex
                  key={detail.title}
                  alignItems="center"
                  gap="15px"
                  minHeight="82px"
                  padding="17px"
                  background="#ffffff"
                  border="1px solid #dfe6f0"
                  borderRadius="16px"
                  boxShadow="0 3px 6px rgba(15, 23, 42, 0.06)"
                >
                  <Flex
                    width="45px"
                    height="46px"
                    flexShrink="0"
                    alignItems="center"
                    justifyContent="center"
                    background="#10182d"
                    borderRadius="12px"
                    color="#f472b6"
                    fontSize="20px"
                  >
                    {detail.icon}
                  </Flex>

                  <Box minWidth="0">
                    <Heading
                      as="h2"
                      fontSize="16px"
                      fontWeight="600"
                      color="#101a30"
                      lineHeight="1.4"
                    >
                      {detail.title}
                    </Heading>

                    <Text
                      marginTop="3px"
                      fontSize="13px"
                      lineHeight="1.5"
                      color="#405775"
                      overflowWrap="anywhere"
                    >
                      {detail.description}
                    </Text>
                  </Box>
                </Flex>
              ))}

              {/* GOOGLE MAP */}
              <Box
                position="relative"
                width="100%"
                height={{
                  base: "260px",
                  md: "195px",
                }}
                border="1px solid #dfe6f0"
                borderRadius="15px"
                overflow="hidden"
                boxShadow="0 3px 6px rgba(15, 23, 42, 0.06)"
                background="#e9eef5"
              >
                <iframe
                  title="Appzia LearnX office location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.4724678363186!2d76.25268707481881!3d11.660890788546851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e5e1d2e37b18717%3A0x64444df162d532d2!2sAppzia%20Learnx!5e0!3m2!1sen!2sus!4v1791865788047!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    display: "block",
                  }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />

                <Box
                  position="absolute"
                  top="10px"
                  left="10px"
                  background="#ffffff"
                  borderRadius="4px"
                  paddingX="12px"
                  paddingY="7px"
                  boxShadow="0 1px 4px rgba(0,0,0,0.15)"
                  pointerEvents="none"
                >
                  <Text fontSize="12px" color="#2563eb" fontWeight="500">
                    Our Location
                  </Text>
                </Box>
              </Box>
            </Flex>

            {/* RIGHT SIDE - MESSAGE FORM */}
            <Box
              background="#ffffff"
              border="1px solid #dfe6f0"
              borderRadius="16px"
              padding={{
                base: "23px",
                sm: "28px",
                md: "32px",
                lg: "38px",
              }}
              boxShadow="0 3px 6px rgba(15, 23, 42, 0.05)"
            >
              <Heading
                as="h2"
                fontSize="19px"
                fontWeight="600"
                color="#101a30"
                marginBottom="22px"
              >
                Send Us a Message
              </Heading>

              {/* Success / Error Message */}
              {status.message && (
                <Box
                  mb="20px"
                  p="12px"
                  borderRadius="8px"
                  bg={status.type === "success" ? "green.50" : "red.50"}
                  color={status.type === "success" ? "green.700" : "red.700"}
                  fontSize="sm"
                  border="1px solid"
                  borderColor={status.type === "success" ? "green.200" : "red.200"}
                >
                  {status.message}
                </Box>
              )}

              <Box as="form" onSubmit={handleSubmit}>
                {/* FULL NAME */}
                <Box marginBottom="15px">
                  <Text
                    as="label"
                    htmlFor="fullName"
                    display="block"
                    fontSize="13px"
                    fontWeight="500"
                    color="#17243b"
                    marginBottom="5px"
                  >
                    Full Name
                  </Text>
                  <Input
                    id="fullName"
                    name="full_name"
                    placeholder="Enter your name"
                    required
                    height="37px"
                    paddingX="12px"
                    fontSize="13px"
                    border="1px solid #cbd7e8"
                    borderRadius="9px"
                    _focus={{
                      borderColor: "#64748b",
                      boxShadow: "0 0 0 1px #64748b",
                    }}
                  />
                </Box>

                {/* EMAIL */}
                <Box marginBottom="15px">
                  <Text
                    as="label"
                    htmlFor="contactEmail"
                    display="block"
                    fontSize="13px"
                    fontWeight="500"
                    color="#17243b"
                    marginBottom="5px"
                  >
                    Email
                  </Text>
                  <Input
                    id="contactEmail"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    height="37px"
                    paddingX="12px"
                    fontSize="13px"
                    border="1px solid #cbd7e8"
                    borderRadius="9px"
                    _focus={{
                      borderColor: "#64748b",
                      boxShadow: "0 0 0 1px #64748b",
                    }}
                  />
                </Box>

                {/* SUBJECT */}
                <Box marginBottom="15px">
                  <Text
                    as="label"
                    htmlFor="subject"
                    display="block"
                    fontSize="13px"
                    fontWeight="500"
                    color="#17243b"
                    marginBottom="5px"
                  >
                    Subject
                  </Text>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Enter subject"
                    required
                    height="37px"
                    paddingX="12px"
                    fontSize="13px"
                    border="1px solid #cbd7e8"
                    borderRadius="9px"
                    _focus={{
                      borderColor: "#64748b",
                      boxShadow: "0 0 0 1px #64748b",
                    }}
                  />
                </Box>

                {/* MESSAGE */}
                <Box marginBottom="15px">
                  <Text
                    as="label"
                    htmlFor="message"
                    display="block"
                    fontSize="13px"
                    fontWeight="500"
                    color="#17243b"
                    marginBottom="5px"
                  >
                    Message
                  </Text>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Write your message..."
                    required
                    minHeight="90px"
                    fontSize="13px"
                    padding="10px 14px"
                    resize="vertical"
                    border="1px solid #cbd7e8"
                    borderRadius="9px"
                    _focus={{
                      borderColor: "#64748b",
                      boxShadow: "0 0 0 1px #64748b",
                    }}
                  />
                </Box>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  width="100%"
                  height="42px"
                  background="#10182d"
                  color="#ffffff"
                  borderRadius="9px"
                  fontSize="13px"
                  fontWeight="600"
                  _hover={{
                    background: "#263247",
                  }}
                  loading={loading}
                >
                  Send Message
                </Button>
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </>
  );
}

export default Contact;