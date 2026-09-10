<?jsx
import React from 'react';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} message={msg} />
      ))}
    </div>
  );
}
