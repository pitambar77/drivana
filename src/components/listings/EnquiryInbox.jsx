import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Inbox, Mail, MessageCircle, Phone } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Avatar, CopyText, EmptyState, Pagination, SearchInput, Select, StatusBadge, Tabs, useToast } from '../ui';
import { CarImage } from '../vehicle/CarArt';
import { vehicleTitle } from '../vehicle/VehicleCard';
import { ago, cn, dateTime, lakh } from '../../utils/format';

export const ENQ_STATUS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'closed', label: 'Closed · deal' },
  { value: 'lost', label: 'Closed · no deal' },
];

/** Two-pane lead inbox: list on the left, detail on the right (stacked on phones). */
export function EnquiryInbox({ showVehicleFilter = true, compact }) {
  const { state, me, vehicle, setEnquiryStatus } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState('open');
  const [q, setQ] = useState('');
  const [veh, setVeh] = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const PS = 8;

  const mine = useMemo(() => state.enquiries.filter((e) => e.sellerId === me.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [state.enquiries, me.id]);
  const vehicles = [...new Set(mine.map((e) => e.vehicleId))].map((id) => vehicle(id)).filter(Boolean);
  const isOpen = (e) => ['new', 'contacted', 'negotiating'].includes(e.status);
  const list = mine.filter((e) => {
    if (tab === 'open' && !isOpen(e)) return false;
    if (tab === 'new' && e.status !== 'new') return false;
    if (tab === 'closed' && isOpen(e)) return false;
    if (veh && e.vehicleId !== veh) return false;
    const t = q.trim().toLowerCase();
    if (t && !`${e.buyerName} ${e.buyerPhone} ${e.message}`.toLowerCase().includes(t)) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(list.length / PS));
  const view = list.slice((page - 1) * PS, page * PS);
  const current = mine.find((e) => e.id === selected) || (typeof window !== 'undefined' && window.innerWidth >= 1024 ? view[0] : null);
  const cv = current ? vehicle(current.vehicleId) : null;

  const setStatus = (id, s) => {
    setEnquiryStatus(id, s);
    toast(`Enquiry marked "${ENQ_STATUS.find((x) => x.value === s).label}".`, { tone: 'info' });
  };

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-mist-100 px-4 pt-2">
        <Tabs
          value={tab}
          onChange={(t) => {
            setTab(t);
            setPage(1);
          }}
          tabs={[
            { value: 'open', label: 'Open', count: mine.filter(isOpen).length },
            { value: 'new', label: 'New', count: mine.filter((e) => e.status === 'new').length },
            { value: 'closed', label: 'Closed', count: mine.filter((e) => !isOpen(e)).length },
            { value: 'all', label: 'All', count: mine.length },
          ]}
        />
      </div>
      <div className={cn('grid', !compact && 'lg:grid-cols-[minmax(300px,380px)_1fr]')}>
        <div className={cn('border-mist-100 lg:border-r', current && selected ? 'hidden lg:block' : '')}>
          <div className="flex flex-col gap-2 border-b border-mist-100 p-3 sm:flex-row">
            <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search buyer or message" className="flex-1" />
            {showVehicleFilter && vehicles.length > 1 && (
              <Select aria-label="Filter by vehicle" value={veh} onChange={(e) => { setVeh(e.target.value); setPage(1); }} placeholder="All vehicles" options={vehicles.map((v) => ({ value: v.id, label: `${v.make} ${v.model} ${v.year}` }))} className="sm:w-44" />
            )}
          </div>
          {view.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={Inbox} title="No enquiries here" message="When buyers call or message about your cars, they show up in this inbox." />
            </div>
          ) : (
            <ul className="divide-y divide-mist-100">
              {view.map((e) => {
                const v = vehicle(e.vehicleId);
                return (
                  <li key={e.id}>
                    <button type="button" onClick={() => setSelected(e.id)} className={cn('flex w-full gap-3 px-4 py-3 text-left hover:bg-mist-50', current?.id === e.id && 'bg-accent-50/60')}>
                      <Avatar name={e.buyerName} size={36} tone="mist" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('truncate text-sm', e.status === 'new' ? 'font-bold text-ink-900' : 'font-semibold text-ink-800')}>{e.buyerName}</p>
                          <span className="shrink-0 text-[11.5px] text-mist-500">{ago(e.createdAt)}</span>
                        </div>
                        <p className="truncate text-[12.5px] text-mist-500">{v ? vehicleTitle(v) : e.vehicleId}</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-[13px] text-mist-600">{e.message}</p>
                          <StatusBadge status={e.status} className="shrink-0" />
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <Pagination className="border-t border-mist-100 px-4 py-3" page={page} pages={pages} onChange={setPage} />
        </div>

        {current && !compact && (
          <div className={cn('min-w-0 p-5', !selected && 'hidden lg:block')}>
            <button type="button" onClick={() => setSelected(null)} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-mist-600 lg:hidden">
              <ArrowLeft className="h-4 w-4" /> All enquiries
            </button>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={current.buyerName} size={44} />
                <div>
                  <p className="text-lg font-bold">{current.buyerName}</p>
                  <p className="text-[13px] text-mist-500">
                    via {current.channel === 'form' ? 'enquiry form' : current.channel} · {dateTime(current.createdAt)} · {current.id.toUpperCase()}
                  </p>
                </div>
              </div>
              <Select aria-label="Enquiry status" value={current.status} onChange={(ev) => setStatus(current.id, ev.target.value)} options={ENQ_STATUS} className="w-[190px]" />
            </div>

            <div className="mt-5 whitespace-pre-line rounded-xl bg-mist-50 p-4 text-[14.5px] leading-relaxed text-ink-800">{current.message}</div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-mist-200 p-4">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-mist-500">Contact buyer</p>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <a href={`tel:${current.buyerPhone?.replace(/\s/g, '')}`} className="flex items-center gap-2 font-mono font-semibold text-ink-900">
                      <Phone className="h-4 w-4 text-mist-400" /> {current.buyerPhone}
                    </a>
                    <CopyText text={current.buyerPhone} />
                  </div>
                  {current.buyerEmail && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2 truncate">
                        <Mail className="h-4 w-4 shrink-0 text-mist-400" /> {current.buyerEmail}
                      </span>
                      <CopyText text={current.buyerEmail} />
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-dark"
                    onClick={() => {
                      if (current.status === 'new') setStatus(current.id, 'contacted');
                    }}
                  >
                    <Phone className="h-3.5 w-3.5" /> Mark as called
                  </button>
                  <a className="btn btn-sm btn-secondary" href={`https://wa.me/${current.buyerPhone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
              {cv && (
                <Link to={`/cars/${cv.id}`} className="flex gap-3 rounded-xl border border-mist-200 p-3 hover:border-accent-300">
                  <CarImage vehicle={cv} view="side" className="h-16 w-24 shrink-0 rounded-md" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-mist-500">About</p>
                    <p className="truncate font-semibold">{vehicleTitle(cv)}</p>
                    <p className="text-[13px] text-mist-500">
                      {lakh(cv.price)} · {cv.id.toUpperCase()}
                    </p>
                  </div>
                </Link>
              )}
            </div>
            <p className="mt-4 text-[12px] text-mist-500">Status changes are for your own tracking; buyers don't see them.</p>
          </div>
        )}
      </div>
    </div>
  );
}
