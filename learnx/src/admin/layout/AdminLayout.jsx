import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  return (
    <Flex minHeight="100vh" bg="#F7F8FC">
      <Sidebar />
      <Box flex="1" minWidth="0">
        <AdminHeader />
        <Box padding={{ base: "18px", md: "32px" }} maxW="1400px" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
}