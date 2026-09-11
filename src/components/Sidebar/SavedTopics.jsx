import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTopics, removeTopic } from '../../store/slices/conversationSlice';
import { topicService } from '../../services/topicService';

export default function SavedTopics() {
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

  const handleRemove = async (e, topicId) => {
    e.stopPropagation();
    try {
      await topicService.remove(topicId);
      dispatch(removeTopic(topicId));
    } catch (err) {
      console.error('Failed to remove topic:', err);
    }
  };

  if (topics.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-secondary">star</span>
          <span>Saved topics</span>
        </div>
      </div>
      <div className="space-y-0.5">
        {topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => navigate(`/chat/${topic.conversation_id}`)}
            className="p-2 rounded-xl hover:bg-surface-container-low cursor-pointer flex justify-between items-center group transition-all"
          >
            <div className="overflow-hidden pr-2 flex-1">
              <p className="font-medium text-on-surface text-xs truncate group-hover:text-primary transition-colors">
                {topic.title || 'Untitled'}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                {formatTime(topic.updated_at)}
              </p>
            </div>
            <button
              onClick={(e) => handleRemove(e, topic.id)}
              className="material-symbols-outlined text-on-surface-variant/30 hover:text-red-400 text-[16px] shrink-0 transition-colors"
              title="Hapus dari saved topics"
            >
              star
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
