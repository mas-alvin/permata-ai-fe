import api from './api';

/**
 * Knowledge base RAG — manajemen dokumen internal (Fase 7).
 */
export const ragService = {
  listDocuments(params = {}) {
    return api.get('/rag/documents', { params });
  },

  uploadDocument(file, title) {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    return api.post('/rag/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getDocument(documentId) {
    return api.get(`/rag/documents/${documentId}`);
  },

  deleteDocument(documentId) {
    return api.delete(`/rag/documents/${documentId}`);
  },

  reingestDocument(documentId) {
    return api.post(`/rag/documents/${documentId}/reingest`);
  },

  /**
   * Pilih sumber dokumen untuk sebuah percakapan.
   */
  updateConversationSources(conversationId, { ragEnabled, ragDocumentIds }) {
    return api.put(`/conversations/${conversationId}/rag-sources`, {
      rag_enabled: ragEnabled,
      rag_document_ids: ragDocumentIds,
    });
  },
};

export default ragService;
