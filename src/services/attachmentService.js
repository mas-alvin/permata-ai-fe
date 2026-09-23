import api from './api';

export const attachmentService = {
  upload: (file, conversationId = null, messageId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) formData.append('conversation_id', conversationId);
    if (messageId) formData.append('message_id', messageId);

    return api.post('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  delete: (attachmentId) =>
    api.delete(`/attachments/${attachmentId}`),
};
