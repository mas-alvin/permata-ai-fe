import api from './api';

export const apiKeyService = {
  list: () => 
    api.get('/api-keys'),
  
  create: (name, scopes = ['chat:write']) => 
    api.post('/api-keys', { name, scopes }),
  
  update: (id, data) => 
    api.patch(`/api-keys/${id}`, data),
  
  delete: (id) => 
    api.delete(`/api-keys/${id}`),
};
