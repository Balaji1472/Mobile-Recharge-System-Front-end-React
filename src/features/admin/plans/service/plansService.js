import api from "../../../../api/axios";

export const fetchAllPlans = async () => {
  const r = await api.get("/plans");
  return r.data;
};

export const fetchPlansByOperator = async (operatorId) => {
  const r = await api.get(`/plans/operator/${operatorId}`);
  return r.data;
};

export const fetchOperators = async () => {
  const r = await api.get("/operators");
  return r.data;
};
export const fetchActiveOperators = async () => {
  const r = await api.get("/operators/active");
  return r.data;
};
export const fetchCategories = async () => {
  const r = await api.get("/categories");
  return r.data;
};
export const fetchActiveCategories = async () => {
  const r = await api.get("/categories");
  return r.data.filter((c) => c.isActive);
};
export const createPlan = async (payload) => {
  const r = await api.post("/plans", payload);
  return r.data;
};
export const updatePlan = async (planId, payload) => {
  const r = await api.put(`/plans/${planId}`, payload);
  return r.data;
};
export const togglePlanStatus = async (planId, isActive) => {
  const r = await api.put(
    `/plans/${planId}/${isActive ? "deactivate" : "activate"}`,
  );
  return r.data;
};
export const createCategory = async (payload) => {
  const r = await api.post("/categories", payload);
  return r.data;
};
export const updateCategory = async (catId, payload) => {
  const r = await api.put(`/categories/${catId}`, payload);
  return r.data;
};
export const toggleCategoryStatus = async (catId, isActive) => {
  const r = await api.put(
    `/categories/${catId}/${isActive ? "deactivate" : "activate"}`,
  );
  return r.data;
};
