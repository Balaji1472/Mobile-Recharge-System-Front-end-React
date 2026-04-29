import api from "../../../../api/axios";

export const fetchMyInvoices = async () => {
  const response = await api.get("/invoices/my");
  return response.data;
};


export const fetchInvoiceById = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}`);
  return response.data;
};


export const fetchInvoiceByRechargeId = async (rechargeId) => {
  const response = await api.get(`/recharges/${rechargeId}/invoice`);
  return response.data;
};