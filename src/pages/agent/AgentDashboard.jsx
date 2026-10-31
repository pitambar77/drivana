import { Link } from 'react-router-dom';
import { Car, FileCheck2, Handshake, Inbox, Plus } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Avatar, Button, DataTable, KpiCard, PageHeader, Section, StatusBadge, VerificationBadge, Alert } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { useSellerStats, AttentionList } from '../dealer/DealerDashboard';
import { ago, tzs } from '../../utils/format';
import { vehiclePath } from '../../data/vehicleTypes';

export function handoverProgress(h) {
  if (!h) return { done: 0, total: 7, next: 'Not started', issue: false };
  const done = h.steps.filter((s) => s.status === 'completed').length;
  const issue = h.steps.find((s) => s.status === 'issue');
  const next = issue || h.steps.find((s) => s.status !== 'completed');
  return { done, total: h.steps.length, next: next ? next.label : 'Handover complete', issue: !!issue };
}

export function ProgressBar({ value, total, issue }) {
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist-200">
        <div className={`h-full rounded-full ${issue ? 'bg-bad-600' : value === total ? 'bg-ok-600' : 'bg-accent-600'}`} style={{ width: `${(value / total) * 100}%` }} />
      </div>
      <span className="text-[12px] font-semibold text-mist-600 num">
        {value}/{total}
      </span>
    </div>
  );
}

export default function AgentDashboard() {
  const { state, me } = useStore();
  const s = useSellerStats();
  const handovers = state.handovers.filter((h) => h.agentId === me.id);
  const inProgress = handovers.filter((h) => {
    const p = handoverProgress(h);
    return p.done > 0 && p.done < p.total;
  });
  const authDoc = state.documents.find((d) => d.userId === me.id && d.type === 'owner_authorization');
  const rows = s.mine.filter((v) => !['removed'].includes(v.status));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={me.agency}
        title="Agent dashboard"
        description="Cars you're selling for owners, their buyers, and where each handover stands."
        actions={
          <Button to="/agent/vehicles/new" icon={Plus}>
            Add owner's vehicle
          </Button>
        }
      />
      {state.config.agentAuthorizationRequired && !authDoc && (
        <Alert tone="warn" title="Owner authorisation required" action={<Button size="sm" variant="secondary" to="/agent/documents">Upload</Button>}>
          Current policy requires a signed owner authorisation before you can publish.
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Active listings" value={s.live.length} icon={Car} tone="green" sub={`${s.mine.length} total`} />
        <KpiCard label="Enquiries" value={s.enq.length} icon={Inbox} sub={`${s.newEnq} new`} />
        <KpiCard label="Your verification" value={<StatusBadge status={me.docStatus} />} icon={FileCheck2} tone="amber" sub={authDoc ? `Authorisation: ${authDoc.status}` : 'Authorisation not uploaded'} />
        <KpiCard label="Handovers in progress" value={inProgress.length} icon={Handshake} tone="dark" sub={`${handovers.filter((h) => handoverProgress(h).issue).length} with issues`} />
      </div>

      <Section title="Vehicles you're selling" description="Owner details are private to you and AutoDealer's verification team." bodyClass="p-0" actions={<Button size="sm" variant="secondary" to="/agent/listings">Manage listings</Button>}>
        <DataTable
          rows={rows}
          pageSize={6}
          columns={[
            {
              key: 'v',
              header: 'Vehicle',
              render: (v) => (
                <div className="flex min-w-[220px] items-center gap-3">
                  <CarImage vehicle={v} view="side" className="h-11 w-[72px] shrink-0 rounded" />
                  <div className="min-w-0">
                    <Link to={`${vehiclePath(v)}`} className="block truncate font-semibold hover:text-accent-700">
                      {vehicleTitle(v)}
                    </Link>
                    <p className="text-[12.5px] text-mist-500">{tzs(v.price)}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'owner',
              header: 'Owner',
              render: (v) => (
                <div className="min-w-[150px]">
                  <p className="text-sm font-semibold">{v.ownerInfo?.name || '—'}</p>
                  <p className="font-mono text-[12px] text-mist-500">{v.ownerInfo?.phone}</p>
                </div>
              ),
            },
            { key: 'status', header: 'Listing', render: (v) => <StatusBadge status={v.status} /> },
            { key: 'ver', header: 'Documents', render: (v) => <VerificationBadge status={v.verification} size="sm" /> },
            {
              key: 'handover',
              header: 'Handover',
              render: (v) => {
                const h = handovers.find((x) => x.vehicleId === v.id);
                const p = handoverProgress(h);
                return (
                  <Link to={`/agent/handover?v=${v.id}`} className="block min-w-[170px] hover:opacity-80">
                    <ProgressBar value={p.done} total={p.total} issue={p.issue} />
                    <p className={`mt-1 truncate text-[12px] ${p.issue ? 'font-semibold text-bad-600' : 'text-mist-500'}`}>{p.issue ? `Issue: ${p.next}` : `Next: ${p.next}`}</p>
                  </Link>
                );
              },
            },
          ]}
        />
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Latest enquiries" bodyClass="p-0" actions={<Button size="sm" variant="ghost" to="/agent/listings?tab=enquiries">View all</Button>}>
          <ul className="divide-y divide-mist-100">
            {s.enq.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={e.buyerName} size={32} tone="mist" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.buyerName}</p>
                  <p className="truncate text-[12.5px] text-mist-500">{e.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={e.status} />
                  <span className="text-[11.5px] text-mist-500">{ago(e.createdAt)}</span>
                </div>
              </li>
            ))}
            {s.enq.length === 0 && <li className="px-5 py-8 text-center text-sm text-mist-500">No enquiries yet.</li>}
          </ul>
        </Section>
        <AttentionList items={s.attention} base="/agent" />
      </div>
    </div>
  );
}
