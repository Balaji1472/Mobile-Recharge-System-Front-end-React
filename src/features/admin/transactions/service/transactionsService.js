import api from "../../../../api/axios";

export const fetchAllTransactions = async () => {
  const r = await api.get("/transactions");
  return r.data;
};
export const fetchAllRefunds = async () => {
  const r = await api.get("/refunds");
  return r.data;
};
