import api from "../../../../api/axios";


export const fetchPlansByMobile = async (mobileNumber) => {
  const response = await api.get(`/recharges/lookup/${mobileNumber}`);
  return response.data;
};

export const fetchConnectionId = async (mobileNumber) => {
  const response = await api.get("/recharges/connection", {
    params: { mobileNumber },
  });
  return response.data;
};

export const initiateRecharge = async (payload) => {
  const response = await api.post("/recharges", payload);
  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await api.post("/payments/verify", payload);
  return response.data;
};

export const fetchMyRecharges = async () => {
  const response = await api.get("/recharges/my");
  return response.data;
};

export const cancelPayment = async (razorpayOrderId) => {
  const response = await api.post("/payments/cancel", null, {
    params: { razorpayOrderId },
  });
  return response.data;
};