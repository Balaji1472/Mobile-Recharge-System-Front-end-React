import api from "../../../../api/axios";

/**
 * GET /invoices/my
 * Returns all invoices for the currently logged-in user.
 */
export const fetchMyInvoices = async () => {
  const response = await api.get("/invoices/my");
  return response.data;
};

/**
 * GET /invoices/{id}
 * Returns a single invoice by invoice ID.
 */
export const fetchInvoiceById = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}`);
  return response.data;
};

/**
 * GET /recharges/{rechargeId}/invoice
 * Returns the invoice linked to a specific recharge.
 */
export const fetchInvoiceByRechargeId = async (rechargeId) => {
  const response = await api.get(`/recharges/${rechargeId}/invoice`);
  return response.data;
};