import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MessageActions from './MessageActions';
import AttachmentPreview from './AttachmentPreview';

export default function MessageBubble({
  message,
  isLast,
  onEdit,
  onRegenerate,
  onDelete,
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
        <div className="w-full max-w-xl bg-primary/[0.04] border border-primary/20 rounded-2xl rounded-br-sm p-3 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            rows={Math.min(8, Math.max(1, draft.split('\n').length))}
            className="w-full bg-white text-sm text-on-surface rounded-xl border border-on-surface/10 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-low transition-colors"
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
        <div className="bg-primary text-on-primary rounded-2xl rounded-br-sm px-4 py-2.5 max-w-xl">
          <span className="text-sm leading-relaxed whitespace-pre-wrap">{content}</span>
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
    <div className="flex flex-col items-start py-1 group">
      <div className="max-w-4xl px-1">
        <div className="prose prose-sm max-w-none text-on-surface">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
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
