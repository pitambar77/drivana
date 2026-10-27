import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Eye, Flag, MoreHorizontal, PauseCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Badge, Button, ConfirmDialog, DataTable, DateRangeFilter, Modal, PageHeader, Plate, SearchInput, Select, StatusBadge, Tabs, VerificationBadge, inRange, useToast } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { CITIES } from '../../data/catalog';
import { ROLE_META } from '../../config/site';
import { date, lakh, normId } from '../../utils/format';

export const MOD = {
  flag: { label: 'Flag for review', tone: 'danger', msg: 'Marks the listing as under review. It stays live; buyers see "Under review" instead of a verified badge.', confirm: 'Flag listing', done: 'Listing flagged' },
  suspend: { label: 'Suspend', tone: 'danger', msg: 'Hides the listing from buyers until restored. The seller is notified.', confirm: 'Suspend listing', done: 'Listing suspended' },
  remove: { label: 'Remove', tone: 'danger', msg: 'Permanently takes the listing down. Use for fraud or policy violations.', confirm: 'Remove listing', done: 'Listing removed' },
  restore: { label: 'Restore', tone: 'primary', msg: 'Puts the listing back live. Payment is already recorded.', confirm: 'Restore listing', done: 'Listing restored' },
};

export function DuplicateReview({ listing, open, onClose }) {
  const { state, user, moderateListing } = useStore();
  const toast = useToast();
  if (!listing) return null;
  const matches = state.vehicles.filter((v) => v.id !== listing.id && ((listing.regNumber && normId(v.regNumber) === normId(listing.regNumber)) || v.vin === listing.vin));
  const col = (v, label) => {
    const u = user(v.sellerId);
    return (
      <div className="min-w-0 rounded-xl border border-mist-200 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-mist-500">{label}</p>
        <CarImage vehicle={v} view="side" className="mt-2 aspect-[16/9] w-full rounded-lg" />
        <p className="mt-3 font-semibold">{vehicleTitle(v)}</p>
        <p className="text-[13px] text-mist-500">
          {u?.business || u?.agency || u?.name} · {ROLE_META[v.sellerRole].label} · {v.city}
        </p>
        <div className="mt-3 space-y-1.5 text-[13px]">
          <p className="flex items-center gap-2">
            <Plate value={v.regNumber} size="sm" />
            {normId(v.regNumber) === normId(listing.regNumber) && v.regNumber && <Badge tone="red">match</Badge>}
          </p>
          <p className="font-mono text-[12px]">
            VIN {v.vin} {v.vin === listing.vin && <Badge tone="red">match</Badge>}
          </p>
          <p>
            Created {date(v.createdAt)} · <StatusBadge status={v.status} />
          </p>
        </div>
        <Link to={`/admin/listings/${v.id}`} className="mt-3 inline-block text-[13px] font-semibold text-accent-700 hover:underline">
          Open listing →
        </Link>
      </div>
    );
  };
  const originalActive = matches.some((m) => ['live', 'pending_payment', 'draft', 'suspended'].includes(m.status));
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Duplicate review"
      description="Compare the blocked listing with the active listing it matched."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              moderateListing(listing.id, 'keepBlocked', 'Reviewed: duplicate confirmed.');
              toast('Block confirmed and logged.', { tone: 'info' });
              onClose();
            }}
          >
            Keep blocked
          </Button>
          <Button
            disabled={originalActive}
            title={originalActive ? 'Suspend or remove the matching active listing first' : undefined}
            onClick={() => {
              moderateListing(listing.id, 'releaseDuplicate', 'Matching listing no longer active; seller may pay and publish.');
              toast('Block released. The seller can now pay and publish.');
              onClose();
            }}
          >
            Release block
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {col(listing, 'Blocked listing')}
        {matches.map((m) => (
          <div key={m.id}>{col(m, 'Matched listing')}</div>
        ))}
      </div>
      {originalActive && <p className="mt-4 text-[13px] text-mist-600">To release the block, first suspend or remove the matching listing (for example, if the earlier seller no longer owns the car).</p>}
    </Modal>
  );
}

