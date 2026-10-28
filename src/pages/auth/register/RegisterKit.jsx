// Shared pieces for the detailed, role-specific registration flows (/register/:role).
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, MessageSquareText, Pencil, ShieldCheck } from 'lucide-react';
import { useStore } from '../../../store/AppStore';
import { Alert, Button, Field, Input, MockNotice, OtpInput, Select, useToast } from '../../../components/ui';
import { Confetti } from '../../../components/interactive/Interactive';
import { COUNTRY_CODES, formatPhone } from '../PhoneSignIn';
import { DEMO_OTP } from '../OtpVerify';
import { ROLE_META } from '../../../config/site';
import { cn, maskPhone, sleep } from '../../../utils/format';

// ── Validation patterns used across forms (Indian formats)
export const RE = {
  pan: /^[A-Z]{5}\d{4}[A-Z]$/,
  gstin: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  pin: /^[1-9]\d{5}$/,
  mobile: /^[6-9]\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  url: /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i,
};
export const LANGUAGES = ['English', 'Hindi', 'Odia', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Kannada', 'Gujarati', 'Malayalam'];
export const STATES = { OD: 'Odisha', WB: 'West Bengal', MH: 'Maharashtra', DL: 'Delhi', KA: 'Karnataka', TS: 'Telangana', TN: 'Tamil Nadu', GJ: 'Gujarat', RJ: 'Rajasthan' };

export function ageFrom(dob) {
  if (!dob) return 0;
  const d = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a -= 1;
  return a;
}

/**
 * Minimal wizard state: `data` + per-step validators returning an errors object.
 * validate(stepKey) → true when the step is clean.
 */
export function useWizard(initial, validators) {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };
  const validate = (key) => {
    const fn = validators[key];
    const e = fn ? fn(data) : {};
    const clean = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(clean);
    return Object.keys(clean).length === 0;
  };
  return { data, set, setData, errors, setErrors, validate };
}

