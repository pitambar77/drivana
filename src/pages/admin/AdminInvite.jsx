import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, MailCheck, QrCode, ShieldCheck, UserPlus } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Button, CopyText, Field, Input, MockNotice, OtpInput, Select } from '../../components/ui';
import { Logo } from '../../components/layout/Brand';
import { StyleToggle } from '../../store/StyleContext';
import { Confetti } from '../../components/interactive/Interactive';
import { DEMO_OTP } from '../auth/OtpVerify';
import { RE } from '../auth/register/RegisterKit';
import { cn } from '../../utils/format';

export const DEMO_INVITE = 'AD-ADMIN-2026';
const STEPS = ['Invitation', 'Profile', 'Password', 'Two-step verification'];
const SECRET = 'JBSW Y3DP EHPK 3PXP';

function strength(p) {
  const checks = [
    [p.length >= 12, 'At least 12 characters'],
    [/[A-Z]/.test(p) && /[a-z]/.test(p), 'Upper and lower case letters'],
    [/\d/.test(p), 'A number'],
    [/[^A-Za-z0-9]/.test(p), 'A symbol'],
  ];
  return { score: checks.filter(([ok]) => ok).length, checks };
}

/** Decorative QR-like grid generated from the secret (not a scannable code). */
function FauxQr() {
  const cells = useMemo(() => {
    let seed = 7;
    return Array.from({ length: 21 * 21 }, (_, i) => {
      const x = i % 21;
      const y = Math.floor(i / 21);
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (finder) {
        const fx = x > 13 ? x - 14 : x;
        const fy = y > 13 ? y - 14 : y;
        return fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5);
      }
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280 > 0.52;
    });
  }, []);
  return (
    <svg viewBox="0 0 21 21" className="keep-light h-40 w-40 rounded-lg bg-[#fff] p-2" aria-label="Authenticator setup code">
      {cells.map((on, i) => on && <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#0F1B2E" />)}
    </svg>
  );
}

export default function AdminInvite() {
  const { registerUser, login } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ code: '', email: '', name: '', team: 'Operations', phone: '', password: '', confirm: '' });
  const [errs, setErrs] = useState({});
  const [show, setShow] = useState(false);
  const [otp, setOtp] = useState('');
  const [done, setDone] = useState(false);
  const set = (k) => (e) => {
    setD({ ...d, [k]: e.target.value });
    setErrs({ ...errs, [k]: undefined });
  };
  const st = strength(d.password);

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (d.code.trim().toUpperCase() !== DEMO_INVITE) e.code = "That invitation code isn't valid or has expired. Ask the admin who invited you to resend it.";
      if (!/^[^\s@]+@autodealer\.example$/i.test(d.email.trim())) e.email = 'Use the work email the invitation was sent to (@autodealer.example)';
    }
    if (step === 1) {
      if (d.name.trim().length < 3) e.name = 'Enter your full name';
      if (!RE.mobile.test(d.phone.replace(/\D/g, ''))) e.phone = 'Enter a 10-digit mobile number';
    }
    if (step === 2) {
      if (st.score < 4) e.password = 'Use a stronger password that meets every rule below';
      if (d.confirm !== d.password) e.confirm = "Passwords don't match";
    }
    if (step === 3 && otp !== DEMO_OTP) {
      e.otp = 'That code is incorrect. Enter the 6 digits shown in your authenticator app.';
      setOtp('');
    }
    setErrs(e);
    return !Object.keys(e).length;
  };
  const next = () => {
    if (!validate()) return;
    if (step < 3) return setStep(step + 1);
    const digits = d.phone.replace(/\D/g, '');
    const u = registerUser({ role: 'admin', phone: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`, name: d.name.trim(), email: d.email.trim().toLowerCase(), team: d.team, docStatus: 'verified', twoFactor: true });
    login(u.id);
    setDone(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 py-10" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div className="w-full max-w-[480px]">
        <div className="mb-6 flex items-center justify-between">
          <Logo dark />
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-300">Admin invite</span>
            <StyleToggle onDark />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-pop md:p-8">
          {done ? (
            <div className="text-center">
              <Confetti />
              <span className="pulse-ring mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok-50 text-ok-600">
                <ShieldCheck className="h-8 w-8" />
              </span>
              <h1 className="mt-4 text-2xl font-bold">Admin account activated</h1>
              <p className="mt-1.5 text-sm text-mist-600">
                {d.team} team · two-step verification on. Sign in with {d.email} next time.
              </p>
              <Button className="mt-6 w-full" onClick={() => nav('/admin')}>
                Open the admin console
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <span key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-accent-600' : 'bg-mist-200')} />
                ))}
              </div>
              <p className="mt-3 text-[12px] font-semibold text-mist-500">
                Step {step + 1} of {STEPS.length} · {STEPS[step]}
              </p>
              {step === 0 && (
                <div className="mt-4 space-y-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white">
                    <MailCheck className="h-5 w-5" />
                  </span>
                  <h1 className="text-2xl font-bold">Accept your invitation</h1>
                  <p className="text-sm text-mist-600">Admin accounts can't be created publicly. Enter the code from your invitation email.</p>
                  <Field label="Invitation code" htmlFor="ai-code" error={errs.code} required>
                    <Input id="ai-code" value={d.code} onChange={set('code')} className="font-mono uppercase" error={errs.code} placeholder="AD-XXXXX-0000" />
                  </Field>
                  <Field label="Work email" htmlFor="ai-email" error={errs.email} required>
                    <Input id="ai-email" type="email" value={d.email} onChange={set('email')} error={errs.email} placeholder="you@autodealer.example" />
                  </Field>
                </div>
              )}
              {step === 1 && (
                <div className="mt-4 space-y-4">
                  <h1 className="text-2xl font-bold">Your admin profile</h1>
                  <Field label="Full name" htmlFor="ai-name" error={errs.name} required>
                    <Input id="ai-name" value={d.name} onChange={set('name')} error={errs.name} autoComplete="name" />
                  </Field>
                  <Field label="Team" htmlFor="ai-team" hint="Decides which screens you see first. Permissions are set by the inviter.">
                    <Select id="ai-team" value={d.team} onChange={set('team')} options={['Operations', 'Trust & safety', 'Finance', 'Customer support']} />
                  </Field>
                  <Field label="Mobile number" htmlFor="ai-phone" error={errs.phone} required hint="For account recovery only">
                    <Input id="ai-phone" prefix="+91" inputMode="tel" value={d.phone} onChange={set('phone')} error={errs.phone} />
                  </Field>
                </div>
              )}
              {step === 2 && (
                <div className="mt-4 space-y-4">
                  <h1 className="text-2xl font-bold">Create a password</h1>
                  <Field label="Password" htmlFor="ai-pass" error={errs.password} required>
                    <div className="relative">
                      <Input id="ai-pass" type={show ? 'text' : 'password'} value={d.password} onChange={set('password')} error={errs.password} className="pr-10" autoComplete="new-password" />
                      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-mist-500" aria-label={show ? 'Hide password' : 'Show password'}>
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i < st.score ? (st.score < 3 ? 'bg-bad-600' : st.score < 4 ? 'bg-warn-600' : 'bg-ok-600') : 'bg-mist-200')} />
                      ))}
                    </div>
                    <ul className="mt-2.5 grid grid-cols-2 gap-1.5 text-[12.5px]">
                      {st.checks.map(([ok, t]) => (
                        <li key={t} className={cn('flex items-center gap-1.5', ok ? 'text-ok-700' : 'text-mist-500')}>
                          <Check className={cn('h-3.5 w-3.5', !ok && 'opacity-30')} /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Field label="Confirm password" htmlFor="ai-confirm" error={errs.confirm} required>
                    <Input id="ai-confirm" type={show ? 'text' : 'password'} value={d.confirm} onChange={set('confirm')} error={errs.confirm} autoComplete="new-password" />
                  </Field>
                </div>
              )}
              {step === 3 && (
                <div className="mt-4 space-y-4">
                  <h1 className="text-2xl font-bold">Turn on two-step verification</h1>
                  <p className="text-sm text-mist-600">Required for every admin. Scan with Google Authenticator, Microsoft Authenticator or 1Password, then enter the 6-digit code.</p>
                  <div className="flex flex-col items-center gap-4 rounded-xl bg-mist-50 p-4 sm:flex-row">
                    <FauxQr />
                    <div className="min-w-0 text-sm">
                      <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                        <QrCode className="h-4 w-4" /> Can't scan?
                      </p>
                      <p className="mt-1 text-mist-600">Enter this key manually:</p>
                      <p className="mt-1 select-all font-mono text-[13px] font-semibold text-ink-900">{SECRET}</p>
                      <CopyText text={SECRET.replace(/\s/g, '')} className="mt-1" />
                    </div>
                  </div>
                  <OtpInput value={otp} onChange={(v) => { setOtp(v); setErrs({}); }} error={!!errs.otp} />
                  {errs.otp && <p className="field-error">{errs.otp}</p>}
                </div>
              )}
              <div className="mt-6 flex items-center justify-between gap-2">
                {step > 0 ? (
                  <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ) : (
                  <Link to="/admin/login" className="text-sm font-semibold text-accent-700 hover:underline">
                    Already have access? Sign in
                  </Link>
                )}
                <Button icon={step === 3 ? UserPlus : undefined} iconRight={step < 3 ? ArrowRight : undefined} onClick={next}>
                  {step === 3 ? 'Activate account' : 'Continue'}
                </Button>
              </div>
            </>
          )}
        </div>
        <MockNotice className="mt-4 border-white/15 bg-white/5 text-ink-200">
          Demo invite code <span className="font-mono">{DEMO_INVITE}</span>, any <span className="font-mono">@autodealer.example</span> email, authenticator code <span className="font-mono">{DEMO_OTP}</span>. <KeyRound className="inline h-3 w-3" /> Passwords aren't stored.
        </MockNotice>
      </div>
    </div>
  );
}
