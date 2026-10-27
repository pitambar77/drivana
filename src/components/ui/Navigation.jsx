import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/format';

export function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex min-w-0 items-center gap-1 text-[13px] text-mist-500', className)}>
      <Link to="/" className="shrink-0 hover:text-ink-900" aria-label="Home">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((it, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-mist-300" />
          {it.to && i < items.length - 1 ? (
            <Link to={it.to} className="truncate hover:text-ink-900">
              {it.label}
            </Link>
          ) : (
            <span className="truncate font-medium text-ink-800">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="flex min-w-max gap-1 border-b border-mist-200" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={value === t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors',
              value === t.value ? 'border-accent-600 text-accent-700' : 'border-transparent text-mist-600 hover:text-ink-900',
            )}
          >
            {t.label}
            {t.count != null && (
              <span className={cn('rounded-full px-1.5 py-px text-[11px] num', value === t.value ? 'bg-accent-100 text-accent-700' : 'bg-mist-100 text-mist-600')}>{t.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Segmented({ options, value, onChange, className }) {
  return (
    <div className={cn('inline-flex rounded-lg bg-mist-100 p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn('rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors', value === o.value ? 'bg-white text-ink-900 shadow-card' : 'text-mist-600 hover:text-ink-900')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Responsive pagination: page numbers on ≥sm, compact "Page x of y" on phones. */
export function Pagination({ page, pages, onChange, total, pageSize, className }) {
  if (pages <= 1) return total != null ? <p className={cn('text-[13px] text-mist-500', className)}>{total} result{total === 1 ? '' : 's'}</p> : null;
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      {total != null && (
        <p className="text-[13px] text-mist-500 num">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </p>
      )}
      <div className="flex items-center gap-1">
        <button type="button" className="btn btn-sm btn-secondary px-2" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2 text-[13px] font-medium text-mist-600 sm:hidden num">
          Page {page} of {pages}
        </span>
        <div className="hidden items-center gap-1 sm:flex">
          {nums.map((n, i) =>
            n === '…' ? (
              <span key={`e${i}`} className="px-1 text-mist-400">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={cn('btn btn-sm min-w-8 px-2 num', n === page ? 'btn-dark' : 'btn-ghost')}
                aria-current={n === page ? 'page' : undefined}
              >
                {n}
              </button>
            ),
          )}
        </div>
        <button type="button" className="btn btn-sm btn-secondary px-2" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Stepper({ steps, current, onStepClick }) {
  return (
    <ol className="flex w-full items-center gap-1 overflow-x-auto pb-1">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!done}
              onClick={() => done && onStepClick?.(i)}
              className={cn('flex min-w-0 items-center gap-2 text-left', done && 'cursor-pointer')}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold num',
                  active ? 'bg-accent-600 text-white' : done ? 'bg-ink-900 text-white' : 'bg-mist-100 text-mist-500',
                )}
              >
                {i + 1}
              </span>
              <span className={cn('hidden truncate text-[13px] font-semibold lg:block', active ? 'text-ink-900' : 'text-mist-500')}>{s}</span>
            </button>
            {i < steps.length - 1 && <span className={cn('h-0.5 min-w-3 flex-1 rounded', done ? 'bg-ink-900' : 'bg-mist-200')} />}
          </li>
        );
      })}
    </ol>
  );
}
