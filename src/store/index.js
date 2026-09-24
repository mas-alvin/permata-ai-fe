import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import conversationReducer from './slices/conversationSlice';
import chatStreamReducer from './slices/chatStreamSlice';
import apiKeyReducer from './slices/apiKeySlice';
import modelsReducer from './slices/modelsSlice';
import ragReducer from './slices/ragSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversation: conversationReducer,
    chatStream: chatStreamReducer,
    apiKey: apiKeyReducer,
    models: modelsReducer,
    rag: ragReducer,
  },
});
