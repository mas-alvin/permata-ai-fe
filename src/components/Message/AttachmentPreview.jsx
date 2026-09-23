import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Renders a single attached file as a compact chip. Image attachments
 * render as thumbnails; other files render as an icon + name chip.
 *
 * Props:
 * - attachment: { filename, url, mime_type, size }
 * - onRemove: () => void  (optional — shows the × button)
 */
function formatSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${Math.round(value * 10) / 10} ${units[unitIndex]}`;
}

export default function AttachmentPreview({ attachment, onRemove }) {
  const { filename, url, mime_type: mimeType, size } = attachment;
  const isImage = mimeType?.startsWith('image/');

  if (isImage) {
    return (
      <div className="relative group/attach shrink-0">
        <img
          src={url}
          alt={filename}
          className="w-20 h-20 object-cover rounded-xl border border-on-surface/10"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-on-surface text-white flex items-center justify-center shadow-md opacity-0 group-hover/attach:opacity-100 transition-opacity"
            aria-label="Hapus lampiran"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-on-surface/10 max-w-[16rem]">
      <PaperClipIcon className="w-4 h-4 text-on-surface-variant shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-on-surface truncate">{filename}</p>
        {size ? <p className="text-[10px] text-on-surface-variant/70">{formatSize(size)}</p> : null}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-semibold text-primary hover:underline shrink-0"
        >
          Buka
        </a>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-red-600 transition-colors shrink-0"
          aria-label="Hapus lampiran"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
