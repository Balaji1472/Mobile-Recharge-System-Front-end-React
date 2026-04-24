import api from '../../../../api/axios';

export const changePassword = async (payload) => {
  const r = await api.put('/auth/change-password', payload);
  return r.data;
};
