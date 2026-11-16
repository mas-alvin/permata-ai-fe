import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setConversations,
  setMessages,
  appendMessage,
  commitStreamedMessage,
  updateMessage,
  removeMessage,
  removeMessagesAfter,
  insertMessageAfter,
  clearPlaceholderMessages,
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
import permataIcon from '../assets/permata-icon.png';
import permataIconDark from '../assets/permata-icon-dark.png';
import { messageService } from '../services/messageService';
import { authService } from '../services/authService';
import { sendMessageStream, regenerateMessageStream, stopConversationStream } from '../services/chatStreamService';
import { sendGuestMessageStream } from '../services/guestChatService';
import { useOutletContext } from 'react-router-dom';
import { PanelLeft, SlidersHorizontal, Upload, Sparkles, FileDown } from 'lucide-react';
import MessageList from '../components/Message/MessageList';
import ChatInputActive from '../components/Chat/ChatInputActive';
import HeroSection from '../components/MainContent/HeroSection';
import ShaderBackground from '../components/MainContent/ShaderBackground';
import ModelSwitcher from '../components/Chat/ModelSwitcher';
import ConfirmModal from '../components/ui/ConfirmModal';
import { ragService } from '../services/ragService';
import { documentService } from '../services/documentService';

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
  const outletContext = useOutletContext();
  const onToggleSidebar = outletContext?.onToggleSidebar;
  const isSidebarOpen = outletContext?.isSidebarOpen ?? true;
  const location = useLocation();

  const [editContent, setEditContent] = useState('');
  const [activeMode, setActiveMode] = useState(null);
  const [replyContent, setReplyContent] = useState(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef(null);

  // Sinkronisasi prefill dan mode dari menu Sidebar (quickNav / template modal)
  useEffect(() => {
    if (location.state?.prefill) {
      setEditContent(location.state.prefill);
      setActiveMode(location.state.mode || null);
    }
  }, [location.state, location.key]);

  // Saat berpindah ke percakapan lama yang sudah ada, reset activeMode
  useEffect(() => {
    if (id && id !== 'new') {
      setActiveMode(null);
    }
  }, [id]);

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

  const abortControllerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Hentikan proses streaming chat jika tombol berhenti ditekan user
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (id && id !== 'new') {
      stopConversationStream(id);
    }

    const partial = partialContentRef.current;
    if (partial && partial.trim()) {
      dispatch(
        commitStreamedMessage({
          conversationId: id || 'new',
          message: {
            id: Date.now() + 1,
            role: 'assistant',
            content: partial,
            created_at: new Date().toISOString(),
          },
        })
      );
    }

    if (id && id !== 'new') {
      dispatch(clearPlaceholderMessages(id));
    }
    hasOptimisticRef.current = false;
    dispatch(endStream());
  };

  // Stream a fresh AI answer for an assistant message, replacing the old one.
  // Dipakai bersama oleh "regenerate" dan "edit & kirim ulang".
  const regenerateAssistant = (assistantMessage) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    hasOptimisticRef.current = true;
    if (id && id !== 'new') {
      dispatch(clearPlaceholderMessages(id));
    }
    dispatch(startStream());
    regenerateMessageStream(
      assistantMessage.id,
      (chunk) => dispatch(appendStreamChunk(chunk)),
      ({ fullContent: streamedText, creditsRemaining, creditsDeducted }) => {
        const fullContent = streamedText || partialContentRef.current;
        dispatch(endStream());
        hasOptimisticRef.current = false;
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
        hasOptimisticRef.current = false;
        dispatch(endStream());
        setError(err?.message || 'Terjadi kesalahan saat regenerasi.');
      },
      controller.signal
    );
  };

  const handleEditMessage = async (message, newContent) => {
    if (!id || id === 'new' || isStreaming) return;
    setError(null);

    // Cari pesan asisten pertama setelah prompt yang diedit
    const index = conversation.findIndex((m) => String(m.id) === String(message.id));
    const assistantMessage =
      index !== -1 ? conversation.slice(index + 1).find((m) => m.role === 'assistant') : undefined;

    // 1. Simpan prompt yang sudah diedit ke backend LEBIH DULU
    try {
      await messageService.update(message.id, newContent);
    } catch {
      setError('Gagal menyimpan perubahan pesan.');
      return;
    }
    dispatch(updateMessage({ conversationId: id, messageId: message.id, content: newContent }));

    // 2. Kalau belum ada jawaban AI setelahnya, tidak ada yang perlu dibuat ulang
    if (!assistantMessage) return;

    // 3. JANGAN hapus jawaban lama — biarkan tetap terlihat (percabangan percakapan)
    //    Stream jawaban baru dan sisipkan SETELAH pesan user yang baru diedit
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    hasOptimisticRef.current = true;
    if (id && id !== 'new') {
      dispatch(clearPlaceholderMessages(id));
    }
    dispatch(startStream());
    regenerateMessageStream(
      assistantMessage.id,
      (chunk) => dispatch(appendStreamChunk(chunk)),
      ({ fullContent: streamedText, creditsRemaining, creditsDeducted }) => {
        const fullContent = streamedText || partialContentRef.current;
        dispatch(endStream());
        hasOptimisticRef.current = false;
        
        // Buat pesan assistant baru dengan ID sementara
        const newAssistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: fullContent,
          created_at: new Date().toISOString(),
        };
        
        // Sisipkan jawaban baru SETELAH pesan user yang diedit (bukan menggantikan yang lama)
        dispatch(insertMessageAfter({
          conversationId: id,
          afterMessageId: message.id,
          message: newAssistantMessage,
        }));
        
        if (typeof creditsRemaining === 'number') {
          dispatch(setCredits(creditsRemaining));
        } else if (typeof creditsDeducted === 'number' && creditsDeducted > 0) {
          dispatch(decrementCredits(creditsDeducted));
        }

        // Ganti ID sementara dengan ID asli dari database
        syncMessagesFromServer(id);
      },
      (err) => {
        hasOptimisticRef.current = false;
        dispatch(endStream());
        setError(err?.message || 'Terjadi kesalahan saat regenerasi.');
      }
    );
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

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    dispatch(clearPlaceholderMessages(id));

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
        if (!hasOptimisticRef.current && apiMessages.length > 0) {
          dispatch(setMessages({ conversationId: id, messages: apiMessages }));
        }

        // Jika pengerjaan AI masih berjalan di latar belakang saat halaman di-refresh:
        // HANYA pasang placeholder jika pesan user baru saja dikirim (< 2 menit yang lalu)
        // dan frontend TIDAK sedang aktif streaming
        const lastMsg = apiMessages[apiMessages.length - 1];
        const isRecentUserMsg =
          lastMsg &&
          lastMsg.role === 'user' &&
          lastMsg.created_at &&
          Date.now() - new Date(lastMsg.created_at).getTime() < 120000;

        if (!hasOptimisticRef.current && !isStreaming && isRecentUserMsg) {
          // Tampilkan typing indicator placeholder
          dispatch(
            setMessages({
              conversationId: id,
              messages: [
                ...apiMessages,
                { id: 'bg-in-progress', role: 'assistant', content: '', created_at: new Date().toISOString() },
              ],
            })
          );

          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

          let attempts = 0;
          pollIntervalRef.current = setInterval(() => {
            attempts++;
            conversationService
              .get(id)
              .then((pollRes) => {
                const updatedMessages = pollRes.data.messages || [];
                const updatedLast = updatedMessages[updatedMessages.length - 1];
                if (updatedLast && updatedLast.role === 'assistant') {
                  if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                  dispatch(setMessages({ conversationId: id, messages: updatedMessages }));
                } else if (attempts >= 45) {
                  if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
              })
              .catch(() => {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              });
          }, 2000);
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

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [id, dispatch]);

  const handleNewMessage = async (content, attachments = []) => {
    setError(null);
    let conversationId = id;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (conversationId && conversationId !== 'new') {
      dispatch(clearPlaceholderMessages(conversationId));
    }

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

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      sendGuestMessageStream(
        content,
        (chunk) => dispatch(appendStreamChunk(chunk)),
        ({ fullContent: streamedText, quota }) => {
          const fullContent = streamedText || partialContentRef.current;
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
        },
        controller.signal
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

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      sendMessageStream(
        conversationId,
        content,
        selectedModelId,
        (chunk) => dispatch(appendStreamChunk(chunk)),
        ({ fullContent: streamedText, creditsRemaining, creditsDeducted, ragSources: sources }) => {
          const fullContent = streamedText || partialContentRef.current;
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
        { ragEnabled: ragConfig.ragEnabled, ragDocumentIds: ragConfig.ragDocumentIds },
        controller.signal
      );
    } catch (err) {
      setError('Gagal memproses pesan.');
    }
  };

  // ==========================================================================
  // Balas (reply) terhadap potongan teks yang diseleksi di jawaban AI.
  // Teks terpilih ditampilkan sebagai kutipan di atas input chat, bukan
  // di dalam textarea, sehingga user bisa mengetik respons tanpa teks
  // yang dibalas ikut terkirim sebagai isi pesan.
  // ==========================================================================
  const handleReply = (selectedText) => {
    if (!selectedText) return;
    setReplyContent(selectedText);
  };

  // Saat pindah percakapan, kosongkan kutipan balas yang masih tertahan.
  useEffect(() => {
    setReplyContent(null);
  }, [id]);

  // Tutup dropdown ekspor saat klik di luar area
  useEffect(() => {
    if (!exportDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportDropdownOpen]);

  const handleExportConversation = async (format) => {
    if (!conversation || conversation.length === 0) {
      alert('Belum ada pesan di percakapan ini untuk diekspor.');
      return;
    }
    try {
      setIsExporting(true);
      if (id && id !== 'new') {
        await documentService.exportConversation(id, format);
      } else {
        const activeConv = conversationsList.find((c) => String(c.id) === String(id));
        const title = activeConv?.title || 'Transkrip Obrolan Permata AI';
        const transcript = conversation
          .map((m) => {
            const sender = m.role === 'assistant' ? '🤖 **Permata AI**' : '👤 **Pengguna**';
            return `### ${sender}\n\n${m.content}\n\n---`;
          })
          .join('\n\n');

        await documentService.exportDocument({
          format,
          title,
          content: transcript,
          meta: {
            document_type: 'Transkrip Percakapan',
            author: user?.name ?? 'Pengguna Permata AI',
          },
        });
      }
      setExportDropdownOpen(false);
    } catch (err) {
      console.error('Conversation export error:', err);
      alert('Gagal mengekspor percakapan.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan obrolan disalin ke clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center animate-pulse text-slate-500 text-xs">
        Memuat...
      </div>
    );
  }

  return (
    <div className="flex-1 flex gap-2.5 overflow-hidden relative min-w-0 h-full">
      <main className="flex-1 sm:rounded-2xl border-0 sm:border border-white/80 dark:border-[#2a222c] shadow-soft flex flex-col justify-between overflow-hidden relative min-w-0 h-full transition-colors bg-white/70 dark:bg-[#120f14]/80">
        {/* Background shader: hanya muncul saat chat baru (kosong), hilang saat chat aktif */}
        {isNewChat && !hasMessages && <ShaderBackground />}
        
        {/* Top Bar inside Card */}
        <div className="relative z-10 h-12 px-3 sm:px-5 flex items-center justify-between shrink-0 border-b sm:border-b-0 border-slate-100/60 dark:border-[#2a222c]/60">
          {/* Left Controls: Sidebar Toggle Button (Mobile) + Model Selector (Mobile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="sm:hidden w-8 h-8 rounded-full bg-white/90 dark:bg-[#19151d] hover:bg-white dark:hover:bg-[#221c27] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-[#2a222c] shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Buka / Tutup Sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* Switch model: mobile only at top bar */}
            <div className="sm:hidden">
              <ModelSwitcher />
            </div>
          </div>

          {/* Right Controls inside Card */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => alert('Panel Konfigurasi Model')}
              className="hidden sm:flex py-1.5 px-3 rounded-full bg-white/90 dark:bg-[#19151d] hover:bg-white dark:hover:bg-[#221c27] text-slate-700 dark:text-slate-200 font-medium text-xs items-center gap-1.5 shadow-2xs border border-slate-200/80 dark:border-[#2a222c] hover:border-slate-500/40 transition-all cursor-pointer"
            >
              <span>Configuration</span>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600/70 dark:text-slate-100/80" />
            </button>

            {/* Tombol Ekspor Seluruh Percakapan (PDF & Word) */}
            {hasMessages && (
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setExportDropdownOpen((prev) => !prev)}
                  disabled={isExporting}
                  className="py-1.5 px-3 rounded-full bg-white/90 dark:bg-[#19151d] hover:bg-white dark:hover:bg-[#221c27] text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 shadow-2xs border border-slate-200/80 dark:border-[#2a222c] hover:border-slate-500/40 transition-all cursor-pointer"
                  title="Ekspor percakapan ke file fisik (PDF / Word)"
                >
                  {isExporting ? (
                    <span className="material-symbols-outlined text-[14px] animate-spin text-amber-600">progress_activity</span>
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  )}
                  <span>Ekspor</span>
                </button>

                {exportDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#1a151d] rounded-xl border border-slate-200 dark:border-[#2a222c] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-[#241d27] text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Ekspor Percakapan
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExportConversation('pdf')}
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#241d27] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                        <span className="font-medium">Dokumen PDF</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-mono font-bold">
                        .pdf
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportConversation('word')}
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#241d27] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="font-medium">Microsoft Word</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold">
                        .docx
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleShare}
              className="py-1.5 px-3 rounded-full bg-white/90 dark:bg-[#19151d] hover:bg-white dark:hover:bg-[#221c27] text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 shadow-2xs border border-slate-200/80 dark:border-[#2a222c] hover:border-slate-500/40 transition-all cursor-pointer"
            >
              <span>Share</span>
              <Upload className="w-3.5 h-3.5 text-slate-600/70 dark:text-slate-100/80" />
            </button>

          </div>
        </div>

        {/* Middle Content */}
        <div
          className={`relative z-10 flex-1 flex flex-col min-h-0 ${
            isNewChat && !hasMessages
              ? 'overflow-y-auto justify-start sm:justify-center px-4 sm:px-6 py-2'
              : 'overflow-hidden justify-start'
          }`}
        >
          {isNewChat && !hasMessages ? (
            <HeroSection onPrefillSelect={(prompt) => setEditContent(prompt)} />
          ) : (
            <div className="w-full flex-1 flex flex-col min-h-0">
              <MessageList
                messages={conversation}
                onEdit={handleEditMessage}
                onRegenerate={handleRegenerate}
                onDelete={requestDeleteMessage}
                onReply={handleReply}
                isStreaming={isStreaming}
                partialContent={partialContent}
              />

              {ragSources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 px-4 pt-2 max-w-4xl mx-auto w-full">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Sumber:
                  </span>
                  {ragSources.map((src, idx) => (
                    <span
                      key={`${src.document_id}-${idx}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/50 dark:border-amber-800/50 text-[10px] font-medium text-amber-700 dark:text-[#d49b2c]"
                      title={`Similarity: ${src.similarity}`}
                    >
                      <span className="material-symbols-outlined text-[11px]">menu_book</span>
                      {src.title}
                    </span>
                  ))}
                </div>
              )}

              {error && <div className="text-red-400 p-4 text-center text-sm">{error}</div>}
            </div>
          )}
        </div>

        {/* Bottom Chat Input */}
        <div className="relative z-10 shrink-0">
          <ChatInputActive
            onSend={handleNewMessage}
            disabled={isStreaming}
            isStreaming={isStreaming}
            onStop={handleStopStream}
            prefill={editContent}
            onPrefillClear={() => setEditContent('')}
            replyContent={replyContent}
            onReplyClear={() => setReplyContent(null)}
            activeMode={activeMode}
            onActiveModeClear={() => setActiveMode(null)}
            ragConfig={ragConfig}
            onRagConfigChange={handleRagConfigChange}
            showQuickActions={isNewChat && !hasMessages}
          />
        </div>

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
      </main>
    </div>
  );
}
