import api from './api';

export const apiKeyService = {
  list: () => api.get('/api-keys'),

  create: (payload) => api.post('/api-keys', payload),

  update: (id, payload) => api.put(`/api-keys/${id}`, payload),

  delete: (id) => api.delete(`/api-keys/${id}`),
};
