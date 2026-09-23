import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal';

const ConfirmModalContext = createContext(null);

/**
 * Provider that renders a single <ConfirmModal /> and exposes a promise-based
 * `confirm()` to any descendant via the `useConfirmModal` hook.
 *
 * Usage:
 *   const { confirm } = useConfirmModal();
 *   const ok = await confirm({ title: 'Hapus?', message: '...', danger: true });
 *   if (ok) doDelete();
 */
export function ConfirmModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
      setOpen(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmModalContext.Provider value={value}>
      {children}
      <ConfirmModal
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options?.title ?? 'Konfirmasi'}
        message={options?.message ?? 'Apakah Anda yakin?'}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        danger={options?.danger}
        loading={options?.loading}
      />
    </ConfirmModalContext.Provider>
  );
}

export default ConfirmModalContext;
