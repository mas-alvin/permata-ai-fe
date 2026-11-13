import React, { useState } from 'react';
import MessageActions from './MessageActions';
import AttachmentPreview from './AttachmentPreview';
import MarkdownRenderer from './MarkdownRenderer';
import SelectionReply from './SelectionReply';

export default function MessageBubble({
  message,
  isLast,
  onEdit,
  onRegenerate,
  onDelete,
  onReply,
}) {
  const isUser = message.role === 'user';
  const content = message.content || '';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const attachments = message.attachments || [];

  const startEdit = () => {
    setDraft(content);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(content);
    setEditing(false);
  };

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === content) {
      cancelEdit();
      return;
    }
    onEdit?.(message, trimmed);
    setEditing(false);
  };

  // Empty assistant message = loading dots
  if (!isUser && !content) {
    return (
      <div className="flex justify-start py-1">
        <div className="flex gap-1.5 items-center px-2">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    );
  }

  // Inline edit mode for user messages
  if (isUser && editing) {
    return (
      <div className="flex flex-col items-end py-1">
        <div className="w-full max-w-xl bg-[#40000b]/[0.05] dark:bg-[#40000b]/20 border border-amber-500/30 rounded-2xl rounded-br-sm p-3 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            rows={Math.min(8, Math.max(1, draft.split('\n').length))}
            className="w-full bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 p-2 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={saveEdit}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-pro rounded-lg hover:opacity-90 transition-opacity"
            >
              Simpan &amp; kirim
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User message: bubble + action icons below
  if (isUser) {
    return (
      <div className="flex flex-col items-end py-1 group">
        {attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2 mb-1">
            {attachments.map((att, idx) => (
              <AttachmentPreview key={att.id ?? idx} attachment={att} />
            ))}
          </div>
        )}
        <div className="bg-gradient-to-r from-[#40000b] to-[#600016] text-white border border-[#800020]/40 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-xl shadow-xs">
          <span className="text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-500 selection:text-white">{content}</span>
        </div>
        <MessageActions
          content={content}
          role="user"
          isLast={isLast}
          onEdit={onEdit ? startEdit : undefined}
          onDelete={onDelete ? () => onDelete(message) : undefined}
        />
      </div>
    );
  }

  // AI message: no bubble, plain text + actions on hover
  return (
    <div className="flex flex-col items-start py-1 group w-full">
      <SelectionReply onReply={onReply}>
        <div className="max-w-4xl px-1 w-full">
          <MarkdownRenderer content={content} />
        </div>
      </SelectionReply>
      <MessageActions
        content={content}
        role="assistant"
        isLast={isLast}
        onRegenerate={onRegenerate ? () => onRegenerate(message) : undefined}
        onDelete={onDelete ? () => onDelete(message) : undefined}
      />
    </div>
  );
}
