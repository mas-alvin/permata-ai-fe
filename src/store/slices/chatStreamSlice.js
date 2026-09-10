import { createSlice } from '@reduxjs/toolkit';

const chatStreamSlice = createSlice({
  name: 'chatStream',
  initialState: { isStreaming: false, partialContent: '' },
  reducers: {
    startStream(state) {
      state.isStreaming = true;
      state.partialContent = '';
    },
    appendStreamChunk(state, action) {
      state.partialContent += action.payload;
    },
    endStream(state) {
      state.isStreaming = false;
      state.partialContent = '';
    },
  },
});

export const { startStream, appendStreamChunk, endStream } = chatStreamSlice.actions;
export default chatStreamSlice.reducer;
