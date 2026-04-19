import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8086/reup",
});

// attach the current access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;