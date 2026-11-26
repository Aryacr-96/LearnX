// src/services/publicApi.js

// ==============================================================================
// 🟢 LIVE & PRODUCTION READY
// Explicitly pointing to your live backend to prevent the frontend from 
// calling 127.0.0.1 (which returns HTML and breaks the login).
// ==============================================================================
export const BACKEND_BASE_URL = "https://demo2.appziatecin.in";
export const API_BASE_URL = "https://demo2.appziatecin.in/api";

// If you ever want to switch back to localhost for local testing, just comment
// out the two lines above and uncomment these:
// export const BACKEND_BASE_URL = "http://127.0.0.1:8000";
// export const API_BASE_URL = "http://127.0.0.1:8000/api";

export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
};

async function publicRequest(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { Accept: "application/json" },
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

// ================= BLOG API =================
export const getPublicBlogs = () => publicRequest("/blogs/");
export const getPublicBlog = (slug) =>
  publicRequest(`/blogs/slug/${encodeURIComponent(slug)}/`);

// ================= GALLERY API =================
export const getPublicGallery = () => publicRequest("/gallery/");
export const getPublicGalleryItem = (id) => publicRequest(`/gallery/${id}/`);

// ================= CONTACT API =================
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
          `${field}: ${Array.isArray(errors) ? errors.join(" ") : errors}`
        )
        .join("\n");
    }

    throw new Error(errorMsg);
  }

  return responseData;
};

// ================= SETTINGS API =================
export const getPublicSettings = () => publicRequest("/settings/");