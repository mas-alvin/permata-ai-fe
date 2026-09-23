import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { BoltIcon } from '@heroicons/react/24/solid';
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { attachmentService } from '../../services/attachmentService';

const models = [
  { id: 'permata-pro', label: 'Permata Pro', icon: 'psychology' },
];

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

export default function ChatInputActive({ onSend, disabled = false, prefill = '', onPrefillClear }) {
  const [input, setInput] = useState(prefill);
  const [textareaHeight, setTextareaHeight] = useState(48);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Credits from auth slice — when 0, the user cannot send messages
  const credits = useAppSelector((state) => state.auth.user?.credits ?? 0);
  const conversationId = useAppSelector((state) => state.conversation.activeConversationId);
  const outOfCredits = credits <= 0;
  const sendDisabled = disabled || outOfCredits;

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
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
    // Best-effort delete on the server
    attachmentService.delete(attachmentId).catch(() => {});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || sendDisabled) return;
    onSend(input, attachments);
    setInput('');
    setAttachments([]);
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      setTextareaHeight(48);
    }
    // Clear edit mode
    if (onPrefillClear) onPrefillClear();
  };

  // Update input when prefill changes (edit feature)
  useEffect(() => {
    setInput(prefill);
    adjustHeight();
  }, [prefill]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const height = Math.min(textarea.scrollHeight, 160);
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
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Out-of-credits banner */}
        {outOfCredits && (
          <div className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            <BoltIcon className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">
              Kredit Anda telah habis. Isi ulang untuk melanjutkan percakapan.
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="ml-auto text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Top up
            </a>
          </div>
        )}

        {/* Input Box — same style as MainContent/ChatInput.jsx */}
        <div className="w-full bg-white rounded-3xl border border-on-surface/10 shadow-lg shadow-on-surface/5 overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
          <div className="p-4 flex flex-col gap-3">
            {/* Attachment previews */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-on-surface/10 max-w-[16rem]"
                  >
                    <PaperClipIcon className="w-4 h-4 text-on-surface-variant shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-on-surface truncate">{att.filename}</p>
                      {att.size ? <p className="text-[10px] text-on-surface-variant/70">{formatSize(att.size)}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-0.5 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-red-600 transition-colors shrink-0"
                      aria-label="Hapus lampiran"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {uploading && (
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Mengunggah file...</span>
              </div>
            )}

            <div style={{ minHeight: `${textareaHeight}px` }} className="relative">
              <textarea
                ref={textareaRef}
                className="w-full h-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md placeholder:text-on-surface-variant/50 p-0 resize-none overflow-y-auto"
                placeholder="Ask Permata anything..."
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sendDisabled}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-on-surface/5">
              <div className="flex items-center gap-2">
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
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Attach"
                  title="Lampirkan file"
                >
                  <span className="material-symbols-outlined text-[22px]">attach_file</span>
                </button>
                <span className="text-on-surface text-sm font-medium select-none">
                  {selectedModel.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-xl transition-colors"
                  aria-label="Voice"
                >
                  <span className="material-symbols-outlined text-[22px]">mic</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sendDisabled || !input.trim()}
                  className="bg-gradient-pro text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-3 text-center max-w-xl mx-auto">
          Permata AI generates AI-based answers. Review key details for accuracy.{' '}
          <a className="underline hover:text-on-surface transition-colors" href="#">
            Cookie Preferences
          </a>
          .
        </p>
      </div>
    </div>
  );
}
