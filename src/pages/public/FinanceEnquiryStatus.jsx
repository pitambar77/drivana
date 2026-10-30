// Confirmation + live tracker for a finance enquiry from the loan calculator.
// Route: /finance-enquiry/:id   — shows who was notified and how far the bank has got.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Bell, Building2, Calculator, CheckCircle2, Circle, FileText, Landmark, Mail, MessageSquare, Monitor, Phone, Smartphone, XCircle } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Avatar, Breadcrumbs, Button, CopyText, EmptyState } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { LOAN_STEPS, bankInfo } from '../../data/partnerBanks';
import { sellerDisplayName } from '../../utils/finance';
import { sellerPath } from './SellerListings';
import { cn, dateTime, tzs } from '../../utils/format';

const CHANNEL_ICON = { Dashboard: Monitor, SMS: Smartphone, Email: Mail, 'Lead desk': Landmark };

function Channels({ list }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {list.map((c) => {
        const Icon = CHANNEL_ICON[c] || Bell;
        return (
          <li key={c} className="inline-flex items-center gap-1 rounded-full bg-ok-50 px-2.5 py-1 text-[12px] font-semibold text-ok-700">
            <Icon className="h-3.5 w-3.5" /> {c} <CheckCircle2 className="h-3 w-3" />
          </li>
        );
      })}
    </ul>
  );
}

