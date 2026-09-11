import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-2">
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-150"></div>
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-300"></div>
    </div>
  );
}
