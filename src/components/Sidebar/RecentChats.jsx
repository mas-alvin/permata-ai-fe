import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setConversations, updateConversationTitle, toggleConversationPin, removeConversation } from '../../store/slices/conversationSlice';
import { conversationService } from '../../services/conversationService';
import ConversationMenu from './ConversationMenu';

export default function RecentChats() {
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

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins}m yang lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}j yang lalu`;
    const days = Math.floor(hrs / 24);
    return `${days}h yang lalu`;
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
      <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">history</span>
          <span>Recent Chats</span>
        </div>
      </div>
      <div className="space-y-0.5">
        {conversations.length === 0 && (
          <p className="px-2 py-3 text-xs text-on-surface-variant/40 italic">Belum ada percakapan</p>
        )}
        {conversations.map((chat) => {
          const isActive = activeId === String(chat.id);
          const isEditing = editingId === chat.id;

          return (
            <div
              key={chat.id}
              onClick={() => !isEditing && navigate(`/chat/${chat.id}`)}
              className={`px-2 rounded-md cursor-pointer flex items-center gap-2 group transition-all ${
                isActive
                  ? 'bg-menu-active/[0.05] border border-menu-active/5'
                  : 'hover:bg-surface-container-low border-l-[3px] border-l-transparent'
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
                    className="w-full text-xs font-medium text-on-surface bg-surface-container border border-primary/20 rounded-md px-2 py-1 focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
                  />
                ) : (
                  <>
                    <p className={`font-medium text-xs truncate transition-colors ${
                      isActive ? 'text-on-surface font-semibold' : 'text-on-surface group-hover:text-secondary'
                    }`}>
                      {chat.title || 'Percakapan tanpa judul'}
                    </p>
                    {/* <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                      {formatTime(chat.updated_at)}
                    </p> */}
                  </>
                )}
              </div>
              {!isEditing && (
                <ConversationMenu
                  chat={chat}
                  onStartRename={handleStartRename}
                  onPin={handlePin}
                  onDelete={handleDelete}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}