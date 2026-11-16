import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import MarkdownRenderer from './MarkdownRenderer';
import TypingIndicator from '../Typing/TypingIndicator';

export default function MessageList({ messages, onEdit, onRegenerate, onDelete, onReply, isStreaming, partialContent }) {
  const endRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setUserScrolledUp(false);
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setUserScrolledUp(!isAtBottom);
    setShowScrollButton(!isAtBottom);
  };

  // Auto-scroll to bottom when streaming or new messages, but only if user hasn't scrolled up
  useEffect(() => {
    if (endRef.current && !userScrolledUp) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, partialContent, isStreaming, userScrolledUp]);

  // Saring pesan agar TIDAK PERNAH menampilkan animasi loading ganda:
  // 1. Jika streaming sedang aktif (isStreaming), sembunyikan placeholder/pesan kosong di riwayat
  //    karena streaming indicator di bagian bawah sudah mewakili proses berpikir AI.
  // 2. Jika tidak streaming, sembunyikan pesan asisten kosong yang bukan pesan terakhir.
  const displayMessages = messages.filter((msg, idx) => {
    const isEmptyAssistant = msg.role === 'assistant' && (!msg.content || msg.content.trim() === '');
    if (isStreaming && (isEmptyAssistant || msg.id === 'bg-in-progress')) {
      return false;
    }
    if (isEmptyAssistant && idx !== messages.length - 1) {
      return false;
    }
    return true;
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 custom-scrollbar min-w-0"
      onScroll={handleScroll}
    >
      <div className="max-w-4xl mx-auto space-y-2 w-full min-w-0">
        {displayMessages.map((msg, idx) => (
          <MessageBubble
            key={msg.id ?? idx}
            message={msg}
            isLast={idx === displayMessages.length - 1}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
            onReply={onReply}
          />
        ))}

        {/* Streaming AI response — same styling as final messages */}
        {isStreaming && partialContent && (
          <div className="flex flex-col items-start py-1 w-full min-w-0">
            <div className="w-full max-w-4xl px-1 min-w-0">
              <MarkdownRenderer content={partialContent} />
            </div>
          </div>
        )}

        {/* Loading indicator while waiting for first chunk */}
        {isStreaming && !partialContent && (
          <div className="flex justify-start py-1">
            <TypingIndicator />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Scroll to bottom button - appears when user has scrolled up (fixed above chat input) */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-40 right-4 z-50 p-2 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          title="Gulir ke bawah"
          aria-label="Gulir ke bawah"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
}