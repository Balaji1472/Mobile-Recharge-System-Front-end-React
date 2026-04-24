import api from "../../../../api/axios";

export const fetchAllNotifications = async () => {
  const r = await api.get("/notifications");
  return r.data;
};
