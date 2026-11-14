import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTopics, removeTopic } from '../../store/slices/conversationSlice';
import { topicService } from '../../services/topicService';
import { Star } from 'lucide-react';

export default function SavedTopics({ searchQuery = '' }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const topics = useAppSelector((state) => state.conversation.topics);
  const activeId = useAppSelector((state) => state.conversation.activeConversationId);

  useEffect(() => {
    topicService
      .list()
      .then((res) => {
        dispatch(setTopics(res.data));
      })
      .catch(() => {});
  }, [dispatch]);

  const filteredTopics = topics.filter(t => 
    !searchQuery.trim() || (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const handleRemove = async (e, topicId) => {
    e.stopPropagation();
    try {
      await topicService.remove(topicId);
      dispatch(removeTopic(topicId));
    } catch (err) {
      console.error('Failed to remove topic:', err);
    }
  };

  if (filteredTopics.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 px-2">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>Topik Tersimpan</span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{filteredTopics.length}</span>
      </div>
      <div className="flex flex-col gap-1">
        {filteredTopics.map((topic) => {
          const isActive = activeId === String(topic.conversation_id);
          return (
            <div
              key={topic.id}
              onClick={() => navigate(`/chat/${topic.conversation_id}`)}
              className={`w-full py-2 px-2.5 rounded-sm font-medium text-xs flex items-center gap-2.5 transition-colors text-left group cursor-pointer ${
                isActive
                  ? 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-500/10 dark:hover:bg-slate-500/10 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isActive
                    ? 'text-amber-700 dark:text-[#d49b2c] fill-amber-500/40'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27] fill-amber-500/20'
                }`}
              />
              <span className="truncate flex-1">
                {topic.title || 'Untitled'}
              </span>
              <button
                onClick={(e) => handleRemove(e, topic.id)}
                className="text-slate-400 hover:text-amber-600 dark:hover:text-[#c58a27] hover:scale-110 transition-transform shrink-0"
                title="Hapus dari topik tersimpan"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
