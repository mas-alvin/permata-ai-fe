import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

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

  return (
    <div className="my-4 rounded-md border border-slate-800/80 bg-[#0d1117] overflow-hidden shadow-lg font-mono text-sm group/code">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-amber-500" />
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            {displayLanguage}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-all duration-200 cursor-pointer ${copied
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
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

      {/* Code Body */}
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-slate-100 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre m-0 bg-transparent border-0 p-0">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}
