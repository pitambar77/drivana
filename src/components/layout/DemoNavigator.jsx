import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, RotateCcw, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { DEMO_USER_IDS } from '../../data/seed';
import { SCREENS } from '../../routes/nav';
import { ROLE_META } from '../../config/site';
import { cn } from '../../utils/format';

/** Floating reviewer tool: switch demo personas and jump to any of the 42 screens. */
export default function DemoNavigator() {
  const { role, login, logout, reset } = useStore();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => setConfirmReset(false), [open]);

  const go = (path, needs) => {
    if (needs && role !== needs) login(DEMO_USER_IDS[needs]);
    if (!needs && ['/register', '/signin', '/verify-otp', '/admin/login', '/admin/invite', '/buyer/welcome'].some((p) => path.startsWith(p)) && role) logout();
    nav(path);
    setOpen(false);
  };
  const here = loc.pathname + loc.search;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-[60] flex items-center gap-2 rounded-full bg-ink-900 py-2.5 pl-3 pr-4 text-[13px] font-semibold text-white shadow-pop hover:bg-ink-800"
        style={{ left: 'max(16px, env(safe-area-inset-left, 0px))', bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Open screen navigator"
      >
        <Compass className="h-4 w-4 text-accent-300" />
        All screens
      </button>
      {open && (
        <div className="fixed inset-0 z-[85]">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[360px] max-w-[92vw] animate-fade-up flex-col bg-white shadow-pop" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="flex items-center justify-between border-b border-mist-200 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-ink-900">Screen navigator</p>
                <p className="text-xs text-mist-500">Opens each screen with the right demo persona</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="btn-icon" aria-label="Close navigator">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-mist-200 px-4 py-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-mist-500">Signed in as</p>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => logout()} className={cn('rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset', !role ? 'bg-ink-900 text-white ring-ink-900' : 'text-mist-700 ring-mist-200 hover:bg-mist-50')}>
                  Guest
                </button>
                {Object.keys(DEMO_USER_IDS).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      login(DEMO_USER_IDS[r]);
                      nav(ROLE_META[r].home);
                      setOpen(false);
                    }}
                    className={cn('rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset', role === r ? 'bg-ink-900 text-white ring-ink-900' : 'text-mist-700 ring-mist-200 hover:bg-mist-50')}
                  >
                    {ROLE_META[r].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {SCREENS.map(([group, list]) => (
                <div key={group} className="mb-2">
                  <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-mist-500">{group}</p>
                  {list.map(([n, label, path, needs]) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => go(path, needs)}
                      className={cn('flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[13.5px] hover:bg-mist-100', here === path && 'bg-accent-50 text-accent-800')}
                    >
                      <span className="w-6 shrink-0 text-right font-mono text-[11px] text-mist-400 num">{n}</span>
                      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
                      {needs && <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-mist-400">{ROLE_META[needs].label.split(' ')[0]}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-mist-200 px-4 py-3">
              {confirmReset ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] text-mist-700">Erase your changes and reload sample data?</span>
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      nav('/');
                      setOpen(false);
                    }}
                    className="btn btn-sm btn-danger"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmReset(true)} className="flex items-center gap-2 text-[13px] font-semibold text-mist-600 hover:text-ink-900">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
