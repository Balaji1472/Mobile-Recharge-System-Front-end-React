import api from '../../../../api/axios';

export const fetchOperators = async () => {
  const r = await api.get('/operators');
  return r.data;
};

export const createOperator = async (payload) => {
  const r = await api.post('/operators', payload);
  return r.data;
};

export const updateOperator = async (operatorId, payload) => {
  const r = await api.put(`/operators/${operatorId}`, payload);
  return r.data;
};

export const toggleOperatorStatus = async (operatorId, isActive) => {
  const endpoint = isActive ? 'deactivate' : 'activate';
  const r = await api.put(`/operators/${operatorId}/${endpoint}`);
  return r.data;
};