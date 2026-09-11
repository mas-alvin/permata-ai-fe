import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  
  const bubbleClass = isUser
    ? 'bg-primary text-on-primary self-end'
    : 'bg-surface-variant text-on-surface-variant self-start';

  const content = message.content || '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-md p-3 max-w-md ${bubbleClass}`}
           style={{ whiteSpace: 'pre-wrap' }}
      >
        {isUser ? (
          <span className="text-sm">{content}</span>
        ) : content ? (
          <div className="text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex gap-1 items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        )}
      </div>
    </div>
  );
}
