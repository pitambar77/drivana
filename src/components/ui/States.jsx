import { AlertCircle, AlertTriangle, CheckCircle2, FlaskConical, Info, SearchX } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/format';

export function Skeleton({ className }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-mist-100', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title, message, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-mist-300 bg-white px-6 py-12 text-center', className)}>
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mist-100 text-mist-500">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-base font-bold">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-mist-600">{message}</p>}
      {action && <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      message={message}
      action={onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
      className="border-bad-100 bg-bad-50/40"
    />
  );
}

const ALERT = {
  info: ['bg-info-50 border-info-100 text-info-700', Info],
  success: ['bg-ok-50 border-ok-100 text-ok-700', CheckCircle2],
  warn: ['bg-warn-50 border-warn-100 text-warn-700', AlertTriangle],
  error: ['bg-bad-50 border-bad-100 text-bad-700', AlertCircle],
};

export function Alert({ tone = 'info', title, children, className, action, icon }) {
  const [cls, DefaultIcon] = ALERT[tone];
  const Icon = icon || DefaultIcon;
  return (
    <div className={cn('flex gap-3 rounded-xl border p-3.5 text-sm', cls, className)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-[13.5px] leading-relaxed opacity-90">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

/** Labels every simulated operation so nobody mistakes the demo for a live integration. */
export function MockNotice({ children, className }) {
  return (
    <div className={cn('mock-notice flex items-start gap-2 rounded-lg border border-dashed border-sun-300 bg-sun-50 px-3 py-2 text-[12.5px] text-ink-800', className)}>
      <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun-700" />
      <span>
        <strong className="font-semibold">Demo mode.</strong> {children}
      </span>
    </div>
  );
}
