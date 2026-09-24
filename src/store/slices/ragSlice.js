import { createSlice } from '@reduxjs/toolkit';

/**
 * State knowledge base RAG (Fase 7).
 *
 * documents: daftar dokumen milik user beserta status ingestion
 * (pending | processing | ready | failed).
 */
const ragSlice = createSlice({
  name: 'rag',
  initialState: {
    documents: [],
    loading: false,
    uploading: false,
    error: null,
  },
  reducers: {
    setDocuments(state, action) {
      state.documents = action.payload;
    },
    addDocument(state, action) {
      state.documents.unshift(action.payload);
    },
    updateDocumentStatus(state, action) {
      const { id, status, error, chunkCount } = action.payload;
      const doc = state.documents.find((d) => String(d.id) === String(id));
      if (doc) {
        doc.status = status;
        if (error !== undefined) doc.error = error;
        if (chunkCount !== undefined) doc.chunk_count = chunkCount;
      }
    },
    removeDocument(state, action) {
      const id = action.payload;
      state.documents = state.documents.filter((d) => String(d.id) !== String(id));
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setUploading(state, action) {
      state.uploading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setDocuments,
  addDocument,
  updateDocumentStatus,
  removeDocument,
  setLoading,
  setUploading,
  setError,
} = ragSlice.actions;

export default ragSlice.reducer;
