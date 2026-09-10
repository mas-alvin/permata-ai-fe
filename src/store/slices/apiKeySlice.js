import { createSlice } from '@reduxjs/toolkit';

const apiKeySlice = createSlice({
  name: 'apiKey',
  initialState: { keys: [], revealedKey: null },
  reducers: {
    setKeys(state, action) {
      state.keys = action.payload;
    },
    addKey(state, action) {
      state.keys.push(action.payload);
    },
    removeKey(state, action) {
      state.keys = state.keys.filter((k) => k.id !== action.payload);
    },
    setRevealedKey(state, action) {
      state.revealedKey = action.payload;
    },
    clearRevealedKey(state) {
      state.revealedKey = null;
    },
  },
});

export const { setKeys, addKey, removeKey, setRevealedKey, clearRevealedKey } = apiKeySlice.actions;
export default apiKeySlice.reducer;
