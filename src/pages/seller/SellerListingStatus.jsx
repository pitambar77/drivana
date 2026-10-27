import { useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, LifeBuoy, Pencil, Search, ShieldX, XCircle } from 'lucide-react';
import { useStore, ACTIVE_STATUSES } from '../../store/AppStore';
import { Alert, Button, ConfirmDialog, EmptyState, Field, Input, MockNotice, PageHeader, Plate, Section, StatusBadge, VerificationBadge, useToast } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { SITE } from '../../config/site';
import { date, normId } from '../../utils/format';

function Check({ ok, warn, title, detail }) {
  const Icon = ok ? CheckCircle2 : warn ? CircleAlert : XCircle;
  return (
    <li className="flex gap-3 px-5 py-3.5">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ok ? 'text-ok-600' : warn ? 'text-warn-600' : 'text-bad-600'}`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        {detail && <p className="text-[13px] text-mist-600">{detail}</p>}
      </div>
    </li>
  );
}

export default function SellerListingStatus() {
  const { state, me, findDuplicates, deleteListing } = useStore();
  const toast = useToast();
  const mine = state.vehicles.filter((v) => v.sellerId === me.id);
  const active = mine.find((v) => ACTIVE_STATUSES.includes(v.status));
  const blocked = mine.filter((v) => v.status === 'blocked_duplicate');
  const idDoc = state.documents.find((d) => d.userId === me.id && d.type === 'personal_id');
  const [probe, setProbe] = useState({ reg: '', vin: '' });
  const [probeRes, setProbeRes] = useState(null);
  const [del, setDel] = useState(null);

  const activeDups = useMemo(() => (active ? findDuplicates(active, active.id) : []), [active, findDuplicates]);

  return (
    <div className="space-y-6">
      <PageHeader title="Listing status" description="Every check your listing must pass before it goes live, and what to do if one fails." />

      {active ? (
        <Section title="Current listing" bodyClass="p-0">
          <div className="flex flex-wrap items-center gap-4 border-b border-mist-100 px-5 py-4">
            <CarImage vehicle={active} view="side" className="h-14 w-24 rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{vehicleTitle(active)}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Plate value={active.regNumber} size="sm" />
                <StatusBadge status={active.status} />
                <VerificationBadge status={active.verification} size="sm" />
              </div>
            </div>
          </div>
          <ul className="divide-y divide-mist-100">
            <Check ok title="Required details complete" detail="Make, model, price, kilometres, registration and VIN are all filled in." />
            <Check ok={!activeDups.length} title={activeDups.length ? 'Duplicate found' : 'No duplicate found'} detail={activeDups.length ? `Matches ${activeDups[0].title} on ${activeDups[0].matchedOn.join(' & ')}.` : 'No other active listing uses this registration number or VIN.'} />
            <Check ok={active.paymentStatus === 'paid'} warn={active.paymentStatus !== 'paid'} title={active.paymentStatus === 'paid' ? 'Listing fee paid' : 'Listing fee not paid'} detail={active.paymentStatus === 'paid' ? 'Payment confirmed by the gateway.' : 'The listing goes live automatically once payment succeeds.'} />
            <Check ok={!!idDoc} warn={!idDoc} title={idDoc ? 'Identity document uploaded' : 'Identity document missing'} detail={idDoc ? `Status: ${idDoc.status}. Review happens after publishing.` : 'Upload your ID before paying.'} />
            <Check ok={active.status === 'live'} warn={active.status !== 'live'} title={active.status === 'live' ? `Live since ${date(active.publishedAt)}` : 'Not live yet'} detail={active.status === 'live' ? '"Live" means buyers can see it. Document verification is a separate step.' : 'Complete the steps above to publish.'} />
          </ul>
        </Section>
      ) : (
        <EmptyState title="No active listing" message="Once you list a car, its publication checks appear here." action={<Button to="/seller/vehicle">List my car</Button>} />
      )}

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <ShieldX className="h-5 w-5 text-bad-600" /> Blocked publications
        </h2>
        {blocked.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Nothing blocked" message="None of your listing attempts were blocked as duplicates." />
        ) : (
          <div className="space-y-4">
            {blocked.map((b) => {
              const reasons = (b.duplicateOf || []).map((id) => state.vehicles.find((x) => x.id === id)).filter(Boolean);
              return (
                <div key={b.id} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center gap-4 border-b border-mist-100 bg-bad-50/40 px-5 py-4">
                    <CarImage vehicle={b} view="side" className="h-14 w-24 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{vehicleTitle(b)}</p>
                      <p className="text-[13px] text-mist-600">
                        Attempted {date(b.createdAt)} · {b.id.toUpperCase()}
                      </p>
                    </div>
                    <StatusBadge status="blocked_duplicate" />
                  </div>
                  <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-wide text-mist-500">Why it was blocked</p>
                      <ul className="mt-2 space-y-2 text-sm text-ink-800">
                        {normId(reasons[0]?.regNumber) === normId(b.regNumber) && b.regNumber && (
                          <li className="flex flex-wrap items-center gap-2">
                            <XCircle className="h-4 w-4 text-bad-600" /> Registration <Plate value={b.regNumber} size="sm" /> is already in an active listing
                          </li>
                        )}
                        {reasons.some((r) => r.vin === b.vin) && (
                          <li className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-bad-600" /> VIN ending <span className="font-mono">{b.vin.slice(-5)}</span> is already in an active listing
                          </li>
                        )}
                        <li className="text-[13px] text-mist-600">The other listing is by {reasons[0]?.sellerRole === 'dealer' ? 'a dealer' : 'another seller'} in {reasons[0]?.city}. For privacy we don't show who.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-wide text-mist-500">Suggested fixes</p>
                      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-mist-700">
                        <li>Compare the registration number and VIN letter by letter with your RC. A typo is the most common cause.</li>
                        <li>If you previously sold or traded in this car, the buyer or dealer may have listed it. It can't be listed twice.</li>
                        <li>If the car is yours and still with you, contact support with a photo of the RC. We'll review the other listing.</li>
                      </ol>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 border-t border-mist-100 bg-mist-50/60 px-5 py-3">
                    <Button variant="ghost" className="text-bad-600" onClick={() => setDel(b)}>
                      Discard attempt
                    </Button>
                    <Button variant="secondary" icon={LifeBuoy} to="/support">
                      Contact support
                    </Button>
                    {!active && (
                      <Button icon={Pencil} to="/seller/vehicle">
                        Correct & resubmit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Section title="Check before you list" description="See whether a registration number or VIN is already in an active listing.">
        <form
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setProbeRes(findDuplicates({ regNumber: normId(probe.reg), vin: probe.vin.toUpperCase() }));
          }}
        >
          <Field label="Registration number" htmlFor="probe-reg">
            <Input id="probe-reg" value={probe.reg} onChange={(e) => setProbe({ ...probe, reg: e.target.value })} className="font-mono uppercase" placeholder="OD 02 AB 1234" />
          </Field>
          <Field label="VIN / chassis" htmlFor="probe-vin">
            <Input id="probe-vin" value={probe.vin} onChange={(e) => setProbe({ ...probe, vin: e.target.value })} className="font-mono uppercase" maxLength={17} />
          </Field>
          <Button type="submit" icon={Search} disabled={!probe.reg && !probe.vin}>
            Check
          </Button>
        </form>
        {probeRes && (
          <div className="mt-4">
            {probeRes.length ? (
              <Alert tone="error" title="Already listed">
                An active listing ({probeRes[0].title}, {probeRes[0].city}) uses this {probeRes[0].matchedOn.join(' and ')}. Publishing would be blocked.
              </Alert>
            ) : (
              <Alert tone="success" title="Not found in active listings">
                You can list a car with these identifiers.
              </Alert>
            )}
          </div>
        )}
        <MockNotice className="mt-4">Checks only Drivana's own listings — not government records.</MockNotice>
      </Section>

      <Alert tone="info" icon={LifeBuoy} title="Still stuck?">
        Call {SITE.supportPhone} ({SITE.supportHours}) or write to {SITE.supportEmail} with your listing ID.
      </Alert>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        tone="danger"
        title="Discard this blocked attempt?"
        message="It's removed from your account. No fee was charged for it."
        confirmLabel="Discard"
        onConfirm={() => {
          deleteListing(del.id);
          toast('Blocked attempt discarded.', { tone: 'info' });
        }}
      />
    </div>
  );
}
