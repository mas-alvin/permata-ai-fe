import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setConversations, updateConversationTitle, toggleConversationPin, removeConversation } from '../../store/slices/conversationSlice';
import { conversationService } from '../../services/conversationService';
import ConversationMenu from './ConversationMenu';
import { History, MessageCircle } from 'lucide-react';

export default function RecentChats({ searchQuery = '' }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.conversation.conversations);
  const activeId = useAppSelector((state) => state.conversation.activeConversationId);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    conversationService.list(1, '').then((res) => {
      const items = res.data.data || res.data;
      dispatch(setConversations(items));
    }).catch(() => {});
  }, [dispatch]);

  const filtered = conversations.filter(c => 
    !searchQuery.trim() || (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Edited just now';
    if (mins < 60) return `Edited ${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Edited ${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `Edited ${days}d ago`;
  };

  const handleStartRename = (chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title || '');
  };

  const handleSaveTitle = async (chatId) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      setEditTitle('');
      return;
    }
    if (editTitle.trim() !== (conversations.find(c => c.id === chatId)?.title || '')) {
      try {
        await conversationService.update(chatId, editTitle);
        dispatch(updateConversationTitle({ id: chatId, title: editTitle }));
      } catch (err) {
        console.error('Failed to rename:', err);
      }
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handlePin = async (chatId) => {
    try {
      await conversationService.pin(chatId);
      dispatch(toggleConversationPin(chatId));
    } catch (err) {
      console.error('Failed to pin:', err);
    }
  };

  const handleDelete = async (chatId) => {
    try {
      await conversationService.delete(chatId);
      dispatch(removeConversation(chatId));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleKeyDown = (e, chatId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle(chatId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditTitle('');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          <span>Riwayat Terbaru</span>
        </div>
        <span className="text-[10px]">{filtered.length}</span>
      </div>
      <div className="flex flex-col gap-1">
        {filtered.length === 0 && (
          <p className="px-2 py-2 text-xs text-slate-400 italic">Belum ada obrolan</p>
        )}
        {filtered.map((chat) => {
          const isActive = activeId === String(chat.id);
          const isEditing = editingId === chat.id;

          return (
            <div
              key={chat.id}
              onClick={() => !isEditing && navigate(`/chat/${chat.id}`)}
              className={`group cursor-pointer p-2 rounded-xl transition-all flex items-center justify-between gap-2 ${
                isActive
                  ? 'bg-slate-100/90 dark:bg-slate-800 text-blue-600'
                  : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="overflow-hidden pr-1 flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, chat.id)}
                    onBlur={() => handleSaveTitle(chat.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-blue-400 rounded-lg px-2 py-1 focus:outline-none transition-all"
                  />
                ) : (
                  <>
                    <h4 className={`text-xs font-medium truncate transition-colors ${
                      isActive ? 'text-blue-600 font-semibold' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600'
                    }`}>
                      {chat.title || 'Percakapan baru'}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {formatTime(chat.updated_at)}
                    </span>
                  </>
                )}
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1 shrink-0">
                  <ConversationMenu
                    chat={chat}
                    onStartRename={handleStartRename}
                    onPin={handlePin}
                    onDelete={handleDelete}
                  />
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}