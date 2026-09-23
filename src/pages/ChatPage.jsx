import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setConversations,
  setMessages,
  appendMessage,
  commitStreamedMessage,
  updateMessage,
  removeMessage,
  removeMessagesAfter,
  selectMessagesByConversationId,
  setActiveConversation,
} from '../store/slices/conversationSlice';
import {
  startStream,
  appendStreamChunk,
  endStream,
  selectSelectedModelId,
} from '../store/slices/chatStreamSlice';
import { setUser, setCredits, decrementCredits } from '../store/slices/authSlice';
import { conversationService } from '../services/conversationService';
import { messageService } from '../services/messageService';
import { authService } from '../services/authService';
import { sendMessageStream, regenerateMessageStream } from '../services/chatStreamService';
import MessageList from '../components/Message/MessageList';
import ChatInputActive from '../components/Chat/ChatInputActive';
import HeroSection from '../components/MainContent/HeroSection';
import QuickActions from '../components/MainContent/QuickActions';
import TypingIndicator from '../components/Typing/TypingIndicator';
import ModelSwitcher from '../components/Chat/ModelSwitcher';
import ShaderBackground from '../components/MainContent/ShaderBackground';

export default function ChatPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const conversation = useAppSelector((state) => selectMessagesByConversationId(state, id));
  const isStreaming = useAppSelector((state) => state.chatStream.isStreaming);
  const partialContent = useAppSelector((state) => state.chatStream.partialContent);
  const conversationsList = useAppSelector((state) => state.conversation.conversations);
  const selectedModelId = useAppSelector((state) => state.chatStream.selectedModelId);
  const user = useAppSelector((state) => state.auth.user);
  const [editContent, setEditContent] = useState('');

  const isNewChat = !id || id === 'new';
  const hasMessages = conversation.length > 0;

  const partialContentRef = useRef('');
  useEffect(() => {
    partialContentRef.current = partialContent;
  }, [partialContent]);

  const hasOptimisticRef = useRef(false);

  // Sync user profile (incl. credits) on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    authService
      .me()
      .then((res) => dispatch(setUser(res.data)))
      .catch(() => {});
  }, [dispatch]);

  const handleEditMessage = (message, newContent) => {
    if (!id || id === 'new') return;
    setError(null);
    messageService
      .update(message.id, newContent)
      .then(() => {
        dispatch(updateMessage({ conversationId: id, messageId: message.id, content: newContent }));
      })
      .catch(() => {
        setError('Gagal menyimpan perubahan pesan.');
      });
  };

  const handleDeleteMessage = async (message) => {
    if (!id || id === 'new') return;
    setError(null);
    // Optimistic: drop the message (and anything after it) from the UI first
    dispatch(removeMessage({ conversationId: id, messageId: message.id }));
    try {
      await messageService.delete(message.id);
    } catch (err) {
      setError('Gagal menghapus pesan.');
      // Best-effort reload to restore consistent state
      conversationService.get(id).then((res) => {
        dispatch(setMessages({ conversationId: id, messages: res.data.messages || [] }));
      });
    }
  };

  const handleRegenerate = async (message) => {
    if (!id || id === 'new' || isStreaming) return;
    setError(null);

    // Optimistically remove the assistant message (and anything after it)
    dispatch(removeMessagesAfter({ conversationId: id, messageId: message.id, inclusive: true }));
    dispatch(startStream());

    regenerateMessageStream(
      message.id,
      (chunk) => dispatch(appendStreamChunk(chunk)),
      ({ creditsRemaining, creditsDeducted }) => {
        const fullContent = partialContentRef.current;
        dispatch(endStream());
        dispatch(
          commitStreamedMessage({
            conversationId: id,
            message: {
              id: Date.now() + 1,
              role: 'assistant',
              content: fullContent,
              created_at: new Date().toISOString(),
            },
          })
        );
        if (typeof creditsRemaining === 'number') {
          dispatch(setCredits(creditsRemaining));
        } else if (typeof creditsDeducted === 'number' && creditsDeducted > 0) {
          dispatch(decrementCredits(creditsDeducted));
        }
      },
      (err) => {
        dispatch(endStream());
        setError(err?.message || 'Terjadi kesalahan saat regenerasi.');
      }
    );
  };

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
        const apiMessages = res.data.messages || [];
        // Don't overwrite if we have optimistic messages
        if (!hasOptimisticRef.current && apiMessages.length > 0) {
          dispatch(setMessages({ conversationId: id, messages: apiMessages }));
        }
        setLoading(false);
        dispatch(setActiveConversation(id));
      })
      .catch(() => {
        setError('Gagal memuat percakapan.');
        setLoading(false);
      });
  }, [id, dispatch]);

  const handleNewMessage = async (content, attachments = []) => {
    setError(null);
    let conversationId = id;

    try {
      if (!conversationId || conversationId === 'new') {
        const res = await conversationService.create(content.substring(0, 30), selectedModelId);
        conversationId = String(res.data.id);
        dispatch(setConversations([res.data, ...conversationsList]));
        navigate(`/chat/${conversationId}`, { replace: true });
      }

      const attachmentPayload = (attachments || []).map((att) => ({
        id: att.id,
        filename: att.filename,
        url: att.url,
        mime_type: att.mime_type,
        size: att.size,
      }));

      const userMsg = {
        id: Date.now(),
        role: 'user',
        content,
        attachments: attachmentPayload,
        created_at: new Date().toISOString(),
      };
      hasOptimisticRef.current = true;
      dispatch(appendMessage({ conversationId, message: userMsg }));
      dispatch(startStream());

      sendMessageStream(
        conversationId,
        content,
        selectedModelId,
        (chunk) => dispatch(appendStreamChunk(chunk)),
        ({ creditsRemaining, creditsDeducted }) => {
          const fullContent = partialContentRef.current;
          dispatch(endStream());
          dispatch(
            commitStreamedMessage({
              conversationId,
              message: {
                id: Date.now() + 1,
                role: 'assistant',
                content: fullContent,
                created_at: new Date().toISOString(),
              },
            })
          );
          if (typeof creditsRemaining === 'number') {
            dispatch(setCredits(creditsRemaining));
          } else if (typeof creditsDeducted === 'number' && creditsDeducted > 0) {
            dispatch(decrementCredits(creditsDeducted));
          }
        },
        (err) => {
          dispatch(endStream());
          setError(err?.message || 'Terjadi kesalahan saat streaming.');
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
        <ShaderBackground />
        {/* Centered Hero + Input */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 pt-16">
          <div className="w-full max-w-4xl flex flex-col">
            <HeroSection />
            <div className="w-full mt-8 md:mt-12">
              <ChatInputActive onSend={handleNewMessage} disabled={isStreaming} prefill={editContent} onPrefillClear={() => setEditContent('')} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active conversation — show messages + input
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex justify-end p-2">
        <ModelSwitcher />
      </div>
      <MessageList
        messages={conversation}
        onEdit={handleEditMessage}
        onRegenerate={handleRegenerate}
        onDelete={handleDeleteMessage}
        isStreaming={isStreaming}
        partialContent={partialContent}
      />

      {error && <div className="text-red-400 p-4 text-center text-sm">{error}</div>}
      <ChatInputActive onSend={handleNewMessage} disabled={isStreaming} prefill={editContent} onPrefillClear={() => setEditContent('')} />
    </div>
  );
}
