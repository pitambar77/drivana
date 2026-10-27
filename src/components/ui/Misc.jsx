import { useEffect, useRef, useState } from 'react';
import { Calendar, Copy, Search, TrendingDown, TrendingUp, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn, initials, prettyReg } from '../../utils/format';

export function PageHeader({ title, description, actions, eyebrow, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-[26px] font-bold leading-tight md:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[14.5px] text-mist-600">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Section({ title, description, actions, children, className, bodyClass }) {
  return (
    <section className={cn('card min-w-0', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-mist-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold" style={{ fontStretch: '105%' }}>
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[13px] text-mist-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(bodyClass ?? 'p-5')}>{children}</div>
    </section>
  );
}

export function KpiCard({ label, value, sub, icon: Icon, trend, tone = 'default' }) {
  const toneCls = { default: 'bg-accent-50 text-accent-600', green: 'bg-ok-50 text-ok-600', amber: 'bg-warn-50 text-warn-600', red: 'bg-bad-50 text-bad-600', dark: 'bg-ink-900 text-white' }[tone];
  return (
    <div className="card flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-mist-600">{label}</p>
        {Icon && (
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', toneCls)}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-[26px] font-bold leading-none text-ink-900 num" style={{ fontStretch: '108%' }}>
          {value}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px]">
          {trend != null && (
            <span className={cn('inline-flex items-center gap-0.5 font-semibold', trend >= 0 ? 'text-ok-600' : 'text-bad-600')}>
              {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="truncate text-mist-500">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search', className }) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input pl-9 pr-8" aria-label={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-mist-400 hover:text-ink-900" aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: 0 },
];
const iso = (d) => d.toISOString().slice(0, 10);
export function presetRange(days) {
  if (!days) return { from: '', to: '' };
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: iso(from), to: iso(to) };
}
export function inRange(dateStr, { from, to }) {
  const t = new Date(dateStr).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime() + 864e5 - 1) return false;
  return true;
}

export function DateRangeFilter({ value, onChange, className }) {
  const active = PRESETS.find((p) => {
    const r = presetRange(p.days);
    return r.from === value.from && r.to === value.to;
  });
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="inline-flex rounded-lg bg-mist-100 p-0.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(presetRange(p.days))}
            className={cn('rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold', active?.label === p.label ? 'bg-white text-ink-900 shadow-card' : 'text-mist-600 hover:text-ink-900')}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-mist-400" />
        <input type="date" aria-label="From date" className="input h-9 w-[140px] px-2 text-[13px]" value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} />
        <span className="text-mist-400">–</span>
        <input type="date" aria-label="To date" className="input h-9 w-[140px] px-2 text-[13px]" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} />
      </div>
    </div>
  );
}

/** Indian registration plate, the identifier buyers check on VAHAN. */
export function Plate({ value, size = 'md' }) {
  if (!value) return <span className="text-[13px] text-mist-500">Not registered yet</span>;
  return (
    <span className={cn('inline-flex items-stretch overflow-hidden rounded-[5px] border-[1.5px] border-ink-900 bg-white font-mono font-semibold tracking-wider text-ink-950', size === 'sm' ? 'text-[11px]' : 'text-[13px]')}>
      <span className="flex flex-col items-center justify-center bg-[#1D3E9E] px-1 text-[7px] leading-none text-white">
        <span className="mb-px h-1.5 w-1.5 rounded-full border border-amber-300" />
        IND
      </span>
      <span className={cn(size === 'sm' ? 'px-1.5 py-px' : 'px-2 py-0.5')}>{prettyReg(value)}</span>
    </span>
  );
}

export function Avatar({ name, size = 36, tone = 'ink' }) {
  const bg = { ink: 'bg-ink-800 text-white', accent: 'bg-accent-100 text-accent-700', mist: 'bg-mist-200 text-ink-800' }[tone];
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold', bg)} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}

export function CopyText({ text, className }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      setDone(false);
    }
  };
  return (
    <button type="button" onClick={copy} className={cn('inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-700 hover:underline', className)}>
      <Copy className="h-3.5 w-3.5" /> {done ? 'Copied' : 'Copy'}
    </button>
  );
}

/** CSV export: attempts a file download and also shows the data, since sandboxed previews can block downloads. */
export function CsvModal({ open, onClose, filename, csv }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [open]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
    } catch {
      ref.current?.select();
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Export ${filename}`}
      description="Your download has started. If your browser blocked it, copy the CSV below into Excel or Google Sheets."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button icon={Copy} onClick={copy}>
            {copied ? 'Copied to clipboard' : 'Copy CSV'}
          </Button>
        </>
      }
    >
      <textarea ref={ref} readOnly value={csv} rows={12} className="input font-mono text-[12px]" onFocus={(e) => e.target.select()} />
      <p className="mt-2 text-xs text-mist-500 num">{csv.split('\n').length - 1} rows</p>
    </Modal>
  );
}

export function DL({ items, cols = 2, className }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-3.5', cols === 3 ? 'grid-cols-2 md:grid-cols-3' : cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2', className)}>
      {items.filter(Boolean).map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[12px] font-medium text-mist-500">{k}</dt>
          <dd className="mt-0.5 break-words text-sm font-semibold text-ink-900">{v ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
