import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8086/reup",
});

// request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// refresh token 
let isRefreshing = false;
let failedQueue = [];

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
  failedQueue = [];
  window.location.href = "/login";
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register") ||
      originalRequest.url.includes("/auth/refresh");

    const isTokenExpiry =
      error.response?.data?.error === "Token expired or invalid";

    if (
      error.response?.status !== 401 ||
      !isTokenExpiry || 
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error); 
    }

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

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      isRefreshing = false;
      processQueue(error, null);
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        "http://localhost:8086/reup/auth/refresh",
        { refreshToken },
      );

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      console.log("refresh token is generated" + newAccessToken);

      const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          ...authUser,
          ...(data.email && { email: data.email }),
          ...(data.fullName && { fullName: data.fullName }),
          ...(data.role && { role: data.role }),
        }),
      );

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
