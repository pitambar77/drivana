// Loan calculator pieces: car picker, partner bank chooser, "Find out more" and "Make an enquiry" dialogs.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BadgeCheck, Building2, Car, Check, CheckCircle2, Clock, FileText, Landmark, Lock, Percent, Search, Send, X } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Button, Checkbox, Field, Input, Modal, Select, Textarea } from '../ui';
import { CarImage } from '../vehicle/CarArt';
import { CITIES } from '../../data/catalog';
import { CALL_TIMES, EMPLOYMENT, INCOME } from '../../data/partnerBanks';
import { sellerDisplayName } from '../../utils/finance';
import { calcEmi } from '../../utils/emi';
import { cn, inr, lakh } from '../../utils/format';

export const carTitle = (v) => `${v.year} ${v.make} ${v.model}`;

/** Whether a bank can fund this loan as set; returns a short warning or ''. */
export function bankFit(bank, { price, down, months }) {
  if (!bank || !price) return '';
  const minDown = Math.ceil((price * (1 - bank.maxFundingPct / 100)) / 1000) * 1000;
  if (down < minDown) return `Funds up to ${bank.maxFundingPct}% — needs at least ${lakh(minDown)} down`;
  if (months > bank.maxMonths) return `Maximum tenure is ${bank.maxMonths} months`;
  return '';
}

/* ───────────────────────── Car being financed */

export function CarPicker({ onPick, autoFocus }) {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const pool = useMemo(() => {
    const live = state.vehicles.filter(isPublic);
    const byId = Object.fromEntries(live.map((v) => [v.id, v]));
    const first = [...state.recent, ...state.saved].map((id) => byId[id]).filter(Boolean);
    return [...new Map([...first, ...live].map((v) => [v.id, v])).values()];
  }, [state.vehicles, state.recent, state.saved]);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = pool.filter((v) => !words.length || words.every((w) => `${v.year} ${v.make} ${v.model} ${v.variant || ''} ${v.city}`.toLowerCase().includes(w))).slice(0, 6);
  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
        <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search make, model or city" aria-label="Search cars" className="input pl-9" />
      </div>
      <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-mist-500">{q ? 'Matching cars' : state.recent.length || state.saved.length ? 'Recently viewed and saved first' : 'Cars for sale'}</p>
      <ul className="mt-1.5 divide-y divide-mist-100 overflow-hidden rounded-xl border border-mist-200">
        {list.length === 0 && <li className="px-4 py-6 text-center text-sm text-mist-500">No cars match “{q}”.</li>}
        {list.map((v) => (
          <li key={v.id}>
            <button type="button" onClick={() => onPick(v)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-mist-50">
              <CarImage vehicle={v} className="h-12 w-[72px] shrink-0 rounded-md object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink-900">{carTitle(v)}</span>
                <span className="block truncate text-[12.5px] text-mist-500">
                  {v.variant} · {v.city}
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold text-ink-900 num">{lakh(v.price)}</span>
            </button>
          </li>
        ))}
      </ul>
      <Link to="/cars" className="mt-2 inline-flex text-[13px] font-semibold text-accent-700 hover:underline">
        Browse all cars
      </Link>
    </div>
  );
}