export default function FinanceEnquiryStatus() {
  const { id } = useParams();
  const { state, vehicle, user, role } = useStore();
  const [showDealer, setShowDealer] = useState(false);
  const enq = state.enquiries.find((e) => e.id === id && e.type === 'finance');
  if (!enq) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={FileText} title="Enquiry not found" message="We couldn't find this finance enquiry. It may have been made in another browser." action={<Button to="/loan-calculator">Open the loan calculator</Button>} />
      </div>
    );
  }
  const v = vehicle(enq.vehicleId);
  const seller = user(enq.sellerId);
  const ref = state.referrals.find((r) => r.id === enq.finance.referralId);
  const bank = bankInfo(state.config.loanProviders.find((l) => l.id === enq.finance.lenderId));
  const notes = (state.notifications || []).filter((n) => n.refId === enq.id && n.id.startsWith(enq.id));
  const dealerNote = notes.find((n) => n.audience === 'dealer');
  const bankNote = notes.find((n) => n.audience === 'bank');
  const status = ref?.status || 'referred';
  const stepIdx = LOAN_STEPS.findIndex((s) => s.value === status);
  const declined = status === 'rejected';
  const f = enq.finance;
  const isNew = Date.now() - new Date(enq.createdAt).getTime() < 10 * 60 * 1000;
  const retryUrl = `/loan-calculator?car=${enq.vehicleId}&down=${f.downPayment}&months=${f.months}`;

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: 'Loan calculator', to: '/loan-calculator' }, { label: 'Finance enquiry' }]} className="mb-4" />

      <section className="card mb-6 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:p-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ok-50 text-ok-600">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{isNew ? 'Enquiry sent' : 'Finance enquiry'}</p>
            <h1 className="mt-0.5 text-[24px] font-bold leading-tight md:text-[28px]">
              {sellerDisplayName(seller)} and {f.lender} have your enquiry
            </h1>
            <p className="mt-1 text-[14px] text-mist-600">
              Both were notified on {dateTime(enq.createdAt)}. Expect a call on <b className="text-ink-800">{enq.buyerPhone}</b>
              {f.callTime && f.callTime !== 'Any time' ? ` — you asked for ${f.callTime.toLowerCase()}` : ''}.
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-mist-50 px-4 py-3">
            <p className="text-[12px] text-mist-500">Reference</p>
            <p className="flex items-center gap-2 font-mono text-[16px] font-bold text-ink-900">
              {enq.id} <CopyText text={enq.id} />
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="notified">
            <h2 id="notified" className="mb-3 text-lg font-bold">
              Who we notified
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={sellerDisplayName(seller)} size={44} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-mist-500">Dealer selling the car</p>
                    <Link to={sellerPath(seller?.role, seller?.id)} className="block truncate font-bold text-ink-900 hover:text-accent-700">
                      {sellerDisplayName(seller)}
                    </Link>
                    <p className="text-[13px] text-mist-600">{seller?.city}</p>
                  </div>
                </div>
                <Channels list={dealerNote?.channels || ['Dashboard', 'SMS', 'Email']} />
                <p className="mt-3 text-[13.5px] text-ink-800">They’ll confirm the car is available{f.testDrive ? ', arrange your test drive' : ''} and share the proforma invoice the bank needs.</p>
                <div className="mt-3">
                  {showDealer ? (
                    <span className="flex items-center justify-between gap-2 rounded-lg bg-mist-50 px-3 py-2">
                      <a href={`tel:${seller?.phone?.replace(/\s/g, '')}`} className="font-mono text-[14px] font-semibold text-ink-900">
                        {seller?.phone}
                      </a>
                      <CopyText text={seller?.phone || ''} />
                    </span>
                  ) : (
                    <Button size="sm" variant="secondary" icon={Phone} onClick={() => setShowDealer(true)}>
                      Show dealer’s number
                    </Button>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-800 text-white">
                    <Landmark className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-mist-500">Partner bank you chose</p>
                    <p className="truncate font-bold text-ink-900">{f.lender}</p>
                    <p className="text-[13px] text-mist-600">{bank?.desk?.name}</p>
                  </div>
                </div>
                <Channels list={bankNote?.channels || ['Lead desk', 'Email']} />
                <p className="mt-3 text-[13.5px] text-ink-800">
                  {bank?.decision}. They’ll check your eligibility and tell you which documents to send. Lead <span className="font-mono font-semibold">{f.referralId}</span>.
                </p>
                {bank?.desk?.phone && (
                  <p className="mt-3 text-[13px] text-mist-600">
                    Bank desk: <a href={`tel:${bank.desk.phone.replace(/\s/g, '')}`} className="font-semibold text-ink-900">{bank.desk.phone}</a>
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="card p-5 md:p-6" aria-labelledby="progress">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="progress" className="text-lg font-bold">
                Loan progress
              </h2>
              <p className="text-[12.5px] text-mist-500">Updated by {f.lender}</p>
            </div>
            {declined ? (
              <Alert tone="error" title={`${f.lender} couldn't approve this loan`} className="mt-4" icon={XCircle}>
                You can try another partner bank with the same car. The dealer has been told.
                <div className="mt-3">
                  <Button size="sm" to={retryUrl} icon={Calculator}>
                    Try another bank
                  </Button>
                </div>
              </Alert>
            ) : (
              <ol className="mt-4">
                {LOAN_STEPS.map((s, i) => {
                  const done = i <= stepIdx;
                  const current = i === stepIdx;
                  const when = ref?.history?.find((h) => h.status === s.value)?.at || (s.value === 'referred' ? enq.createdAt : null);
                  return (
                    <li key={s.value} className="relative flex gap-3 pb-5 last:pb-0">
                      {i < LOAN_STEPS.length - 1 && <span className={cn('absolute left-[11px] top-6 h-[calc(100%-20px)] w-0.5', i < stepIdx ? 'bg-ok-600' : 'bg-mist-200')} />}
                      {done ? <CheckCircle2 className={cn('relative h-6 w-6 shrink-0 text-ok-600', current && 'drop-shadow')} /> : <Circle className="relative h-6 w-6 shrink-0 text-mist-300" />}
                      <div className="min-w-0">
                        <p className={cn('text-[14.5px] font-semibold', done ? 'text-ink-900' : 'text-mist-500')}>
                          {s.label}
                          {current && <span className="ml-2 rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-700">Now</span>}
                        </p>
                        <p className="text-[13px] text-mist-600">{s.desc}</p>
                        {done && when && <p className="text-[12px] text-mist-500">{dateTime(when)}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {bank && !declined && (
            <section className="card p-5 md:p-6">
              <h2 className="text-lg font-bold">Documents to keep ready</h2>
              <p className="mt-1 text-[13.5px] text-mist-600">{f.lender} usually asks for these. The dealer provides the car invoice.</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {bank.documents.map((d) => (
                  <li key={d} className="flex gap-2 text-[13.5px] text-ink-800">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-mist-500" /> {d}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="card overflow-hidden">
            {v && (
              <Link to={`/cars/${v.id}`} className="block">
                <CarImage vehicle={v} className="h-44 w-full object-cover" />
              </Link>
            )}
            <div className="p-5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-mist-500">Your loan request</p>
              {v && (
                <Link to={`/cars/${v.id}`} className="mt-0.5 block font-bold text-ink-900 hover:text-accent-700">
                  {v.year} {v.make} {v.model} <span className="font-normal text-mist-500">{v.variant}</span>
                </Link>
              )}
              <dl className="mt-3 space-y-2 text-[13.5px]">
                {[
                  ['Car price', tzs(f.price)],
                  ['Down payment', tzs(f.downPayment)],
                  ['Loan amount', tzs(f.loanAmount)],
                  ['Interest rate', `${f.ratePct.toFixed(2)}% p.a. (indicative)`],
                  ['Tenure', `${f.months} months`],
                ].map(([k, val]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-mist-600">{k}</dt>
                    <dd className="text-right font-semibold text-ink-900 num">{val}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 border-t border-mist-100 pt-2">
                  <dt className="font-semibold text-ink-900">Estimated EMI</dt>
                  <dd className="font-bold text-ink-900 num">{tzs(f.emi)}/mo</dd>
                </div>
              </dl>
            </div>
          </section>
          <div className="flex flex-col gap-2">
            {v && (
              <Button variant="secondary" to={`/cars/${v.id}`} icon={Building2}>
                Back to the car
              </Button>
            )}
            <Button variant="secondary" to={`/cars/${enq.vehicleId}/contact`} icon={MessageSquare}>
              Message the dealer
            </Button>
            {role === 'buyer' && (
              <Button variant="ghost" to="/buyer" iconRight={ArrowRight}>
                Go to my dashboard
              </Button>
            )}
          </div>
          <p className="px-1 text-[12px] leading-relaxed text-mist-500">The rate and EMI are estimates. The bank confirms the final offer after checking your documents and credit profile.</p>
        </aside>
      </div>
    </div>
  );
}
