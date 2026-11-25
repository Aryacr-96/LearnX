
 // ==============================================================================
// PRODUCTION MODE - DEPLOYED BACKEND
// ==============================================================================

export const BACKEND_BASE_URL =
  "https://demo2.appziatec.in/backendlearnx";

export const API_BASE_URL =
  `${BACKEND_BASE_URL}/api`;

// ==============================================================================
// LOCAL TESTING MODE
// Uncomment these when testing on your local computer.
// ==============================================================================

// export const BACKEND_BASE_URL = "http://127.0.0.1:8000";
// export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

// ==============================================================================
// IMAGE URL RESOLVER
// ==============================================================================

export const resolveImageUrl = (url) => {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const cleanPath = url.startsWith("/") ? url : `/${url}`;

  return `${BACKEND_BASE_URL}${cleanPath}`;
};

// ==============================================================================
// PUBLIC REQUEST FUNCTION
// ==============================================================================

async function publicRequest(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Not found");
    }

    throw new Error(data.detail || "Request failed.");
  }

  return data;
}

// ==============================================================================
// BLOG API
// ==============================================================================

export const getPublicBlogs = () =>
  publicRequest("/blogs/");

export const getPublicBlog = (slug) =>
  publicRequest(`/blogs/slug/${encodeURIComponent(slug)}/`);

// ==============================================================================
// GALLERY API
// ==============================================================================

export const getPublicGallery = () =>
  publicRequest("/gallery/");

export const getPublicGalleryItem = (id) =>
  publicRequest(`/gallery/${id}/`);

// ==============================================================================
// CONTACT API
// ==============================================================================

export const sendContactMessage = async (data) => {
  const response = await fetch(`${API_BASE_URL}/contact/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = "Failed to send message.";

    if (responseData.detail) {
      errorMsg = responseData.detail;
    } else if (
      typeof responseData === "object" &&
      Object.keys(responseData).length > 0
    ) {
      errorMsg = Object.entries(responseData)
        .map(([field, errors]) =>
          `${field}: ${
            Array.isArray(errors) ? errors.join(" ") : errors
          }`
        )
        .join("\n");
    }

    throw new Error(errorMsg);
  }

  return responseData;
};

// ==============================================================================
// SETTINGS API
// ==============================================================================

export const getPublicSettings = () =>
  publicRequest("/settings/");
