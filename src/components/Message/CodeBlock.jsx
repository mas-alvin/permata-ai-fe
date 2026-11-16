import React, { useState, useMemo } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { highlightCode } from '../../utils/prism';

export default function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin kode:', err);
    }
  };

  const displayLanguage = language ? language.toLowerCase() : 'code';

  const highlightedHtml = useMemo(() => {
    return highlightCode(value, displayLanguage);
  }, [value, displayLanguage]);

  return (
    <div className="my-4 w-full min-w-0 rounded-2xl border border-slate-700/50 dark:border-white/10 bg-[#1e1e1e] overflow-hidden shadow-2xl font-mono text-sm group/code">
      {/* VS Code Style Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-white/10 text-xs text-slate-300 select-none">
        <div className="flex items-center gap-2.5">
          {/* Window control dots */}
          <div className="flex items-center gap-1.5 mr-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-80 inline-block" />
          </div>
          <Code className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold uppercase tracking-wider text-slate-300 text-[11px]">
            {displayLanguage}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
            copied
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Salin kode ke clipboard"
          aria-label="Salin kode"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Salin kode</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with VS Code syntax highlighting */}
      <div className="p-4 w-full min-w-0 overflow-x-auto custom-scrollbar bg-[#1e1e1e]">
        <pre
          className={`language-${displayLanguage} !bg-transparent !p-0 !m-0 !border-0 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre !overflow-visible`}
        >
          <code
            className={`language-${displayLanguage}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}
