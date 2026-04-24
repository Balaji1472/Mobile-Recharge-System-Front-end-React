import api from "../../../../api/axios";

export const fetchUnreadNotifications = async () => {
  const r = await api.get("/notifications/unread");
  return r.data;
};
export const fetchReadNotifications = async () => {
  const r = await api.get("/notifications/readed");
  return r.data;
};
export const markNotificationRead = async (id) => {
  const r = await api.patch(`/notifications/${id}`);
  return r.data;
};
export const markAllNotificationsRead = async () => {
  const r = await api.patch("/notifications/read-all");
  return r.data;
};
