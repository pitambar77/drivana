import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, CreditCard, Eye, LayoutGrid, MoreHorizontal, Pencil, Plus, Rows3, Trash2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Button, ConfirmDialog, DataTable, EmptyState, Plate, SearchInput, Select, StatusBadge, VerificationBadge, useToast } from '../ui';
import { CarImage } from '../vehicle/CarArt';
import { vehicleTitle } from '../vehicle/VehicleCard';
import { cn, date, tzs, num } from '../../utils/format';

const STATUS_OPTS = [
  { value: 'live', label: 'Live' },
  { value: 'pending_payment', label: 'Awaiting payment' },
  { value: 'draft', label: 'Draft' },
  { value: 'blocked_duplicate', label: 'Blocked · duplicate' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'sold', label: 'Sold' },
  { value: 'expired', label: 'Expired' },
];

function RowActions({ v, base, onDelete, onSold }) {
  const [open, setOpen] = useState(false);
  const needsPay = ['draft', 'pending_payment'].includes(v.status);
  return (
    <div className="relative flex items-center justify-end gap-1">
      {needsPay && (
        <Button size="sm" variant="primary" icon={CreditCard} to={`/checkout/${v.id}`}>
          Pay
        </Button>
      )}
      <Button size="sm" variant="ghost" icon={Pencil} to={`${base}/vehicles/${v.id}/edit`} aria-label="Edit">
        <span className="hidden xl:inline">Edit</span>
      </Button>
      <button type="button" className="btn-icon h-8 w-8" onClick={() => setOpen((o) => !o)} aria-label="More actions" aria-expanded={open}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-48 animate-fade-up rounded-xl border border-mist-200 bg-white p-1.5 text-left shadow-pop">
            <Link to={`/cars/${v.id}`} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-mist-100">
              <Eye className="h-4 w-4" /> View listing
            </Link>
            {v.status === 'live' && (
              <button type="button" onClick={() => { setOpen(false); onSold(v); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-mist-100">
                <CheckCheck className="h-4 w-4" /> Mark as sold
              </button>
            )}
            <button type="button" onClick={() => { setOpen(false); onDelete(v); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-bad-600 hover:bg-bad-50">
              <Trash2 className="h-4 w-4" /> Delete listing
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Searchable, filterable stock manager shared by dealers and agents. */
export function ListingsManager({ base, showOwner }) {
  const { state, me, deleteListing, setListingStatus } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [ver, setVer] = useState('');
  const [view, setView] = useState('table');
  const [del, setDel] = useState(null);
  const [sold, setSold] = useState(null);

  const mine = useMemo(() => state.vehicles.filter((v) => v.sellerId === me.id), [state.vehicles, me.id]);
  const enqCount = useMemo(() => {
    const m = {};
    state.enquiries.forEach((e) => (m[e.vehicleId] = (m[e.vehicleId] || 0) + 1));
    return m;
  }, [state.enquiries]);
  const rows = mine.filter((v) => {
    const t = q.trim().toLowerCase();
    if (t && !`${v.make} ${v.model} ${v.variant} ${v.regNumber} ${v.id}`.toLowerCase().includes(t)) return false;
    if (status && v.status !== status) return false;
    if (ver && v.verification !== ver) return false;
    return true;
  });

  const columns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      sort: (v) => `${v.make}${v.model}`,
      render: (v) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <CarImage vehicle={v} view="side" className="h-12 w-20 shrink-0 rounded-md" />
          <div className="min-w-0">
            <Link to={`/cars/${v.id}`} className="block truncate font-semibold text-ink-900 hover:text-accent-700">
              {vehicleTitle(v)}
            </Link>
            <p className="truncate text-[12.5px] text-mist-500">
              {v.variant} · {v.id.toUpperCase()}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'reg', header: 'Registration', render: (v) => <Plate value={v.regNumber} size="sm" /> },
    ...(showOwner ? [{ key: 'owner', header: 'Owner (private)', render: (v) => <span className="text-[13px]">{v.ownerInfo?.name || '—'}</span> }] : []),
    { key: 'price', header: 'Price', align: 'right', sort: (v) => v.price, render: (v) => <span className="font-semibold">{tzs(v.price)}</span> },
    { key: 'status', header: 'Listing', sort: (v) => v.status, render: (v) => <StatusBadge status={v.status} /> },
    { key: 'verification', header: 'Documents', render: (v) => <VerificationBadge status={v.verification} size="sm" /> },
    { key: 'views', header: 'Views', align: 'right', sort: (v) => v.views, render: (v) => num(v.views) },
    { key: 'enq', header: 'Enquiries', align: 'right', sort: (v) => enqCount[v.id] || 0, render: (v) => num(enqCount[v.id] || 0) },
    { key: 'created', header: 'Created', sort: (v) => v.createdAt, render: (v) => <span className="text-[13px] text-mist-600">{date(v.createdAt)}</span> },
    { key: 'actions', header: '', align: 'right', render: (v) => <RowActions v={v} base={base} onDelete={setDel} onSold={setSold} /> },
  ];

  return (
    <div className="card">
      <div className="flex flex-col gap-3 border-b border-mist-100 p-4 md:flex-row md:items-center">
        <SearchInput value={q} onChange={setQ} placeholder="Search make, model, reg. no. or ID" className="md:w-72" />
        <div className="flex flex-wrap gap-2">
          <Select aria-label="Filter by listing status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All statuses" options={STATUS_OPTS} className="w-[170px]" />
          <Select aria-label="Filter by verification" value={ver} onChange={(e) => setVer(e.target.value)} placeholder="Any verification" options={[{ value: 'verified', label: 'Verified' }, { value: 'pending', label: 'In review' }, { value: 'unverified', label: 'Not verified' }, { value: 'flagged', label: 'Flagged' }]} className="w-[170px]" />
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <div className="flex rounded-lg bg-mist-100 p-0.5">
            {[
              ['table', Rows3],
              ['cards', LayoutGrid],
            ].map(([k, Icon]) => (
              <button key={k} type="button" onClick={() => setView(k)} className={cn('rounded-md p-1.5', view === k ? 'bg-white text-ink-900 shadow-card' : 'text-mist-500')} aria-label={`${k} view`} aria-pressed={view === k}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <Button icon={Plus} to={`${base}/vehicles/new`}>
            Add vehicle
          </Button>
        </div>
      </div>
      {view === 'table' ? (
        <DataTable
          rows={rows}
          columns={columns}
          initialSort={{ key: 'created', dir: 'desc' }}
          empty={<EmptyState title={mine.length ? 'No listings match' : 'No listings yet'} message={mine.length ? 'Try clearing the filters.' : 'Add your first vehicle. It goes live as soon as payment succeeds.'} action={<Button to={`${base}/vehicles/new`} icon={Plus}>Add vehicle</Button>} />}
        />
      ) : rows.length ? (
        <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-xl border border-mist-200">
              <CarImage vehicle={v} view="side" className="aspect-[16/9] w-full" />
              <div className="space-y-2 p-3.5">
                <p className="truncate font-semibold">{vehicleTitle(v)}</p>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={v.status} />
                  <VerificationBadge status={v.verification} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold">{tzs(v.price)}</span>
                  <RowActions v={v} base={base} onDelete={setDel} onSold={setSold} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4">
          <EmptyState title="No listings match" />
        </div>
      )}
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        tone="danger"
        title="Delete this listing?"
        message={del ? `${vehicleTitle(del)} will be removed from search and your dashboard. Fees already paid aren't refunded.` : ''}
        confirmLabel="Delete listing"
        onConfirm={() => {
          deleteListing(del.id);
          toast('Listing deleted.', { tone: 'info' });
        }}
      />
      <ConfirmDialog
        open={!!sold}
        onClose={() => setSold(null)}
        title="Mark as sold?"
        message={sold ? `${vehicleTitle(sold)} will leave search results. Enquiries stay in your inbox.` : ''}
        confirmLabel="Mark as sold"
        onConfirm={() => {
          setListingStatus(sold.id, 'sold');
          toast('Marked as sold. Congratulations!');
        }}
      />
    </div>
  );
}
