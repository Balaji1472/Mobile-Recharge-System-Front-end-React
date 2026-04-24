import api from "../../../../api/axios";

export const fetchProfile = async () => {
  const r = await api.get("/auth/profile");
  return r.data;
};
export const updateProfile = async (payload) => {
  const r = await api.put("/auth/profile", payload);
  return r.data;
};
