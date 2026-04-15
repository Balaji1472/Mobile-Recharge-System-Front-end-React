import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8086/reup",
});

// 1. Request Interceptor: Attach the current Access Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 2. Response Interceptor: Catch expiration errors and refresh the token
api.interceptors.response.use(
  (response) => response, // If the request succeeds, just return the response
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 or 403 AND we haven't already tried to refresh this specific request
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request so we don't enter an infinite loop

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Call your backend refresh endpoint
        // NOTE: Use axios (not api) here to avoid the interceptor loop
        const res = await axios.post("http://localhost:8086/reup/auth/refresh", {
          refreshToken: refreshToken,
        });

        if (res.status === 200) {
          const newAccessToken = res.data.accessToken;

          // 1. Save new token
          localStorage.setItem("accessToken", newAccessToken);

          // 2. Update the header for the failed request
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // 3. Retry the original request with the new token
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token is also expired, log the user out
        console.error("Refresh token expired. Logging out...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // Force redirect
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;