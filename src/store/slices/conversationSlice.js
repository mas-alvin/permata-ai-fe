import { createSlice } from '@reduxjs/toolkit';

const conversationSlice = createSlice({
  name: 'conversation',
  initialState: {
    conversations: [],
    activeConversationId: null,
    messages: {},
  },
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload;
    },
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    appendMessage(state, action) {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) state.messages[conversationId] = [];
      state.messages[conversationId].push(message);
    },
    setMessages(state, action) {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },
    commitStreamedMessage(state, action) {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) state.messages[conversationId] = [];
      state.messages[conversationId].push(message);
    },
  },
});

export const { setConversations, setActiveConversation, appendMessage, setMessages, commitStreamedMessage } = conversationSlice.actions;
export default conversationSlice.reducer;
