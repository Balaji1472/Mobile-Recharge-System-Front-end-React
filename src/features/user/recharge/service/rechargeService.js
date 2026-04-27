import api from "../../../../api/axios";

/**
 * Fetch all plans available for a given mobile number.
 * GET /recharges/lookup/:mobileNumber
 */
export const fetchPlansByMobile = async (mobileNumber) => {
  const response = await api.get(`/recharges/lookup/${mobileNumber}`);
  return response.data;
};

/**
 * Resolve a mobile number → connectionId.
 * GET /recharges/connection?mobileNumber=...
 */
export const fetchConnectionId = async (mobileNumber) => {
  const response = await api.get("/recharges/connection", {
    params: { mobileNumber },
  });
  return response.data;
};

/**
 * Initiate a recharge — creates a Razorpay order on the backend.
 * POST /recharges
 * Payload:  { connectionId, planId, paymentMethod }
 * Response: { rechargeId, razorpayOrderId, finalAmount, planName, ... }
 */
export const initiateRecharge = async (payload) => {
  const response = await api.post("/recharges", payload);
  return response.data;
};

/**
 * Verify Razorpay payment signature with backend after popup success.
 * POST /payments/verify
 * Payload: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * Backend verifies HMAC signature → updates payment + recharge in DB → returns PaymentResponseDTO
 */
export const verifyPayment = async (payload) => {
  const response = await api.post("/payments/verify", payload);
  return response.data;
};

/**
 * Get current user's recharge history.
 * GET /recharges/my
 */
export const fetchMyRecharges = async () => {
  const response = await api.get("/recharges/my");
  return response.data;
};