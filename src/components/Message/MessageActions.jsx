import { useState, useRef, useEffect } from 'react';
import {
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { documentService } from '../../services/documentService';

/**
 * Row of hover actions for a message bubble with PDF and Word export options.
 */
export default function MessageActions({ 
  content, 
  role, 
  isLast, 
  onRegenerate, 
  onEdit, 
  onDelete, 
  onReply,
  title = 'Jawaban Asisten Permata AI'
}) {
  const [copied, setCopied] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null); // 'pdf' | 'word' | null
  const exportMenuRef = useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Close export dropdown on click outside
  useEffect(() => {
    if (!exportOpen) return;
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportOpen]);

  const handleExport = async (format) => {
    try {
      setExportingFormat(format);
      await documentService.exportDocument({
        format,
        title,
        content,
        meta: {
          document_type: 'Jawaban Asisten AI',
          author: role === 'assistant' ? 'Permata AI Assistant' : 'Pengguna',
        },
      });
      setExportOpen(false);
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengekspor dokumen. Pastikan koneksi ke server stabil.');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 relative">
      {/* Tombol Salin */}
      <button
        type="button"
        onClick={handleCopy}
        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#201a24] transition-colors text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer"
        title="Salin pesan"
        aria-label="Salin pesan"
      >
        {copied ? (
          <ClipboardDocumentCheckIcon className="w-4 h-4 text-amber-600" />
        ) : (
          <ClipboardDocumentIcon className="w-4 h-4" />
        )}
      </button>

      {/* Tombol Ekspor PDF / Word (Khusus Asisten AI) */}
      {role === 'assistant' && (
        <div className="relative" ref={exportMenuRef}>
          <button
            type="button"
            onClick={() => setExportOpen((prev) => !prev)}
            disabled={!!exportingFormat}
            className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#201a24] transition-colors cursor-pointer ${
              exportOpen
                ? 'bg-slate-100 dark:bg-[#201a24] text-amber-700 dark:text-amber-400'
                : 'text-slate-400 hover:text-amber-700 dark:hover:text-amber-400'
            }`}
            title="Unduh sebagai Dokumen Fisik (PDF / Word)"
            aria-label="Unduh dokumen fisik"
          >
            {exportingFormat ? (
              <span className="material-symbols-outlined text-[16px] animate-spin text-amber-600">progress_activity</span>
            ) : (
              <DocumentArrowDownIcon className="w-4 h-4" />
            )}
          </button>

          {/* Dropdown Menu Opsi Download */}
          {exportOpen && (
            <div className="absolute left-0 bottom-full mb-1.5 w-48 bg-white dark:bg-[#1a151d] rounded-xl border border-slate-200 dark:border-[#2a222c] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-[#241d27] text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Unduh Dokumen Fisik
              </div>

              {/* Opsi 1: PDF */}
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={!!exportingFormat}
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

              {/* Opsi 2: Word */}
              <button
                type="button"
                onClick={() => handleExport('word')}
                disabled={!!exportingFormat}
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

      {/* Tombol Regenerasi (Hanya pesan terakhir assistant) */}
      {role === 'assistant' && isLast && onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#201a24] transition-colors text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer"
          title="Regenerasi jawaban"
          aria-label="Regenerasi jawaban"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      )}

      {/* Tombol Balas Potongan Teks */}
      {role === 'assistant' && onReply && (
        <button
          type="button"
          onClick={() => onReply({ content, id: null })}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#201a24] transition-colors text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer"
          title="Balas pesan ini"
          aria-label="Balas pesan"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
        </button>
      )}

      {/* Tombol Edit (Khusus user) */}
      {role === 'user' && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#201a24] transition-colors text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer"
          title="Edit pesan"
          aria-label="Edit pesan"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>
      )}

      {/* Tombol Hapus */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-slate-400 hover:text-red-600 cursor-pointer"
          title="Hapus pesan"
          aria-label="Hapus pesan"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
