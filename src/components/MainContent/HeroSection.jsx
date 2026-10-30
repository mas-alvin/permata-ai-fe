import React from 'react';
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
      color: 'emerald',
      icon: Table2,
      prompt: 'Analyze key deliverables and Q4 milestones from Project Brief.gsheet',
    },
    {
      id: 2,
      title: 'Design Notes.gdoc',
      desc: "Creative services don't just save thi...",
      time: '11 September',
      color: 'blue',
      icon: AlignLeft,
      prompt: 'Summarize the typography and brand system tokens inside Design Notes.gdoc',
    },
    {
      id: 3,
      title: 'User Feedback.gform',
      desc: "Creative services don't...",
      time: '12 September',
      color: 'purple',
      icon: ListTodo,
      prompt: 'Extract top 5 user pain points from User Feedback.gform responses',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col items-center my-auto py-2">
      {/* Floating Gemini Sparkle Icon Card */}
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-float border border-slate-100/80 dark:border-slate-700 flex items-center justify-center mb-3 sm:mb-4 animate-float">
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 32 32" fill="none">
          <path d="M16 3C16 10.18 21.82 16 29 16C21.82 16 16 21.82 16 29C16 21.82 10.18 16 3 16C10.18 16 16 10.18 16 3Z" fill="url(#hero-gemini)"/>
          <defs>
            <linearGradient id="hero-gemini" x1="3" y1="16" x2="29" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981"/>
              <stop offset="30%" stopColor="#3B82F6"/>
              <stop offset="68%" stopColor="#EF4444"/>
              <stop offset="100%" stopColor="#F59E0B"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Gradient Heading */}
      <div className="relative text-center max-w-lg mb-2 px-2">
        <h1 className="text-lg sm:text-[22px] font-semibold tracking-tight leading-snug text-hero-gradient">
          Think bigger with Gemini AI for insights and innovation at your command
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-5 sm:mb-6 relative px-2">
        Turn imagination into impact with Gemini AI. AI built to unfold endless possibilities and shape your ideas into intelligent results.
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block ml-1"></span>
      </p>

      {/* Pinned Chats Section */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Pin className="w-3.5 h-3.5 text-slate-500 rotate-45" />
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
              emerald: 'bg-emerald-500/10 text-emerald-600 hover:border-emerald-200 group-hover:text-emerald-700',
              blue: 'bg-blue-500/10 text-blue-600 hover:border-blue-200 group-hover:text-blue-700',
              purple: 'bg-purple-600/10 text-purple-600 hover:border-purple-200 group-hover:text-purple-700',
            }[item.color];

            const badgeBg = {
              emerald: 'bg-emerald-500',
              blue: 'bg-blue-500',
              purple: 'bg-purple-600',
            }[item.color];

            return (
              <div 
                key={item.id}
                onClick={() => onPrefillSelect && onPrefillSelect(item.prompt)}
                className="min-w-[200px] sm:min-w-0 flex-1 group cursor-pointer p-3 sm:p-3.5 rounded-2xl bg-[#F8FAFC]/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between gap-2"
              >
                <div className={`w-7 h-7 rounded-lg ${badgeBg}/10 flex items-center justify-center`}>
                  <div className={`w-4 h-5 rounded-xs ${badgeBg} text-white flex items-center justify-center`}>
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