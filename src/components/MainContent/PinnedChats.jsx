const pinnedFiles = [
  {
    title: 'Project Brief.gsheet',
    description: "Creative services don't just make thi...",
    date: 'Just now',
    icon: 'description',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    title: 'Design Notes.gdoc',
    description: "Creative services don't just make thi...",
    date: '11 September',
    icon: 'article',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'User Feedback.gform',
    description: "Creative services don't just make thi...",
    date: '12 September',
    icon: 'assignment',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
]

export default function PinnedChats() {
  return (
    <div className="w-full max-w-3xl mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[20px] text-primary">push_pin</span>
          Pinned Chats
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            expand_more
          </span>
        </div>
        <button className="text-sm font-medium text-primary hover:text-primary-fixed-variant transition-colors">
          See all
        </button>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {pinnedFiles.map((file) => (
          <div
            key={file.title}
            className="bg-white p-5 rounded-2xl border border-on-surface/10 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
          >
            <div
              className={`w-10 h-10 rounded-xl ${file.iconBg} ${file.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <span className="material-symbols-outlined text-[20px]">{file.icon}</span>
            </div>
            <h3 className="font-label-md text-on-surface font-semibold mb-1.5 truncate group-hover:text-primary transition-colors">
              {file.title}
            </h3>
            <p className="text-xs text-on-surface-variant truncate">{file.description}</p>
            <p className="text-[10px] text-on-surface-variant/70 mt-3 font-medium">{file.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
