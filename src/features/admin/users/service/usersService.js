import api from "../../../../api/axios";

export const fetchAllUsers = async () => {
  const r = await api.get("/users");
  return r.data;
};
export const updateUserStatus = async (userId, status) => {
  const r = await api.patch(`/users/${userId}/status`, { status });
  return r.data;
};
export const fetchRoleCounts = async () => {
  const r = await api.get("/roles/counts");
  return r.data;
};
