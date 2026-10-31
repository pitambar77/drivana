import { useState } from 'react';
import { BadgeCheck, Building2, Car, Check, CreditCard, FileCheck2, Handshake, Inbox, Radio, ShieldCheck, ShieldX, UserCheck } from 'lucide-react';
import { Breadcrumbs, Button, Segmented, Badge } from '../../components/ui';
import { PLANS } from '../../config/site';
import { useStore } from '../../store/AppStore';
import { cn, tzs } from '../../utils/format';

const JOURNEYS = {
  dealer: {
    icon: Building2,
    title: 'Dealer',
    blurb: 'For car, motorcycle and truck showrooms. Manage your whole stock from one dashboard.',
    steps: [
      [UserCheck, 'Sign in with your business mobile', 'Verify with a one-time code and choose the Dealer account type.'],
      [FileCheck2, 'Upload your business certificate', 'Shop & establishment, GST or company registration. Reviewed after you publish.'],
      [Car, 'Add vehicles', 'Six-step form with photos, registration and VIN. Save drafts any time.'],
      [CreditCard, 'Pay per vehicle or buy a pack', 'Each listing goes live as soon as its payment succeeds.'],
      [Inbox, 'Manage enquiries', 'Every call and message lands in your lead inbox with a status you can update.'],
    ],
  },
  seller: {
    icon: Car,
    title: 'Private seller',
    blurb: 'Selling your own car, motorcycle or lorry. One active listing per account keeps the marketplace honest.',
    steps: [
      [UserCheck, 'Sign in with your mobile', 'One-time code, no password. Choose Private Seller.'],
      [ShieldCheck, 'Upload your ID', 'Driving licence, PAN or passport. An optional short video speeds up verification.'],
      [Car, 'Describe your vehicle', 'Registration number, VIN, kilometres, photos and your price.'],
      [CreditCard, 'Pay the listing fee', 'Your listing publishes automatically after payment.'],
      [Inbox, 'Talk to buyers', 'Buyers call or message you directly. Mark it sold when you\'re done.'],
    ],
  },
  agent: {
    icon: Handshake,
    title: 'Agent',
    blurb: 'For agents who sell vehicles on behalf of owners and see the handover through.',
    steps: [
      [UserCheck, 'Sign in and choose Agent', 'Verify your mobile with a one-time code.'],
      [FileCheck2, 'Upload ID and owner authorisation', 'Your identity proof, plus the owner\'s signed authorisation letter where policy requires it.'],
      [Car, 'List the vehicle with owner details', 'Owner details stay private; buyers contact you.'],
      [CreditCard, 'Pay per listing', 'The listing goes live once payment succeeds.'],
      [Handshake, 'Track the handover', 'Owner → agent → buyer timeline, from authorisation to delivery.'],
    ],
  },
};

const RULES = [
  [CreditCard, 'No payment, no listing', 'A listing only goes live after its payment succeeds. Failed, cancelled or pending payments never publish a car.'],
  [Radio, 'Live as soon as it passes checks', 'There is no waiting for manual approval. Once paid and validated, your listing appears in search right away.'],
  [BadgeCheck, 'Live is not the same as verified', 'Our team reviews documents after publishing. The "Documents verified" badge appears only after that review.'],
  [ShieldX, 'Duplicates are blocked', 'A registration number or VIN can be in only one active listing. We explain why and how to fix it if yours is blocked.'],
  [Car, 'One vehicle per private seller', 'Private seller accounts can have one active listing. Mark it sold or remove it to list another.'],
  [ShieldCheck, 'Suspicious listings are reviewed', 'Admins can flag, suspend or remove listings that look wrong, and every action is recorded.'],
];

export default function HowItWorks() {
  const [role, setRole] = useState('dealer');
  const { me } = useStore();
  const j = JOURNEYS[role];
  const groups = [
    ['seller', 'Private seller'],
    ['agent', 'Agent'],
    ['dealer', 'Dealer'],
  ];
  return (
    <div>
      <section className="bg-white">
        <div className="container-page py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Sell your vehicle' }]} className="mb-4" />
          <p className="eyebrow">Sell on AutoDealer</p>
          <h1 className="mt-2 max-w-2xl text-[30px] font-bold leading-tight md:text-[40px]">Three ways to sell, one simple rule: pay, publish, then get verified.</h1>
        </div>
      </section>

      <section className="container-page py-10">
        <Segmented value={role} onChange={setRole} options={Object.entries(JOURNEYS).map(([k, v]) => ({ value: k, label: v.title }))} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="card p-6">
            <j.icon className="h-8 w-8 text-accent-600" />
            <h2 className="mt-4 text-xl font-bold">{j.title} journey</h2>
            <p className="mt-2 text-sm text-mist-600">{j.blurb}</p>
            <Button to={`/register/${role}`} className="mt-5 w-full">
              Register as {j.title.toLowerCase()}
            </Button>
          </div>
          <ol className="relative space-y-3">
            {j.steps.map(([Icon, t, d], i) => (
              <li key={t} className="card flex gap-4 p-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[11.5px] text-mist-400">Step {i + 1}</p>
                  <p className="font-semibold text-ink-900">{t}</p>
                  <p className="text-sm text-mist-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="plans" className="scroll-mt-20 bg-white py-12">
        <div className="container-page">
          <p className="eyebrow">Listing plans</p>
          <h2 className="mt-1 text-[26px] font-bold">Fees are per listing, plus 18% GST</h2>
          <p className="mt-1 text-sm text-mist-600">No commission on the sale price. Fees are configured by the platform and may change.</p>
          <div className="mt-8 space-y-8">
            {groups.map(([r, label]) => (
              <div key={r}>
                <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.1em] text-mist-500">{label}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {PLANS.filter((p) => p.role === r).map((p) => (
                    <div key={p.id} className={cn('relative flex flex-col rounded-2xl border p-6', p.highlight ? 'border-accent-500 ring-2 ring-accent-100' : 'border-mist-200')}>
                      {p.highlight && (
                        <Badge tone="blue" className="absolute right-4 top-4">
                          Most popular
                        </Badge>
                      )}
                      <p className="font-semibold text-ink-900">{p.name}</p>
                      <p className="mt-2 font-display text-[34px] font-extrabold leading-none num" style={{ fontStretch: '112%' }}>
                        {tzs(p.price)}
                      </p>
                      <p className="mt-1 text-[13px] text-mist-500">
                        + {tzs(p.price * 0.18)} GST · {p.vehicles > 1 ? `${p.vehicles} vehicles` : 'one vehicle'} · {p.validityDays} days
                      </p>
                      <ul className="mt-5 flex-1 space-y-2 text-sm text-mist-700">
                        {p.features.map((f) => (
                          <li key={f} className="flex gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Button to={`/register/${r}`} variant={p.highlight ? 'primary' : 'secondary'} className="mt-6 w-full">
                        Choose {p.name}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="text-[26px] font-bold">Payment, publishing and verification rules</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RULES.map(([Icon, t, d]) => (
            <div key={t} className="card p-5">
              <Icon className="h-6 w-6 text-ink-900" />
              <p className="mt-3 font-semibold text-ink-900">{t}</p>
              <p className="mt-1 text-sm text-mist-600">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-ink-950 p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h3 className="text-xl font-bold text-white">Ready to list?</h3>
            <p className="text-ink-300">Pick your account type and verify your phone. It takes under a minute.</p>
          </div>
          <Button to="/register" size="lg">
            Choose account type
          </Button>
        </div>
      </section>
    </div>
  );
}
