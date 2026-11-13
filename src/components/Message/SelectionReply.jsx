import React, { useState, useRef, useEffect } from 'react';

export default function SelectionReply({ onReply, children }) {
  const [selection, setSelection] = useState(null);
  const containerRef = useRef(null);

  const handleSelectionChange = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const selectedText = sel.toString().trim();

    // Check if selection is inside our container
    if (!containerRef.current?.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    if (selectedText.length > 0) {
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setSelection({
        text: selectedText,
        top: rect.top - containerRect.top - 8,
        left: rect.left - containerRect.left + rect.width / 2,
      });
    } else {
      setSelection(null);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleReplyClick = (e) => {
    e.stopPropagation();
    if (selection?.text) {
      onReply?.(selection.text);
      setSelection(null);
      window.getSelection().removeAllRanges();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {children}
      
      {selection && (
        <div 
          className="absolute z-50 pointer-events-none"
          style={{ 
            top: selection.top, 
            left: selection.left,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <button
            onClick={handleReplyClick}
            className="pointer-events-auto px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#40000b] to-[#600016] border border-amber-500/40 rounded-full shadow-lg hover:opacity-95 transition-opacity flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Balas teks terpilih"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h12M8 12l-4-4m4 4l-4 4M20 12l-4-4m4 4l-4 4" />
            </svg>
            <span>Balas</span>
          </button>
          
          {/* Triangle pointer */}
          <div className="pointer-events-auto absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-[#600016] border-r-transparent border-l-transparent" />
        </div>
      )}
    </div>
  );
}
