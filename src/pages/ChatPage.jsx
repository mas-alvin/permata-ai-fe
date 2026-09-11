import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setConversations,
  setMessages,
  appendMessage,
  commitStreamedMessage,
} from '../store/slices/conversationSlice';
import {
  startStream,
  appendStreamChunk,
  endStream,
} from '../store/slices/chatStreamSlice';
import { conversationService } from '../services/conversationService';
import { sendMessageStream } from '../services/chatStreamService';
import MessageList from '../components/Message/MessageList';
import ChatInputActive from '../components/Chat/ChatInputActive';
import HeroSection from '../components/MainContent/HeroSection';
import QuickActions from '../components/MainContent/QuickActions';
import TypingIndicator from '../components/Typing/TypingIndicator';

export default function ChatPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const conversation = useAppSelector((state) => state.conversation.messages[id] || []);
  const isStreaming = useAppSelector((state) => state.chatStream.isStreaming);
  const partialContent = useAppSelector((state) => state.chatStream.partialContent);
  const conversationsList = useAppSelector((state) => state.conversation.conversations);

  const isNewChat = !id || id === 'new';
  const hasMessages = conversation.length > 0;

  const partialContentRef = useRef('');
  useEffect(() => {
    partialContentRef.current = partialContent;
  }, [partialContent]);

  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    conversationService
      .get(id)
      .then((res) => {
        dispatch(setMessages({ conversationId: id, messages: res.data.messages || [] }));
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat percakapan.');
        setLoading(false);
      });
  }, [id, dispatch]);

  const handleNewMessage = async (content) => {
    setError(null);
    let conversationId = id;

    try {
      if (!conversationId || conversationId === 'new') {
        const res = await conversationService.create({ title: content.substring(0, 30) });
        conversationId = String(res.data.id);
        dispatch(setConversations([res.data, ...conversationsList]));
        navigate(`/chat/${conversationId}`, { replace: true });
      }

      const userMsg = {
        id: Date.now(),
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      dispatch(appendMessage({ conversationId, message: userMsg }));
      dispatch(startStream());

      sendMessageStream(
        conversationId,
        content,
        (chunk) => dispatch(appendStreamChunk(chunk)),
        () => {
          const fullContent = partialContentRef.current;
          dispatch(endStream());
          dispatch(commitStreamedMessage({
            conversationId,
            message: {
              id: Date.now() + 1,
              role: 'assistant',
              content: fullContent,
              created_at: new Date().toISOString(),
            }
          }));
        },
        (err) => {
          dispatch(endStream());
          setError('Terjadi kesalahan saat streaming.');
          console.error(err);
        }
      );
    } catch (err) {
      setError('Gagal memproses pesan.');
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center animate-pulse">Memuat...</div>;

  // Empty state (new chat, no messages) — show HeroSection centered
  if (isNewChat && !hasMessages) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Centered Hero + Input */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 pt-16">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <HeroSection />
            <div className="w-full mt-8 md:mt-12 flex justify-center">
              <ChatInputActive onSend={handleNewMessage} disabled={isStreaming} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active conversation — show messages + input
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <MessageList messages={conversation} />
      {isStreaming && (
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto bg-surface-variant/60 rounded-2xl p-4">
            {partialContent || <TypingIndicator />}
          </div>
        </div>
      )}
      {error && <div className="text-red-400 p-4 text-center text-sm">{error}</div>}
      <ChatInputActive onSend={handleNewMessage} disabled={isStreaming} />
    </div>
  );
}
