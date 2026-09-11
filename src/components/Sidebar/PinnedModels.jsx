import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function PinnedModels() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    api
      .get('/models')
      .then((res) => {
        setModels(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-2 text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-wider">
        <span>Pinned Models</span>
        <button className="text-on-surface-variant hover:text-on-surface transition-colors p-0.5 rounded hover:bg-surface-container-low">
          <span className="material-symbols-outlined text-[15px]">add</span>
        </button>
      </div>
      <div className="space-y-1">
        {/* Active / Promoted Model */}
        {models.length === 0 && (
          <div className="relative bg-gradient-pro p-2.5 rounded-xl text-white flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[17px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div className="truncate">
                <div className="font-label-md font-semibold text-sm leading-tight flex items-center gap-1.5">
                  <span>Permata Pro</span>
                  <span className="text-[9px] bg-secondary-container text-on-secondary-container font-bold px-1 rounded-sm uppercase tracking-wide">Pro</span>
                </div>
                <p className="text-[10px] text-white/80 truncate">Reasoning &amp; Advanced Logic</p>
              </div>
            </div>
          </div>
        )}

        {models.map((model) => (
          <button
            key={model.id}
            className="w-full p-2 rounded-xl text-on-surface hover:bg-surface-container-low text-left font-label-md flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </div>
              <span className="text-xs font-medium">{model.name}</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/50 group-hover:text-on-surface-variant">{model.slug}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