export function FinancingCar({ car, seller, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  if (!car)
    return (
      <div className="card flex flex-col gap-3 border-dashed p-4 sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist-100 text-mist-500">
          <Car className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">Which car do you want to finance?</p>
          <p className="text-[13px] text-mist-600">Choose a car to use its price and send your enquiry to the dealer selling it.</p>
        </div>
        <Button variant="secondary" icon={Search} onClick={() => setOpen(true)}>
          Choose a car
        </Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Choose the car to finance">
          <CarPicker
            autoFocus
            onPick={(v) => {
              onChange(v);
              setOpen(false);
            }}
          />
        </Modal>
      </div>
    );
  return (
    <div className="card flex items-center gap-3 p-3 sm:gap-4">
      <Link to={`/cars/${car.id}`} className="shrink-0">
        <CarImage vehicle={car} className="h-16 w-24 rounded-lg object-cover sm:h-[72px] sm:w-28" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-accent-700">Financing this car</p>
        <Link to={`/cars/${car.id}`} className="block truncate font-bold text-ink-900 hover:text-accent-700">
          {carTitle(car)} <span className="font-medium text-mist-500">{car.variant}</span>
        </Link>
        <p className="truncate text-[13px] text-mist-600">
          <span className="font-semibold text-ink-900 num">{lakh(car.price)}</span> · sold by {sellerDisplayName(seller)}, {car.city}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
        <button type="button" onClick={() => setOpen(true)} className="btn btn-sm btn-ghost">
          Change
        </button>
        <button type="button" onClick={onClear} className="btn-icon h-8 w-8" aria-label="Remove car" title="Remove car">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Choose the car to finance">
        <CarPicker
          autoFocus
          onPick={(v) => {
            onChange(v);
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

/* ───────────────────────── Partner banks */

export function BankChooser({ banks, value, onChange, onMore, loan }) {
  return (
    <div role="radiogroup" aria-label="Partner bank" className="space-y-2.5">
      {banks.map((b) => {
        const on = value === b.id;
        const r = calcEmi({ price: loan.price, downPayment: loan.down, ratePct: b.rate, months: loan.months });
        const warn = bankFit(b, loan);
        return (
          <div key={b.id} className={cn('rounded-xl border bg-white transition-colors', on ? 'border-accent-500 ring-2 ring-accent-100' : 'border-mist-200 hover:border-mist-300')}>
            <label className="flex cursor-pointer items-start gap-3 p-3.5">
              <input type="radio" name="bank" value={b.id} checked={on} onChange={() => onChange(b)} className="sr-only" />
              <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', on ? 'border-accent-600 bg-accent-600 text-white' : 'border-mist-300')}>
                {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                  <span className="flex items-center gap-2 font-semibold text-ink-900">
                    <Landmark className="h-4 w-4 text-mist-500" /> {b.name}
                  </span>
                  <span className="text-[13px] text-mist-600 num">
                    from <span className="font-bold text-ink-900">{b.rate.toFixed(2)}%</span> p.a.
                  </span>
                </span>
                <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-mist-500 num">
                  <span>
                    EMI about <span className="font-semibold text-ink-800">{inr(r.emi)}</span>/mo
                  </span>
                  <span>Up to {b.maxFundingPct}% funding</span>
                  <span>Fee: {b.processingFee}</span>
                </span>
                {warn && (
                  <span className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-semibold text-warn-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {warn}
                  </span>
                )}
              </span>
            </label>
            <div className="flex justify-end border-t border-mist-100 px-3.5 py-1.5">
              <button type="button" onClick={() => onMore(b)} className="text-[13px] font-semibold text-accent-700 hover:underline">
                Find out more
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BankInfoModal({ bank, loan, onClose, onEnquire }) {
  if (!bank) return null;
  const r = calcEmi({ price: loan.price, downPayment: loan.down, ratePct: bank.rate, months: loan.months });
  const warn = bankFit(bank, loan);
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={bank.name}
      description={bank.tagline}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button icon={Send} onClick={() => onEnquire(bank)}>
            Make an enquiry
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {[
            [Percent, 'Rates from', `${bank.rate.toFixed(2)}% p.a.`],
            [Building2, 'Funding', `Up to ${bank.maxFundingPct}% of price`],
            [Clock, 'Tenure', `Up to ${bank.maxMonths} months`],
            [FileText, 'Processing fee', bank.processingFee],
            [BadgeCheck, 'Decision', bank.decision],
          ].map(([Icon, k, val]) => (
            <div key={k} className="rounded-xl bg-mist-50 p-3">
              <dt className="flex items-center gap-1.5 text-[12px] text-mist-500">
                <Icon className="h-3.5 w-3.5" /> {k}
              </dt>
              <dd className="mt-0.5 text-[13.5px] font-semibold text-ink-900">{val}</dd>
            </div>
          ))}
        </dl>

        <div className="rounded-xl border border-mist-200 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-mist-500">Your estimate with {bank.short}</p>
          <p className="mt-1 text-[15px] text-ink-800 num">
            Loan of <b>{inr(r.principal)}</b> over {loan.months} months · EMI about <b>{inr(r.emi)}</b>/month
          </p>
          {warn && (
            <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-semibold text-warn-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {warn}. You can still enquire and discuss it with the bank.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-[14px] font-bold">Who can apply</h3>
            <ul className="mt-2 space-y-1.5">
              {bank.eligibility.map((x) => (
                <li key={x} className="flex gap-2 text-[13.5px] text-ink-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[14px] font-bold">Documents to keep ready</h3>
            <ul className="mt-2 space-y-1.5">
              {bank.documents.map((x) => (
                <li key={x} className="flex gap-2 text-[13.5px] text-ink-800">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-mist-500" /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="rounded-xl bg-accent-50 p-3.5 text-[13.5px] text-ink-800">
          <b>How it works:</b> when you make an enquiry, {bank.name}’s loan desk and the dealer selling the car are both notified. The bank calls you to check eligibility and the dealer confirms the car and paperwork. Enquiring is free and isn’t a loan application.
        </p>
      </div>
    </Modal>
  );
}

/* ───────────────────────── Make an enquiry */

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FinanceEnquiryModal({ open, onClose, car, seller, bank, loan, onPickCar, onSubmit }) {
  const { me, role } = useStore();
  const buyer = role === 'buyer' ? me : null;
  const [f, setF] = useState(() => ({
    name: buyer?.name || '',
    phone: buyer?.phone ? buyer.phone.replace(/^\+91\s?/, '').replace(/\s/g, '') : '',
    email: buyer?.email || '',
    city: car?.city || buyer?.city || '',
    employment: '',
    income: '',
    callTime: CALL_TIMES[0],
    testDrive: true,
    exchange: false,
    message: '',
    consent: false,
  }));
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const r = calcEmi({ price: loan.price, downPayment: loan.down, ratePct: loan.rate, months: loan.months });

  const submit = async () => {
    const phone = f.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    const e = {
      car: !car && 'Choose the car you want to finance',
      name: f.name.trim().length < 2 && 'Enter your full name',
      phone: !PHONE_RE.test(phone) && 'Enter a 10-digit mobile number',
      email: f.email && !EMAIL_RE.test(f.email.trim()) && 'Enter a valid email or leave it empty',
      city: !f.city && 'Choose your city',
      employment: !f.employment && 'Choose how you earn',
      consent: !f.consent && 'Tick this box so we can share your enquiry',
    };
    Object.keys(e).forEach((k) => !e[k] && delete e[k]);
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    await new Promise((res) => setTimeout(res, 600));
    onSubmit({ ...f, phone: `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` });
  };

  if (!open) return null;
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Make a finance enquiry"
      description={car && bank ? `${sellerDisplayName(seller)} and ${bank.name} will both get your enquiry.` : 'Tell us a little about you and we’ll pass it on.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={Send} loading={busy} onClick={submit}>
            Send enquiry
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {car ? (
          <div className="overflow-hidden rounded-xl border border-mist-200">
            <div className="flex items-center gap-3 p-3">
              <CarImage vehicle={car} className="h-14 w-20 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">
                  {carTitle(car)} <span className="font-normal text-mist-500">{car.variant}</span>
                </p>
                <p className="truncate text-[13px] text-mist-600">
                  {sellerDisplayName(seller)} · {car.city}
                </p>
              </div>
              <span className="shrink-0 font-bold text-ink-900 num">{lakh(car.price)}</span>
            </div>
            <dl className="grid grid-cols-2 gap-px border-t border-mist-200 bg-mist-200 sm:grid-cols-4">
              {[
                ['Bank', bank?.short || '—'],
                ['Loan', inr(r.principal)],
                ['EMI', `${inr(r.emi)}/mo`],
                ['Terms', `${loan.months} mo · ${Number(loan.rate).toFixed(2)}%`],
              ].map(([k, val]) => (
                <div key={k} className="min-w-0 bg-white px-3 py-2">
                  <dt className="text-[11.5px] text-mist-500">{k}</dt>
                  <dd className="truncate text-[13.5px] font-semibold text-ink-900 num">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-900">Which car is this for?</p>
            <CarPicker onPick={onPickCar} />
            {err.car && <p className="field-error mt-1.5">{err.car}</p>}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fe-name" required error={err.name}>
            <Input id="fe-name" autoComplete="name" value={f.name} onChange={set('name')} error={err.name} />
          </Field>
          <Field label="Mobile number" htmlFor="fe-phone" required error={err.phone} hint={!err.phone ? 'The dealer and bank will call this number' : undefined}>
            <Input id="fe-phone" prefix="+91" inputMode="tel" autoComplete="tel-national" value={f.phone} onChange={set('phone')} error={err.phone} />
          </Field>
          <Field label="Email" htmlFor="fe-email" optional error={err.email}>
            <Input id="fe-email" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={err.email} />
          </Field>
          <Field label="Your city" htmlFor="fe-city" required error={err.city}>
            <Select id="fe-city" value={f.city} onChange={set('city')} placeholder="Choose city" options={CITIES.map((c) => c.name)} error={err.city} />
          </Field>
          <Field label="How do you earn?" htmlFor="fe-emp" required error={err.employment}>
            <Select id="fe-emp" value={f.employment} onChange={set('employment')} placeholder="Choose one" options={EMPLOYMENT} error={err.employment} />
          </Field>
          <Field label="Monthly income" htmlFor="fe-income" optional hint="Helps the bank check eligibility faster">
            <Select id="fe-income" value={f.income} onChange={set('income')} placeholder="Prefer not to say" options={INCOME} />
          </Field>
          <Field label="Best time to call" htmlFor="fe-time" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2" role="radiogroup" id="fe-time">
              {CALL_TIMES.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={f.callTime === t} onClick={() => set('callTime')(t)} className={cn('rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors', f.callTime === t ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-mist-200 text-mist-700 hover:border-mist-300')}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Checkbox checked={f.testDrive} onChange={set('testDrive')} label="I’d like a test drive" />
          <Checkbox checked={f.exchange} onChange={set('exchange')} label="I want to exchange my current car" />
        </div>

        <Field label="Anything else?" htmlFor="fe-msg" optional>
          <Textarea id="fe-msg" rows={3} maxLength={500} value={f.message} onChange={set('message')} placeholder="For example: when you’d like delivery, or questions for the bank" />
        </Field>

        <div className={cn('rounded-xl border p-3.5', err.consent ? 'border-bad-600' : 'border-mist-200 bg-mist-50')}>
          <Checkbox
            checked={f.consent}
            onChange={set('consent')}
            label={
              <span>
                I agree that AutoDealer shares these details with <b>{car ? sellerDisplayName(seller) : 'the dealer selling the car'}</b> and <b>{bank?.name || 'the bank I chose'}</b> so they can contact me about this car and loan.
              </span>
            }
          />
          {err.consent && <p className="field-error ml-7 mt-1">{err.consent}</p>}
        </div>
        <p className="flex items-start gap-1.5 text-[12px] text-mist-500">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Free and no obligation. This is an enquiry, not a loan application, and it doesn’t affect your credit score.
        </p>
      </div>
    </Modal>
  );
}

export function EnquireCta({ disabled, onMore, onEnquire, bank, dark }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button icon={Send} onClick={onEnquire} disabled={disabled} className="flex-1 whitespace-nowrap">
        Make an enquiry
      </Button>
      <Button variant={dark ? 'secondary' : 'secondary'} iconRight={ArrowRight} onClick={onMore} disabled={disabled || !bank} className="flex-1 whitespace-nowrap">
        Find out more
      </Button>
    </div>
  );
}