/** Field helpers that bind to the wizard. */
export function TextField({ w, k, label, required, hint, optional, type = 'text', className, inputClass, ...rest }) {
  return (
    <Field label={label} required={required} optional={optional} hint={hint} error={w.errors[k]} htmlFor={`rg-${k}`} className={className}>
      <Input id={`rg-${k}`} type={type} value={w.data[k] ?? ''} onChange={(e) => w.set(k, e.target.value)} error={w.errors[k]} className={inputClass} {...rest} />
    </Field>
  );
}
export function SelectField({ w, k, label, required, hint, options, placeholder = 'Select', className, onChange }) {
  return (
    <Field label={label} required={required} hint={hint} error={w.errors[k]} htmlFor={`rg-${k}`} className={className}>
      <Select id={`rg-${k}`} value={w.data[k] ?? ''} onChange={(e) => (onChange ? onChange(e.target.value) : w.set(k, e.target.value))} options={options} placeholder={placeholder} error={w.errors[k]} />
    </Field>
  );
}
export function ChipsField({ w, k, label, options, required, hint, max }) {
  const val = w.data[k] || [];
  return (
    <fieldset>
      <legend className="label">
        {label}
        {required && <span className="text-bad-600"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = val.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => w.set(k, on ? val.filter((x) => x !== o) : max && val.length >= max ? val : [...val, o])}
              className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors', on ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-mist-200 text-mist-700 hover:border-mist-300')}
            >
              {on && <Check className="h-3.5 w-3.5" />}
              {o}
            </button>
          );
        })}
      </div>
      {w.errors[k] ? <p className="field-error">{w.errors[k]}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </fieldset>
  );
}
export function YesNo({ w, k, label, hint }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="inline-flex rounded-lg bg-mist-100 p-0.5">
        {['Yes', 'No'].map((o) => (
          <button key={o} type="button" onClick={() => w.set(k, o)} aria-pressed={w.data[k] === o} className={cn('rounded-md px-4 py-1.5 text-[13px] font-semibold', w.data[k] === o ? 'bg-white text-ink-900 shadow-card' : 'text-mist-600')}>
            {o}
          </button>
        ))}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

/** Page frame: role eyebrow, step list with progress, title. */
export function RegisterFrame({ role, steps, step, onJump, title, description, children, footer }) {
  const pct = Math.round((step / (steps.length - 1)) * 100);
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link to="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-mist-600 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Account types
        </Link>
        <span className="text-[12.5px] text-mist-500">
          Have an account?{' '}
          <Link to="/signin" className="font-semibold text-accent-700 hover:underline">
            Sign in
          </Link>
        </span>
      </div>
      <p className="eyebrow">
        {ROLE_META[role].label} registration · step {step + 1} of {steps.length}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist-100" aria-hidden="true">
        <div className="h-full rounded-full bg-accent-600 transition-all duration-500" style={{ width: `${Math.max(6, pct)}%` }} />
      </div>
      <ol className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {steps.map((s, i) => (
          <li key={s}>
            <button type="button" disabled={i >= step} onClick={() => onJump(i)} className={cn('inline-flex items-center gap-1 text-[12px] font-semibold', i === step ? 'text-ink-900' : i < step ? 'text-accent-700 hover:underline' : 'text-mist-400')}>
              {i < step ? <Check className="h-3 w-3" /> : <span className="font-mono">{i + 1}.</span>}
              {s}
            </button>
          </li>
        ))}
      </ol>
      <h1 className="mt-6 text-[26px] font-bold leading-tight">{title}</h1>
      {description && <p className="mt-1.5 text-mist-600">{description}</p>}
      <div className="mt-6 space-y-4">{children}</div>
      {footer && <div className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t border-mist-100 pt-5">{footer}</div>}
    </div>
  );
}

export function NavButtons({ step, onBack, onNext, nextLabel = 'Continue', loading, disabled }) {
  return (
    <>
      {step > 0 ? (
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button iconRight={ArrowRight} onClick={onNext} loading={loading} disabled={disabled}>
        {nextLabel}
      </Button>
    </>
  );
}

/** Step 1 of every flow: mobile number + OTP, with duplicate-account detection. */
export function PhoneVerifyStep({ w, role }) {
  const { findUserByPhone } = useStore();
  const toast = useToast();
  const [stage, setStage] = useState(w.data.phoneVerified ? 'done' : 'enter');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [existing, setExisting] = useState(null);
  const [busy, setBusy] = useState(false);
  const cc = w.data.cc || '+91';
  const [params] = useSearchParams();
  useEffect(() => {
    const p = params.get('phone');
    if (p && !w.data.mobile) w.set('mobile', p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const send = async () => {
    const digits = (w.data.mobile || '').replace(/\D/g, '');
    const c = COUNTRY_CODES.find((x) => x.value === cc);
    if (!c.re.test(digits)) return setErr(`Enter a valid ${c.len}-digit mobile number`);
    const full = formatPhone(cc, digits);
    const u = findUserByPhone(full);
    if (u) {
      setExisting(u);
      return setErr('');
    }
    setErr('');
    setExisting(null);
    setBusy(true);
    await sleep(500);
    setBusy(false);
    setStage('code');
    toast('Code sent (simulated).', { tone: 'info' });
  };
  const verify = async (value = code) => {
    if (value.length < 6) return setErr('Enter all 6 digits.');
    if (value !== DEMO_OTP) {
      setCode('');
      return setErr('That code is incorrect. Check the SMS and try again.');
    }
    setBusy(true);
    await sleep(400);
    setBusy(false);
    w.setData((d) => ({ ...d, phone: formatPhone(cc, (d.mobile || '').replace(/\D/g, '')), phoneVerified: true }));
    w.setErrors({});
    setStage('done');
  };

  if (stage === 'done') {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-ok-100 bg-ok-50 p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-ok-600" />
          <div>
            <p className="font-semibold text-ink-900">Mobile number verified</p>
            <p className="font-mono text-sm text-mist-600">{w.data.phone}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          icon={Pencil}
          onClick={() => {
            w.setData((d) => ({ ...d, phoneVerified: false }));
            setStage('enter');
            setCode('');
          }}
        >
          Change
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {stage === 'enter' ? (
        <>
          <Field label="Mobile number" required htmlFor="rg-mobile" error={err || w.errors.phoneVerified} hint="Used to sign in and for buyer calls. We'll send a 6-digit code.">
            <div className="flex gap-2">
              <Select aria-label="Country code" value={cc} onChange={(e) => w.set('cc', e.target.value)} options={COUNTRY_CODES} className="w-[118px] shrink-0" />
              <Input id="rg-mobile" type="tel" inputMode="numeric" value={w.data.mobile || ''} onChange={(e) => { w.set('mobile', e.target.value); setErr(''); setExisting(null); }} placeholder="98765 43210" className="font-mono text-[15px]" error={err} />
            </div>
          </Field>
          {existing && (
            <Alert tone="warn" title={`This number already has a ${ROLE_META[existing.role].label.toLowerCase()} account`}>
              One account per mobile number. Sign in to that account, or use a different number to register as {ROLE_META[role].label.toLowerCase()}.
              <div className="mt-2">
                <Button size="sm" variant="secondary" to="/signin">
                  Go to sign in
                </Button>
              </div>
            </Alert>
          )}
          <Button icon={MessageSquareText} onClick={send} loading={busy}>
            Send verification code
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-mist-600">
            Code sent to <span className="font-mono font-semibold text-ink-900">{maskPhone(formatPhone(cc, (w.data.mobile || '').replace(/\D/g, '')))}</span> ·{' '}
            <button type="button" className="font-semibold text-accent-700 hover:underline" onClick={() => { setStage('enter'); setCode(''); setErr(''); }}>
              Edit number
            </button>
          </p>
          <OtpInput
            value={code}
            onChange={(c) => {
              setCode(c);
              setErr('');
              if (c.length === 6) verify(c);
            }}
            error={!!err}
          />
          {err && <p className="field-error">{err}</p>}
          <Button icon={ShieldCheck} onClick={() => verify()} loading={busy}>
            Verify number
          </Button>
        </>
      )}
      <MockNotice>No SMS is sent. Use code <span className="font-mono font-semibold">{DEMO_OTP}</span>. Numbers already registered (e.g. 98610 21001) are detected.</MockNotice>
    </div>
  );
}

/** Review summary: one block per section with an Edit link back to that step. */
export function ReviewBlock({ title, rows, onEdit }) {
  return (
    <div className="rounded-xl border border-mist-200">
      <div className="flex items-center justify-between border-b border-mist-100 px-4 py-2.5">
        <p className="text-sm font-bold text-ink-900">{title}</p>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-700 hover:underline">
          <Pencil className="h-3 w-3" /> Edit
        </button>
      </div>
      <dl className="grid gap-x-4 gap-y-2 px-4 py-3 text-sm sm:grid-cols-2">
        {rows.filter(Boolean).map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[12px] text-mist-500">{k}</dt>
            <dd className="break-words font-medium text-ink-900">{v || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SuccessPanel({ role, name, next }) {
  const nav = useNavigate();
  return (
    <div className="text-center">
      <Confetti />
      <span className="pulse-ring mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok-50 text-ok-600">
        <CheckCircle2 className="h-9 w-9" />
      </span>
      <h1 className="mt-5 text-[28px] font-bold">Welcome to AutoDealer{name ? `, ${name.split(' ')[0]}` : ''}!</h1>
      <p className="mx-auto mt-2 max-w-md text-mist-600">Your {ROLE_META[role].label.toLowerCase()} account is ready and you're signed in.</p>
      <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
        {next.map(([t, d]) => (
          <li key={t} className="flex gap-2.5 rounded-lg bg-mist-50 px-3 py-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
            <span>
              <span className="font-semibold text-ink-900">{t}</span>
              <span className="block text-[12.5px] text-mist-600">{d}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {role !== 'buyer' && role !== 'admin' && (
          <Button onClick={() => nav(role === 'seller' ? '/seller/vehicle' : `${ROLE_META[role].home}/vehicles/new`)}>List your first car</Button>
        )}
        <Button variant={role === 'buyer' || role === 'admin' ? 'primary' : 'secondary'} onClick={() => nav(role === 'buyer' ? '/cars' : ROLE_META[role].home)}>
          {role === 'buyer' ? 'Start browsing' : 'Go to dashboard'}
        </Button>
      </div>
    </div>
  );
}
