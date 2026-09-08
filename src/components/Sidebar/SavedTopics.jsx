const savedTopics = [
  { title: 'Give me unique name logo for...', edited: 'Edited 2m ago' },
  { title: 'Create a logo for a tech startup', edited: 'Edited Oct 2, 2:05 PM' },
]

export default function SavedTopics() {
  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-secondary">star</span>
          <span>Saved topics</span>
        </div>
        <button className="text-on-surface-variant/60 hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[15px]">more_vert</span>
        </button>
      </div>
      <div className="space-y-0.5">
        {savedTopics.map((topic) => (
          <div
            key={topic.title}
            className="p-2 rounded-xl hover:bg-surface-container-low cursor-pointer flex justify-between items-center group transition-all"
          >
            <div className="overflow-hidden pr-2 flex-1">
              <p className="font-medium text-on-surface text-xs truncate group-hover:text-primary transition-colors">
                {topic.title}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{topic.edited}</p>
            </div>
            <span
              className="material-symbols-outlined text-secondary-container text-[16px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
