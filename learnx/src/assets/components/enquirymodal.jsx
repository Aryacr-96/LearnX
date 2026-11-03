
import React, { useEffect, useState } from "react";

import {
  Portal,
  Flex,
  Box,
  Heading,
  Text,
  Input,
  Button,
  IconButton,
  Checkbox,
  NativeSelect,
} from "@chakra-ui/react";

export default function EnquiryModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isRobot, setIsRobot] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Reset messages when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [isOpen]);

  // Close modal using Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Phone number: allow only 10 digits
  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setPhone(value);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Submit callback request
  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (phone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!isRobot) {
      setErrorMessage("Please confirm that you are not a robot.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/callbacks/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: `${countryCode} ${phone}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.detail ||
          errorData.message ||
          "Unable to submit your callback request. Please try again."
        );
      }

      // Show success message inside the modal
      setSuccessMessage(
        "Your callback request has been submitted successfully!"
      );

      // Clear form fields
      setName("");
      setPhone("");
      setCountryCode("+91");
      setIsRobot(false);

    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Background overlay */}
      <Flex
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        background="rgba(0, 0, 0, 0.75)"
        justify="center"
        align="center"
        zIndex="9999"
        padding="15px"
      >
        {/* Modal */}
        <Box
          width="100%"
          maxWidth="484px"
          background="white"
          borderRadius="16px"
          padding={{
            base: "25px 20px",
            md: "30px 35px",
          }}
          position="relative"
          boxShadow="0 10px 40px rgba(0,0,0,0.2)"
          maxHeight="90vh"
          overflowY="auto"
        >
          {/* Close button */}
          <IconButton
            aria-label="Close modal"
            position="absolute"
            top="15px"
            right="15px"
            variant="ghost"
            color="gray.600"
            fontSize="22px"
            onClick={onClose}
          >
            ×
          </IconButton>

          {/* Heading */}
          <Heading
            textAlign="center"
            fontSize={{
              base: "25px",
              md: "34px",
            }}
            fontWeight="700"
            color="black"
            marginBottom="22px"
          >
            Callback Request
          </Heading>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <Box marginBottom="25px">
              <Text
                fontSize="14px"
                fontWeight="600"
                color="black"
                marginBottom="9px"
              >
                Name:
              </Text>

              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                height="55px"
                borderRadius="12px"
                border="1px solid #D1D5DB"
                fontSize="16px"
                color="black"
                _focus={{
                  borderColor: "#555555",
                  boxShadow: "none",
                }}
                required
              />
            </Box>

            {/* Phone */}
            <Box marginBottom="25px">
              <Text
                fontSize="14px"
                fontWeight="600"
                color="black"
                marginBottom="9px"
              >
                Phone:
              </Text>

              <Flex
                width="100%"
                height="55px"
                border="1px solid #D1D5DB"
                borderRadius="12px"
                overflow="hidden"
              >
                {/* Country code */}
                <NativeSelect.Root width="90px" flexShrink={0}>
                  <NativeSelect.Field
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setSuccessMessage("");
                    }}
                    height="55px"
                    border="none"
                    borderRight="1px solid #D1D5DB"
                    borderRadius="0"
                    fontSize="15px"
                    color="black"
                    paddingLeft="12px"
                    paddingRight="5px"
                    background="white"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+971">+971</option>
                    <option value="+61">+61</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>

                {/* Phone number */}
                <Input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  height="55px"
                  border="none"
                  borderRadius="0"
                  fontSize="16px"
                  color="black"
                  _focus={{
                    border: "none",
                    boxShadow: "none",
                  }}
                  required
                />
              </Flex>

              <Text
                fontSize="12px"
                color="gray.500"
                marginTop="5px"
              >
                {phone.length}/10 digits
              </Text>
            </Box>

            {/* Robot checkbox */}
            <Box marginBottom="22px">
              <Checkbox.Root
                checked={isRobot}
                onCheckedChange={(details) => {
                  setIsRobot(details.checked);
                  setErrorMessage("");
                }}
                colorPalette="blue"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>
                  <Text fontSize="14px" color="black">
                    I'm not a robot
                  </Text>
                </Checkbox.Label>
              </Checkbox.Root>
            </Box>

            {/* Error message */}
            {errorMessage && (
              <Text
                color="red.600"
                fontSize="13px"
                fontWeight="600"
                textAlign="center"
                marginBottom="12px"
              >
                {errorMessage}
              </Text>
            )}

            {/* Success message - inside modal */}
            {successMessage && (
              <Box
                background="#E8F5E9"
                border="1px solid #A5D6A7"
                borderRadius="8px"
                padding="12px"
                marginBottom="15px"
              >
                <Text
                  color="green.700"
                  fontSize="14px"
                  fontWeight="600"
                  textAlign="center"
                >
                  {successMessage}
                </Text>
              </Box>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              width="100%"
              height="62px"
              background="#333333"
              color="white"
              borderRadius="10px"
              fontSize="16px"
              fontWeight="600"
              _hover={{
                background: "#222222",
              }}
              loading={loading}
              disabled={loading}
            >
              {loading ? "Submitting..." : "SUBMIT"}
            </Button>
          </form>
        </Box>
      </Flex>
    </Portal>
  );
}
