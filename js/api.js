(function createPteahBayApi(global) {
  const API_BASE_URL = "https://pteahbay-api.cheatdev.online";
  const AUTH_STORAGE_KEY = "pteahbay-auth";

  class ApiError extends Error {
    constructor(message, status, data) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.data = data;
    }
  }

  function buildUrl(endpoint) {
    if (!endpoint) {
      return API_BASE_URL;
    }

    if (/^https?:/i.test(endpoint)) {
      return endpoint;
    }

    return `${API_BASE_URL}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;
  }

  async function apiRequest(endpoint, options = {}) {
    const requestInit = {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    };

    if (options.body !== undefined) {
      requestInit.body = options.body;
    }

    const response = await fetch(buildUrl(endpoint), requestInit);
    const contentType = response.headers.get("Content-Type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        (payload && payload.detail) ||
        (typeof payload === "string" && payload) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, payload);
    }

    return payload;
  }

  async function loginUser(credentials) {
    const payload = await apiRequest("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    persistAuthSession({
      accessToken: payload.access_token,
      tokenType: payload.token_type,
      user: payload.user,
    });

    return payload;
  }

  async function registerUser(userData) {
    return apiRequest("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  }

  async function registerAndLogin(userData) {
    await registerUser(userData);
    return loginUser({
      email: userData.email,
      password: userData.password,
    });
  }

  function persistAuthSession(session) {
    try {
      const record = {
        ...session,
        storedAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record));
    } catch (error) {
      console.warn("Unable to persist auth session", error);
    }
  }

  function getStoredAuthSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Unable to read auth session", error);
      return null;
    }
  }

  function clearAuthSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  global.PteahBayAPI = {
    API_BASE_URL,
    AUTH_STORAGE_KEY,
    loginUser,
    registerUser,
    registerAndLogin,
    getStoredAuthSession,
    clearAuthSession,
    apiRequest,
  };
})(window);
