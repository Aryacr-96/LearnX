
import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Box, Heading, Text } from "@chakra-ui/react";

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react";

// ================= PUBLIC WEBSITE PAGES =================

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

// ================= ADMIN COMPONENTS =================

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

// ================= TOASTER =================

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
            {toast.type === "loading" ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Toast.Indicator />
            )}

            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && (
                <Toast.Title>{toast.title}</Toast.Title>
              )}

              {toast.description && (
                <Toast.Description>
                  {toast.description}
                </Toast.Description>
              )}
            </Stack>

            {toast.action && (
              <Toast.ActionTrigger>
                {toast.action.label}
              </Toast.ActionTrigger>
            )}

            {toast.meta?.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
}

// ================= PLACEHOLDER MODULE =================

function ModulePage({ title }) {
  return (
    <Box
      bg="white"
      padding={{ base: "20px", md: "30px" }}
      borderRadius="16px"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      width="100%"
    >
      <Heading size="lg" color="#20243A">
        {title}
      </Heading>

      <Text color="gray.500" marginTop="12px" lineHeight="1.8">
        This module will be connected to your Django backend as we build your
        LearnX content management system.
      </Text>
    </Box>
  );
}

// ================= MAIN APP =================

function App() {
  return (
    <BrowserRouter>
      <Toaster />

      <Routes>
        {/* ================= PUBLIC WEBSITE ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/course" element={<Course />} />

        {/* Course detail using slug */}
        <Route
          path="/course/:slug"
          element={<CourseDetails />}
        />

        <Route path="/gallery" element={<Gallery />} />

        <Route path="/hire" element={<Hire />} />

        <Route path="/placements" element={<Placements />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/about" element={<About />} />

        <Route path="/careers" element={<Career />} />

        <Route
          path="/career-details/:jobTitle"
          element={<CareerDetails />}
        />

        {/* Blog listing */}
        <Route
          path="/blog"
          element={<Blog />}
        />

        {/* Blog details using slug */}
        <Route
          path="/blog-details/:slug"
          element={<BlogDetails />}
        />

        {/* ================= ADMIN LOGIN ================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ================= PROTECTED ADMIN ROUTES ================= */}

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>

            {/* Redirect /admin to dashboard */}
            <Route
              index
              element={
                <Navigate to="/admin/dashboard" replace />
              }
            />

            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            <Route
              path="blogs"
              element={<BlogList />}
            />

            <Route
              path="gallery"
              element={<GalleryList />}
            />

            <Route
              path="placements"
              element={<PlacementList />}
            />

            <Route
              path="team"
              element={<TeamMember />}
            />

            <Route
              path="contact"
              element={<ContactList />}
            />

            <Route
              path="courses"
              element={<CourseList />}
            />

            <Route
              path="technologies"
              element={<TechnologyList />}
            />

            <Route
              path="testimonials"
              element={<TestimonialList />}
            />

            <Route
              path="hire-enquiries"
              element={<HireEnquiryList />}
            />

            <Route
              path="careers"
              element={<CareerList />}
            />

            <Route
              path="callbacks"
              element={<CallbackList />}
            />

            <Route
              path="website-content"
              element={
                <ModulePage title="Website Content Management" />
              }
            />

            <Route
              path="enquiries"
              element={
                <ModulePage title="Enquiries Management" />
              }
            />

            <Route
              path="settings"
              element={
                <ModulePage title="Admin Settings" />
              }
            />

          </Route>
        </Route>

        {/* ================= UNKNOWN ROUTES ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
