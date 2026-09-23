import api from './api';

export const messageService = {
  update: (messageId, content) =>
    api.put(`/messages/${messageId}`, { content }),

  delete: (messageId) =>
    api.delete(`/messages/${messageId}`),
};
