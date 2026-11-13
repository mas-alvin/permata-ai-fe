import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Paperclip, Lightbulb, AudioLines, Sparkles, X, ArrowUpRight, Timer } from 'lucide-react';
import { attachmentService } from '../../services/attachmentService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import RagSourcePicker from '../Rag/RagSourcePicker';
import QuickActions from '../MainContent/QuickActions';

function formatSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${Math.round(value * 10) / 10} ${units[unitIndex]}`;
}

export default function ChatInputActive({ 
  onSend, 
  disabled = false, 
  prefill = '', 
  onPrefillClear, 
  replyContent = null, 
  onReplyClear, 
  ragConfig, 
  onRagConfigChange,
  showQuickActions = false
}) {
  const [input, setInput] = useState(prefill);
  const [textareaHeight, setTextareaHeight] = useState(38);
  const [deepThinkActive, setDeepThinkActive] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const credits = useAppSelector((state) => state.auth.user?.credits ?? null);
  const conversationId = useAppSelector((state) => state.conversation.activeConversationId);
  const outOfCredits = isAuthenticated !== false && credits !== null && credits <= 0;
  const sendDisabled = disabled || outOfCredits;

  const effectiveConvId = conversationId && conversationId !== 'new' ? conversationId : null;
  const ragEnabled = ragConfig?.ragEnabled ?? false;
  const ragDocumentIds = ragConfig?.ragDocumentIds ?? [];

  const handleTranscript = useCallback((transcript, isFinal) => {
    setInput((prev) => {
      const base = prev.replace(/\s*$/, '');
      if (isFinal) {
        return base ? `${base} ${transcript}` : transcript;
      }
      return base ? `${base} ${transcript}` : transcript;
    });
  }, []);

  const { listening, error: voiceError, supported: voiceSupported, start: startListening, stop: stopListening } =
    useSpeechRecognition({ lang: 'id-ID', onTranscript: handleTranscript });

  const handleMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const res = await attachmentService.upload(file, conversationId && conversationId !== 'new' ? conversationId : null);
      setAttachments((prev) => [...prev, res.data.attachment]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    attachmentService.delete(attachmentId).catch(() => {});
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || sendDisabled) return;
    onSend(input, attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      setTextareaHeight(38);
    }
    if (onPrefillClear) onPrefillClear();
    if (onReplyClear) onReplyClear();
  };

  useEffect(() => {
    setInput(prefill);
    adjustHeight();
  }, [prefill]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const height = Math.min(textarea.scrollHeight, 120);
      setTextareaHeight(height);
      textarea.style.height = `${height}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-3 sm:px-6 pb-2.5 sm:pb-3 pt-1 max-w-2xl mx-auto w-full flex flex-col gap-2 shrink-0">
      {/* Suggestion pills if empty state */}
      {showQuickActions && (
        <QuickActions onSelectPrompt={(prompt) => setInput(prompt)} />
      )}

      {/* Quoted reply preview */}
      {replyContent && (
        <div className="px-1">
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[16px] mt-0.5">reply</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Balas potongan teks</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{replyContent}</p>
            </div>
            <button
              type="button"
              onClick={onReplyClear}
              className="p-1 rounded-md text-slate-400 hover:text-red-600 transition-colors shrink-0"
              aria-label="Batalkan balasan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 text-xs shadow-2xs max-w-[14rem]"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate flex-1 text-slate-700 dark:text-slate-300">{att.filename}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(att.id)}
                className="text-slate-400 hover:text-red-500 rounded-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Combined Trial Banner + Input Box Container */}
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-amber-500/40 via-[#800020]/40 to-amber-600/40 shadow-glow">
        <div className="rounded-[15px] bg-trial-banner overflow-hidden">
          
          {/* Top Banner inside Input Card */}
          <div className="px-3 sm:px-3.5 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] gap-2">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium truncate">
              <Timer className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span className="truncate">Free Trial ending soon continue your workflow</span>
            </div>
            <button 
              type="button"
              onClick={() => alert('Fitur Upgrade Permata Pro')}
              className="font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-900 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            >
              <span>Upgrade Now</span>
              <ArrowUpRight className="w-3 h-3 border border-amber-600/60 dark:border-amber-400/60 rounded-full p-0.5" />
            </button>
          </div>

          {/* White Chat Input Box */}
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl px-3 sm:px-3.5 pt-2.5 pb-2.5 flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendDisabled}
              placeholder="Ask me anything..."
              className="w-full resize-none border-0 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none leading-relaxed"
              style={{ minHeight: `${textareaHeight}px` }}
            />

            {/* Bottom Bar inside Input */}
            <div className="flex items-center justify-between pt-1 gap-1">
              {/* Left Pills: Attach, RAG, & Deep Think */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.txt,.md,.csv,.json"
                />
                <button
                  type="button"
                  onClick={handleAttachClick}
                  disabled={sendDisabled || uploading}
                  className="py-1 px-2 sm:px-2.5 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-3 h-3 text-slate-500" />
                  <span>Attach</span>
                </button>

                <RagSourcePicker
                  conversationId={effectiveConvId}
                  ragEnabled={ragEnabled}
                  ragDocumentIds={ragDocumentIds}
                  onPersist={onRagConfigChange}
                />

                <button
                  type="button"
                  onClick={() => setDeepThinkActive((prev) => !prev)}
                  className={`py-1 px-2 sm:px-2.5 rounded-full border text-slate-700 dark:text-slate-300 font-medium text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    deepThinkActive
                      ? 'bg-deep-think text-white border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <Lightbulb className={`w-3 h-3 ${deepThinkActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>Deep Think</span>
                </button>
              </div>

              {/* Right Pills: Voice & Gradient Send */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={sendDisabled || !voiceSupported}
                  className={`py-1 px-2 sm:px-2.5 rounded-full border border-slate-200/80 dark:border-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                    listening
                      ? 'bg-red-50 text-red-600 animate-pulse border-red-200'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <AudioLines className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span className="hidden xs:inline">Voice</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sendDisabled || !input.trim()}
                  className="py-1 px-3 sm:px-3.5 rounded-full bg-send-btn hover:opacity-95 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 fill-amber-200 text-amber-200" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="text-center text-[10px] text-slate-400 truncate">
        Permata Flash 1.0 generates AI-based answers. Review key details for accuracy.{' '}
        <span className="underline text-slate-500 hover:text-slate-700 font-medium cursor-pointer">
          Cookie Preferences.
        </span>
      </p>
    </div>
  );
}
