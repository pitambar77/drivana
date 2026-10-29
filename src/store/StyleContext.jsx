// Light / dark mode.
// Every visitor starts in DEFAULT_THEME. Clicking the sun/moon button switches mode,
// and that choice is remembered on their browser.
// Sets <html data-theme="light|dark">; theme.css restyles the app from there.
import { createContext, useContext, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../utils/format';

const KEY = 'autodealer-theme';

/** Change to 'dark' to open the site in dark mode by default. */
export const DEFAULT_THEME = 'light';
const Ctx = createContext({ theme: 'light', setTheme: () => {}, toggle: () => {} });

function stored() {
  try {
    const s = localStorage.getItem(KEY);
    if (s === 'light' || s === 'dark') return s;
  } catch {
    /* storage unavailable */
  }
  return null;
}

export function ThemeProvider({ children }) {
  const [choice, setChoice] = useState(stored);
  const theme = choice || DEFAULT_THEME;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = (t) => {
    setChoice(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  };
  return <Ctx.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

/** Sun / moon switch used in the navbar, dashboard header and sign-in pages. */
export function ThemeToggle({ className, onDark, compact }) {
  const { theme, setTheme, toggle } = useTheme();
  if (compact) {
    const next = theme === 'dark' ? 'light' : 'dark';
    const Icon = next === 'dark' ? Moon : Sun;
    return (
      <button type="button" onClick={toggle} className={cn('btn-icon theme-toggle-btn', className)} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
        <Icon className={cn('h-[18px] w-[18px]', next === 'light' ? 'text-sun-400' : 'text-ink-700')} strokeWidth={2.2} />
      </button>
    );
  }
  const opts = [
    { value: 'light', label: 'Light mode', icon: Sun },
    { value: 'dark', label: 'Dark mode', icon: Moon },
  ];
  return (
    <div role="radiogroup" aria-label="Colour mode" className={cn('theme-toggle inline-flex h-9 shrink-0 items-center gap-0.5 rounded-full p-1', onDark ? 'bg-white/10 text-ink-200' : 'bg-mist-100 text-mist-600', className)}>
      {opts.map((o) => {
        const on = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.label}
            title={o.label}
            onClick={() => setTheme(o.value)}
            className={cn('flex h-7 w-7 items-center justify-center rounded-full transition-all', on ? (o.value === 'dark' ? 'bg-ink-900 text-sun-400 shadow-card' : 'bg-white text-accent-600 shadow-card') : 'hover:text-ink-900')}
          >
            <o.icon className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        );
      })}
    </div>
  );
}

// Back-compat names used across the app
export const StyleProvider = ThemeProvider;
export const StyleToggle = ThemeToggle;
export const useStyle = () => {
  const t = useTheme();
  return { style: t.theme, setStyle: t.setTheme };
};
