import { useState, useRef, useEffect } from 'react'
import QuickActions from './QuickActions'

const models = [
  { id: 'permata-pro', label: 'Permata Pro', icon: 'psychology' },
  { id: 'create-image', label: 'Create Image', icon: 'image' },
  { id: 'canvas', label: 'Canvas', icon: 'draw' },
]

export default function ChatInput() {
  const [message, setMessage] = useState('')
  const [textareaHeight, setTextareaHeight] = useState(48)
  const [selectedModel, setSelectedModel] = useState(models[0])
  const textareaRef = useRef(null)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const height = Math.min(textarea.scrollHeight, 160)
      setTextareaHeight(height)
      textarea.style.height = `${height}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [message])

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <QuickActions />

      {/* Input Box */}
      <div className="w-full bg-white rounded-3xl border border-on-surface/10 shadow-lg shadow-on-surface/5 overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
        <div className="bg-primary/5 px-5 py-2.5 flex items-center justify-between border-b border-on-surface/5">
          <div className="flex items-center gap-2 text-xs font-medium text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-primary animate-pulse">
              timer
            </span>
            Free Trial ending soon continue your workflow
          </div>
          <button className="text-xs font-semibold text-primary hover:text-primary-fixed-variant transition-colors">
            Upgrade Now
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div style={{ height: `${textareaHeight}px` }} className="relative">
            <textarea
              ref={textareaRef}
              className="w-full h-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md placeholder:text-on-surface-variant/50 p-0 resize-none overflow-y-auto"
              placeholder="Ask Permata anything..."
              rows="1"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
              }}
            ></textarea>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-on-surface/5">
            <div className="flex items-center gap-2">
              <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-xl transition-colors" aria-label="Attach">
                <span className="material-symbols-outlined text-[22px]">attach_file</span>
              </button>
              <select
                value={selectedModel.id}
                onChange={(e) => setSelectedModel(models.find(m => m.id === e.target.value))}
                className="bg-transparent border-none text-on-surface text-sm font-medium focus:ring-0 focus:ring-offset-0 min-w-[140px] cursor-pointer"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-xl transition-colors" aria-label="Voice">
                <span className="material-symbols-outlined text-[22px]">mic</span>
              </button>
              <button className="bg-gradient-pro text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-md" aria-label="Send">
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-on-surface-variant mt-4 text-center max-w-xl mx-auto">
        Permata AI generates AI-based answers. Review key details for accuracy.{' '}
        <a className="underline hover:text-on-surface transition-colors" href="#">
          Cookie Preferences
        </a>
        .
      </p>
    </div>
  )
}