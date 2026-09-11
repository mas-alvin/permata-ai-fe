import { createSlice } from '@reduxjs/toolkit';

const chatStreamSlice = createSlice({
  name: 'chatStream',
  initialState: {
    isStreaming: false,
    partialContent: '',
    selectedModelId: null,
  },
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
    setSelectedModelId(state, action) {
      state.selectedModelId = action.payload;
    },
  },
});

export const { startStream, appendStreamChunk, endStream, setSelectedModelId } = chatStreamSlice.actions;
export default chatStreamSlice.reducer;
export const selectSelectedModelId = (state) => state.chatStream.selectedModelId;
