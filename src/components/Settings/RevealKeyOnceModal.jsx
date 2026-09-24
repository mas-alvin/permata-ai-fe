import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearRevealedKey } from '../../store/slices/apiKeySlice';
import {
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Shows the plaintext API key exactly once. When the modal closes the
 * plaintext is purged from Redux state (clearRevealedKey) — there is no
 * way to view it again (ai-rul.md §3.5).
 */
export default function RevealKeyOnceModal({ onClose }) {
  const dispatch = useAppDispatch();
  const revealed = useAppSelector((state) => state.apiKey.revealedKey);
  const [copied, setCopied] = useState(false);

  const plainKey = typeof revealed === 'string' ? revealed : revealed?.api_key;

  useEffect(() => {
    if (!plainKey) {
      onClose();
    }
  }, [plainKey, onClose]);

  const handleClose = () => {
    dispatch(clearRevealedKey());
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!plainKey) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-on-surface/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-on-surface/10 bg-amber-50">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-on-surface">API Key Anda</h3>
            <p className="text-xs text-on-surface-variant/80 mt-0.5">
              Key hanya ditampilkan satu kali. Simpan sekarang.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-amber-100 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
            aria-label="Tutup"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              API Key
            </label>
            <div className="flex items-stretch gap-2">
              <code className="flex-1 px-3 py-2.5 rounded-md bg-surface-container-low border border-on-surface/10 text-sm font-mono text-on-surface break-all">
                {plainKey}
              </code>
              <button
                onClick={handleCopy}
                className={`px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gradient-pro text-white hover:opacity-90'
                }`}
              >
                {copied ? (
                  <>
                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    <span>Disalin</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-100 text-red-700">
            <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              Demi keamanan, key ini <span className="font-semibold">tidak akan ditampilkan lagi</span> setelah Anda menutup jendela ini. Backend hanya menyimpan hash dari key.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-on-surface text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Saya sudah menyimpan key ini
          </button>
        </div>
      </div>
    </div>
  );
}
