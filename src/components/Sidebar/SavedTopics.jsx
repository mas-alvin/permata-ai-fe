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
            className="group cursor-pointer p-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all flex items-start justify-between gap-2"
          >
            <div className="overflow-hidden min-w-0 flex-1">
              <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                {topic.title || 'Untitled'}
              </h4>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                {formatTime(topic.updated_at)}
              </span>
            </div>
            <button
              onClick={(e) => handleRemove(e, topic.id)}
              className="text-amber-400 hover:scale-110 transition-transform shrink-0 mt-0.5"
              title="Hapus dari topik tersimpan"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
