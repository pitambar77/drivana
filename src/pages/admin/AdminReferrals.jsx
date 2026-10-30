import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, HandCoins, Landmark, Send, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Button, CsvModal, DataTable, DateRangeFilter, KpiCard, MockNotice, PageHeader, Section, SearchInput, Select, StatusBadge, inRange, useToast } from '../../components/ui';
import { Bars, CHART } from '../../components/charts/Charts';
import { date, inr, lakh, toCSV, tryDownload } from '../../utils/format';

const STATUSES = [
  { value: 'referred', label: 'Referred' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'application', label: 'Application' },
  { value: 'sanctioned', label: 'Sanctioned' },
  { value: 'disbursed', label: 'Disbursed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminReferrals() {
  const { state, user, vehicle, setReferralStatus } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [lender, setLender] = useState('');
  const [status, setStatus] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [csv, setCsv] = useState(null);

  const rows = state.referrals.filter((r) => {
    const t = q.trim().toLowerCase();
    const u = r.buyerId ? user(r.buyerId) : null;
    if (t && !`${r.id} ${u?.name || r.buyerName || ''} ${r.vehicleId || ''}`.toLowerCase().includes(t)) return false;
    if (lender && r.lenderId !== lender) return false;
    if (status && r.status !== status) return false;
    return inRange(r.createdAt, range);
  });
  const byLender = state.config.loanProviders.map((l) => {
    const rs = rows.filter((r) => r.lenderId === l.id);
    return { label: l.name.split(' ').slice(0, 2).join(' '), earned: rs.reduce((s, r) => s + r.commission, 0), pipeline: rs.filter((r) => ['referred', 'application', 'sanctioned'].includes(r.status)).reduce((s, r) => s + r.expectedCommission, 0) };
  });

  const exportCsv = () => {
    const text = toCSV(rows, [
      { label: 'Referral', value: 'id' },
      { label: 'Date', value: (r) => r.createdAt.slice(0, 10) },
      { label: 'Lender', value: 'lender' },
      { label: 'Buyer', value: (r) => (r.buyerId ? user(r.buyerId)?.name : r.buyerName) },
      { label: 'Vehicle', value: (r) => r.vehicleId || '' },
      { label: 'Loan amount (INR)', value: 'loanAmount' },
      { label: 'Tenure (months)', value: 'tenureMonths' },
      { label: 'Status', value: 'status' },
      { label: 'Commission earned (INR)', value: 'commission' },
      { label: 'Expected commission (INR)', value: 'expectedCommission' },
    ]);
    tryDownload('autodealer-loan-referrals.csv', text);
    setCsv(text);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Loan referrals & commissions" description="Buyers referred to lending partners from the EMI calculator. Commission accrues only when a loan is disbursed." actions={<Button variant="secondary" icon={Download} onClick={exportCsv}>Export report</Button>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Referrals" value={rows.length} icon={Send} sub="in selected range" />
        <KpiCard label="Disbursed loans" value={rows.filter((r) => r.status === 'disbursed').length} icon={Landmark} tone="green" sub={lakh(rows.filter((r) => r.status === 'disbursed').reduce((s, r) => s + r.loanAmount, 0))} />
        <KpiCard label="Commission earned" value={inr(rows.reduce((s, r) => s + r.commission, 0))} icon={HandCoins} tone="dark" />
        <KpiCard label="Pipeline" value={inr(rows.filter((r) => ['referred', 'application', 'sanctioned'].includes(r.status)).reduce((s, r) => s + r.expectedCommission, 0))} icon={TrendingUp} tone="amber" sub="if open referrals disburse" />
      </div>
      <Section title="Commission by lender">
        <Bars money data={byLender} series={[{ key: 'earned', name: 'Earned', color: CHART.navy }, { key: 'pipeline', name: 'Pipeline', color: CHART.blue }]} height={220} />
      </Section>
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-mist-100 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchInput value={q} onChange={setQ} placeholder="Referral ID, buyer or vehicle" className="md:w-72" />
            <Select aria-label="Lender" value={lender} onChange={(e) => setLender(e.target.value)} placeholder="All lenders" options={state.config.loanProviders.map((l) => ({ value: l.id, label: l.name }))} className="md:w-60" />
            <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Any status" options={STATUSES} className="md:w-44" />
          </div>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
        <DataTable
          rows={rows}
          initialSort={{ key: 'date', dir: 'desc' }}
          columns={[
            {
              key: 'id',
              header: 'Referral',
              render: (r) => (
                <span>
                  <span className="block font-mono text-[13px] font-semibold">{r.id}</span>
                  {r.enquiryId && (
                    <Link to={`/finance-enquiry/${r.enquiryId}`} className="text-[12px] text-accent-700 hover:underline">
                      {r.enquiryId}
                    </Link>
                  )}
                </span>
              ),
            },
            { key: 'date', header: 'Date', sort: (r) => r.createdAt, render: (r) => date(r.createdAt) },
            { key: 'lender', header: 'Lender', render: (r) => <span className="text-[13px]">{r.lender}</span> },
            { key: 'buyer', header: 'Buyer', render: (r) => <span className="text-[13px]">{r.buyerId ? user(r.buyerId)?.name : r.buyerName}</span> },
            {
              key: 'vehicle',
              header: 'Vehicle',
              render: (r) => {
                const v = r.vehicleId ? vehicle(r.vehicleId) : null;
                return v ? (
                  <Link to={`/admin/listings/${v.id}`} className="text-[13px] text-accent-700 hover:underline">
                    {v.year} {v.make} {v.model}
                  </Link>
                ) : (
                  <span className="text-[13px] text-mist-500">No car chosen</span>
                );
              },
            },
            { key: 'amount', header: 'Loan', align: 'right', sort: (r) => r.loanAmount, render: (r) => lakh(r.loanAmount) },
            { key: 'tenure', header: 'Tenure', align: 'right', render: (r) => `${r.tenureMonths} mo` },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'commission', header: 'Commission', align: 'right', sort: (r) => r.commission, render: (r) => (r.commission ? <span className="font-semibold text-ok-700">{inr(r.commission)}</span> : <span className="text-mist-500">{inr(r.expectedCommission)} exp.</span>) },
            {
              key: 'update',
              header: 'Update',
              render: (r) => (
                <Select
                  aria-label={`Update status for ${r.id}`}
                  value={r.status}
                  onChange={(e) => {
                    setReferralStatus(r.id, e.target.value);
                    toast(`${r.id} marked ${e.target.value}.`, { tone: 'info' });
                  }}
                  options={STATUSES}
                  className="w-[140px]"
                />
              ),
            },
          ]}
        />
      </div>
      <MockNotice>Lender statuses would arrive by webhook from each partner. Here you can change them by hand to test the reports.</MockNotice>
      <CsvModal open={!!csv} onClose={() => setCsv(null)} filename="autodealer-loan-referrals.csv" csv={csv || ''} />
    </div>
  );
}
