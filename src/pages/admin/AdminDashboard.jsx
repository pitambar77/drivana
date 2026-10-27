import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, BadgeIndianRupee, Car, CircleDashed, CreditCard, Landmark, Radio, Users } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Badge, Button, KpiCard, PageHeader, Section } from '../../components/ui';
import { AreaTrend, Bars, Donut, LegendList, Lines, bucket, CHART } from '../../components/charts/Charts';
import { ago, inr, lakh, num } from '../../utils/format';

export default function AdminDashboard() {
  const { state } = useStore();
  const d = useMemo(() => {
    const users = state.users.filter((u) => u.role !== 'admin');
    const byRole = ['dealer', 'seller', 'agent', 'buyer'].map((r, i) => ({ label: { dealer: 'Dealers', seller: 'Private sellers', agent: 'Agents', buyer: 'Buyers' }[r], value: users.filter((u) => u.role === r).length, color: [CHART.navy, CHART.blue, CHART.teal, CHART.amber][i] }));
    const v = state.vehicles;
    const pays = state.payments;
    const ok = pays.filter((p) => p.status === 'success');
    const listingsTrend = bucket(v, { getDate: (x) => x.createdAt, n: 8, unit: 'week', reducers: { created: (l) => l.length, published: (l) => l.filter((x) => x.publishedAt).length } });
    const regTrend = bucket(users, {
      getDate: (u) => u.registeredAt,
      n: 6,
      unit: 'month',
      reducers: { dealer: (l) => l.filter((u) => u.role === 'dealer').length, seller: (l) => l.filter((u) => u.role === 'seller').length, agent: (l) => l.filter((u) => u.role === 'agent').length, buyer: (l) => l.filter((u) => u.role === 'buyer').length },
    });
    const revTrend = bucket(ok, { getDate: (p) => p.createdAt, n: 8, unit: 'week', reducers: { revenue: (l) => l.reduce((s, p) => s + p.amount, 0) } });
    return {
      users,
      byRole,
      total: v.length,
      live: v.filter((x) => x.status === 'live').length,
      unverified: v.filter((x) => x.status === 'live' && x.verification !== 'verified').length,
      flagged: v.filter((x) => x.verification === 'flagged' || x.status === 'blocked_duplicate' || x.status === 'suspended').length,
      revenue: ok.reduce((s, p) => s + p.amount, 0),
      gst: ok.reduce((s, p) => s + p.gst, 0),
      payStats: ['success', 'failed', 'cancelled', 'pending'].map((s, i) => ({ label: { success: 'Successful', failed: 'Failed', cancelled: 'Cancelled', pending: 'Pending' }[s], value: pays.filter((p) => p.status === s).length, color: [CHART.teal, CHART.rose, CHART.grey, CHART.amber][i] })),
      commission: state.referrals.reduce((s, r) => s + r.commission, 0),
      pipeline: state.referrals.filter((r) => ['referred', 'application', 'sanctioned'].includes(r.status)).reduce((s, r) => s + r.expectedCommission, 0),
      listingsTrend,
      regTrend,
      revTrend,
      pendingDocs: state.documents.filter((x) => x.status === 'pending').length,
    };
  }, [state]);

  const successRate = Math.round((d.payStats[0].value / Math.max(1, d.payStats.reduce((s, x) => s + x.value, 0))) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Users, listings, verification backlog and revenue."
        actions={
          <>
            <Button variant="secondary" to="/admin/documents">
              Review documents ({d.pendingDocs})
            </Button>
            <Button to="/admin/reports">Open reports</Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total users" value={num(d.users.length)} icon={Users} trend={9} sub="vs last month" />
        <KpiCard label="Listings (total / live)" value={`${d.total} / ${d.live}`} icon={Car} />
        <KpiCard label="Live but unverified" value={d.unverified} icon={CircleDashed} tone="amber" sub="awaiting document review" />
        <KpiCard label="Flagged & blocked" value={d.flagged} icon={AlertOctagon} tone="red" sub="needs moderation" />
        <KpiCard label="Listing-fee revenue" value={lakh(d.revenue)} icon={BadgeIndianRupee} tone="green" sub={`+ ${inr(d.gst)} GST collected`} />
        <KpiCard label="Payment success rate" value={`${successRate}%`} icon={CreditCard} sub={`${d.payStats[1].value} failed · ${d.payStats[3].value} pending`} />
        <KpiCard label="Loan commissions earned" value={inr(d.commission)} icon={Landmark} tone="dark" sub="disbursed referrals" />
        <KpiCard label="Commission pipeline" value={inr(d.pipeline)} icon={Radio} sub="if open referrals disburse" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Section title="Listings created vs published" description="Last 8 weeks">
          <AreaTrend data={d.listingsTrend} series={[{ key: 'created', name: 'Created' }, { key: 'published', name: 'Published (paid)', color: CHART.teal }]} />
        </Section>
        <Section title="Users by role">
          <Donut data={d.byRole} height={180} centerValue={d.users.length} centerLabel="users" />
          <div className="mt-4">
            <LegendList data={d.byRole} />
          </div>
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Registrations by role" description="Last 6 months">
          <Bars stacked data={d.regTrend} series={[{ key: 'dealer', name: 'Dealers', color: CHART.navy }, { key: 'seller', name: 'Sellers', color: CHART.blue }, { key: 'agent', name: 'Agents', color: CHART.teal }, { key: 'buyer', name: 'Buyers', color: CHART.amber }]} />
        </Section>
        <Section title="Listing-fee revenue" description="Excl. GST, last 8 weeks">
          <Lines money data={d.revTrend} series={[{ key: 'revenue', name: 'Revenue' }]} />
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Section title="Payment outcomes">
          <LegendList data={d.payStats} />
        </Section>
        <Section title="Recent activity" bodyClass="p-0" actions={<Button size="sm" variant="ghost" to="/admin/reports">All activity</Button>}>
          <ul className="divide-y divide-mist-100">
            {state.audit.slice(0, 7).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <Badge tone={a.actorRole === 'admin' ? 'dark' : a.actorRole === 'system' ? 'amber' : 'neutral'} className="hidden w-16 justify-center sm:inline-flex">{a.actorRole === 'admin' ? 'Admin' : a.actorRole === 'system' ? 'System' : 'User'}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-semibold">{a.actor}</span> · {a.action}{' '}
                    {a.entityType === 'listing' ? (
                      <Link to={`/admin/listings/${a.entityId}`} className="font-mono text-[12.5px] text-accent-700 hover:underline">
                        {a.entityId}
                      </Link>
                    ) : (
                      <span className="font-mono text-[12.5px] text-mist-600">{a.entityId}</span>
                    )}
                  </p>
                  {a.note && <p className="truncate text-[12.5px] text-mist-500">{a.note}</p>}
                </div>
                <span className="shrink-0 text-[12px] text-mist-500">{ago(a.at)}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
