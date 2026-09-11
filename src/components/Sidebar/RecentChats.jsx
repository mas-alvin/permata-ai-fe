import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setConversations } from '../../store/slices/conversationSlice';
import { conversationService } from '../../services/conversationService';

export default function RecentChats() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.conversation.conversations);
  const activeId = useAppSelector((state) => state.conversation.activeConversationId);

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
        {conversations.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className={`p-2 rounded-xl cursor-pointer flex items-center gap-2 group transition-all ${
              activeId === String(chat.id)
                ? 'bg-surface-container-low/70 border border-primary/10'
                : 'hover:bg-surface-container-low'
            }`}
          >
            {activeId === String(chat.id) && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
            )}
            <div className="overflow-hidden pr-2 flex-1">
              <p className={`font-medium text-xs truncate transition-colors ${
                activeId === String(chat.id)
                  ? 'text-on-surface font-semibold'
                  : 'text-on-surface group-hover:text-primary'
              }`}>
                {chat.title || 'Percakapan tanpa judul'}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                {formatTime(chat.updated_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}