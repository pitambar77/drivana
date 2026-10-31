import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building, CreditCard, Loader2, Lock, Smartphone, Wallet } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Button, Checkbox, EmptyState, MockNotice, PageHeader, Plate, RadioCards, Section, StatusBadge } from '../../components/ui';
import { PaymentSummary } from '../../components/payment/Payment';
import { CarImage } from '../../components/vehicle/CarArt';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { requiredDocsFor } from '../../components/vehicle/VehicleFormWizard';
import { PLANS, ROLE_META } from '../../config/site';
import { cn, tzs, sleep } from '../../utils/format';
import { vehiclePath } from '../../data/vehicleTypes';

const METHODS = [
  { value: 'UPI', label: 'UPI', description: 'Any UPI app', icon: Smartphone },
  { value: 'Card', label: 'Debit / credit card', description: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { value: 'Net banking', label: 'Net banking', description: 'All major banks', icon: Building },
  { value: 'Wallet', label: 'Wallet', description: 'Paytm, PhonePe, Amazon Pay', icon: Wallet },
];
const OUTCOMES = [
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending', label: 'Pending' },
];

export default function Checkout() {
  const { listingId } = useParams();
  const { state, me, role, vehicle, pay } = useStore();
  const nav = useNavigate();
  const v = vehicle(listingId);
  const plans = PLANS.filter((p) => p.role === role);
  const [planId, setPlanId] = useState(plans.find((p) => p.id === v?.planId)?.id || plans[0]?.id);
  const [method, setMethod] = useState('UPI');
  const [terms, setTerms] = useState(false);
  const [termsErr, setTermsErr] = useState(false);
  const [outcome, setOutcome] = useState('success');
  const [processing, setProcessing] = useState(false);
  const home = ROLE_META[role].home;

  if (!v || v.sellerId !== me.id) {
    return <EmptyState title="We couldn't find that listing" message="It may have been deleted, or it belongs to another account." action={<Button to={home}>Back to dashboard</Button>} />;
  }
  if (v.status === 'live' && v.paymentStatus === 'paid') {
    return <EmptyState title="This listing is already paid and live" message="There's nothing to pay. You can edit the listing at any time." action={<><Button to={`${vehiclePath(v)}`}>View listing</Button><Button variant="secondary" to={home}>Dashboard</Button></>} />;
  }
  if (v.status === 'blocked_duplicate') {
    return <EmptyState title="Payment isn't available for a blocked listing" message="This car matches another active listing. Fix the registration number or VIN first, so you aren't charged for a listing that can't go live." action={<Button to={role === 'seller' ? '/seller/listing-status' : `${home}/listings`}>See why it's blocked</Button>} />;
  }
  const missingDocs = requiredDocsFor(role, state.config).filter(([type]) => !state.documents.some((d) => d.userId === me.id && d.type === type && d.status !== 'rejected'));
  const pendingTxn = state.payments.find((p) => p.listingId === v.id && p.status === 'pending');

  const submit = async () => {
    if (!terms) {
      setTermsErr(true);
      return;
    }
    setProcessing(true);
    await sleep(1600);
    const txn = pay({ listingId: v.id, planId, method, outcome });
    setProcessing(false);
    nav(`/payments/result/${txn.id}`, { replace: true });
  };

  const plan = PLANS.find((p) => p.id === planId);

  return (
    <div>
      <PageHeader eyebrow="Checkout" title="Pay the listing fee" description="Your listing goes live automatically as soon as this payment succeeds." />
      {missingDocs.length > 0 && (
        <Alert tone="warn" className="mb-6" title="Upload required documents first">
          {missingDocs.map((d) => d[1]).join(' and ')} must be uploaded before you pay.{' '}
          <Link to={missingDocs[0][2]} className="font-semibold underline">
            Upload now
          </Link>
        </Alert>
      )}
      {pendingTxn && (
        <Alert tone="warn" className="mb-6" title="A payment for this listing is still pending">
          Paying again could charge you twice.{' '}
          <Link to={`/payments/result/${pendingTxn.id}`} className="font-semibold underline">
            Check {pendingTxn.id}
          </Link>
        </Alert>
      )}
      {v.paymentStatus === 'failed' || v.paymentStatus === 'cancelled' ? (
        <Alert tone="info" className="mb-6" title={`Your last payment ${v.paymentStatus === 'failed' ? 'failed' : 'was cancelled'}`}>
          No listing fee was charged. You can try again below.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section title="1. Choose a plan">
            <RadioCards name="plan" value={planId} onChange={setPlanId} columns={2} options={plans.map((p) => ({ value: p.id, label: `${p.name} · ${tzs(p.price)}`, description: p.features.slice(0, 2).join(' · ') }))} />
          </Section>
          <Section title="2. Payment method">
            <RadioCards name="method" value={method} onChange={setMethod} columns={2} options={METHODS} />
            <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-mist-500">
              <Lock className="h-3.5 w-3.5" /> You'll complete payment on the {state.config.paymentGateway.provider} secure page. AutoDealer never sees your card or UPI PIN.
            </p>
          </Section>
          <Section title="Simulate the gateway response" description="Demo only — choose what the payment gateway returns.">
            <div className="flex flex-wrap gap-2">
              {OUTCOMES.map((o) => (
                <button key={o.value} type="button" onClick={() => setOutcome(o.value)} className={cn('rounded-lg border px-3 py-1.5 text-[13px] font-semibold', outcome === o.value ? 'border-ink-900 bg-ink-900 text-white' : 'border-mist-200 text-mist-700 hover:border-mist-300')} aria-pressed={outcome === o.value}>
                  {o.label}
                </button>
              ))}
            </div>
            <MockNotice className="mt-3">No money moves. Only "Success" publishes the listing; the other outcomes leave it unpublished.</MockNotice>
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card overflow-hidden">
            <CarImage vehicle={v} view="side" className="aspect-[16/8] w-full" />
            <div className="space-y-4 p-5">
              <div>
                <p className="font-bold text-ink-900">{vehicleTitle(v)}</p>
                <p className="text-[13px] text-mist-500">
                  {v.variant} · {tzs(v.price)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Plate value={v.regNumber} size="sm" />
                  <StatusBadge status={v.status} />
                </div>
              </div>
              <PaymentSummary planId={planId} vehicleTitle={vehicleTitle(v)} className="border-t border-mist-100 pt-4" />
              <div>
                <Checkbox
                  checked={terms}
                  onChange={(e) => {
                    setTerms(e.target.checked);
                    setTermsErr(false);
                  }}
                  label={<>I accept the listing terms. The fee is non-refundable once the listing is live.</>}
                />
                {termsErr && <p className="field-error">Accept the listing terms to continue.</p>}
              </div>
              <Button size="lg" className="w-full" icon={Lock} onClick={submit} disabled={missingDocs.length > 0 || processing}>
                Pay {tzs(plan.price * 1.18)}
              </Button>
            </div>
          </div>
          <p className="text-center text-[12px] text-mist-500">GST invoice is emailed after payment.</p>
        </aside>
      </div>

      {processing && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-950/60 backdrop-blur-sm" role="alertdialog" aria-label="Processing payment">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-pop">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent-600" />
            <p className="mt-4 text-lg font-bold">Processing payment…</p>
            <p className="mt-1 text-sm text-mist-600">Don't close this window. Waiting for {state.config.paymentGateway.provider} (simulated).</p>
          </div>
        </div>
      )}
    </div>
  );
}
