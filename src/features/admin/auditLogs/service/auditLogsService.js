import api from "../../../../api/axios";


export const fetchAuditLogs = async (page = 0, size = 10) => {
  const r = await api.get("/audit-logs", {
    params: {
      page,
      size,
      sort: "timestamp,desc",  
    },
  });
  return r.data;               
};