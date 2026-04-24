import api from "../../../api/axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};

export const requestPasswordReset = async (email) => {
  const response = await api.post(`/auth/forgot-password/request?email=${email}`);
  return response.data;
};

export const verifyAndResetPassword = async (resetData) => {
  const response = await api.post('/auth/forgot-password/verify', resetData);
  return response.data;
};
