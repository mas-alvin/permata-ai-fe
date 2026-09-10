<?jsx
import React, { useState } from 'react';

export default function ChatInputActive({ onSend }) {
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSend} className="p-3 border-t border-surface-border flex gap-2">
      <input
        type="text"
        className="flex-1 bg-surface border border-surface-border rounded-lg px-4 py-2 text-on-surface"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit" className="bg-primary-500 text-on-primary px-4 py-2 rounded-lg">
        Send
      </button>
    </form>
  );
}
