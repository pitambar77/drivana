import { useState } from 'react';
import { useStore } from '../../../store/AppStore';
import { Checkbox, Toggle } from '../../../components/ui';
import { BODY_TYPES, CITIES, FUELS } from '../../../data/catalog';
import { ChipsField, NavButtons, PhoneVerifyStep, RE, RegisterFrame, ReviewBlock, SelectField, SuccessPanel, TextField, YesNo, useWizard } from './RegisterKit';

const STEPS = ['Mobile', 'Profile', 'What you want', 'Alerts & review'];
const BUDGETS = [
  { value: '0-15000000', label: 'Under TSh 15M' },
  { value: '15000000-40000000', label: 'TSh 15M – 40M' },
  { value: '40000000-75000000', label: 'TSh 40M – 75M' },
  { value: '75000000-9999999999', label: 'Above TSh 75M' },
];

const V = {
  0: (d) => ({ phoneVerified: !d.phoneVerified && 'Verify your mobile number to continue' }),
  1: (d) => ({ name: (d.name || '').trim().length < 2 && 'Enter your name', email: d.email && !RE.email.test(d.email) && 'Enter a valid email or leave it empty', city: !d.city && 'Choose your city' }),
  2: (d) => ({ budget: !d.budget && 'Choose a budget', timeline: !d.timeline && 'When are you planning to buy?' }),
  3: (d) => ({ terms: !d.terms && 'Accept the terms to continue' }),
};

export default function RegisterBuyer() {
  const { registerUser, login, setBuyerPrefs } = useStore();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const w = useWizard({ cc: '+91', bodies: [], fuels: [], budget: '15000000-40000000', priceDrops: true, newMatches: true, weekly: false }, V);
  const d = w.data;

  const submit = async () => {
    if (!w.validate(3)) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    const u = registerUser({ role: 'buyer', phone: d.phone, name: d.name.trim(), email: (d.email || '').trim(), city: d.city, timeline: d.timeline, needLoan: d.needLoan || 'No', exchange: d.exchange || 'No', alerts: { priceDrops: d.priceDrops, newMatches: d.newMatches, weekly: d.weekly } });
    setBuyerPrefs({ budget: d.budget, bodies: d.bodies, city: d.city, fuels: d.fuels });
    login(u.id);
    setBusy(false);
    setDone(true);
  };

  if (done)
    return (
      <SuccessPanel
        role="buyer"
        name={d.name}
        next={[
          ['Recommendations ready', 'Your dashboard shows cars that match your budget and body types.'],
          ['Save and compare', 'Shortlist cars and compare up to three side by side.'],
          ...(d.needLoan === 'Yes' ? [['Plan your EMI', 'Use the loan calculator and request a lender callback.']] : []),
        ]}
      />
    );

  const frames = {
    0: ['Verify your mobile number', 'Sellers reply to you on this number.', <PhoneVerifyStep key="p" w={w} role="buyer" />],
    1: [
      'Your profile',
      'Only your first name is shown to sellers.',
      <div key="b" className="grid gap-4 sm:grid-cols-2">
        <TextField w={w} k="name" label="Full name" required className="sm:col-span-2" autoComplete="name" />
        <TextField w={w} k="email" label="Email" optional type="email" autoComplete="email" />
        <SelectField w={w} k="city" label="City" required options={CITIES.map((c) => c.name)} />
      </div>,
    ],
    2: [
      'What are you looking for?',
      'We use this for recommendations. Change it any time.',
      <div key="c" className="space-y-5">
        <SelectField w={w} k="budget" label="Budget" required options={BUDGETS} />
        <ChipsField w={w} k="bodies" label="Body types" options={BODY_TYPES} />
        <ChipsField w={w} k="fuels" label="Fuel" options={FUELS} />
        <SelectField w={w} k="timeline" label="When do you plan to buy?" required options={['Within 2 weeks', 'Within a month', 'In 1–3 months', 'Just browsing']} />
        <div className="grid gap-4 sm:grid-cols-2">
          <YesNo w={w} k="needLoan" label="Need a car loan?" />
          <YesNo w={w} k="exchange" label="Have a car to exchange?" />
        </div>
      </div>,
    ],
    3: [
      'Alerts and review',
      null,
      <div key="r" className="space-y-4">
        <div className="card space-y-4 p-4">
          <Toggle id="rg-drops" label="Price drops on saved cars" checked={d.priceDrops} onChange={(v) => w.set('priceDrops', v)} />
          <Toggle id="rg-matches" label="New cars matching my preferences" checked={d.newMatches} onChange={(v) => w.set('newMatches', v)} />
          <Toggle id="rg-weekly" label="Weekly market roundup" checked={d.weekly} onChange={(v) => w.set('weekly', v)} />
        </div>
        <ReviewBlock title="Profile" onEdit={() => setStep(1)} rows={[['Name', d.name], ['Email', d.email || 'Not added'], ['City', d.city], ['Mobile', d.phone]]} />
        <ReviewBlock title="Preferences" onEdit={() => setStep(2)} rows={[['Budget', BUDGETS.find((b) => b.value === d.budget)?.label], ['Body types', (d.bodies || []).join(', ') || 'Any'], ['Fuel', (d.fuels || []).join(', ') || 'Any'], ['Timeline', d.timeline], ['Loan', d.needLoan || 'No']]} />
        <Checkbox checked={!!d.terms} onChange={(e) => w.set('terms', e.target.checked)} label="I accept the Terms and Privacy Policy" />
        {w.errors.terms && <p className="field-error">{w.errors.terms}</p>}
      </div>,
    ],
  };
  const [title, desc, body] = frames[step];
  return (
    <RegisterFrame role="buyer" steps={STEPS} step={step} onJump={setStep} title={title} description={desc} footer={<NavButtons step={step} onBack={() => setStep((s) => s - 1)} onNext={step === 3 ? submit : () => w.validate(step) && setStep((s) => s + 1)} nextLabel={step === 3 ? 'Create buyer account' : 'Continue'} loading={busy} />}>
      {body}
    </RegisterFrame>
  );
}
