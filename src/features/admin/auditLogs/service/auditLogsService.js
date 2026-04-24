import api from "../../../../api/axios";

export const fetchAuditLogs = async () => {
  const r = await api.get("/audit-logs");
  return r.data;
};
