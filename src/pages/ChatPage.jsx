import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { setUser, setCredits, decrementCredits, clearCredentials } from '../store/slices/authSlice';
import { conversationService } from '../services/conversationService';
import { messageService } from '../services/messageService';
import { authService } from '../services/authService';
import { sendMessageStream, regenerateMessageStream } from '../services/chatStreamService';
import { sendGuestMessageStream } from '../services/guestChatService';
import MessageList from '../components/Message/MessageList';
import ChatInputActive from '../components/Chat/ChatInputActive';
import HeroSection from '../components/MainContent/HeroSection';
import QuickActions from '../components/MainContent/QuickActions';
import TypingIndicator from '../components/Typing/TypingIndicator';
import ModelSwitcher from '../components/Chat/ModelSwitcher';
import ShaderBackground from '../components/MainContent/ShaderBackground';
import ConfirmModal from '../components/ui/ConfirmModal';
import { ragService } from '../services/ragService';

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

  // RAG (Fase 7) — sumber knowledge base untuk percakapan aktif.
  const [ragConfig, setRagConfig] = useState({ ragEnabled: false, ragDocumentIds: [] });
  const [ragSources, setRagSources] = useState([]);

  // Modal konfirmasi hapus pesan (prompt user maupun jawaban AI).
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Persist pilihan sumber dokumen ke backend (ai-rul.md §3.4 — hanya dokumen
  // milik user yang disimpan oleh backend).
  const handleRagConfigChange = useCallback(
    (next) => {
      setRagConfig(next);
      if (!id || id === 'new') return;
      ragService
        .updateConversationSources(id, {
          ragEnabled: next.ragEnabled,
          ragDocumentIds: next.ragDocumentIds,
        })
        .catch(() => setError('Gagal menyimpan pilihan sumber dokumen.'));
    },
    [id]
  );

  const isNewChat = !id || id === 'new';
  const hasMessages = conversation.length > 0;

  const partialContentRef = useRef('');
  useEffect(() => {
    partialContentRef.current = partialContent;
  }, [partialContent]);

  const hasOptimisticRef = useRef(false);

  // Setelah streaming selesai, ambil ulang pesan dari backend agar ID pesan
  // di Redux adalah ID asli database (bukan ID sementara Date.now()). Tanpa
  // ini, edit/hapus/regenerate mengirim ID palsu ke backend dan gagal dengan
  // "No query results for model [App\Models\Message]".
  const syncMessagesFromServer = (conversationId) => {
    conversationService
      .get(conversationId)
      .then((res) => {
        const apiMessages = res.data.messages || [];
        if (apiMessages.length > 0) {
          hasOptimisticRef.current = false;
          dispatch(setMessages({ conversationId, messages: apiMessages }));
        }
      })
      .catch(() => {});
  };

  // Sync user profile (incl. credits) on mount — hanya untuk user login.
  // Tamu tidak punya data user; /me hanya valid bersama cookie JWT.
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    authService
      .me()
      .then((res) => dispatch(setUser(res.data)))
      .catch(() => {});
  }, [dispatch, isAuthenticated]);

  // Stream a fresh AI answer for an assistant message, replacing the old one.
  // Dipakai bersama oleh "regenerate" dan "edit & kirim ulang".
  const regenerateAssistant = (assistantMessage) => {
    dispatch(startStream());
    regenerateMessageStream(
      assistantMessage.id,
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

        // Ganti ID sementara dengan ID asli dari database.
        syncMessagesFromServer(id);
      },
      (err) => {
        dispatch(endStream());
        setError(err?.message || 'Terjadi kesalahan saat regenerasi.');
      }
    );
  };

  const handleEditMessage = async (message, newContent) => {
    if (!id || id === 'new' || isStreaming) return;
    setError(null);

    // Cari pesan asisten pertama setelah prompt yang diedit — itulah jawaban
    // lama yang harus dibuat ulang agar sesuai dengan prompt baru.
    const index = conversation.findIndex((m) => String(m.id) === String(message.id));
    const assistantMessage =
      index !== -1 ? conversation.slice(index + 1).find((m) => m.role === 'assistant') : undefined;

    // 1. Simpan prompt yang sudah diedit ke backend LEBIH DULU, supaya history
    //    yang dibaca saat regenerasi sudah berisi teks baru.
    try {
      await messageService.update(message.id, newContent);
    } catch {
      setError('Gagal menyimpan perubahan pesan.');
      return;
    }
    dispatch(updateMessage({ conversationId: id, messageId: message.id, content: newContent }));

    // 2. Kalau belum ada jawaban AI setelahnya, tidak ada yang perlu dibuat ulang.
    if (!assistantMessage) return;

    // 3. Buang jawaban lama (beserta pesan setelahnya) secara optimis, lalu
    //    stream jawaban baru dari prompt yang sudah diperbarui.
    dispatch(removeMessagesAfter({ conversationId: id, messageId: assistantMessage.id, inclusive: true }));
    regenerateAssistant(assistantMessage);
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

  // Hapus pesan (prompt user atau jawaban AI) selalu meminta konfirmasi dulu.
  const requestDeleteMessage = (message) => {
    if (!id || id === 'new') return;
    setDeleteTarget(message);
  };

  const confirmDeleteMessage = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await handleDeleteMessage(target);
  };

  const handleRegenerate = (message) => {
    if (!id || id === 'new' || isStreaming) return;
    if (message.role !== 'assistant') return;
    setError(null);

    // Optimistically remove the assistant message (and anything after it)
    dispatch(removeMessagesAfter({ conversationId: id, messageId: message.id, inclusive: true }));
    regenerateAssistant(message);
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
        // Muat preferensi RAG percakapan (Fase 7).
        setRagConfig({
          ragEnabled: !!res.data.rag_enabled,
          ragDocumentIds: res.data.rag_document_ids || [],
        });
        setRagSources([]);
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

    // ── Mode tamu: belum login ──────────────────────────────────────────
    // Tamu memakai endpoint khusus /guest/chat yang dibatasi kuota harian
    // per device_id. Pesan disimpan backend dengan user_id NULL dan akan
    // dihapus permanen saat user login (AuthController::purgeGuestChats).
    if (!isAuthenticated) {
      // Pakai id rute sebagai key store — sama seperti mode user login —
      // agar selectMessagesByConversationId(id) menemukan pesan tamu.
      // Sebelumnya memakai key 'guest' sehingga pesan tidak pernah tampil
      // dan UI macet di HeroSection (hasMessages tetap false).
      const guestConvId = conversationId && conversationId !== 'new' ? conversationId : 'new';

      const userMsg = {
        id: Date.now(),
        role: 'user',
        content,
        attachments: (attachments || []).map((att) => ({
          id: att.id,
          filename: att.filename,
          url: att.url,
          mime_type: att.mime_type,
          size: att.size,
        })),
        created_at: new Date().toISOString(),
      };
      hasOptimisticRef.current = true;
      dispatch(appendMessage({ conversationId: guestConvId, message: userMsg }));
      dispatch(startStream());

      sendGuestMessageStream(
        content,
        (chunk) => dispatch(appendStreamChunk(chunk)),
        ({ quota }) => {
          const fullContent = partialContentRef.current;
          dispatch(endStream());
          dispatch(
            commitStreamedMessage({
              conversationId: guestConvId,
              message: {
                id: Date.now() + 1,
                role: 'assistant',
                content: fullContent,
                created_at: new Date().toISOString(),
              },
            })
          );
          // Kuota harian tamu habis → arahkan ke login untuk lanjut.
          if (quota && typeof quota.remaining === 'number' && quota.remaining === 0) {
            setError('Batas harian tamu tercapai. Masuk dengan akun untuk melanjutkan.');
          }
        },
        (err) => {
          dispatch(endStream());
          setError(err?.message || 'Terjadi kesalahan saat streaming.');
        }
      );
      return;
    }

    // ── Mode user login ─────────────────────────────────────────────────
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
        ({ creditsRemaining, creditsDeducted, ragSources: sources }) => {
          const fullContent = partialContentRef.current;
          dispatch(endStream());
          setRagSources(sources || []);
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

          // Ganti ID sementara dengan ID asli dari database.
          syncMessagesFromServer(conversationId);
        },
        (err) => {
          dispatch(endStream());
          setError(err?.message || 'Terjadi kesalahan saat streaming.');
        },
        attachments,
        { ragEnabled: ragConfig.ragEnabled, ragDocumentIds: ragConfig.ragDocumentIds }
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
        <ConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteMessage}
          title="Hapus pesan?"
          message={deleteTarget?.role === 'assistant'
            ? 'Jawaban AI ini akan dihapus permanen bersama seluruh pesan setelahnya. Tindakan ini tidak dapat dibatalkan.'
            : 'Prompt Anda akan dihapus permanen bersama jawaban AI dan seluruh pesan setelahnya. Tindakan ini tidak dapat dibatalkan.'}
          confirmLabel="Hapus"
          cancelLabel="Batal"
          danger
        />
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
        onDelete={requestDeleteMessage}
        isStreaming={isStreaming}
        partialContent={partialContent}
      />

      {ragSources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pt-2 max-w-4xl mx-auto w-full">
          <span className="text-[10px] font-semibold text-on-surface-variant/70 uppercase tracking-wide">
            Sumber:
          </span>
          {ragSources.map((src, idx) => (
            <span
              key={`${src.document_id}-${idx}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 border border-primary/20 text-[10px] font-medium text-primary"
              title={`Similarity: ${src.similarity}`}
            >
              <span className="material-symbols-outlined text-[11px]">menu_book</span>
              {src.title}
            </span>
          ))}
        </div>
      )}

      {error && <div className="text-red-400 p-4 text-center text-sm">{error}</div>}
      <ChatInputActive
        onSend={handleNewMessage}
        disabled={isStreaming}
        prefill={editContent}
        onPrefillClear={() => setEditContent('')}
        ragConfig={ragConfig}
        onRagConfigChange={handleRagConfigChange}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteMessage}
        title="Hapus pesan?"
        message={
          deleteTarget?.role === 'assistant'
            ? 'Jawaban AI ini akan dihapus permanen bersama seluruh pesan setelahnya. Tindakan ini tidak dapat dibatalkan.'
            : 'Prompt Anda akan dihapus permanen bersama jawaban AI dan seluruh pesan setelahnya. Tindakan ini tidak dapat dibatalkan.'
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        danger
      />
    </div>
  );
}
