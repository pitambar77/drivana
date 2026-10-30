import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Car, Clock, CreditCard, Inbox, Plus, Radio, Wallet } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Button, KpiCard, PageHeader, Section, StatusBadge } from '../../components/ui';
import { AreaTrend, Bars, bucket } from '../../components/charts/Charts';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { CarImage } from '../../components/vehicle/CarArt';
import { ago, tzs, tzsShort } from '../../utils/format';

/** Builds the KPI + chart data every seller-side dashboard needs. */
export function useSellerStats() {
  const { state, me } = useStore();
  return useMemo(() => {
    const mine = state.vehicles.filter((v) => v.sellerId === me.id);
    const ids = new Set(mine.map((v) => v.id));
    const enq = state.enquiries.filter((e) => ids.has(e.vehicleId));
    const pays = state.payments.filter((p) => p.userId === me.id);
    const live = mine.filter((v) => v.status === 'live');
    const weekly = bucket(enq, {
      getDate: (e) => e.createdAt,
      n: 8,
      unit: 'week',
      reducers: { enquiries: (l) => l.length },
    }).map((r, i, arr) => ({ ...r, views: Math.round((live.reduce((s, v) => s + v.views, 0) / 30) * (0.7 + 0.22 * Math.sin(i * 1.4) + (i / arr.length) * 0.45)) }));
    const perf = live
      .map((v) => ({ label: `${v.model} ’${String(v.year).slice(2)}`, views: v.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);
    return {
      mine,
      live,
      enq,
      pays,
      weekly,
      perf,
      pendingVerification: live.filter((v) => v.verification !== 'verified').length,
      newEnq: enq.filter((e) => e.status === 'new').length,
      spend: pays.filter((p) => p.status === 'success').reduce((s, p) => s + p.total, 0),
      attention: mine.filter((v) => ['draft', 'pending_payment', 'blocked_duplicate', 'suspended'].includes(v.status)),
    };
  }, [state.vehicles, state.enquiries, state.payments, me.id]);
}

export function AttentionList({ items, base }) {
  if (!items.length) return null;
  const msg = {
    draft: 'Draft — finish details and pay to publish',
    pending_payment: 'Not live — payment needed',
    blocked_duplicate: 'Blocked — duplicate registration or VIN',
    suspended: 'Suspended by AutoDealer — contact support',
  };
  return (
    <Section title="Needs your attention" description="These listings aren't visible to buyers yet." bodyClass="p-0">
      <ul className="divide-y divide-mist-100">
        {items.map((v) => (
          <li key={v.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <CarImage vehicle={v} view="side" className="h-10 w-16 shrink-0 rounded" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{vehicleTitle(v)}</p>
              <p className="text-[12.5px] text-mist-500">{msg[v.status]}</p>
            </div>
            <StatusBadge status={v.status} />
            {['draft', 'pending_payment'].includes(v.status) ? (
              <Button size="sm" to={`/checkout/${v.id}`} icon={CreditCard}>
                Pay & publish
              </Button>
            ) : v.status === 'blocked_duplicate' ? (
              <Button size="sm" variant="secondary" to={base === '/seller' ? '/seller/listing-status' : `${base}/vehicles/${v.id}/edit`}>
                Fix details
              </Button>
            ) : (
              <Button size="sm" variant="secondary" to="/support">
                Support
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default function DealerDashboard() {
  const { state, me } = useStore();
  const s = useSellerStats();
  const docOk = me.docStatus === 'verified';
  const activity = [
    ...s.enq.slice(0, 6).map((e) => ({ id: e.id, at: e.createdAt, icon: Inbox, text: `${e.buyerName} enquired about ${vehicleTitle(state.vehicles.find((v) => v.id === e.vehicleId) || {})}`, to: '/dealer/enquiries' })),
    ...s.pays.slice(0, 4).map((p) => ({ id: p.id, at: p.createdAt, icon: CreditCard, text: `Payment ${p.id} ${p.status === 'success' ? 'succeeded' : p.status} · ${tzs(p.total)}`, to: '/payments' })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 7);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={me.business}
        title={`Good to see you, ${me.name.split(' ')[0]}`}
        description="Your stock, leads and spend at a glance."
        actions={
          <>
            <Button variant="secondary" to="/dealer/enquiries" icon={Inbox}>
              Enquiries{s.newEnq ? ` (${s.newEnq} new)` : ''}
            </Button>
            <Button to="/dealer/vehicles/new" icon={Plus}>
              Add vehicle
            </Button>
          </>
        }
      />
      {!docOk && (
        <Alert tone="warn" icon={AlertTriangle} title="Business documents not verified yet" action={<Button size="sm" variant="secondary" to="/dealer/documents">Review documents</Button>}>
          Your listings can go live, but they won't show the "Documents verified" badge until we verify your business certificate.
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Total listings" value={s.mine.length} icon={Car} sub={`${s.mine.filter((v) => v.status === 'sold').length} sold`} />
        <KpiCard label="Active (live)" value={s.live.length} icon={Radio} tone="green" trend={12} sub="vs last month" />
        <KpiCard label="Pending verification" value={s.pendingVerification} icon={Clock} tone="amber" sub="live, docs in review" />
        <KpiCard label="Enquiries" value={s.enq.length} icon={Inbox} trend={8} sub={`${s.newEnq} new`} />
        <KpiCard label="Listing expenses" value={tzsShort(s.spend)} icon={Wallet} tone="dark" sub="all time, incl. GST" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Section title="Views and enquiries" description="Last 8 weeks across all live listings · enquiries on the right axis">
          <AreaTrend data={s.weekly} series={[{ key: 'views', name: 'Listing views' }, { key: 'enquiries', name: 'Enquiries', axis: 'right', color: '#1A9C8C' }]} />
        </Section>
        <Section title="Top listings by views" description="Your six most-viewed live cars">
          <Bars data={s.perf} layout="vertical" series={[{ key: 'views', name: 'Views' }]} height={260} />
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AttentionList items={s.attention} base="/dealer" />
        <Section title="Recent activity" bodyClass="p-0" className={s.attention.length ? '' : 'xl:col-span-2'}>
          <ul className="divide-y divide-mist-100">
            {activity.map((a) => (
              <li key={a.id}>
                <Link to={a.to} className="flex items-center gap-3 px-5 py-3 hover:bg-mist-50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist-100 text-mist-600">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-ink-800">{a.text}</p>
                  <span className="shrink-0 text-[12px] text-mist-500">{ago(a.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Stock value" description="Asking price of live listings">
        <p className="font-display text-3xl font-bold num">{tzs(s.live.reduce((t, v) => t + v.price, 0))}</p>
        <p className="mt-1 text-sm text-mist-500">
          across {s.live.length} live vehicles · average {tzs(s.live.length ? s.live.reduce((t, v) => t + v.price, 0) / s.live.length : 0)}
        </p>
      </Section>
    </div>
  );
}
