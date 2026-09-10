<?jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const bubbleClass = isUser
    ? 'bg-primary-500 text-on-primary self-end'
    : 'bg-surface-variant text-on-surface-variant self-start';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-xl p-3 max-w-md ${bubbleClass}`}
           style={{ whiteSpace: 'pre-wrap' }}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        )}
      </div>
    </div>>
  );
}
