import api from './api';

export const conversationService = {
  list: (page = 1, search = '') => 
    api.get('/conversations', { params: { page, search } }),
  
  create: (title = null) => 
    api.post('/conversations', { title }),
  
  get: (id) => 
    api.get(`/conversations/${id}`),
  
  update: (id, title) => 
    api.put(`/conversations/${id}`, { title }),
  
  delete: (id) => 
    api.delete(`/conversations/${id}`),
  
  pin: (id) => 
    api.post(`/conversations/${id}/pin`),
};
