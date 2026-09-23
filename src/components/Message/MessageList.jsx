import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages, onEdit, onRegenerate, onDelete, isStreaming, partialContent }) {
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

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 custom-scrollbar"
      onScroll={handleScroll}
    >
      <div className="max-w-4xl mx-auto space-y-2">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id ?? idx}
            message={msg}
            isLast={idx === messages.length - 1}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
          />
        ))}

        {/* Streaming AI response — same styling as final messages */}
        {isStreaming && partialContent && (
          <div className="flex flex-col items-start py-1">
            <div className="max-w-4xl px-1">
              <div className="prose prose-sm max-w-none text-on-surface">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{partialContent}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Loading dots while waiting for first chunk */}
        {isStreaming && !partialContent && (
          <div className="flex justify-start py-1">
            <div className="flex gap-1.5 items-center px-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
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