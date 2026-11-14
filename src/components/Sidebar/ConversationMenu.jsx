import React, { useState, useRef, useEffect } from 'react';
import { useConfirmModal } from '../../hooks/useConfirmModal';

/**
 * Dropdown menu (titik 3) untuk aksi percakapan: Rename, Pin/Unpin, Delete.
 * Digunakan di RecentChats dan PinnedChats.
 *
 * Props:
 *  - chat: object percakapan
 *  - onStartRename: dipanggil saat user klik "Rename" (parent handle inline edit)
 *  - onPin: (chatId) => void
 *  - onDelete: (chatId) => void
 */
export default function ConversationMenu({ chat, onStartRename, onPin, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { confirm } = useConfirmModal();

  // Tutup menu saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onStartRename(chat);
  };

  const handlePin = (e) => {
    e.stopPropagation();
    onPin(chat.id);
    setIsOpen(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsOpen(false);
    const ok = await confirm({
      title: 'Hapus percakapan?',
      message: `Percakapan "${chat.title || 'Tanpa judul'}" dan semua pesannya akan dihapus permanen.`,
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      danger: true,
    });
    if (ok) {
      onDelete(chat.id);
    }
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={handleMenuClick}
        className={`p-1 rounded-sm transition-all ${
          isOpen
            ? 'text-slate-800 dark:text-slate-200 bg-slate-500/10 dark:bg-slate-500/20'
            : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-500/10 dark:hover:bg-slate-500/10'
        }`}
        aria-label="More actions"
      >
        <span className="material-symbols-outlined text-[16px]">more_horiz</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white dark:bg-[#19151d] rounded-sm border border-slate-200 dark:border-[#2a222c] shadow-xl py-1 animate-in fade-in duration-100 overflow-hidden">
          <button
            onClick={handleRename}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-[#251e29] hover:text-amber-800 dark:hover:text-[#d49b2c] transition-colors text-left group"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-amber-700 dark:group-hover:text-[#c58a27] transition-colors">edit</span>
            <span>Ubah Nama</span>
          </button>
          <button
            onClick={handlePin}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-[#251e29] hover:text-amber-800 dark:hover:text-[#d49b2c] transition-colors text-left group"
          >
            <span className={`material-symbols-outlined text-[16px] transition-colors ${chat.is_pinned ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-700 dark:group-hover:text-[#c58a27]'}`} style={chat.is_pinned ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {chat.is_pinned ? 'star' : 'star_outline'}
            </span>
            <span>{chat.is_pinned ? 'Lepas Sematan' : 'Sematkan'}</span>
          </button>
          <div className="my-1 border-t border-slate-100 dark:border-[#2a222c]"></div>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Hapus</span>
          </button>
        </div>
      )}
    </div>
  );
}
