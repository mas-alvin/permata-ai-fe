import { useState } from 'react'
import QuickActions from './QuickActions'

export default function ChatInput() {
  const [message, setMessage] = useState('')

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-16 flex flex-col items-center">
      <QuickActions />

      {/* Input Box */}
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-on-surface/10 shadow-lg shadow-on-surface/5 overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
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
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md placeholder:text-on-surface-variant/50 p-0 resize-none max-h-32"
            placeholder="Ask Permata anything..."
            rows="1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className="flex items-center justify-between pt-2 border-t border-on-surface/5">
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[18px]">attach_file</span> Attach
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-fixed-variant px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-[18px]">psychology</span> Deep
                Think
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[18px]">mic</span> Voice
              </button>
              <button className="bg-gradient-pro text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md">
                <span className="material-symbols-outlined text-[18px]">send</span> Send
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
