import api from "../../../../api/axios";

export const fetchUserOverview = async () => {
  const r = await api.get("/analytics");
  return r.data;
};
