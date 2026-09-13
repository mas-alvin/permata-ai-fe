import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages, onEdit, isStreaming, partialContent }) {
  const endRef = useRef(null);

  // Auto-scroll to bottom when streaming or new messages
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, partialContent, isStreaming]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-2">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} onEdit={onEdit} />
        ))}

        {/* Streaming AI response — no bubble, plain text */}
        {isStreaming && partialContent && (
          <div className="flex flex-col items-start py-1">
            <div className="max-w-4xl px-1">
              <div className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                {partialContent}
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
    </div>
  );
}
