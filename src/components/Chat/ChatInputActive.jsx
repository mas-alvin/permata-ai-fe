import React, { useState, useRef, useEffect } from 'react';

const models = [
  { id: 'permata-pro', label: 'Permata Pro', icon: 'psychology' },
];

export default function ChatInputActive({ onSend, disabled = false }) {
  const [input, setInput] = useState('');
  const [textareaHeight, setTextareaHeight] = useState(48);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const height = Math.min(textarea.scrollHeight, 160);
      setTextareaHeight(height);
      textarea.style.height = `${height}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      setTextareaHeight(48);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-on-surface/10">
      <div className="max-w-3xl mx-auto">
        {/* Input Box — same style as MainContent/ChatInput.jsx */}
        <div className="w-full bg-white rounded-3xl border border-on-surface/10 shadow-lg shadow-on-surface/5 overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
          <div className="p-4 flex flex-col gap-3">
            <div style={{ minHeight: `${textareaHeight}px` }} className="relative">
              <textarea
                ref={textareaRef}
                className="w-full h-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md placeholder:text-on-surface-variant/50 p-0 resize-none overflow-y-auto"
                placeholder="Ask Permata anything..."
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-on-surface/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-xl transition-colors"
                  aria-label="Attach"
                >
                  <span className="material-symbols-outlined text-[22px]">attach_file</span>
                </button>
                <span className="text-on-surface text-sm font-medium select-none">
                  {selectedModel.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-xl transition-colors"
                  aria-label="Voice"
                >
                  <span className="material-symbols-outlined text-[22px]">mic</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={disabled || !input.trim()}
                  className="bg-gradient-pro text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-3 text-center max-w-xl mx-auto">
          Permata AI generates AI-based answers. Review key details for accuracy.{' '}
          <a className="underline hover:text-on-surface transition-colors" href="#">
            Cookie Preferences
          </a>
          .
        </p>
      </div>
    </div>
  );
}
