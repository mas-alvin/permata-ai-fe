import React, { useState } from 'react';
import MessageActions from './MessageActions';
import AttachmentPreview from './AttachmentPreview';
import MarkdownRenderer from './MarkdownRenderer';
import SelectionReply from './SelectionReply';
import TypingIndicator from '../Typing/TypingIndicator';
import { FileDown, Download } from 'lucide-react';
import { documentService } from '../../services/documentService';

function parseUserContent(content) {
  if (typeof content === 'string' && content.startsWith('> ')) {
    const splitIndex = content.indexOf('\n\n');
    if (splitIndex !== -1) {
      const quoteBlock = content.slice(0, splitIndex);
      const textBlock = content.slice(splitIndex + 2);
      const lines = quoteBlock.split('\n');
      const allQuoted = lines.every((line) => line.startsWith('>') || line.trim() === '');
      if (allQuoted) {
        const quote = lines.map((l) => l.replace(/^>\s?/, '')).join('\n');
        return { quote, text: textBlock };
      }
    }
  }
  return { quote: null, text: content };
}

function extractTitleFromContent(content) {
  if (!content) return 'Dokumen Permata AI';
  const match = content.match(/^#+\s*(.+)$/m);
  if (match && match[1]) {
    return match[1].trim().replace(/[*_`]/g, '');
  }
  const firstLine = content.split('\n').find((l) => l.trim().length > 0);
  if (firstLine) {
    const cleaned = firstLine.replace(/[*_#`]/g, '').trim();
    if (cleaned.length > 0) return cleaned.slice(0, 60);
  }
  return 'Dokumen Permata AI';
}

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
  const [downloadingFormat, setDownloadingFormat] = useState(null); // 'pdf' | 'word' | null
  const attachments = message.attachments || [];

  const documentTitle = extractTitleFromContent(content);
  // Deteksi apakah pesan ini terstruktur seperti dokumen formal (memiliki judul/sub-judul dan isi terstruktur)
  const isDocumentLike =
    !isUser &&
    content.length > 180 &&
    (/^#+\s/m.test(content) ||
     content.includes('Ringkasan Eksekutif') ||
     content.includes('Dokumen') ||
     content.includes('Laporan') ||
     content.includes('Panduan') ||
     content.includes('CRUD') ||
     /(unduh pdf|unduh word|dokumen fisik|\.pdf|\.docx)/i.test(content));

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

  const handleQuickDownload = async (format) => {
    try {
      setDownloadingFormat(format);
      await documentService.exportDocument({
        format,
        title: documentTitle,
        content,
        meta: {
          document_type: 'Dokumen Formal AI',
          author: 'Permata AI Assistant',
        },
      });
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh dokumen. Silakan coba kembali.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Empty assistant message = typing / thinking indicator
  if (!isUser && !content) {
    return (
      <div className="flex justify-start py-1">
        <TypingIndicator />
      </div>
    );
  }

  // Inline edit mode for user messages
  if (isUser && editing) {
    return (
      <div className="flex flex-col items-end py-1">
        <div className="w-full max-w-xl bg-[#40000b]/[0.05] dark:bg-[#40000b]/25 border border-amber-500/30 rounded-2xl rounded-br-sm p-3 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            rows={Math.min(8, Math.max(1, draft.split('\n').length))}
            className="w-full bg-white dark:bg-[#19151d] text-sm text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-[#2a222c] p-2 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#19151d] transition-colors"
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
    const { quote, text } = parseUserContent(content);

    return (
      <div className="flex flex-col items-end py-1 group max-w-full">
        {attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2 mb-1">
            {attachments.map((att, idx) => (
              <AttachmentPreview key={att.id ?? idx} attachment={att} />
            ))}
          </div>
        )}
        <div className="bg-gradient-to-r from-[#40000b] to-[#600016] dark:from-[#4d0012] dark:via-[#630018] dark:to-[#78001e] text-white border border-[#800020]/40 dark:border-amber-400/35 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-xl shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(128,0,32,0.45)]">
          {quote && (
            <div className="mb-2.5 pl-2.5 py-1.5 pr-2 rounded-r-lg bg-black/30 border-l-2 border-amber-400 text-xs text-amber-100/90 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block mb-0.5">
                Membalas:
              </span>
              <span className="opacity-90">{quote}</span>
            </div>
          )}
          <span className="text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-500 selection:text-white">{text}</span>
        </div>
        <MessageActions
          content={content}
          role="user"
          isLast={isLast}
          onEdit={onEdit ? startEdit : undefined}
          onDelete={onDelete ? () => onDelete(message) : undefined}
          title={documentTitle}
        />
      </div>
    );
  }

  // AI message: no bubble, plain text + actions on hover + optional document quick download banner
  return (
    <div className="flex flex-col items-start py-1 group w-full min-w-0">
      <SelectionReply onReply={onReply}>
        <div className="w-full max-w-4xl px-1 min-w-0">
          <MarkdownRenderer content={content} />
        </div>
      </SelectionReply>

      <MessageActions
        content={content}
        role="assistant"
        isLast={isLast}
        onRegenerate={onRegenerate ? () => onRegenerate(message) : undefined}
        onDelete={onDelete ? () => onDelete(message) : undefined}
        onReply={onReply}
        title={documentTitle}
      />
    </div>
  );
}
