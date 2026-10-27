import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, CircleDot, Clock, Handshake, Scale, UserRound } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Button, EmptyState, Field, Input, PageHeader, Select, StatusBadge, Textarea, useToast } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { handoverProgress, ProgressBar } from './AgentDashboard';
import { cn, dateTime } from '../../utils/format';

const STEP_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'issue', label: 'Issue' },
];
const ICON = { pending: Clock, in_progress: CircleDot, completed: Check, issue: AlertTriangle };
const DOT = { pending: 'bg-mist-200 text-mist-500', in_progress: 'bg-accent-600 text-white', completed: 'bg-ok-600 text-white', issue: 'bg-bad-600 text-white' };
const PARTY = { owner: 'Owner', agent: 'Agent', buyer: 'Buyer' };

function Party({ icon: Icon, role, name, active }) {
  return (
    <div className={cn('flex min-w-0 flex-1 flex-col items-center gap-2 rounded-xl border p-3 text-center', active ? 'border-accent-300 bg-accent-50' : 'border-mist-200 bg-white')}>
      <span className={cn('flex h-10 w-10 items-center justify-center rounded-full', active ? 'bg-accent-600 text-white' : 'bg-mist-100 text-ink-800')}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-mist-500">{role}</p>
        <p className="truncate text-sm font-semibold text-ink-900">{name || 'Not yet identified'}</p>
      </div>
    </div>
  );
}

export default function AgentHandover() {
  const { state, me, updateHandoverStep, setHandoverBuyer, ensureHandover } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const vehicles = state.vehicles.filter((v) => v.sellerId === me.id && !['removed', 'draft', 'blocked_duplicate'].includes(v.status));
  const sel = params.get('v') || vehicles[0]?.id;
  const v = vehicles.find((x) => x.id === sel);
  const h = state.handovers.find((x) => x.vehicleId === sel);
  const [notes, setNotes] = useState({});
  const [buyer, setBuyer] = useState('');

  useEffect(() => {
    if (v && !h) ensureHandover(v.id);
  }, [v, h, ensureHandover]);
  useEffect(() => setBuyer(h?.buyerName || ''), [h?.id, h?.buyerName]);

  const progress = useMemo(() => handoverProgress(h), [h]);
  const stage = !h ? 'owner' : h.steps.find((s) => s.status !== 'completed')?.party || 'buyer';

  if (!vehicles.length) {
    return (
      <div>
        <PageHeader title="Handover tracking" />
        <EmptyState icon={Handshake} title="No vehicles to track yet" message="Once you list an owner's car, its handover timeline appears here." action={<Button to="/agent/vehicles/new">Add a vehicle</Button>} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ownership & handover tracking" description="Track each car from the owner, through you, to the buyer." />
      <Alert tone="info" icon={Scale} title="This tracks progress, it does not transfer ownership">
        Legal transfer of ownership happens at the RTO (Form 29/30) between the owner and the buyer. Drivana only records the steps you mark here.
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="card h-fit overflow-hidden">
          <p className="border-b border-mist-100 px-4 py-3 text-sm font-bold">Your vehicles</p>
          <ul className="max-h-[560px] divide-y divide-mist-100 overflow-y-auto">
            {vehicles.map((x) => {
              const hx = state.handovers.find((y) => y.vehicleId === x.id);
              const p = handoverProgress(hx);
              return (
                <li key={x.id}>
                  <button type="button" onClick={() => setParams({ v: x.id }, { replace: true })} className={cn('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-mist-50', sel === x.id && 'bg-accent-50/60')}>
                    <CarImage vehicle={x} view="side" className="h-10 w-16 shrink-0 rounded" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{vehicleTitle(x)}</p>
                      <ProgressBar value={p.done} total={p.total} issue={p.issue} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {v && h && (
          <div className="min-w-0 space-y-5">
            <div className="card p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{vehicleTitle(v)}</p>
                  <p className="text-[13px] text-mist-500">
                    {v.variant} · {v.id.toUpperCase()}
                  </p>
                </div>
                <StatusBadge status={progress.issue ? 'issue' : progress.done === progress.total ? 'completed' : 'in_progress'} />
              </div>
              <div className="flex items-stretch gap-2">
                <Party icon={UserRound} role="Owner" name={v.ownerInfo?.name} active={stage === 'owner'} />
                <ArrowRight className="h-5 w-5 shrink-0 self-center text-mist-400" />
                <Party icon={Handshake} role="Agent (you)" name={me.name} active={stage === 'agent'} />
                <ArrowRight className="h-5 w-5 shrink-0 self-center text-mist-400" />
                <Party icon={UserRound} role="Buyer" name={h.buyerName} active={stage === 'buyer'} />
              </div>
              <form
                className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  setHandoverBuyer(h.id, buyer.trim());
                  toast(buyer.trim() ? 'Buyer saved.' : 'Buyer cleared.', { tone: 'info' });
                }}
              >
                <Field label="Buyer name" htmlFor="ho-buyer" className="flex-1">
                  <Input id="ho-buyer" value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="Add once a buyer is confirmed" />
                </Field>
                <Button type="submit" variant="secondary">
                  Save buyer
                </Button>
              </form>
            </div>

            <div className="card p-5">
              <h2 className="mb-4 text-[15px] font-bold">Timeline</h2>
              <ol className="relative">
                {h.steps.map((st, i) => {
                  const Icon = ICON[st.status];
                  return (
                    <li key={st.key} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < h.steps.length - 1 && <span className={cn('absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5', st.status === 'completed' ? 'bg-ok-600' : 'bg-mist-200')} />}
                      <span className={cn('relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full', DOT[st.status])}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-900">{st.label}</p>
                            <p className="text-[12.5px] text-mist-500">
                              {PARTY[st.party]} step{st.updatedAt ? ` · updated ${dateTime(st.updatedAt)}` : ''}
                            </p>
                          </div>
                          <Select
                            aria-label={`Status for ${st.label}`}
                            value={st.status}
                            onChange={(e) => {
                              updateHandoverStep(h.id, st.key, { status: e.target.value });
                              toast(`"${st.label}" marked ${STEP_STATUS.find((x) => x.value === e.target.value).label.toLowerCase()}.`, { tone: e.target.value === 'issue' ? 'warn' : 'success' });
                            }}
                            options={STEP_STATUS}
                            className="w-[150px]"
                          />
                        </div>
                        {st.note && notes[st.key] === undefined && (
                          <p className={cn('mt-2 rounded-lg px-3 py-2 text-[13px]', st.status === 'issue' ? 'bg-bad-50 text-bad-700' : 'bg-mist-50 text-mist-700')}>{st.note}</p>
                        )}
                        {notes[st.key] !== undefined ? (
                          <div className="mt-2 space-y-2">
                            <Textarea rows={2} value={notes[st.key]} onChange={(e) => setNotes({ ...notes, [st.key]: e.target.value })} aria-label="Note" placeholder="What happened, what's blocking, who's responsible" />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  updateHandoverStep(h.id, st.key, { note: notes[st.key].trim() });
                                  const { [st.key]: _omit, ...rest } = notes;
                                  setNotes(rest);
                                  toast('Note saved.', { tone: 'info' });
                                }}
                              >
                                Save note
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const { [st.key]: _omit, ...rest } = notes;
                                  setNotes(rest);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setNotes({ ...notes, [st.key]: st.note || '' })} className="mt-1.5 text-[12.5px] font-semibold text-accent-700 hover:underline">
                            {st.note ? 'Edit note' : 'Add note'}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
