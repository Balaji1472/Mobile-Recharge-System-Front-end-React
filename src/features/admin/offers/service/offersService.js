import api from "../../../../api/axios";

export const fetchAllOffers = async () => {
  const r = await api.get("/offers");
  return r.data;
};
export const createOffer = async (payload) => {
  const r = await api.post("/offers", payload);
  return r.data;
};
export const updateOffer = async (offerId, payload) => {
  const r = await api.put(`/offers/${offerId}`, payload);
  return r.data;
};
export const toggleOfferStatus = async (offerId, active) => {
  const r = await api.put(
    `/offers/${offerId}/${active ? "deactivate" : "activate"}`,
  );
  return r.data;
};
export const endOffer = async (offerId) => {
  const r = await api.put(`/offers/${offerId}/end`);
  return r.data;
};
export const fetchPlanOffers = async (planId) => {
  const r = await api.get(`/plans/${planId}/offers`);
  return r.data;
};
export const mapOfferToPlan = async (planId, payload) => {
  const r = await api.post(`/plans/${planId}/offers`, payload);
  return r.data;
};
export const unmapOfferFromPlan = async (planId, offerId) => {
  const r = await api.delete(`/plans/${planId}/offers/${offerId}`);
  return r.data;
};
export const fetchAllPlans = async () => {
  const r = await api.get("/plans");
  return r.data;
};
