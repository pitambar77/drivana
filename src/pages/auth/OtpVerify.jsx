import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Button, Field, Input, MockNotice, OtpInput, useToast } from '../../components/ui';
import { ROLE_META } from '../../config/site';
import { readPending, savePending } from './PhoneSignIn';
import { maskPhone, sleep } from '../../utils/format';

export const DEMO_OTP = '246810';
const RESEND_SECONDS = 30;

/** Shared OTP logic so the buyer onboarding can reuse it inline. */
export function useOtp() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [left, setLeft] = useState(RESEND_SECONDS);
  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const check = () => {
    if (attempts >= 5) {
      setError('Too many attempts. Request a new code.');
      return false;
    }
    if (code.length < 6) {
      setError('Enter all 6 digits.');
      return false;
    }
    if (code !== DEMO_OTP) {
      // Clear the boxes so a corrected code is typed fresh (and auto-submit doesn't fire per keystroke).
      setCode('');
      setAttempts((a) => a + 1);
      setError(`That code is incorrect. ${4 - attempts > 0 ? `${4 - attempts} attempt${4 - attempts === 1 ? '' : 's'} left.` : 'Request a new code.'}`);
      return false;
    }
    setError('');
    return true;
  };
  const resend = () => {
    setLeft(RESEND_SECONDS);
    setAttempts(0);
    setCode('');
    setError('');
  };
  return { code, setCode: (c) => { setCode(c); setError(''); }, error, check, left, resend, locked: attempts >= 5 };
}

export default function OtpVerify() {
  const loc = useLocation();
  const nav = useNavigate();
  const toast = useToast();
  const { findUserByPhone, registerUser, login } = useStore();
  const pending = loc.state || readPending() || { phone: '+91 98610 21001', role: 'dealer', isNew: false, next: '', demo: true };
  const otp = useOtp();
  const [stage, setStage] = useState('code');
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [busy, setBusy] = useState(false);

  const finish = (user) => {
    login(user.id);
    savePending(null);
    toast(`Signed in as ${ROLE_META[user.role].label}.`, { title: `Welcome${user.name ? `, ${user.name.split(' ')[0]}` : ''}` });
    const dest = pending.next ? decodeURIComponent(pending.next) : ROLE_META[user.role].home;
    nav(dest, { replace: true });
  };

  const verify = async (e) => {
    e?.preventDefault();
    if (!otp.check()) return;
    setBusy(true);
    await sleep(500);
    setBusy(false);
    const existing = findUserByPhone(pending.phone);
    if (existing) {
      if (existing.status === 'suspended') {
        otp.setCode('');
        setStage('suspended');
        return;
      }
      finish(existing);
    } else setStage('name');
  };

  const createAccount = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setNameErr('Enter your full name');
      return;
    }
    const u = registerUser({ phone: pending.phone, role: pending.role, name: name.trim() });
    setTimeout(() => finish(u), 30);
  };

  // auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.code.length === 6 && stage === 'code') verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp.code]);

  if (stage === 'suspended') {
    return (
      <div>
        <Alert tone="error" title="This account is suspended">
          An administrator suspended this account. Contact support to find out why and how to restore access.
        </Alert>
        <Button to="/support" className="mt-4">
          Contact support
        </Button>
      </div>
    );
  }

  if (stage === 'name') {
    return (
      <form onSubmit={createAccount} noValidate>
        <p className="eyebrow">New {ROLE_META[pending.role].label} account · step 3 of 3</p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight">Your number is verified</h1>
        <p className="mt-1.5 text-mist-600">Tell us your name. Buyers see it on your listings{pending.role === 'dealer' ? ' alongside your business name' : ''}.</p>
        <Field label="Full name" htmlFor="otp-name" error={nameErr} className="mt-6" required>
          <Input id="otp-name" value={name} onChange={(e) => { setName(e.target.value); setNameErr(''); }} error={nameErr} autoComplete="name" autoFocus />
        </Field>
        <Button type="submit" size="lg" className="mt-5 w-full">
          Create account
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} noValidate>
      <Link to={`/signin${pending.role ? `?role=${pending.role}` : ''}`} className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-mist-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <p className="eyebrow">Verify your number</p>
      <h1 className="mt-2 text-[28px] font-bold leading-tight">Enter the 6-digit code</h1>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-mist-600">
        Sent to <span className="font-mono font-semibold text-ink-900">{maskPhone(pending.phone)}</span>
        <Link to={`/signin${pending.role ? `?role=${pending.role}` : ''}`} className="inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:underline">
          <Pencil className="h-3.5 w-3.5" /> Edit number
        </Link>
      </p>
      {pending.demo && (
        <Alert tone="info" className="mt-4" title="Opened directly">
          No number was entered, so this screen is using the demo dealer number.
        </Alert>
      )}
      <div className="mt-6">
        <OtpInput value={otp.code} onChange={otp.setCode} error={!!otp.error} disabled={otp.locked} />
        {otp.error && <p className="field-error mt-2" role="alert">{otp.error}</p>}
      </div>
      <div className="mt-4 text-sm text-mist-600">
        {otp.left > 0 ? (
          <span className="num">
            Didn't get it? Resend in <span className="font-mono font-semibold text-ink-900">0:{String(otp.left).padStart(2, '0')}</span>
          </span>
        ) : (
          <button
            type="button"
            className="font-semibold text-accent-700 hover:underline"
            onClick={() => {
              otp.resend();
              toast('A new code is on its way.', { tone: 'info' });
            }}
          >
            Resend code
          </button>
        )}
      </div>
      <Button type="submit" size="lg" className="mt-6 w-full" loading={busy} icon={ShieldCheck} disabled={otp.locked}>
        Verify & continue
      </Button>
      <MockNotice className="mt-4">
        Use code <span className="font-mono font-semibold">{DEMO_OTP}</span>. Any other code shows the error state.
      </MockNotice>
    </form>
  );
}
