import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setConversations } from '../../store/slices/conversationSlice';
import { conversationService } from '../../services/conversationService';
import { Search, X, MessageSquare, Pin, ArrowRight, CornerDownLeft, Sparkles, Clock } from 'lucide-react';

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.conversation.conversations);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync conversation list if not loaded yet
  useEffect(() => {
    if (isOpen) {
      if (conversations.length === 0) {
        conversationService.list(1, '').then((res) => {
          const items = res.data.data || res.data;
          dispatch(setConversations(items));
        }).catch(() => {});
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen, dispatch, conversations.length]);

  // Filtered results
  const filtered = conversations.filter((c) => {
    if (!query.trim()) return true;
    const title = c.title || '';
    return title.toLowerCase().includes(query.toLowerCase());
  });

  // Relative time formatter
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins}m yang lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}j yang lalu`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Kemarin';
    if (days < 7) return `${days}h yang lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  };

  const handleSelect = (convId) => {
    navigate(`/chat/${convId}`);
    onClose();
  };

  // Keyboard navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].id);
      }
    }
  };

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#19151d] rounded-2xl border border-slate-200/80 dark:border-[#2a222c] shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-[#2a222c] shrink-0">
          <Search className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari percakapan atau kata kunci..."
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#251e2a] border border-slate-200 dark:border-[#35293a] text-[10px] font-semibold text-slate-400">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto no-scrollbar flex-1 p-2 space-y-1" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-600" />
              <p className="text-xs font-medium">Tidak ada percakapan ditemukan</p>
              {query && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Coba kata kunci lain untuk "{query}"
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>{query ? `Hasil Pencarian (${filtered.length})` : 'Percakapan Terbaru'}</span>
                <span className="normal-case text-[10px] text-amber-700 dark:text-amber-400">Tekan ↵ untuk memilih</span>
              </div>

              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isPinned = item.is_pinned;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-[#201a24] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isPinned
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : isSelected
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-[#221c27] text-slate-400'
                      }`}>
                        {isPinned ? (
                          <Pin className="w-4 h-4 fill-amber-500 text-amber-600" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium truncate ${
                          isSelected ? 'text-amber-900 dark:text-amber-200 font-semibold' : ''
                        }`}>
                          {item.title || 'Percakapan Tanpa Judul'}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400/80" />
                          <span>{formatTime(item.updated_at || item.created_at)}</span>
                          {isPinned && <span className="text-amber-600 font-semibold">• Dipin</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Modal Footer Shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-[#2a222c] bg-slate-50/50 dark:bg-[#151218] flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200/80 dark:bg-[#2a222c] font-mono text-[9px] text-slate-600 dark:text-slate-300">↑↓</kbd>
              <span>Navigasi</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200/80 dark:bg-[#2a222c] font-mono text-[9px] text-slate-600 dark:text-slate-300">↵</kbd>
              <span>Buka</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200/80 dark:bg-[#2a222c] font-mono text-[9px] text-slate-600 dark:text-slate-300">ESC</kbd>
              <span>Tutup</span>
            </span>
          </div>

          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Permata Search</span>
          </span>
        </div>
      </div>
    </div>
  );
}

