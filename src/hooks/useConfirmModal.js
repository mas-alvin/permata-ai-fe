import { useContext } from 'react';
import ConfirmModalContext from '../context/ConfirmModalProvider';

/**
 * Access the promise-based confirm modal from any component.
 *
 * @returns {{ confirm: (opts: object) => Promise<boolean> }}
 */
export function useConfirmModal() {
  const ctx = useContext(ConfirmModalContext);
  if (!ctx) {
    throw new Error('useConfirmModal must be used within a <ConfirmModalProvider>.');
  }
  return ctx;
}

export default useConfirmModal;
