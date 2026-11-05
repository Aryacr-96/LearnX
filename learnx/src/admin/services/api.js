const API_BASE_URL = "https://demo2.appziatec.in/backendlearnx/api";

export const getToken = () =>
  localStorage.getItem("learnx_admin_token");

export const isAdminLoggedIn = () =>
  Boolean(getToken());

// ADMIN LOGIN
export const adminLogin = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/admin-login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
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
  localStorage.setItem("learnx_admin_username", data.username);

  return data;
};

// ADMIN LOGOUT
export const adminLogout = () => {
  localStorage.removeItem("learnx_admin_token");
  localStorage.removeItem("learnx_admin_username");
};

// COMMON API REQUEST
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

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      detail: text || `Server returned status ${response.status}.`,
    };
  }

  if (!response.ok) {
    console.error("API Error:", {
      endpoint,
      status: response.status,
      response: data,
    });

    if (response.status === 401) {
      adminLogout();
    }

    const errorMessage =
      data.detail ||
      data.error ||
      (typeof data === "object"
        ? JSON.stringify(data)
        : String(data)) ||
      `API request failed: ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
};
