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
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5" />
          <span>Topik Tersimpan</span>
        </div>
        <span className="text-[10px]">{filteredTopics.length}</span>
      </div>
      <div className="flex flex-col gap-1">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => navigate(`/chat/${topic.conversation_id}`)}
            className="w-full py-2 px-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-[#1f1922] text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-[#d49b2c] font-medium text-xs flex items-center gap-3 transition-colors text-left group cursor-pointer"
          >
            <Star className="w-4 h-4 text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27] shrink-0 fill-amber-500/20" />
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
        ))}
      </div>
    </div>
  );
}
