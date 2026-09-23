import { createSlice } from '@reduxjs/toolkit';

const apiKeySlice = createSlice({
  name: 'apiKey',
  initialState: {
    keys: [],
    revealedKey: null,
    loading: false,
    error: null,
  },
  reducers: {
    setKeys(state, action) {
      state.keys = action.payload;
    },
    setKeysLoading(state, action) {
      state.loading = action.payload;
    },
    setKeysError(state, action) {
      state.error = action.payload;
    },
    addKey(state, action) {
      // Store metadata only; the plaintext is kept separately in
      // revealedKey so it can be purged once the modal closes.
      state.keys.unshift(action.payload);
    },
    updateKey(state, action) {
      const updated = action.payload;
      const index = state.keys.findIndex((k) => k.id === updated.id);
      if (index !== -1) {
        state.keys[index] = { ...state.keys[index], ...updated };
      }
    },
    removeKey(state, action) {
      const id = action.payload;
      state.keys = state.keys.filter((k) => k.id !== id);
    },
    setRevealedKey(state, action) {
      state.revealedKey = action.payload;
    },
    // Purge the plaintext key from Redux once the reveal modal closes.
    clearRevealedKey(state) {
      state.revealedKey = null;
    },
  },
});

export const {
  setKeys,
  setKeysLoading,
  setKeysError,
  addKey,
  updateKey,
  removeKey,
  setRevealedKey,
  clearRevealedKey,
} = apiKeySlice.actions;

export default apiKeySlice.reducer;