function RowMenu({ v, onAct, onDup }) {
  const [open, setOpen] = useState(false);
  const item = (Icon, label, fn, cls = '') => (
    <button type="button" onClick={() => { setOpen(false); fn(); }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-mist-100 ${cls}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
  return (
    <div className="relative flex justify-end gap-1">
      <Button size="sm" variant="ghost" icon={Eye} to={`/admin/listings/${v.id}`}>
        View
      </Button>
      <button type="button" className="btn-icon h-8 w-8" onClick={() => setOpen((o) => !o)} aria-label="Moderation actions" aria-expanded={open}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-52 animate-fade-up rounded-xl border border-mist-200 bg-white p-1.5 text-left shadow-pop">
            {v.status === 'blocked_duplicate' && item(Copy, 'Review duplicate', () => onDup(v))}
            {v.verification !== 'flagged' && item(Flag, 'Flag for review', () => onAct(v, 'flag'), 'text-warn-700')}
            {v.status === 'live' && item(PauseCircle, 'Suspend', () => onAct(v, 'suspend'), 'text-bad-600')}
            {['suspended', 'removed'].includes(v.status) && v.paymentStatus === 'paid' && item(RotateCcw, 'Restore', () => onAct(v, 'restore'))}
            {v.status !== 'removed' && item(Trash2, 'Remove', () => onAct(v, 'remove'), 'text-bad-600')}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminListings() {
  const { state, user, moderateListing } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [act, setAct] = useState(null);
  const [dup, setDup] = useState(null);

  const base = state.vehicles;
  const tabs = {
    all: () => true,
    flagged: (v) => v.verification === 'flagged' || v.status === 'suspended',
    duplicates: (v) => v.status === 'blocked_duplicate',
    unverified: (v) => v.status === 'live' && v.verification !== 'verified',
  };
  const rows = useMemo(
    () =>
      base.filter(tabs[tab]).filter((v) => {
        const t = q.trim().toLowerCase();
        if (t && !`${v.id} ${v.make} ${v.model} ${v.regNumber} ${v.vin}`.toLowerCase().includes(t.replace(/\s/g, ''))) {
          if (!`${v.make} ${v.model}`.toLowerCase().includes(t)) return false;
        }
        if (status && v.status !== status) return false;
        if (role && v.sellerRole !== role) return false;
        if (city && v.city !== city) return false;
        if (!inRange(v.createdAt, range)) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, tab, q, status, role, city, range],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Listings moderation" description="Every listing on the platform. Live listings don't need approval; moderate the ones that look wrong." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'all', label: 'All listings', count: base.length },
          { value: 'unverified', label: 'Live, unverified', count: base.filter(tabs.unverified).length },
          { value: 'flagged', label: 'Flagged & suspended', count: base.filter(tabs.flagged).length },
          { value: 'duplicates', label: 'Duplicate blocks', count: base.filter(tabs.duplicates).length },
        ]}
      />
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-mist-100 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchInput value={q} onChange={setQ} placeholder="ID, make, model, reg. no. or VIN" className="md:w-80" />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Any status" options={['live', 'pending_payment', 'draft', 'blocked_duplicate', 'suspended', 'removed', 'sold', 'expired'].map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))} className="sm:w-44" />
              <Select aria-label="Seller type" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Any seller type" options={[{ value: 'dealer', label: 'Dealer' }, { value: 'seller', label: 'Private seller' }, { value: 'agent', label: 'Agent' }]} className="sm:w-44" />
              <Select aria-label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Any city" options={CITIES.map((c) => c.name)} className="col-span-2 sm:w-40" />
            </div>
          </div>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
        <DataTable
          rows={rows}
          initialSort={{ key: 'created', dir: 'desc' }}
          columns={[
            {
              key: 'v',
              header: 'Listing',
              sort: (v) => v.make + v.model,
              render: (v) => (
                <Link to={`/admin/listings/${v.id}`} className="flex min-w-[220px] items-center gap-3">
                  <CarImage vehicle={v} view="side" className="h-10 w-16 shrink-0 rounded" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold hover:text-accent-700">{vehicleTitle(v)}</p>
                    <p className="font-mono text-[11.5px] text-mist-500">{v.id.toUpperCase()}</p>
                  </div>
                </Link>
              ),
            },
            {
              key: 'seller',
              header: 'Seller',
              render: (v) => {
                const u = user(v.sellerId);
                return (
                  <div className="min-w-[140px]">
                    <p className="truncate text-[13px] font-medium">{u?.business || u?.agency || u?.name}</p>
                    <p className="text-[12px] text-mist-500">{ROLE_META[v.sellerRole].label}</p>
                  </div>
                );
              },
            },
            { key: 'reg', header: 'Reg. no.', render: (v) => <Plate value={v.regNumber} size="sm" /> },
            { key: 'city', header: 'City', sort: (v) => v.city },
            { key: 'price', header: 'Price', align: 'right', sort: (v) => v.price, render: (v) => lakh(v.price) },
            { key: 'status', header: 'Listing', render: (v) => <StatusBadge status={v.status} /> },
            { key: 'ver', header: 'Verification', render: (v) => <VerificationBadge status={v.verification} size="sm" /> },
            { key: 'created', header: 'Created', sort: (v) => v.createdAt, render: (v) => date(v.createdAt) },
            { key: 'a', header: '', align: 'right', render: (v) => <RowMenu v={v} onAct={(x, a) => setAct({ v: x, a })} onDup={setDup} /> },
          ]}
        />
      </div>

      <ConfirmDialog
        open={!!act}
        onClose={() => setAct(null)}
        tone={act ? MOD[act.a].tone : 'primary'}
        withReason
        reasonRequired={act?.a !== 'restore'}
        title={act ? `${MOD[act.a].label}: ${vehicleTitle(act.v)}` : ''}
        message={act ? MOD[act.a].msg : ''}
        confirmLabel={act ? MOD[act.a].confirm : ''}
        onConfirm={(reason) => {
          moderateListing(act.v.id, act.a, reason);
          toast(`${MOD[act.a].done}. Recorded in the audit trail.`, { tone: act.a === 'restore' ? 'success' : 'warn' });
        }}
      />
      <DuplicateReview listing={dup} open={!!dup} onClose={() => setDup(null)} />
    </div>
  );
}
