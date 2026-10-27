import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, XCircle, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/format';

const Ctx = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const dismiss = (id) => setItems((s) => s.filter((t) => t.id !== id));
  const toast = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s.slice(-3), { id, message, tone: opts.tone || 'success', title: opts.title }]);
    setTimeout(() => dismiss(id), opts.duration || 4200);
  }, []);
  const icons = { success: CheckCircle2, error: XCircle, info: Info, warn: AlertTriangle };
  const tones = { success: 'text-ok-600', error: 'text-bad-600', info: 'text-accent-600', warn: 'text-warn-600' };
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed z-[90] flex w-full flex-col items-center gap-2 sm:items-end"
        style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', right: 'max(16px, env(safe-area-inset-right, 0px))', left: 'auto', maxWidth: 380 }}
        aria-live="polite"
      >
        {items.map((t) => {
          const Icon = icons[t.tone];
          return (
            <div key={t.id} className="pointer-events-auto flex w-[calc(100vw-32px)] max-w-[380px] animate-fade-up items-start gap-3 rounded-xl border border-mist-200 bg-white p-3.5 shadow-pop">
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', tones[t.tone])} />
              <div className="min-w-0 flex-1 text-sm">
                {t.title && <p className="font-semibold text-ink-900">{t.title}</p>}
                <p className="text-mist-700">{t.message}</p>
              </div>
              <button type="button" onClick={() => dismiss(t.id)} className="text-mist-400 hover:text-ink-900" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
