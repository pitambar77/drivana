import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

export function Logo({ dark, className, to = '/' }) {
  return (
    <Link to={to} className={cn('flex shrink-0 items-center gap-2', className)} aria-label="Drivana home">
      {/* <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={dark ? '#FFFFFF' : '#0F1B2E'} />
        <path d="M8 22 L14.5 9.5 Q16 7 17.5 9.5 L24 22" fill="none" stroke={dark ? '#0F1B2E' : '#FFFFFF'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 14.5 V17 M16 20 V22.5" stroke="#5E84F3" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className={cn('font-display text-[21px] font-extrabold tracking-tight', dark ? 'text-white' : 'text-ink-900')} style={{ fontStretch: '118%' }}>
        drivana
      </span> */}
      <img src="/autodealer-logo.png" alt="Drivana Logo" className="h-8 w-48" />
    </Link>
  );
}
