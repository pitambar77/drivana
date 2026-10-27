import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { Textarea, Field } from './Field';
import { cn } from '../../utils/format';

export function Modal({ open, onClose, title, description, children, footer, size = 'md', side }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          'flex w-full flex-col bg-white shadow-pop',
          side ? 'absolute bottom-0 right-0 top-0 max-w-xl animate-slide-in' : cn('relative max-h-[92vh]', width, 'animate-fade-up rounded-t-2xl sm:m-4 sm:rounded-2xl'),
        )}
        style={side ? { paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : undefined}
      >
        <div className="flex items-start justify-between gap-4 border-b border-mist-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-mist-600">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-icon -mr-2 -mt-1" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-mist-200 bg-mist-50 px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Confirmation step built into the page (native confirm() is not used).
 * withReason → shows a required textarea, passed to onConfirm(reason).
 */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', tone = 'primary', withReason, reasonLabel = 'Reason', reasonRequired = true }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => {
    if (open) {
      setReason('');
      setErr('');
    }
  }, [open]);
  const submit = () => {
    if (withReason && reasonRequired && reason.trim().length < 5) {
      setErr('Add a short reason (at least 5 characters). It is saved to the audit trail.');
      return;
    }
    onConfirm(reason.trim());
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={submit}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {tone === 'danger' && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bad-50 text-bad-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-sm text-mist-700">{message}</p>
          {withReason && (
            <Field label={reasonLabel} error={err} htmlFor="confirm-reason" required={reasonRequired}>
              <Textarea id="confirm-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} error={err} placeholder="Visible to other admins in the audit trail" />
            </Field>
          )}
        </div>
      </div>
    </Modal>
  );
}
