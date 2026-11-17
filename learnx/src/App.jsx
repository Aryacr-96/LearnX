import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, Heading, Text, Toaster as ChakraToaster, Portal, Spinner, Stack, Toast, createToaster } from "@chakra-ui/react";

// Public Pages
import Home from "./assets/pages/home";
import Course from "./assets/pages/course";
import CourseDetails from "./assets/pages/courseDetails";
import Gallery from "./assets/pages/gallery";
import Hire from "./assets/pages/hire";
import Placements from "./assets/pages/placements";
import Contact from "./assets/pages/contact";
import Blog from "./assets/pages/blog";
import BlogDetails from "./assets/pages/blogDetails";
import About from "./assets/pages/about";
import Career from "./assets/pages/career";
import CareerDetails from "./assets/pages/careerDetails";

// Admin Components
import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import BlogList from "./admin/pages/BlogList";
import GalleryList from "./admin/pages/GalleryList";
import ContactList from "./admin/pages/ContactList";
import AdminLogin from "./admin/pages/AdminLogin";
import ProtectedRoute from "./admin/ProtectedRoute";
import PlacementList from "./admin/pages/PlacementList";
import TeamMember from "./admin/pages/TeamMember";
import CourseList from "./admin/pages/CourseList";
import TechnologyList from "./admin/pages/TechnologyList";
import TestimonialList from "./admin/pages/TestimonialList";
import HireEnquiryList from "./admin/pages/HireEnquiryList";
import CareerList from "./admin/pages/CareerList";
import CallbackList from "./admin/pages/CallbackList";
import ManageUsers from "./admin/pages/ManageUsers";
import ManagePageSEO from "./admin/pages/ManagePageSEO"; 
import ChangePassword from "./admin/pages/ChangePassword"; 
import Settings from "./admin/pages/Settings"; // 👈 Imported the new Settings page

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root width={{ md: "sm" }}>
            {toast.type === "loading" ? <Spinner size="sm" color="blue.solid" /> : <Toast.Indicator />}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
            </Stack>
            {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
            {toast.meta?.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
}

function ModulePage({ title }) {
  return (
    <Box bg="white" padding={{ base: "20px", md: "30px" }} borderRadius="16px" border="1px solid" borderColor="gray.200" boxShadow="sm" width="100%">
      <Heading size="lg" color="#20243A">{title}</Heading>
      <Text color="gray.500" marginTop="12px" lineHeight="1.8">This module will be connected to your Django backend.</Text>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* PUBLIC WEBSITE */}
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<Course />} />
        <Route path="/course/:slug" element={<CourseDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/hire" element={<Hire />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Career />} />
        <Route path="/career-details/:jobTitle" element={<CareerDetails />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog-details/:slug" element={<BlogDetails />} />

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route element={<ProtectedRoute />}>
          
          {/* FORCED PASSWORD CHANGE (NO SIDEBAR/HEADER) */}
          <Route path="/admin/change-password" element={<ChangePassword />} />

          {/* MAIN ADMIN DASHBOARD */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route element={<ProtectedRoute module="blogs" />}>
              <Route path="blogs" element={<BlogList />} />
            </Route>
            <Route element={<ProtectedRoute module="gallery" />}>
              <Route path="gallery" element={<GalleryList />} />
            </Route>
            <Route element={<ProtectedRoute module="placements" />}>
              <Route path="placements" element={<PlacementList />} />
            </Route>
            <Route element={<ProtectedRoute module="team" />}>
              <Route path="team" element={<TeamMember />} />
            </Route>
            <Route element={<ProtectedRoute module="contacts" />}>
              <Route path="contact" element={<ContactList />} />
            </Route>
            <Route element={<ProtectedRoute module="courses" />}>
              <Route path="courses" element={<CourseList />} />
            </Route>
            <Route element={<ProtectedRoute module="technologies" />}>
              <Route path="technologies" element={<TechnologyList />} />
            </Route>
            <Route element={<ProtectedRoute module="testimonials" />}>
              <Route path="testimonials" element={<TestimonialList />} />
            </Route>
            <Route element={<ProtectedRoute module="hire_enquiries" />}>
              <Route path="hire-enquiries" element={<HireEnquiryList />} />
            </Route>
            <Route element={<ProtectedRoute module="careers" />}>
              <Route path="careers" element={<CareerList />} />
            </Route>
            <Route element={<ProtectedRoute module="callbacks" />}>
              <Route path="callbacks" element={<CallbackList />} />
            </Route>
            <Route element={<ProtectedRoute module="pages" />}>
              <Route path="page-seo" element={<ManagePageSEO />} />
            </Route>

            {/* Only the main Admin can see these */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="users" element={<ManageUsers />} />
              <Route path="website-content" element={<ModulePage title="Website Content Management" />} />
              <Route path="enquiries" element={<ModulePage title="Enquiries Management" />} />
              
              {/* 👇 Replaced ModulePage with the real Settings component */}
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        {/* UNKNOWN ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;