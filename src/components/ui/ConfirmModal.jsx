import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Modal from './Modal';

/**
 * Confirmation dialog rendered by ConfirmModalProvider.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onConfirm
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.confirmLabel='Konfirmasi']
 * @param {string} [props.cancelLabel='Batal']
 * @param {boolean} [props.danger=false] - red confirm button for destructive actions
 * @param {boolean} [props.loading=false]
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  danger = false,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              danger ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-tight text-on-surface">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-on-surface-variant/90 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 px-6 pb-6">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            danger
              ? 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
              : 'bg-gradient-pro hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Memproses...
            </span>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </Modal>
  );
}
