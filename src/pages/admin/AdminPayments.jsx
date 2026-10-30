import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Clock, Download, Percent, XCircle } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Button, CsvModal, DataTable, DateRangeFilter, KpiCard, PageHeader, SearchInput, Select, StatusBadge, inRange } from '../../components/ui';
import { ReceiptModal } from '../account/Payments';
import { PLANS, ROLE_META } from '../../config/site';
import { dateTime, tzs, toCSV, tryDownload, tzsShort } from '../../utils/format';

export default function AdminPayments() {
  const { state, user, vehicle } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [plan, setPlan] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [csv, setCsv] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const rows = state.payments.filter((p) => {
    const t = q.trim().toLowerCase();
    const u = user(p.userId);
    if (t && !`${p.id} ${p.gatewayRef} ${p.listingId} ${u?.name} ${u?.business || ''}`.toLowerCase().includes(t)) return false;
    if (status && p.status !== status) return false;
    if (method && p.method !== method) return false;
    if (plan && p.planId !== plan) return false;
    return inRange(p.createdAt, range);
  });
  const ok = rows.filter((p) => p.status === 'success');

  const exportCsv = () => {
    const text = toCSV(rows, [
      { label: 'Transaction', value: 'id' },
      { label: 'Gateway reference', value: 'gatewayRef' },
      { label: 'Date', value: (p) => p.createdAt.slice(0, 19).replace('T', ' ') },
      { label: 'User', value: (p) => user(p.userId)?.name },
      { label: 'Role', value: (p) => user(p.userId)?.role },
      { label: 'Listing', value: 'listingId' },
      { label: 'Plan', value: (p) => PLANS.find((x) => x.id === p.planId)?.name },
      { label: 'Fee (TZS)', value: 'amount' },
      { label: 'GST (TZS)', value: 'gst' },
      { label: 'Total (TZS)', value: 'total' },
      { label: 'Method', value: 'method' },
      { label: 'Status', value: 'status' },
    ]);
    tryDownload('autodealer-listing-fees.csv', text);
    setCsv(text);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Payments & listing-fee ledger" description="Every listing-fee transaction from the payment gateway. Payment status is independent of document verification." actions={<Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Fee revenue (filtered)" value={tzsShort(ok.reduce((s, p) => s + p.amount, 0))} icon={Banknote} tone="green" sub={`+ ${tzs(ok.reduce((s, p) => s + p.gst, 0))} GST`} />
        <KpiCard label="Success rate" value={`${Math.round((ok.length / Math.max(1, rows.length)) * 100)}%`} icon={Percent} sub={`${ok.length} of ${rows.length}`} />
        <KpiCard label="Failed / cancelled" value={rows.filter((p) => ['failed', 'cancelled'].includes(p.status)).length} icon={XCircle} tone="red" sub="never activated a listing" />
        <KpiCard label="Pending" value={rows.filter((p) => p.status === 'pending').length} icon={Clock} tone="amber" sub="awaiting bank confirmation" />
      </div>
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-mist-100 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchInput value={q} onChange={setQ} placeholder="Transaction, gateway ref, listing or user" className="md:w-80" />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Any status" options={[{ value: 'success', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'pending', label: 'Pending' }]} className="sm:w-40" />
              <Select aria-label="Method" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Any method" options={['UPI', 'Card', 'Net banking', 'Wallet']} className="sm:w-40" />
              <Select aria-label="Plan" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Any plan" options={PLANS.map((p) => ({ value: p.id, label: p.name }))} className="col-span-2 sm:w-48" />
            </div>
          </div>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
        <DataTable
          rows={rows}
          pageSize={12}
          initialSort={{ key: 'date', dir: 'desc' }}
          columns={[
            {
              key: 'id',
              header: 'Transaction',
              render: (p) => (
                <div className="min-w-[150px]">
                  <p className="font-mono text-[13px] font-semibold">{p.id}</p>
                  <p className="font-mono text-[11px] text-mist-500">{p.gatewayRef}</p>
                </div>
              ),
            },
            { key: 'date', header: 'Date', sort: (p) => p.createdAt, render: (p) => dateTime(p.createdAt) },
            {
              key: 'user',
              header: 'Paid by',
              render: (p) => {
                const u = user(p.userId);
                return (
                  <div className="min-w-[140px]">
                    <p className="truncate text-[13px] font-medium">{u?.business || u?.agency || u?.name}</p>
                    <p className="text-[12px] text-mist-500">{ROLE_META[u?.role]?.label}</p>
                  </div>
                );
              },
            },
            {
              key: 'listing',
              header: 'Listing',
              render: (p) => {
                const v = vehicle(p.listingId);
                return (
                  <Link to={`/admin/listings/${p.listingId}`} className="text-[13px] text-accent-700 hover:underline">
                    {v ? `${v.make} ${v.model}` : p.listingId}
                  </Link>
                );
              },
            },
            { key: 'plan', header: 'Plan', render: (p) => <span className="text-[13px]">{PLANS.find((x) => x.id === p.planId)?.name}</span> },
            { key: 'fee', header: 'Fee', align: 'right', sort: (p) => p.amount, render: (p) => tzs(p.amount) },
            { key: 'gst', header: 'GST', align: 'right', render: (p) => <span className="text-mist-600">{tzs(p.gst)}</span> },
            { key: 'total', header: 'Total', align: 'right', sort: (p) => p.total, render: (p) => <span className="font-semibold">{tzs(p.total)}</span> },
            { key: 'method', header: 'Method', render: (p) => p.method },
            { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
            {
              key: 'r',
              header: '',
              align: 'right',
              render: (p) =>
                p.status === 'success' ? (
                  <Button size="sm" variant="ghost" onClick={() => setReceipt(p)}>
                    Receipt
                  </Button>
                ) : null,
            },
          ]}
        />
      </div>
      <CsvModal open={!!csv} onClose={() => setCsv(null)} filename="autodealer-listing-fees.csv" csv={csv || ''} />
      <ReceiptModal open={!!receipt} onClose={() => setReceipt(null)} txn={receipt} vehicle={receipt ? vehicle(receipt.listingId) : null} user={receipt ? user(receipt.userId) : null} />
    </div>
  );
}
