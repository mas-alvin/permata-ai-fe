const quickActions = [
  { icon: 'edit', label: 'Help me write' },
  { icon: 'brush', label: 'Design Smart' },
  { icon: 'lightbulb', label: 'Learn about' },
  { icon: 'image_search', label: 'Analyze Image' },
]

export default function QuickActions() {
  return (
    <div className="flex gap-3 mb-5 overflow-x-auto w-full max-w-3xl pb-2 hide-scrollbar">
      {quickActions.map((action) => (
        <button
          key={action.label}
          className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-white border border-on-surface/10 text-xs font-medium text-on-surface hover:bg-surface-container-low hover:border-primary/30 transition-all flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">{action.icon}</span>{' '}
          {action.label}
        </button>
      ))}
    </div>
  )
}
