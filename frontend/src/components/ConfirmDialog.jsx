import { useEffect, useRef, useState } from 'react';

// Modal "are you sure?" for destructive actions. onConfirm may be async; the
// dialog shows a busy state, closes itself on success, and shows the error
// (staying open) if it throws. Focus starts on Cancel so Enter can't delete.
export default function ConfirmDialog({
  title,
  children,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);
  const busyRef = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && !busyRef.current) closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  async function confirm() {
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message);
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-[#0E141B]/55"
        onClick={() => !busy && onClose()}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="relative flex w-full max-w-[440px] flex-col gap-4 rounded-xl border border-line-strong bg-surface p-6 shadow-md"
      >
        <h2
          id="confirm-title"
          className="font-serif text-[21px] font-semibold leading-7"
        >
          {title}
        </h2>
        <div id="confirm-body" className="text-[15px] leading-6 text-ink-2">
          {children}
        </div>
        {error && (
          <p role="alert" className="text-sm font-semibold text-danger-ink">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2.5">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="btn bg-danger text-primary-fg hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
