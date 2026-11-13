import React from 'react';
import permataIcon from '../../assets/permata-icon.png';
import { 
  Pin, 
  ChevronDown, 
  ChevronRight, 
  Table2, 
  AlignLeft, 
  ListTodo 
} from 'lucide-react';

export default function HeroSection({ onPrefillSelect }) {
  const pinnedTemplates = [
    {
      id: 1,
      title: 'Project Brief.gsheet',
      desc: "Creative services don't just make thi...",
      time: 'Just now',
      color: 'amber',
      icon: Table2,
      prompt: 'Analyze key deliverables and Q4 milestones from Project Brief.gsheet',
    },
    {
      id: 2,
      title: 'Design Notes.gdoc',
      desc: "Creative services don't just save thi...",
      time: '11 September',
      color: 'maroon',
      icon: AlignLeft,
      prompt: 'Summarize the typography and brand system tokens inside Design Notes.gdoc',
    },
    {
      id: 3,
      title: 'User Feedback.gform',
      desc: "Creative services don't...",
      time: '12 September',
      color: 'gold',
      icon: ListTodo,
      prompt: 'Extract top 5 user pain points from User Feedback.gform responses',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col items-center my-auto py-2">
      {/* Floating Permata Icon Card */}
      <div className="w-30 h-30 sm:w-14 sm:h-14 dark:bg-slate-800 shadow-float border border-slate-200/80 dark:border-slate-700 flex items-center justify-center mb-3 sm:mb-4 animate-float p-2.5">
        <img src={permataIcon} alt="Permata AI" className="w-full h-full object-contain" />
      </div>

      {/* Gradient Heading */}
      <div className="relative text-center max-w-lg mb-2 px-2">
        <h1 className="text-lg sm:text-[22px] font-semibold tracking-tight leading-snug text-hero-gradient">
          Think bigger with Permata Flash 1.0 for insights and innovation at your command
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-5 sm:mb-6 relative px-2">
        Turn imagination into impact with Permata Flash 1.0. AI built to unfold endless possibilities and shape your ideas into intelligent results.
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ml-1"></span>
      </p>

      {/* Pinned Chats Section */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 rotate-45" />
            <span>Pinned Chats</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-0.5">
            <span>See all</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* 3 Horizontal Cards Grid */}
        <div className="flex sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {pinnedTemplates.map((item) => {
            const Icon = item.icon;
            const colorClasses = {
              amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:border-amber-300 group-hover:text-amber-800',
              maroon: 'bg-rose-900/10 text-rose-800 dark:text-rose-400 hover:border-rose-300 group-hover:text-rose-900',
              gold: 'bg-yellow-600/10 text-yellow-700 dark:text-yellow-400 hover:border-yellow-300 group-hover:text-yellow-800',
            }[item.color];

            const badgeBg = {
              amber: 'bg-amber-600',
              maroon: 'bg-[#800020]',
              gold: 'bg-amber-500',
            }[item.color];

            return (
              <div 
                key={item.id}
                onClick={() => onPrefillSelect && onPrefillSelect(item.prompt)}
                className="min-w-[200px] sm:min-w-0 flex-1 group cursor-pointer p-3 sm:p-3.5 rounded-2xl bg-[#F8FAFC]/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between gap-2"
              >
                <div className={`w-7 h-7 rounded-lg ${badgeBg}/10 flex items-center justify-center`}>
                  <div className={`w-4 h-5 rounded-xs ${badgeBg} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-xs font-semibold text-slate-800 dark:text-slate-200 truncate ${colorClasses}`}>
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}