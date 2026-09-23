import { useState } from 'react';
import {
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

/**
 * Row of hover actions for a message bubble.
 *
 * Props:
 * - role: 'user' | 'assistant'
 * - isLast: whether this is the last message in the conversation
 * - onRegenerate: () => void  (assistant only)
 * - onEdit: () => void        (user only)
 * - onDelete: () => void
 */
export default function MessageActions({ content, role, isLast, onRegenerate, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md hover:bg-surface-container-low transition-colors text-on-surface-variant/60 hover:text-on-surface"
        title="Salin"
        aria-label="Salin pesan"
      >
        {copied ? (
          <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <ClipboardDocumentIcon className="w-3.5 h-3.5" />
        )}
      </button>

      {role === 'assistant' && isLast && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="p-1.5 rounded-md hover:bg-surface-container-low transition-colors text-on-surface-variant/60 hover:text-on-surface"
          title="Regenerasi jawaban"
          aria-label="Regenerasi jawaban"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
        </button>
      )}

      {role === 'user' && onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md hover:bg-surface-container-low transition-colors text-on-surface-variant/60 hover:text-on-surface"
          title="Edit pesan"
          aria-label="Edit pesan"
        >
          <PencilSquareIcon className="w-3.5 h-3.5" />
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-on-surface-variant/60 hover:text-red-600"
          title="Hapus pesan"
          aria-label="Hapus pesan"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
