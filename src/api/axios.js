import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8086/reup",
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Refresh Token State ────
let isRefreshing = false;
let failedQueue = []; // holds requests waiting while refresh is in progress

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("auth_user");
  window.location.href = "/login";
};

// ─── Response Interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response, // pass through all successful responses untouched

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 — skip everything else and also prevent infinite retry
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If refresh is already running, queue this request until it finishes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark request so it won't retry again on another 401
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      // No refresh token at all — go to login immediately
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    try {
      // Call backend refresh endpoint
      const { data } = await axios.post(
        "http://localhost:8086/reup/auth/refresh",
        { refreshToken }
      );

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      // Save rotated tokens
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Update auth_user with latest info from refresh response
      const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          ...authUser,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        })
      );
      // Unblock all queued requests with new token
      processQueue(null, newAccessToken);

      // Retry the original failed request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      // Refresh itself failed — clear session and redirect to login
      processQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;