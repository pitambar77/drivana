import { BadgeCheck, CircleDashed, Flag, ShieldAlert, ShieldQuestion, Clock } from 'lucide-react';
import { cn } from '../../utils/format';

const TONES = {
  neutral: 'bg-mist-100 text-mist-700 ring-mist-200',
  blue: 'bg-accent-50 text-accent-700 ring-accent-100',
  green: 'bg-ok-50 text-ok-700 ring-ok-100',
  amber: 'bg-warn-50 text-warn-700 ring-warn-100',
  red: 'bg-bad-50 text-bad-700 ring-bad-100',
  dark: 'bg-ink-900 text-white ring-ink-900',
  info: 'bg-info-50 text-info-700 ring-info-100',
};

export function Badge({ tone = 'neutral', icon: Icon, children, className, dot }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-semibold ring-1 ring-inset', TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />}
      {children}
    </span>
  );
}

// One dictionary for every status in the product so labels never drift.
const STATUS = {
  // listing lifecycle
  live: ['green', 'Live'],
  draft: ['neutral', 'Draft'],
  pending_payment: ['amber', 'Awaiting payment'],
  blocked_duplicate: ['red', 'Blocked · duplicate'],
  suspended: ['red', 'Suspended'],
  removed: ['dark', 'Removed'],
  sold: ['blue', 'Sold'],
  expired: ['neutral', 'Expired'],
  // payment
  success: ['green', 'Paid'],
  paid: ['green', 'Paid'],
  unpaid: ['neutral', 'Unpaid'],
  failed: ['red', 'Failed'],
  cancelled: ['neutral', 'Cancelled'],
  pending: ['amber', 'Pending'],
  // documents / verification
  verified: ['green', 'Verified'],
  unverified: ['neutral', 'Not verified'],
  rejected: ['red', 'Rejected'],
  flagged: ['red', 'Flagged'],
  not_submitted: ['neutral', 'Not submitted'],
  // users
  active: ['green', 'Active'],
  // enquiries
  new: ['blue', 'New'],
  contacted: ['info', 'Contacted'],
  negotiating: ['amber', 'Negotiating'],
  closed: ['green', 'Closed · deal'],
  lost: ['neutral', 'Closed · no deal'],
  // handover
  completed: ['green', 'Completed'],
  in_progress: ['blue', 'In progress'],
  issue: ['red', 'Issue'],
  // loan referrals
  referred: ['neutral', 'Referred'],
  application: ['info', 'Application'],
  sanctioned: ['amber', 'Sanctioned'],
  disbursed: ['green', 'Disbursed'],
};

export const statusLabel = (s) => STATUS[s]?.[1] || String(s).replace(/_/g, ' ');

export function StatusBadge({ status, className, prefix }) {
  const [tone, label] = STATUS[status] || ['neutral', String(status || '—').replace(/_/g, ' ')];
  return (
    <Badge tone={tone} dot className={className}>
      {prefix ? `${prefix}: ` : ''}
      {label}
    </Badge>
  );
}

/** Verification is a separate dimension from listing status: live ≠ verified. */
export function VerificationBadge({ status, size = 'md' }) {
  const map = {
    verified: ['green', BadgeCheck, 'Documents verified'],
    pending: ['amber', Clock, 'Verification in review'],
    unverified: ['neutral', CircleDashed, 'Not yet verified'],
    flagged: ['red', Flag, 'Under review'],
    rejected: ['red', ShieldAlert, 'Verification failed'],
  };
  const [tone, Icon, label] = map[status] || ['neutral', ShieldQuestion, 'Unknown'];
  return (
    <Badge tone={tone} icon={Icon} className={size === 'sm' ? 'text-[11px]' : ''}>
      {label}
    </Badge>
  );
}
