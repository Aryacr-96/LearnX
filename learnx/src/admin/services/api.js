// src/admin/services/api.js

import { API_BASE_URL } from "../../services/publicApi";

// ---------------------------------------------------------------------------
// Token & session helpers
// ---------------------------------------------------------------------------
export const getToken = () => localStorage.getItem("learnx_admin_token");

export const isAdminLoggedIn = () => Boolean(getToken());

export const getAdminRole = () => localStorage.getItem("learnx_admin_role") || "";

export const getAdminName = () => localStorage.getItem("learnx_admin_name") || "";

export const getAdminEmail = () => localStorage.getItem("learnx_admin_email") || "";

export const getAdminPermissions = () => {
  try {
    return JSON.parse(localStorage.getItem("learnx_admin_permissions") || "{}");
  } catch {
    return {};
  }
};

export const hasPermission = (module) => {
  const role = getAdminRole();
  if (role === "admin") return true;
  if (role !== "subadmin") return false;
  return Boolean(getAdminPermissions()[module]);
};

// ---------------------------------------------------------------------------
// ADMIN LOGIN — identifier may be email, username, or name
// ---------------------------------------------------------------------------
export const adminLogin = async (identifier, password) => {
  const response = await fetch(`${API_BASE_URL}/admin-login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: identifier, password }),
  });

  const text = await response.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text || "Invalid server response." };
  }

  if (!response.ok) {
    throw new Error(data.detail || "Login failed.");
  }

  localStorage.setItem("learnx_admin_token", data.token);
  localStorage.setItem("learnx_admin_username", data.username || "");
  localStorage.setItem("learnx_admin_email", data.email || "");
  localStorage.setItem("learnx_admin_name", data.name || data.username || "");
  localStorage.setItem("learnx_admin_role", data.role || "");
  localStorage.setItem(
    "learnx_admin_permissions",
    JSON.stringify(data.permissions || {})
  );

  return data;
};

// ---------------------------------------------------------------------------
// ADMIN LOGOUT
// ---------------------------------------------------------------------------
export const adminLogout = () => {
  localStorage.removeItem("learnx_admin_token");
  localStorage.removeItem("learnx_admin_username");
  localStorage.removeItem("learnx_admin_email");
  localStorage.removeItem("learnx_admin_name");
  localStorage.removeItem("learnx_admin_role");
  localStorage.removeItem("learnx_admin_permissions");
};

// ---------------------------------------------------------------------------
// Helper: flatten DRF errors into a single readable string
// Handles: { detail: "..." }, { field: ["err1","err2"] }, nested dicts, arrays
// ---------------------------------------------------------------------------
const flattenErrors = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(flattenErrors).filter(Boolean).join(", ");

  if (typeof data === "object") {
    return Object.entries(data)
      .map(([field, errs]) => {
        const msg = flattenErrors(errs);
        if (!msg) return "";
        return field === "non_field_errors" || field === "detail"
          ? msg
          : `${field}: ${msg}`;
      })
      .filter(Boolean)
      .join(" • ");
  }

  return String(data);
};

// ---------------------------------------------------------------------------
// COMMON API REQUEST
// ---------------------------------------------------------------------------
export const apiRequest = async (endpoint, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getToken();

  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    typeof options.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text || `Server returned status ${response.status}.` };
  }

  if (!response.ok) {
    console.error("API Error:", {
      endpoint,
      status: response.status,
      response: data,
    });

    // Auto-logout on 401
    if (response.status === 401) {
      adminLogout();
    }

    const errorMessage =
      flattenErrors(data) ||
      `API request failed: ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
};