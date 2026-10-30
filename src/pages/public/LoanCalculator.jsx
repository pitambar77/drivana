import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Landmark, Lock, RotateCcw } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Breadcrumbs, Button, Field, Input, Select } from '../../components/ui';
import { EmiDisclaimer, RangeInput } from '../../components/vehicle/EmiWidget';
import { AreaTrend, Donut, CHART } from '../../components/charts/Charts';
import { BankChooser, BankInfoModal, EnquireCta, FinanceEnquiryModal, FinancingCar } from '../../components/finance/FinanceParts';
import { partnerBanks } from '../../data/partnerBanks';
import { amortisation, calcEmi } from '../../utils/emi';
import { tzs, tzsShort } from '../../utils/format';

function NumberField({ id, label, value, onChange, prefix, suffix, min, max, step, error, disabled, hint }) {
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <Input id={id} type="number" inputMode="decimal" prefix={prefix} suffix={suffix} value={value} min={min} max={max} step={step} disabled={disabled} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} error={error} />
    </Field>
  );
}

const roundDown = (price) => Math.round((price * 0.2) / 100000) * 100000;

export default function LoanCalculator() {
  const [params, setParams] = useSearchParams();
  const { state, vehicle, user, submitFinanceEnquiry } = useStore();
  const navigate = useNavigate();
  const banks = useMemo(() => partnerBanks(state.config), [state.config]);

  const paramCar = vehicle(params.get('car'));
  const [car, setCar] = useState(paramCar && isPublic(paramCar) ? paramCar : null);
  const startBank = banks.find((b) => b.id === params.get('bank')) || banks[0];
  const init = {
    price: car?.price || Number(params.get('price')) || 25000000,
    down: Number(params.get('down')) || (car ? roundDown(car.price) : 5000000),
    rate: Number(params.get('rate')) || startBank?.rate || state.config.defaultInterestRate,
    months: Number(params.get('months')) || 60,
    bank: startBank?.id,
  };
  const [price, setPrice] = useState(init.price);
  const [down, setDown] = useState(init.down);
  const [rate, setRate] = useState(init.rate);
  const [months, setMonths] = useState(init.months);
  const [bankId, setBankId] = useState(init.bank);
  const [info, setInfo] = useState(null);
  const [enquire, setEnquire] = useState(false);

  const bank = banks.find((b) => b.id === bankId) || null;
  const seller = car ? user(car.sellerId) : null;

  const errors = {
    price: price === '' || price < 1000000 ? 'Enter a vehicle price of at least TSh 1,000,000' : price > 2000000000 ? 'Price looks too high' : '',
    down: down === '' || down < 0 ? 'Enter 0 or more' : down >= price ? 'Down payment must be less than the price' : '',
    rate: rate === '' || rate <= 0 || rate > 30 ? 'Enter a rate between 0.1% and 30%' : '',
    months: months === '' || months < 6 || months > 96 ? 'Tenure must be 6 to 96 months' : '',
  };
  const ok = !Object.values(errors).some(Boolean);
  const r = useMemo(() => (ok ? calcEmi({ price, downPayment: down, ratePct: rate, months }) : null), [ok, price, down, rate, months]);
  const sched = useMemo(() => (ok ? amortisation({ price, downPayment: down, ratePct: rate, months }) : []), [ok, price, down, rate, months]);
  const loan = { price: Number(price) || 0, down: Number(down) || 0, rate: Number(rate) || 0, months: Number(months) || 0 };

  const syncUrl = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };
  const pickCar = (v) => {
    setCar(v);
    setPrice(v.price);
    setDown(roundDown(v.price));
    syncUrl({ car: v.id, price: '', down: '' });
  };
  const clearCar = () => {
    setCar(null);
    syncUrl({ car: '' });
  };
  const pickBank = (b) => {
    setBankId(b.id);
    setRate(b.rate);
    syncUrl({ bank: b.id });
  };
  const openEnquiry = (b) => {
    if (b) pickBank(b);
    setInfo(null);
    setEnquire(true);
  };
  const send = (f) => {
    const res = submitFinanceEnquiry({
      vehicleId: car.id,
      lenderId: bank.id,
      price: loan.price,
      downPayment: loan.down,
      ratePct: loan.rate,
      months: loan.months,
      buyerName: f.name,
      buyerPhone: f.phone,
      buyerEmail: f.email,
      city: f.city,
      employment: f.employment,
      income: f.income,
      callTime: f.callTime,
      testDrive: f.testDrive,
      exchange: f.exchange,
      message: f.message,
    });
    navigate(`/finance-enquiry/${res.enquiry.id}`);
  };

  const ctaProps = { disabled: !r || !bank, bank, onMore: () => setInfo(bank), onEnquire: () => openEnquiry() };

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[...(car ? [{ label: 'Buy a car', to: '/cars' }, { label: `${car.make} ${car.model}`, to: `/cars/${car.id}` }] : []), { label: 'Loan calculator' }]} className="mb-4" />
      <div className="mb-6 max-w-2xl">
        <h1 className="text-[28px] font-bold md:text-[32px]">Car loan EMI calculator</h1>
        <p className="mt-1.5 text-mist-600">Set your down payment and tenure, pick a partner bank, then make an enquiry. The dealer and the bank are both notified and follow up with you.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0 space-y-5">
          <FinancingCar car={car} seller={seller} onChange={pickCar} onClear={clearCar} />

          <section className="card space-y-5 p-5 md:p-6" aria-labelledby="lc-step1">
            <h2 id="lc-step1" className="flex items-center gap-2 text-[16px] font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[12px] text-white">1</span> Adjust your loan
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField id="lc-price" label="Vehicle price" prefix="TSh" value={price} onChange={setPrice} step={100000} error={errors.price} disabled={!!car} hint={car ? 'Set by the listing' : undefined} />
              <NumberField id="lc-down" label="Down payment" prefix="TSh" value={down} onChange={setDown} step={100000} error={errors.down} />
              <NumberField id="lc-rate" label="Interest rate (per year)" suffix="%" value={rate} onChange={setRate} step={0.05} error={errors.rate} hint={bank && Number(rate) !== bank.rate ? `${bank.short}'s indicative rate is ${bank.rate.toFixed(2)}%` : undefined} />
              <Field label="Loan duration" htmlFor="lc-months" error={errors.months}>
                <Select id="lc-months" value={String(months)} onChange={(e) => setMonths(Number(e.target.value))} options={[12, 24, 36, 48, 60, 72, 84].map((m) => ({ value: String(m), label: `${m} months (${m / 12} yr${m > 12 ? 's' : ''})` }))} />
              </Field>
            </div>
            {ok && (
              <div className="space-y-4 border-t border-mist-100 pt-5">
                <RangeInput id="lc-down-r" label="Down payment" value={down} min={0} max={Math.round(price * 0.9)} step={100000} onChange={setDown} display={`${tzsShort(down)} (${Math.round((down / price) * 100)}%)`} />
                <RangeInput id="lc-rate-r" label="Interest rate" value={rate} min={6} max={18} step={0.05} onChange={setRate} display={`${Number(rate).toFixed(2)}%`} />
                <RangeInput id="lc-months-r" label="Tenure" value={months} min={12} max={84} step={12} onChange={setMonths} display={`${months} months`} />
              </div>
            )}
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={() => {
                setPrice(car ? car.price : init.price);
                setDown(car ? roundDown(car.price) : init.down);
                setMonths(init.months);
                setRate(bank?.rate || init.rate);
              }}
            >
              Reset
            </Button>
          </section>

          <section className="card space-y-4 p-5 md:p-6" aria-labelledby="lc-step2">
            <div>
              <h2 id="lc-step2" className="flex items-center gap-2 text-[16px] font-bold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[12px] text-white">2</span> Choose a partner bank
              </h2>
              <p className="mt-1 text-[13.5px] text-mist-600">Picking a bank uses its indicative rate. Your enquiry goes to this bank’s loan desk.</p>
            </div>
            {banks.length ? (
              <BankChooser banks={banks} value={bankId} onChange={pickBank} onMore={setInfo} loan={loan} />
            ) : (
              <p className="flex items-center gap-2 rounded-xl bg-mist-50 p-4 text-sm text-mist-600">
                <Landmark className="h-4 w-4" /> No partner banks are taking enquiries right now.
              </p>
            )}
            <div className="border-t border-mist-100 pt-4 lg:hidden">
              <p className="mb-2.5 text-[13px] text-mist-600 num">
                {r && bank ? (
                  <>
                    <b className="text-ink-900">{tzs(r.emi)}/month</b> with {bank.short} for {months} months
                  </>
                ) : (
                  'Fix the highlighted fields to continue'
                )}
              </p>
              <EnquireCta {...ctaProps} />
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-5">
          <div className="card overflow-hidden">
            <div className="bg-ink-950 p-6 text-white">
              <p className="text-sm text-ink-300">Estimated monthly EMI{bank ? ` with ${bank.name}` : ''}</p>
              <p className="mt-1 font-display text-[44px] font-extrabold leading-none num" style={{ fontStretch: '112%' }} aria-live="polite">
                {r ? tzs(r.emi) : '—'}
              </p>
              <p className="mt-2 text-[13px] text-ink-300 num">{r ? `for ${months} months at ${Number(rate).toFixed(2)}% p.a.` : 'Fix the highlighted fields to see your EMI'}</p>
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-sun-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sun-400 text-[11px] font-bold text-ink-950">3</span> Happy with this? Ask the dealer and bank to call you.
                </p>
                <EnquireCta {...ctaProps} dark />
                <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-ink-300">
                  <Lock className="h-3.5 w-3.5" /> Free, no obligation and no effect on your credit score.
                </p>
              </div>
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
                    ['Loan amount (principal)', tzs(r.principal), CHART.navy],
                    ['Total interest', tzs(r.totalInterest), CHART.blue],
                    ['Total payable to lender', tzs(r.totalPayable)],
                    ['Down payment', tzs(down)],
                    ['Total cost of the car', tzs(r.totalPayable + Number(down))],
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
          <EmiDisclaimer />
        </div>
      </div>

      <BankInfoModal bank={info} loan={loan} onClose={() => setInfo(null)} onEnquire={openEnquiry} />
      {enquire && <FinanceEnquiryModal open onClose={() => setEnquire(false)} car={car} seller={seller} bank={bank} loan={loan} onPickCar={pickCar} onSubmit={send} />}
    </div>
  );
}
