import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Paperclip, Lightbulb, AudioLines, Sparkles, X, ArrowUpRight, Timer, Plus, BookOpen } from 'lucide-react';
import { attachmentService } from '../../services/attachmentService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import RagSourcePicker from '../Rag/RagSourcePicker';
import QuickActions from '../MainContent/QuickActions';
import ModelSwitcher from './ModelSwitcher';

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
  activeMode = null,
  onActiveModeClear,
  ragConfig, 
  onRagConfigChange,
  showQuickActions = false
}) {
  const [input, setInput] = useState(prefill);
  const [textareaHeight, setTextareaHeight] = useState(44);
  const [deepThinkActive, setDeepThinkActive] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const plusMenuRef = useRef(null);
  const plusButtonRef = useRef(null);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const credits = useAppSelector((state) => state.auth.user?.credits ?? null);
  const conversationId = useAppSelector((state) => state.conversation.activeConversationId);
  const outOfCredits = isAuthenticated !== false && credits !== null && credits <= 0;
  const sendDisabled = disabled || outOfCredits;

  const effectiveConvId = conversationId && conversationId !== 'new' ? conversationId : null;
  const ragEnabled = ragConfig?.ragEnabled ?? false;
  const ragDocumentIds = ragConfig?.ragDocumentIds ?? [];

  // Close plus menu on outside click
  useEffect(() => {
    if (!plusMenuOpen) return;
    const handleClickOutside = (e) => {
      if (
        plusMenuRef.current?.contains(e.target) ||
        plusButtonRef.current?.contains(e.target) ||
        e.target.closest?.('[data-rag-portal]')
      ) {
        return;
      }
      setPlusMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [plusMenuOpen]);

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

    let finalContent = input.trim();
    if (replyContent) {
      const quoted = replyContent
        .trim()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
      finalContent = `${quoted}\n\n${finalContent}`;
    }

    onSend(finalContent, attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      setTextareaHeight(44);
    }
    if (onPrefillClear) onPrefillClear();
    if (onReplyClear) onReplyClear();
    if (onActiveModeClear) onActiveModeClear();
  };

  useEffect(() => {
    setInput(prefill);
    adjustHeight();
  }, [prefill]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const height = Math.min(Math.max(textarea.scrollHeight, 44), 140);
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
    <div className="px-4 sm:px-6 pb-2.5 sm:pb-3 pt-1 max-w-4xl mx-auto w-full flex flex-col gap-2 shrink-0">
      {/* Suggestion pills if empty state */}
      {showQuickActions && (
        <QuickActions onSelectPrompt={(prompt) => setInput(prompt)} />
      )}

      {/* Active mode / Specialized role preview */}
      {activeMode && (
        <div className="px-1">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-medium truncate">
                Mode aktif: <span className="font-semibold">{activeMode}</span>
              </span>
            </div>
            {onActiveModeClear && (
              <button
                type="button"
                onClick={onActiveModeClear}
                className="p-1 rounded-md text-amber-700/70 dark:text-amber-300/70 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                aria-label="Batalkan mode spesialis"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quoted reply preview */}
      {replyContent && (
        <div className="px-1">
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-[#19151d] border border-slate-200/80 dark:border-[#2a222c] shadow-2xs">
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
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white dark:bg-[#19151d] border border-slate-200 dark:border-[#2a222c] text-xs shadow-2xs max-w-[14rem]"
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

      {/* Input Box Container - Border only appears when credits are depleted */}
      <div className={
        outOfCredits
          ? 'rounded-2xl p-[1.5px] bg-gradient-to-r from-amber-500/40 via-[#800020]/40 to-amber-600/40 dark:from-amber-500/50 dark:via-[#990026]/50 dark:to-amber-500/50 shadow-glow'
          : 'rounded-2xl bg-white dark:bg-[#141116] shadow-sm'
      }>
        <div className={outOfCredits ? 'rounded-[15px] bg-trial-banner' : ''}>
          
          {/* Top Banner inside Input Card - Only displayed when credits run out */}
          {outOfCredits && (
            <div className="px-3 sm:px-3.5 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] gap-2 border-b border-amber-500/20">
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
          )}

          {/* White Chat Input Box */}
          <div className={`bg-white dark:bg-[#181818] ${outOfCredits ? 'rounded-b-[14px]' : 'rounded-2xl'} px-3 sm:px-3.5 pt-2.5 pb-2.5 flex flex-col gap-2`}>
            <textarea
              ref={textareaRef}
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendDisabled}
              placeholder="Ask me anything..."
              className="w-full resize-none border-0 bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none leading-relaxed"
              style={{ minHeight: `${textareaHeight}px` }}
            />

            {/* Bottom Bar inside Input */}
            <div className="flex items-center justify-between pt-1 gap-1">
              {/* Left Side: Plus Button Menu (Knowledge, Attach, Deep Think) + Desktop Model Switcher + Active Chips */}
              <div className="flex items-center gap-1.5">
                {/* Plus Button with Dropup Menu */}
                <div className="relative">
                  <button
                    ref={plusButtonRef}
                    type="button"
                    onClick={() => setPlusMenuOpen((prev) => !prev)}
                    className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      plusMenuOpen
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#1c1720] hover:bg-slate-200 dark:hover:bg-[#251e2a] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-[#2a222c]'
                    }`}
                    title="Fitur Tambahan (Knowledge, Attach, Deep Think)"
                  >
                    <Plus className={`w-4 h-4 transition-transform duration-200 ${plusMenuOpen ? 'rotate-45' : ''}`} />
                  </button>

                  {/* Plus Dropup Menu */}
                  {plusMenuOpen && (
                    <div
                      ref={plusMenuRef}
                      className="absolute left-0 bottom-full mb-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#19151d] shadow-2xl border border-slate-200/80 dark:border-[#2a222c] p-2 z-50 text-xs flex flex-col gap-1"
                    >
                      <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-[#2a222c] flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fitur & Lampiran</span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Permata Tools</span>
                      </div>

                      {/* 1. Lampirkan File (Attach) */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAttachClick();
                          setPlusMenuOpen(false);
                        }}
                        disabled={sendDisabled || uploading}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#221c27] flex items-center justify-between text-left transition-colors cursor-pointer group disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Lampirkan File</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Gambar, Dokumen PDF, TXT, CSV</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">Pilih</span>
                      </button>

                      {/* 2. Knowledge Base (RAG) */}
                      <RagSourcePicker
                        conversationId={effectiveConvId}
                        ragEnabled={ragEnabled}
                        ragDocumentIds={ragDocumentIds}
                        onPersist={onRagConfigChange}
                        customTrigger={({ onClick, isEnabled, activeCount, buttonRef }) => (
                          <button
                            ref={buttonRef}
                            type="button"
                            onClick={() => {
                              onClick();
                            }}
                            className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#221c27] flex items-center justify-between text-left transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Knowledge Base</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {isEnabled && activeCount > 0 ? `${activeCount} dokumen aktif` : 'Gunakan dokumen referensi'}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              isEnabled && activeCount > 0
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}>
                              {isEnabled && activeCount > 0 ? `${activeCount} Dokumen` : 'Atur'}
                            </span>
                          </button>
                        )}
                      />

                      {/* 3. Deep Think */}
                      <div className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#221c27] flex items-center justify-between text-left transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform ${
                            deepThinkActive 
                              ? 'bg-deep-think text-white shadow-xs' 
                              : 'bg-slate-100 dark:bg-[#201a24] text-slate-500 dark:text-slate-400'
                          }`}>
                            <Lightbulb className={`w-4 h-4 ${deepThinkActive ? 'text-amber-300' : 'text-slate-500'}`} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Deep Think</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Penalaran logis mendalam</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeepThinkActive((prev) => !prev)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                            deepThinkActive ? 'bg-amber-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              deepThinkActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Model Switcher for Desktop */}
                {/* <div className="hidden sm:block">
                  <ModelSwitcher dropUp={true} inInput={true} />
                </div> */}

                {/* Active indicator chips (if Deep Think or Knowledge is on) */}
                {deepThinkActive && (
                  <button
                    type="button"
                    onClick={() => setDeepThinkActive(false)}
                    className="py-1 px-2.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50 text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-2xs group cursor-pointer"
                    title="Klik untuk nonaktifkan Deep Think"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Deep Think</span>
                    <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </button>
                )}

                {ragEnabled && ragDocumentIds.length > 0 && (
                  <div
                    className="py-1 px-2.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50 text-[11px] font-medium flex items-center gap-1.5 shadow-2xs"
                    title="Knowledge aktif"
                  >
                    <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Knowledge ({ragDocumentIds.length})</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.txt,.md,.csv,.json"
                />
              </div>

              {/* Right Pills: Voice & Gradient Send */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="hidden sm:block">
                  <ModelSwitcher dropUp={true} inInput={true} />
                </div>
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={sendDisabled || !voiceSupported}
                  className={`w-8 h-8 py-1 px-2 sm:px-2.5 rounded-full border border-slate-200/80 dark:border-[#2a222c] font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                    listening
                      ? 'bg-red-50 text-red-600 animate-pulse border-red-200'
                      : 'bg-slate-50 dark:bg-[#1c1720] hover:bg-slate-100 dark:hover:bg-[#251e2a] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <AudioLines className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  {/* <span className="hidden xs:inline">Voice</span> */}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sendDisabled || !input.trim()}
                  className="w-8 h-8 py-1 px-3 sm:px-3.5 rounded-full bg-send-btn hover:opacity-95 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 fill-amber-200 text-amber-200" />
                  {/* <span>Send</span> */}
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
