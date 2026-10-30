import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileBarChart } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Button, CsvModal, DataTable, DateRangeFilter, KpiCard, PageHeader, Section, StatusBadge, VerificationBadge, inRange, presetRange } from '../../components/ui';
import { AreaTrend, Bars, Donut, LegendList, Lines, bucket, CHART } from '../../components/charts/Charts';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { dateTime, tzs, num, toCSV, tryDownload, tzsShort } from '../../utils/format';

export default function AdminReports() {
  const { state, user } = useStore();
  const [range, setRange] = useState(presetRange(90));
  const [csv, setCsv] = useState(null);

  const r = useMemo(() => {
    const within = (d) => inRange(d, range);
    const days = range.from ? Math.max(7, (new Date(range.to || Date.now()) - new Date(range.from)) / 864e5) : 365;
    const unit = days > 100 ? 'month' : 'week';
    const n = unit === 'week' ? Math.min(13, Math.ceil(days / 7)) : Math.min(12, Math.ceil(days / 30));
    const users = state.users.filter((u) => u.role !== 'admin' && within(u.registeredAt));
    const vehicles = state.vehicles.filter((v) => within(v.createdAt));
    const pays = state.payments.filter((p) => within(p.createdAt));
    const enq = state.enquiries.filter((e) => within(e.createdAt));
    const statuses = ['live', 'pending_payment', 'draft', 'blocked_duplicate', 'suspended', 'sold', 'expired', 'removed'];
    return {
      unit,
      users,
      vehicles,
      pays,
      enq,
      activity: bucket([...users.map((u) => ({ t: 'reg', at: u.registeredAt })), ...enq.map((e) => ({ t: 'enq', at: e.createdAt })), ...vehicles.map((v) => ({ t: 'lst', at: v.createdAt }))], {
        getDate: (x) => x.at,
        n,
        unit,
        reducers: { registrations: (l) => l.filter((x) => x.t === 'reg').length, enquiries: (l) => l.filter((x) => x.t === 'enq').length, listings: (l) => l.filter((x) => x.t === 'lst').length },
      }),
      byStatus: statuses.map((s, i) => ({ label: s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()), value: vehicles.filter((v) => v.status === s).length, color: [CHART.teal, CHART.amber, CHART.grey, CHART.rose, '#9B2C2C', CHART.blue, '#C5D0E3', CHART.navy][i] })).filter((x) => x.value),
      byCity: Object.entries(vehicles.reduce((m, v) => ({ ...m, [v.city]: (m[v.city] || 0) + 1 }), {}))
        .map(([label, value]) => ({ label, listings: value }))
        .sort((a, b) => b.listings - a.listings)
        .slice(0, 8),
      revenue: bucket(pays.filter((p) => p.status === 'success'), { getDate: (p) => p.createdAt, n, unit, reducers: { fees: (l) => l.reduce((s, p) => s + p.amount, 0), gst: (l) => l.reduce((s, p) => s + p.gst, 0) } }),
      flagged: state.vehicles.filter((v) => v.verification === 'flagged' || ['suspended', 'blocked_duplicate'].includes(v.status)),
    };
  }, [state, range]);

  const exp = (name, rows, cols) => {
    const text = toCSV(rows, cols);
    tryDownload(name, text);
    setCsv({ name, text });
  };

  const exports = {
    activity: () => exp('activity-report.csv', r.activity, [{ label: 'Period', value: 'label' }, { label: 'Registrations', value: 'registrations' }, { label: 'New listings', value: 'listings' }, { label: 'Enquiries', value: 'enquiries' }]),
    listings: () => exp('listing-statistics.csv', r.vehicles, [{ label: 'ID', value: 'id' }, { label: 'Vehicle', value: (v) => vehicleTitle(v) }, { label: 'City', value: 'city' }, { label: 'Seller type', value: 'sellerRole' }, { label: 'Price', value: 'price' }, { label: 'Status', value: 'status' }, { label: 'Verification', value: 'verification' }, { label: 'Created', value: (v) => v.createdAt.slice(0, 10) }]),
    revenue: () => exp('revenue-report.csv', r.revenue, [{ label: 'Period', value: 'label' }, { label: 'Listing fees (TZS)', value: 'fees' }, { label: 'GST (TZS)', value: 'gst' }]),
    flagged: () => exp('flagged-listings.csv', r.flagged, [{ label: 'ID', value: 'id' }, { label: 'Vehicle', value: (v) => vehicleTitle(v) }, { label: 'Status', value: 'status' }, { label: 'Verification', value: 'verification' }, { label: 'Seller', value: (v) => user(v.sellerId)?.name }]),
  };

  const fees = r.pays.filter((p) => p.status === 'success').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & monitoring" description="Platform health for the selected period. Every chart can be exported." actions={<Button variant="secondary" icon={FileBarChart} onClick={exports.listings}>Export listings</Button>}>
        <DateRangeFilter value={range} onChange={setRange} className="mt-4" />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="New users" value={num(r.users.length)} />
        <KpiCard label="New listings" value={num(r.vehicles.length)} />
        <KpiCard label="Enquiries" value={num(r.enq.length)} />
        <KpiCard label="Fee revenue" value={tzsShort(fees)} tone="green" />
        <KpiCard label="Flagged now" value={r.flagged.length} tone="red" />
      </div>

      <Section title="User activity" description={`Per ${r.unit}`} actions={<Button size="sm" variant="ghost" icon={Download} onClick={exports.activity}>CSV</Button>}>
        <AreaTrend data={r.activity} series={[{ key: 'registrations', name: 'Registrations', color: CHART.navy }, { key: 'listings', name: 'New listings', color: CHART.blue }, { key: 'enquiries', name: 'Enquiries', color: CHART.teal }]} />
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Listings by status" actions={<Button size="sm" variant="ghost" icon={Download} onClick={exports.listings}>CSV</Button>}>
          <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
            <Donut data={r.byStatus} height={180} centerValue={r.vehicles.length} centerLabel="listings" />
            <LegendList data={r.byStatus} />
          </div>
        </Section>
        <Section title="Listings by city">
          <Bars layout="vertical" data={r.byCity} series={[{ key: 'listings', name: 'Listings' }]} height={240} />
        </Section>
      </div>

      <Section title="Revenue" description={`Listing fees and GST per ${r.unit} · total ${tzs(fees)}`} actions={<Button size="sm" variant="ghost" icon={Download} onClick={exports.revenue}>CSV</Button>}>
        <Lines money data={r.revenue} series={[{ key: 'fees', name: 'Listing fees', color: CHART.navy }, { key: 'gst', name: 'GST', color: CHART.amber }]} />
      </Section>

      <Section title="Flagged, suspended and blocked listings" bodyClass="p-0" actions={<Button size="sm" variant="ghost" icon={Download} onClick={exports.flagged}>CSV</Button>}>
        <DataTable
          rows={r.flagged}
          pageSize={8}
          columns={[
            { key: 'v', header: 'Listing', render: (v) => <Link to={`/admin/listings/${v.id}`} className="font-semibold hover:text-accent-700">{vehicleTitle(v)}</Link> },
            { key: 'id', header: 'ID', render: (v) => <span className="font-mono text-[12.5px]">{v.id.toUpperCase()}</span> },
            { key: 'seller', header: 'Seller', render: (v) => user(v.sellerId)?.business || user(v.sellerId)?.name },
            { key: 'status', header: 'Listing', render: (v) => <StatusBadge status={v.status} /> },
            { key: 'ver', header: 'Verification', render: (v) => <VerificationBadge status={v.verification} size="sm" /> },
            { key: 'last', header: 'Last action', render: (v) => { const a = state.audit.find((x) => x.entityId === v.id); return <span className="text-[13px] text-mist-600">{a ? `${a.action} · ${dateTime(a.at)}` : '—'}</span>; } },
          ]}
        />
      </Section>
      <CsvModal open={!!csv} onClose={() => setCsv(null)} filename={csv?.name || ''} csv={csv?.text || ''} />
    </div>
  );
}
