import api from '../../../../api/axios';

export const fetchAnalytics = async () => {
  const res = await api.get('/analytics');
  return res.data;
};
