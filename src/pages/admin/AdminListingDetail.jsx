import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, CircleDashed, Copy, ExternalLink, Flag, History, MessageSquarePlus, PauseCircle, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Avatar, Badge, Button, ConfirmDialog, DL, EmptyState, Modal, PageHeader, Plate, Section, StatusBadge, Textarea, VerificationBadge, useToast } from '../../components/ui';
import { CarImage, GALLERY_VIEWS } from '../../components/vehicle/CarArt';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { DocPreview } from '../../components/documents/DocumentCard';
import { DuplicateReview, MOD } from './AdminListings';
import { ROLE_META } from '../../config/site';
import { dateTime, tzs, km, num } from '../../utils/format';

export default function AdminListingDetail() {
  const { id } = useParams();
  const { state, vehicle, user, moderateListing, addNote } = useStore();
  const toast = useToast();
  const [act, setAct] = useState(null);
  const [note, setNote] = useState('');
  const [noteErr, setNoteErr] = useState('');
  const [doc, setDoc] = useState(null);
  const [dup, setDup] = useState(false);
  const v = vehicle(id);
  if (!v) return <EmptyState title="Listing not found" message={`No listing with ID ${id}.`} action={<Button to="/admin/listings">All listings</Button>} />;
  const seller = user(v.sellerId);
  const docs = state.documents.filter((d) => d.userId === v.sellerId);
  const history = state.audit.filter((a) => a.entityId === v.id || (a.entityType === 'user' && a.entityId === v.sellerId)).sort((a, b) => new Date(b.at) - new Date(a.at));
  const adminHistory = history.filter((a) => a.actorRole === 'admin');
  const notes = state.notes.filter((n) => n.listingId === v.id);
  const pays = state.payments.filter((p) => p.listingId === v.id);
  const enquiries = state.enquiries.filter((e) => e.vehicleId === v.id).length;

  const ALL = { ...MOD, verify: { label: 'Mark verified', tone: 'primary', msg: 'Adds the "Documents verified" badge to this listing. Make sure the seller documents and RC details check out.', confirm: 'Mark verified', done: 'Listing marked verified' }, unverify: { label: 'Clear verification', tone: 'primary', msg: 'Removes the verified badge and returns the listing to "Not yet verified".', confirm: 'Clear verification', done: 'Verification cleared' } };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Listing ${v.id.toUpperCase()}`}
        title={vehicleTitle(v)}
        description={`${v.variant} · listed by ${seller?.business || seller?.agency || seller?.name} (${ROLE_META[v.sellerRole].label})`}
        actions={
          <>
            <Button variant="secondary" icon={ExternalLink} to={`/cars/${v.id}`}>
              Public page
            </Button>
            {v.status === 'blocked_duplicate' && (
              <Button variant="secondary" icon={Copy} onClick={() => setDup(true)}>
                Review duplicate
              </Button>
            )}
          </>
        }
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge status={v.status} prefix="Listing" />
          <StatusBadge status={v.paymentStatus === 'paid' ? 'success' : v.paymentStatus} prefix="Payment" />
          <VerificationBadge status={v.verification} />
        </div>
      </PageHeader>

      {v.status === 'live' && v.verification !== 'verified' && (
        <Alert tone="info" icon={CircleDashed} title="Live but not verified">
          This listing published automatically after payment. Review the seller's documents below, then mark it verified or flag it.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Section title="Moderation" description="Every action asks for a reason and is written to the audit trail.">
            <div className="flex flex-wrap gap-2">
              {v.verification !== 'verified' ? (
                <Button icon={BadgeCheck} onClick={() => setAct('verify')}>
                  Mark verified
                </Button>
              ) : (
                <Button variant="secondary" icon={ShieldCheck} onClick={() => setAct('unverify')}>
                  Clear verification
                </Button>
              )}
              {v.verification !== 'flagged' && (
                <Button variant="secondary" icon={Flag} className="text-warn-700" onClick={() => setAct('flag')}>
                  Flag
                </Button>
              )}
              {v.status === 'live' && (
                <Button variant="secondary" icon={PauseCircle} className="text-bad-600" onClick={() => setAct('suspend')}>
                  Suspend
                </Button>
              )}
              {['suspended', 'removed'].includes(v.status) && v.paymentStatus === 'paid' && (
                <Button variant="secondary" icon={RotateCcw} onClick={() => setAct('restore')}>
                  Restore
                </Button>
              )}
              {v.status !== 'removed' && (
                <Button variant="danger" icon={Trash2} onClick={() => setAct('remove')}>
                  Remove
                </Button>
              )}
            </div>
          </Section>

          <Section title="Listing information">
            <div className="mb-5 grid grid-cols-4 gap-2">
              {GALLERY_VIEWS.map((g, i) => (
                <CarImage key={g.view} vehicle={v} index={i} className="aspect-[4/3] w-full rounded-lg" />
              ))}
            </div>
            <DL
              cols={3}
              items={[
                ['Price', tzs(v.price)],
                ['Kilometres', km(v.mileage)],
                ['Year', v.year],
                ['Fuel / gearbox', `${v.fuel} · ${v.transmission}`],
                ['Condition', v.condition],
                ['Ownership', v.owners],
                ['Registration', <Plate key="p" value={v.regNumber} size="sm" />],
                ['VIN', <span key="vin" className="font-mono text-[12.5px]">{v.vin}</span>],
                ['Engine no.', <span key="e" className="font-mono text-[12.5px]">{v.engineNo}</span>],
                ['City', v.city],
                ['Views / enquiries', `${num(v.views)} / ${enquiries}`],
                ['Created', dateTime(v.createdAt)],
                ['Published', dateTime(v.publishedAt)],
                ['Expires', dateTime(v.expiresAt)],
                v.ownerInfo && ['Registered owner (agent listing)', `${v.ownerInfo.name} · ${v.ownerInfo.phone}`],
              ]}
            />
            <p className="mt-5 whitespace-pre-line rounded-lg bg-mist-50 p-3 text-sm text-mist-700">{v.description}</p>
            {v.modifications && <p className="mt-3 text-sm text-warn-700">Modifications: {v.modifications}</p>}
          </Section>

          <Section title="Payments for this listing" bodyClass="p-0">
            {pays.length ? (
              <ul className="divide-y divide-mist-100">
                {pays.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                    <span className="font-mono font-semibold">{p.id}</span>
                    <span className="text-mist-500">{dateTime(p.createdAt)}</span>
                    <span className="text-mist-500">{p.method}</span>
                    <span className="ml-auto font-semibold num">{tzs(p.total)}</span>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-5 text-sm text-mist-500">No payment attempts. This listing has never been live.</p>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Seller">
            <div className="flex items-center gap-3">
              <Avatar name={seller?.business || seller?.agency || seller?.name} size={40} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{seller?.business || seller?.agency || seller?.name}</p>
                <p className="text-[13px] text-mist-500">
                  {seller?.name} · <span className="font-mono">{seller?.phone}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={seller?.status} prefix="Account" />
              <StatusBadge status={seller?.docStatus} prefix="Docs" />
            </div>
            <Link to={`/admin/users?q=${encodeURIComponent(seller?.phone || '')}`} className="mt-3 inline-block text-[13px] font-semibold text-accent-700 hover:underline">
              Open in user directory →
            </Link>
          </Section>

          <Section title="Uploaded documents" bodyClass="p-0" actions={<Button size="sm" variant="ghost" to="/admin/documents">Queue</Button>}>
            <ul className="divide-y divide-mist-100">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{d.label}</p>
                    <p className="truncate font-mono text-[11.5px] text-mist-500">{d.fileName}</p>
                  </div>
                  <StatusBadge status={d.status} />
                  <Button size="sm" variant="ghost" onClick={() => setDoc(d)}>
                    View
                  </Button>
                </li>
              ))}
              {!docs.length && <li className="px-5 py-5 text-sm text-mist-500">The seller hasn't uploaded documents.</li>}
            </ul>
          </Section>

          <Section title="Moderation notes" description="Internal — never shown to the seller.">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (note.trim().length < 3) return setNoteErr('Write a note first.');
                addNote(v.id, note.trim());
                setNote('');
                setNoteErr('');
                toast('Note added.', { tone: 'info' });
              }}
              className="space-y-2"
            >
              <Textarea rows={2} value={note} onChange={(e) => { setNote(e.target.value); setNoteErr(''); }} placeholder="e.g. Called seller, RC photo requested" aria-label="New note" error={noteErr} />
              {noteErr && <p className="field-error">{noteErr}</p>}
              <div className="flex justify-end">
                <Button type="submit" size="sm" icon={MessageSquarePlus}>
                  Add note
                </Button>
              </div>
            </form>
            <ul className="mt-4 space-y-2.5">
              {notes.map((n) => (
                <li key={n.id} className="rounded-lg bg-warn-50/60 px-3 py-2 text-[13px]">
                  <p className="text-ink-800">{n.text}</p>
                  <p className="mt-0.5 text-[11.5px] text-mist-500">
                    {n.author} · {dateTime(n.at)}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={<span className="flex items-center gap-2"><History className="h-4 w-4" /> Activity history</span>} description={`${adminHistory.length} admin action${adminHistory.length === 1 ? '' : 's'}`}>
            {history.length ? (
              <ol className="relative space-y-4 border-l-2 border-mist-200 pl-5">
                {history.map((a) => (
                  <li key={a.id} className="relative">
                    <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${a.actorRole === 'admin' ? 'bg-ink-900' : a.actorRole === 'system' ? 'bg-warn-600' : 'bg-accent-500'}`} />
                    <p className="text-sm">
                      <span className="font-semibold">{a.action}</span>
                      {a.entityType === 'user' && <span className="text-mist-500"> (seller account)</span>}
                    </p>
                    <p className="text-[12px] text-mist-500">
                      <Badge tone={a.actorRole === 'admin' ? 'dark' : 'neutral'} className="mr-1.5 py-0 text-[10.5px]">
                        {a.actorRole}
                      </Badge>
                      {a.actor} · {dateTime(a.at)}
                    </p>
                    {a.note && <p className="mt-1 text-[13px] text-mist-700">{a.note}</p>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-mist-500">No recorded activity yet.</p>
            )}
          </Section>
        </div>
      </div>

      <ConfirmDialog
        open={!!act}
        onClose={() => setAct(null)}
        tone={act ? ALL[act].tone : 'primary'}
        withReason
        reasonRequired={!['restore', 'verify', 'unverify'].includes(act)}
        title={act ? `${ALL[act].label}?` : ''}
        message={act ? ALL[act].msg : ''}
        confirmLabel={act ? ALL[act].confirm : ''}
        onConfirm={(reason) => {
          moderateListing(v.id, act, reason);
          toast(`${ALL[act].done}.`, { tone: ['verify', 'restore'].includes(act) ? 'success' : 'warn' });
        }}
      />
      <Modal open={!!doc} onClose={() => setDoc(null)} title={doc?.label || ''} size="lg">
        {doc && <DocPreview doc={doc} user={seller} />}
      </Modal>
      <DuplicateReview listing={v} open={dup} onClose={() => setDup(false)} />
    </div>
  );
}
