import { useState } from 'react';
import { CalendarClock, CheckCheck, CheckCircle2, CircleAlert, Eye, Inbox, Pencil, Plus, ShieldCheck } from 'lucide-react';
import { useStore, ACTIVE_STATUSES } from '../../store/AppStore';
import { Alert, Button, ConfirmDialog, EmptyState, KpiCard, PageHeader, Plate, Section, StatusBadge, VerificationBadge, useToast } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { EnquiryInbox } from '../../components/listings/EnquiryInbox';
import { AttentionList } from '../dealer/DealerDashboard';
import { date, km, lakh, num } from '../../utils/format';

export default function SellerDashboard() {
  const { state, me, setListingStatus } = useStore();
  const toast = useToast();
  const [sold, setSold] = useState(false);
  const mine = state.vehicles.filter((v) => v.sellerId === me.id);
  const active = mine.find((v) => ACTIVE_STATUSES.includes(v.status));
  const blocked = mine.filter((v) => v.status === 'blocked_duplicate');
  const enq = state.enquiries.filter((e) => e.sellerId === me.id);
  const idDoc = state.documents.find((d) => d.userId === me.id && d.type === 'personal_id');

  return (
    <div className="space-y-6">
      <PageHeader title={`Hi ${me.name.split(' ')[0]}`} description="Private seller accounts have one active listing. Here's where yours stands." />

      {!active ? (
        <EmptyState
          icon={Plus}
          title="You don't have an active listing"
          message="Add your car's details, pay the listing fee and it goes live straight away."
          action={<Button to="/seller/vehicle" icon={Plus}>List my car</Button>}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="card overflow-hidden">
            <div className="grid md:grid-cols-[1.1fr_1fr]">
              <CarImage vehicle={active} view="side" className="aspect-[16/10] w-full md:h-full" />
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-mist-500">Your vehicle · {active.id.toUpperCase()}</p>
                  <h2 className="mt-1 text-xl font-bold">{vehicleTitle(active)}</h2>
                  <p className="text-sm text-mist-500">
                    {active.variant} · {km(active.mileage)} · {active.fuel}
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold num">{lakh(active.price)}</p>
                </div>
                <Plate value={active.regNumber} />
                <dl className="grid grid-cols-2 gap-2 rounded-lg bg-mist-50 p-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-[11.5px] text-mist-500">Listing</dt>
                    <dd className="mt-1">
                      <StatusBadge status={active.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11.5px] text-mist-500">Payment</dt>
                    <dd className="mt-1">
                      <StatusBadge status={active.paymentStatus} />
                    </dd>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <dt className="text-[11.5px] text-mist-500">Documents</dt>
                    <dd className="mt-1">
                      <VerificationBadge status={active.verification} size="sm" />
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  {active.status === 'live' ? (
                    <>
                      <Button size="sm" variant="secondary" icon={Eye} to={`/cars/${active.id}`}>
                        View
                      </Button>
                      <Button size="sm" variant="secondary" icon={Pencil} to="/seller/vehicle">
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" icon={CheckCheck} onClick={() => setSold(true)}>
                        Mark sold
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" to={`/checkout/${active.id}`}>
                        Pay & publish
                      </Button>
                      <Button size="sm" variant="secondary" icon={Pencil} to="/seller/vehicle">
                        Edit details
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <KpiCard label="Views" value={num(active.views)} icon={Eye} />
              <KpiCard label="Enquiries" value={enq.length} icon={Inbox} sub={`${enq.filter((e) => e.status === 'new').length} new`} />
            </div>
            <Section title="Publication checklist">
              <ul className="space-y-3 text-sm">
                {[
                  [true, 'Vehicle details complete'],
                  [active.paymentStatus === 'paid', active.paymentStatus === 'paid' ? 'Listing fee paid' : 'Listing fee not paid'],
                  [!!idDoc, idDoc ? 'Identity document uploaded' : 'Identity document missing'],
                  [active.verification === 'verified', active.verification === 'verified' ? 'Documents verified by AutoDealer' : 'Document verification in progress (listing can be live meanwhile)'],
                ].map(([ok, t]) => (
                  <li key={t} className="flex gap-2.5">
                    {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn-600" />}
                    <span className={ok ? 'text-ink-800' : 'text-mist-600'}>{t}</span>
                  </li>
                ))}
              </ul>
              {active.expiresAt && active.status === 'live' && (
                <p className="mt-4 flex items-center gap-2 border-t border-mist-100 pt-3 text-[13px] text-mist-600">
                  <CalendarClock className="h-4 w-4" /> Listed until {date(active.expiresAt)}
                </p>
              )}
            </Section>
            <Section title="Identity verification">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-mist-400" /> Your ID
                </span>
                <StatusBadge status={idDoc?.status || 'not_submitted'} />
              </div>
              <Button size="sm" variant="secondary" className="mt-3" to="/seller/identity">
                {idDoc ? 'Manage ID documents' : 'Upload ID'}
              </Button>
            </Section>
          </div>
        </div>
      )}

      {blocked.length > 0 && (
        <Alert tone="error" title={`${blocked.length} earlier listing attempt${blocked.length > 1 ? ' was' : ' was'} blocked as a duplicate`} action={<Button size="sm" variant="secondary" to="/seller/listing-status">See why</Button>}>
          Blocked attempts don't count as your active listing.
        </Alert>
      )}
      {active && active.status !== 'live' && <AttentionList items={[active]} base="/seller" />}

      <div>
        <h2 className="mb-3 text-lg font-bold">Enquiries</h2>
        <EnquiryInbox showVehicleFilter={false} />
      </div>

      <ConfirmDialog
        open={sold}
        onClose={() => setSold(false)}
        title="Mark your car as sold?"
        message="The listing leaves search results and your listing slot frees up for another car."
        confirmLabel="Mark as sold"
        onConfirm={() => {
          setListingStatus(active.id, 'sold');
          toast('Marked as sold. You can list another car now.');
        }}
      />
    </div>
  );
}
