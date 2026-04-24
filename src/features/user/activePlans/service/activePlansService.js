import api from '../../../../api/axios';

export const fetchActivePlanDetails = async () => { const r = await api.get('/analytics'); return r.data; };
