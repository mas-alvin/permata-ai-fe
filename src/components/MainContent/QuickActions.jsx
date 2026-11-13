import React from 'react';
import { 
  Wand2, 
  PencilRuler, 
  BookOpenCheck, 
  ScanEye, 
  Sparkles 
} from 'lucide-react';

const quickActions = [
  { icon: Wand2, label: 'Help me write', prompt: 'Help me write a compelling product launch announcement' },
  { icon: PencilRuler, label: 'Design Smart', prompt: 'Design a smart UI component hierarchy for a SaaS analytics dashboard' },
  { icon: BookOpenCheck, label: 'Learn about', prompt: 'Explain quantum computing concepts in simple executive terms' },
  { icon: ScanEye, label: 'Analyze Image', prompt: 'Analyze the visual hierarchy and color palette of my mockup' },
  { icon: Sparkles, label: 'Productivity Focus', prompt: 'Create a high-leverage daily productivity workflow for a design team' },
];

export default function QuickActions({ onSelectPrompt }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => onSelectPrompt && onSelectPrompt(action.prompt)}
            className="shrink-0 py-1.5 px-3 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 hover:border-amber-500/40 text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-400 font-medium text-[11px] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Icon className="w-3 h-3 text-amber-600/80 dark:text-amber-400/80" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
