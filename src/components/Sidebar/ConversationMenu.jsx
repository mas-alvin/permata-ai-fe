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
        className={`p-1 rounded-lg transition-all ${
          isOpen
            ? 'text-on-surface bg-surface-container-low'
            : 'text-on-surface-variant/40 opacity-0 group-hover:opacity-100 hover:text-on-surface hover:bg-surface-container-low'
        }`}
        aria-label="More actions"
      >
        <span className="material-symbols-outlined text-[16px]">more_horiz</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-surface rounded-md border border-on-surface/8 py-1 animate-in fade-in duration-100">
          <button
            onClick={handleRename}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
            <span>Rename</span>
          </button>
          <button
            onClick={handlePin}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors text-left"
          >
            <span className={`material-symbols-outlined text-[16px] ${chat.is_pinned ? 'text-amber-500' : 'text-on-surface-variant'}`} style={chat.is_pinned ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {chat.is_pinned ? 'star' : 'star_outline'}
            </span>
            <span>{chat.is_pinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <div className="my-1 border-t border-on-surface/5"></div>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-surface-container-low transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
