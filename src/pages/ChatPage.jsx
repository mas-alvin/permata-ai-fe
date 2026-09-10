<?jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveConversation, setMessages, appendMessage, commitStreamedMessage } from '../../store/slices/conversationSlice';
import { startStream, appendStreamChunk, endStream } from '../../store/slices/chatStreamSlice';
import { conversationService } from '../../services/conversationService';
import MessageList from '../components/Message/MessageList';
import ChatInputActive from '../components/Chat/ChatInputActive';
import TypingIndicator from '../components/Typing/TypingIndicator';

export default function ChatPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(state => state.conversation.conversations.find(c => c.id === Number(id)));
  const isStreaming = useAppSelector(state => state.chatStream.isStreaming);

  useEffect(() => {
    if (!id) return;
    // set active conversation
    dispatch(setActiveConversation(Number(id)));
    // fetch conversation detail (messages + model)
    conversationService.get(id).then(res => {
      const data = res.data;
      dispatch(setMessages({ conversationId: Number(id), messages: data.messages }));
    });
  }, [id, dispatch]);

  const handleNewMessage = (content) => {
    // optimistic user bubble
    const userMsg = { role: 'user', content, created_at: new Date().toISOString() };
    dispatch(appendMessage({ conversationId: Number(id), message: userMsg }));
    // start streaming
    dispatch(startStream());
    // invoke streaming service (SSE)
    const onChunk = (chunk) => {
      dispatch(appendStreamChunk(chunk));
    };
    const onDone = () => {
      dispatch(endStream());
      // commit full assistant message (stored in state.chatStream.partialContent)
      const assistantMsg = { role: 'assistant', content: useAppSelector(state => state.chatStream.partialContent), created_at: new Date().toISOString() };
      dispatch(commitStreamedMessage({ conversationId: Number(id), message: assistantMsg }));
    };
    // use service (already written) – it returns a promise
    import('../../services/chatStreamService').then(mod => {
      mod.sendMessageStream(Number(id), content, onChunk, onDone, (err) => console.error(err));
    });
  };

  if (!conversation) return <div className="p-4">Loading…</div>;

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={conversation.messages || []} />
      {isStreaming && <TypingIndicator />}
      <ChatInputActive onSend={handleNewMessage} />
    </div>
  );
}
