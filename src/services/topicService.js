import api from './api';

export const topicService = {
  list: () => api.get('/topics'),
  create: (conversationId, title, note = null) =>
    api.post('/topics', { conversation_id: conversationId, title, note }),
  remove: (id) => api.delete(`/topics/${id}`),
};
