import { createSlice } from '@reduxjs/toolkit';

const conversationSlice = createSlice({
  name: 'conversation',
  initialState: {
    conversations: [],
    activeConversationId: null,
    messages: {},
    topics: [],
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
    updateConversationTitle(state, action) {
      const { id, title } = action.payload;
      const conv = state.conversations.find((c) => String(c.id) === String(id));
      if (conv) conv.title = title;
    },
    toggleConversationPin(state, action) {
      const id = action.payload;
      const conv = state.conversations.find((c) => String(c.id) === String(id));
      if (conv) conv.is_pinned = !conv.is_pinned;
    },
    removeConversation(state, action) {
      const id = action.payload;
      state.conversations = state.conversations.filter((c) => String(c.id) !== String(id));
      delete state.messages[id];
    },
    setTopics(state, action) {
      state.topics = action.payload;
    },
    addTopic(state, action) {
      state.topics.unshift(action.payload);
    },
    removeTopic(state, action) {
      const id = action.payload;
      state.topics = state.topics.filter((t) => t.id !== id);
    },
  },
});

const emptyArray = [];

export const selectMessagesByConversationId = (state, id) => state.conversation.messages[id] ?? emptyArray;

export const {
  setConversations,
  setActiveConversation,
  appendMessage,
  setMessages,
  commitStreamedMessage,
  updateConversationTitle,
  toggleConversationPin,
  removeConversation,
  setTopics,
  addTopic,
  removeTopic,
} = conversationSlice.actions;

export default conversationSlice.reducer;
