import React, { useState, useEffect } from 'react';
import PermataLogoLoader from './PermataLogoLoader';
import { Sparkles } from 'lucide-react';

const THINKING_STEPS = [
  'Sedang berpikir...',
  'Menganalisis pertanyaan...',
  'Menyiapkan respon terbaik...',
];

export default function TypingIndicator({ label }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (label) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % THINKING_STEPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [label]);

  const currentLabel = label || THINKING_STEPS[stepIndex];

  return (
    <div className="flex items-center gap-2.5 py-1.5 px-0.5 select-none animate-in fade-in duration-300">
      {/* AI Avatar Orb with Breathing Aura and Animated Permata Logo Loader */}
      <div className="relative flex items-center justify-center shrink-0">
        <span className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#800020] via-amber-500 to-amber-300 opacity-40 blur-xs animate-pulse-glow" />
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#19151d] border border-amber-500/35 dark:border-amber-400/30 flex items-center justify-center shadow-xs relative z-10 p-1.5">
          <PermataLogoLoader className="w-full h-full" />
        </div>
      </div>

      {/* Floating Thinking Capsule */}
      <div className="rounded-2xl px-3.5 py-2 bg-white/80 dark:bg-[#19151d]/90 backdrop-blur-md border border-slate-200/80 dark:border-[#2a222c] shadow-xs flex items-center gap-3">
        {/* Equalizer Waveform Bars */}
        <div className="flex items-center gap-1 h-4">
          <span className="w-1 bg-gradient-to-t from-[#800020] to-amber-500 rounded-full animate-equalizer-1" />
          <span className="w-1 bg-gradient-to-t from-amber-600 to-amber-400 rounded-full animate-equalizer-2" />
          <span className="w-1 bg-gradient-to-t from-[#800020] to-amber-500 rounded-full animate-equalizer-3" />
          <span className="w-1 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full animate-equalizer-4" />
        </div>

        {/* Shimmering Text */}
        <span className="text-xs font-medium bg-gradient-to-r from-slate-700 via-amber-600 to-slate-700 dark:from-slate-200 dark:via-amber-400 dark:to-slate-200 bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent">
          {currentLabel}
        </span>

        {/* Ambient Sparkle */}
        <Sparkles className="w-3.5 h-3.5 text-amber-500/80 dark:text-amber-400/80 animate-spin-slow shrink-0" />
      </div>
    </div>
  );
}
