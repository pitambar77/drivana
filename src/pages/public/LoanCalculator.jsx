import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Handshake, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Breadcrumbs, Button, Field, Input, MockNotice, Modal, Select, useToast } from '../../components/ui';
import { EmiDisclaimer, RangeInput } from '../../components/vehicle/EmiWidget';
import { AreaTrend, Donut, CHART } from '../../components/charts/Charts';
import { amortisation, calcEmi } from '../../utils/emi';
import { inr, lakh } from '../../utils/format';

function NumberField({ id, label, value, onChange, prefix, suffix, min, max, step, error }) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <Input id={id} type="number" inputMode="decimal" prefix={prefix} suffix={suffix} value={value} min={min} max={max} step={step} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} error={error} />
    </Field>
  );
}

export default function LoanCalculator() {
  const [params] = useSearchParams();
  const { state, addReferral } = useStore();
  const toast = useToast();
  const init = { price: Number(params.get('price')) || 850000, down: Number(params.get('down')) || 170000, rate: state.config.defaultInterestRate, months: Number(params.get('months')) || 60 };
  const [price, setPrice] = useState(init.price);
  const [down, setDown] = useState(init.down);
  const [rate, setRate] = useState(init.rate);
  const [months, setMonths] = useState(init.months);
  const [help, setHelp] = useState(false);
  const [lead, setLead] = useState({ name: '', phone: '', lender: state.config.loanProviders.find((l) => l.enabled)?.id });
  const [leadErr, setLeadErr] = useState({});

  const errors = {
    price: price === '' || price < 50000 ? 'Enter a vehicle price of at least ₹50,000' : price > 50000000 ? 'Price looks too high' : '',
    down: down === '' || down < 0 ? 'Enter 0 or more' : down >= price ? 'Down payment must be less than the price' : '',
    rate: rate === '' || rate <= 0 || rate > 30 ? 'Enter a rate between 0.1% and 30%' : '',
    months: months === '' || months < 6 || months > 96 ? 'Tenure must be 6 to 96 months' : '',
  };
  const ok = !Object.values(errors).some(Boolean);
  const r = useMemo(() => (ok ? calcEmi({ price, downPayment: down, ratePct: rate, months }) : null), [ok, price, down, rate, months]);
  const sched = useMemo(() => (ok ? amortisation({ price, downPayment: down, ratePct: rate, months }) : []), [ok, price, down, rate, months]);

  const submitLead = () => {
    const e = {};
    if (lead.name.trim().length < 2) e.name = 'Enter your name';
    if (!/^[6-9]\d{4}\s?\d{5}$/.test(lead.phone.trim())) e.phone = 'Enter a 10-digit mobile number';
    setLeadErr(e);
    if (Object.keys(e).length) return;
    addReferral({ lenderId: lead.lender, loanAmount: r.principal, tenureMonths: months, buyerName: lead.name, buyerPhone: `+91 ${lead.phone}` });
    setHelp(false);
    toast('Request sent. The lending partner will call you to discuss eligibility.', { title: 'Loan callback requested' });
  };

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: 'Loan calculator' }]} className="mb-4" />
      <div className="mb-6 max-w-2xl">
        <h1 className="text-[28px] font-bold md:text-[32px]">Car loan EMI calculator</h1>
        <p className="mt-1.5 text-mist-600">See what you'd pay each month for a car loan. Change the down payment, rate and tenure to compare options.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="card space-y-5 p-5 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="lc-price" label="Vehicle price" prefix="₹" value={price} onChange={setPrice} step={10000} error={errors.price} />
            <NumberField id="lc-down" label="Down payment" prefix="₹" value={down} onChange={setDown} step={10000} error={errors.down} />
            <NumberField id="lc-rate" label="Interest rate (per year)" suffix="%" value={rate} onChange={setRate} step={0.05} error={errors.rate} />
            <Field label="Loan duration" htmlFor="lc-months" error={errors.months}>
              <Select id="lc-months" value={String(months)} onChange={(e) => setMonths(Number(e.target.value))} options={[12, 24, 36, 48, 60, 72, 84].map((m) => ({ value: String(m), label: `${m} months (${m / 12} yr${m > 12 ? 's' : ''})` }))} />
            </Field>
          </div>
          {ok && (
            <div className="space-y-4 border-t border-mist-100 pt-5">
              <RangeInput id="lc-down-r" label="Down payment" value={down} min={0} max={Math.round(price * 0.9)} step={10000} onChange={setDown} display={`${lakh(down)} (${Math.round((down / price) * 100)}%)`} />
              <RangeInput id="lc-rate-r" label="Interest rate" value={rate} min={6} max={18} step={0.05} onChange={setRate} display={`${Number(rate).toFixed(2)}%`} />
              <RangeInput id="lc-months-r" label="Tenure" value={months} min={12} max={84} step={12} onChange={setMonths} display={`${months} months`} />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={() => {
                setPrice(init.price);
                setDown(init.down);
                setRate(init.rate);
                setMonths(init.months);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="bg-ink-950 p-6 text-white">
              <p className="text-sm text-ink-300">Estimated monthly EMI</p>
              <p className="mt-1 font-display text-[44px] font-extrabold leading-none num" style={{ fontStretch: '112%' }} aria-live="polite">
                {r ? inr(r.emi) : '—'}
              </p>
              <p className="mt-2 text-[13px] text-ink-300 num">{r ? `for ${months} months at ${Number(rate).toFixed(2)}% p.a.` : 'Fix the highlighted fields to see your EMI'}</p>
            </div>
            {r && (
              <div className="grid gap-5 p-5 sm:grid-cols-[180px_1fr] sm:items-center">
                <Donut
                  height={170}
                  data={[
                    { label: 'Principal', value: r.principal, color: CHART.navy },
                    { label: 'Interest', value: r.totalInterest, color: CHART.blue },
                  ]}
                  centerValue={`${Math.round((r.totalInterest / r.totalPayable) * 100)}%`}
                  centerLabel="is interest"
                />
                <dl className="space-y-2.5 text-sm">
                  {[
                    ['Loan amount (principal)', inr(r.principal), CHART.navy],
                    ['Total interest', inr(r.totalInterest), CHART.blue],
                    ['Total payable to lender', inr(r.totalPayable)],
                    ['Down payment', inr(down)],
                    ['Total cost of the car', inr(r.totalPayable + Number(down))],
                  ].map(([k, val, c]) => (
                    <div key={k} className="flex items-center justify-between gap-3 border-b border-mist-100 pb-2.5 last:border-0">
                      <dt className="flex items-center gap-2 text-mist-600">
                        {c && <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />}
                        {k}
                      </dt>
                      <dd className="font-semibold text-ink-900 num">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {r && sched.length > 1 && (
            <div className="card p-5">
              <h2 className="mb-3 text-[15px] font-bold">Outstanding balance by year</h2>
              <AreaTrend money data={sched} series={[{ key: 'balance', name: 'Balance left' }, { key: 'interest', name: 'Interest paid so far', color: CHART.amber }]} height={220} />
            </div>
          )}

          <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <Handshake className="h-8 w-8 shrink-0 text-accent-600" />
            <div className="flex-1">
              <p className="font-semibold">Want a real quote?</p>
              <p className="text-sm text-mist-600">A lending partner can call you to check eligibility. Requesting a callback isn't a loan application.</p>
            </div>
            <Button variant="secondary" onClick={() => setHelp(true)} disabled={!r}>
              Request a callback
            </Button>
          </div>
          <EmiDisclaimer />
        </div>
      </div>

      <Modal
        open={help}
        onClose={() => setHelp(false)}
        title="Talk to a lending partner"
        description={r ? `Loan of ${lakh(r.principal)} over ${months} months` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setHelp(false)}>
              Cancel
            </Button>
            <Button onClick={submitLead}>Request callback</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Your name" htmlFor="lead-name" error={leadErr.name} required>
            <Input id="lead-name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} error={leadErr.name} />
          </Field>
          <Field label="Mobile number" htmlFor="lead-phone" error={leadErr.phone} required>
            <Input id="lead-phone" prefix="+91" inputMode="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} error={leadErr.phone} />
          </Field>
          <Field label="Lending partner" htmlFor="lead-lender">
            <Select id="lead-lender" value={lead.lender} onChange={(e) => setLead({ ...lead, lender: e.target.value })} options={state.config.loanProviders.filter((l) => l.enabled).map((l) => ({ value: l.id, label: l.name }))} />
          </Field>
          <MockNotice>No details are shared with a real lender. The request appears in Admin → Loan referrals.</MockNotice>
        </div>
      </Modal>
    </div>
  );
}
