import api from "../../../../api/axios";

export const fetchMyTransactions = async () => {
  const r = await api.get("/transactions/my");
  return r.data;
};
