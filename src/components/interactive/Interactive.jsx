// Interactive building blocks shared across both visual styles.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, GitCompareArrows, Hand, X } from 'lucide-react';
import { CarArt, CarImage } from '../vehicle/CarArt';
import { useStore } from '../../store/AppStore';
import { COLORS } from '../../data/catalog';
import { cn, num } from '../../utils/format';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches;

/** 3D tilt + cursor spotlight. Spread the returned props on a `relative` element with the `tilt` class. */
export function useTilt(max = 7) {
  const ref = useRef(null);
  const onPointerMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el || reduced() || !finePointer()) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`);
      el.style.setProperty('--rx', `${(0.5 - y) * max * 2}deg`);
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
      el.classList.add('is-tilting');
    },
    [max],
  );
  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.classList.remove('is-tilting');
  }, []);
  return { ref, onPointerMove, onPointerLeave };
}

/** Sets data-shown once the element scrolls into view. Content stays readable before that. */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || typeof IntersectionObserver === 'undefined') return undefined;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) return undefined; // already on screen: leave it alone
    setShown(false);
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setTimeout(() => setShown(true), delay);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <Tag ref={ref} className={cn('reveal', className)} data-shown={shown}>
      {children}
    </Tag>
  );
}

/** Counts up to `value` the first time it becomes visible. */
export function CountUp({ value, format = num, duration = 1100, className }) {
  const ref = useRef(null);
  const [v, setV] = useState(reduced() ? value : 0);
  useEffect(() => {
    if (reduced()) {
      setV(value);
      return undefined;
    }
    let raf;
    let started = false;
    const run = () => {
      started = true;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        setV(value * (1 - (1 - p) ** 3));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setV(value);
      return undefined;
    }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !started) run();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return (
    <span ref={ref} className={cn('num', className)}>
      {format(Math.round(v))}
    </span>
  );
}

export function ColorSwatches({ value, onChange, size = 'md', label = 'Preview colour' }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-2">
      {COLORS.map((c) => (
        <button
          key={c.name}
          type="button"
          role="radio"
          aria-checked={value === c.hex}
          aria-label={c.name}
          title={c.name}
          onClick={() => onChange(c.hex, c.name)}
          className={cn('rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110', size === 'sm' ? 'h-5 w-5' : 'h-7 w-7', value === c.hex ? 'scale-110 ring-accent-500 ring-offset-transparent' : 'ring-transparent ring-offset-transparent')}
          style={{ background: `linear-gradient(135deg, ${c.hex} 40%, rgba(0,0,0,.35))`, boxShadow: '0 0 0 1px rgba(127,127,127,.35) inset' }}
        />
      ))}
    </div>
  );
}

/**
 * Drag-to-turn viewer. Horizontal drag (or arrow keys / buttons) rotates the car on a turntable.
 * The illustration is 2D, so rotation is shown as a foreshortened turn with a lighting change.
 */
export function Turntable({ vehicle, className, autoSpin = false, showHint = true }) {
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const start = useRef(null);
  useEffect(() => {
    if (!autoSpin || touched || reduced()) return undefined;
    let raf;
    let last = performance.now();
    const tick = (t) => {
      setAngle((a) => (a + (t - last) * 0.03) % 360);
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoSpin, touched]);

  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const scale = Math.max(0.28, Math.abs(cos));
  const flipped = cos < 0;
  const nudge = (d) => {
    setTouched(true);
    setAngle((a) => (a + d + 360) % 360);
  };

  return (
    <div
      className={cn('relative select-none overflow-hidden', dragging ? 'cursor-grabbing' : 'cursor-grab', className)}
      onPointerDown={(e) => {
        setTouched(true);
        setDragging(true);
        start.current = { x: e.clientX, a: angle };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging || !start.current) return;
        setAngle((((start.current.a + (e.clientX - start.current.x) * 0.6) % 360) + 360) % 360);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') nudge(-15);
        if (e.key === 'ArrowRight') nudge(15);
      }}
      tabIndex={0}
      role="slider"
      aria-label="Rotate the car"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(angle)}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="studio absolute inset-0" />
      <div className="relative h-full w-full" style={{ transform: `scaleX(${flipped ? -scale : scale})`, transition: dragging || autoSpin ? 'none' : 'transform .3s ease' }}>
        <CarArt vehicle={vehicle} view={flipped ? 'rear' : 'side'} className="h-full w-full" bare />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
        {showHint && !touched && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-950/75 px-3 py-1 text-[12px] font-semibold text-white">
            <Hand className="h-3.5 w-3.5" /> Drag to turn
          </span>
        )}
      </div>
      <button type="button" onClick={() => nudge(-30)} className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-card" aria-label="Turn left">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => nudge(30)} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-card" aria-label="Turn right">
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="absolute right-3 top-3 rounded-md bg-ink-950/70 px-2 py-0.5 font-mono text-[11px] text-white num">{Math.round(angle)}°</span>
    </div>
  );
}

/** Floating tray that follows the buyer around the public site while cars are selected for comparison. */
export function CompareTray() {
  const { state, vehicle, toggleCompare } = useStore();
  const loc = useLocation();
  const cars = state.compare.map(vehicle).filter(Boolean);
  if (!cars.length || loc.pathname === '/compare') return null;
  return (
    <div className="compare-tray-pos pointer-events-none fixed inset-x-0 z-[55] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[calc(100vw-200px)] animate-fade-up items-center gap-3 rounded-2xl border border-mist-200 bg-white/95 p-2 pl-3 shadow-pop backdrop-blur max-sm:max-w-[calc(100vw-32px)]">
        <GitCompareArrows className="hidden h-4 w-4 shrink-0 text-accent-600 sm:block" />
        <div className="flex -space-x-2">
          {cars.map((v) => (
            <div key={v.id} className="group relative">
              <CarImage vehicle={v} view="side" className="h-9 w-14 rounded-lg ring-2 ring-white" />
              <button type="button" onClick={() => toggleCompare(v.id)} className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-ink-900 text-white group-hover:flex" aria-label={`Remove ${v.model}`}>
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <span className="whitespace-nowrap text-[13px] font-semibold text-ink-800 num">{cars.length}/3</span>
        <Link to="/compare" className="btn btn-sm btn-primary">
          Compare
        </Link>
      </div>
    </div>
  );
}

/** Short celebratory burst drawn on a canvas; respects reduced motion. */
export function Confetti({ fire = true }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!fire || reduced()) return undefined;
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!ctx) return undefined;
    const W = (c.width = c.offsetWidth * devicePixelRatio);
    const H = (c.height = c.offsetHeight * devicePixelRatio);
    const colors = ['#E8201C', '#F8D000', '#13282D', '#FF6560', '#FFE15C', '#FFFFFF'];
    const parts = Array.from({ length: 140 }, () => ({
      x: W / 2,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 18 * devicePixelRatio,
      vy: (-Math.random() * 14 - 4) * devicePixelRatio,
      s: (Math.random() * 6 + 4) * devicePixelRatio,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.45 * devicePixelRatio;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (t - t0 < 2600) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[96] h-full w-full" aria-hidden="true" />;
}

/** Hero car with colour picker: the eye-catching opener on the home page. */
export function HeroShowcase() {
  const [color, setColor] = useState({ hex: '#2C5AA3', name: 'Ocean Blue' });
  const [body, setBody] = useState('SUV');
  return (
    <div className="relative">
      <div className="float-y">
        <Turntable vehicle={{ bodyType: body, colorHex: color.hex, mileage: 12000 }} className="aspect-[16/10] w-full rounded-2xl" autoSpin showHint />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ColorSwatches value={color.hex} onChange={(hex, name) => setColor({ hex, name })} size="sm" />
        <div className="inline-flex rounded-full bg-white/10 p-0.5">
          {['Hatchback', 'Sedan', 'SUV', 'MUV'].map((b) => (
            <button key={b} type="button" onClick={() => setBody(b)} className={cn('rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors', body === b ? 'bg-accent-600 text-white' : 'text-ink-200 hover:text-white')} aria-pressed={body === b}>
              {b}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[12px] text-ink-300">
        {color.name} {body} · drag the car to turn it
      </p>
    </div>
  );
}
