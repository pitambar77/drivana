import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MessageSquareText } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Button, Checkbox, Field, Input, MockNotice, Select } from '../../components/ui';
import { ROLE_META } from '../../config/site';
import { ROLE_CARDS } from './RoleSelect';
import { sleep } from '../../utils/format';

export const COUNTRY_CODES = [
  { value: '+91', label: '🇮🇳 +91', len: 10, re: /^[6-9]\d{9}$/ },
  { value: '+971', label: '🇦🇪 +971', len: 9, re: /^5\d{8}$/ },
  { value: '+254', label: '🇰🇪 +254', len: 9, re: /^[17]\d{8}$/ },
  { value: '+44', label: '🇬🇧 +44', len: 10, re: /^7\d{9}$/ },
  { value: '+1', label: '🇺🇸 +1', len: 10, re: /^\d{10}$/ },
];

const schema = z
  .object({
    cc: z.string(),
    phone: z.string().trim(),
    role: z.string().optional(),
    consent: z.literal(true, { message: 'You need to agree before we can send a code' }),
  })
  .superRefine((d, ctx) => {
    const c = COUNTRY_CODES.find((x) => x.value === d.cc);
    const digits = d.phone.replace(/\D/g, '');
    if (!c.re.test(digits)) ctx.addIssue({ code: 'custom', path: ['phone'], message: `Enter a valid ${c.len}-digit mobile number` });
  });

export const PENDING_KEY = 'drivana-pending-otp';
export function savePending(p) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
export function readPending() {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null');
  } catch {
    return null;
  }
}

export function formatPhone(cc, phone) {
  const d = phone.replace(/\D/g, '');
  return cc === '+91' ? `${cc} ${d.slice(0, 5)} ${d.slice(5)}` : `${cc} ${d}`;
}

export default function PhoneSignIn() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { findUserByPhone } = useStore();
  const presetRole = params.get('role');
  const next = params.get('next') || '';
  const [conflict, setConflict] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { cc: '+91', phone: '', role: presetRole || '', consent: false } });
  const role = watch('role');

  const submit = async (d, force) => {
    const full = formatPhone(d.cc, d.phone);
    const existing = findUserByPhone(full);
    if (existing && d.role && existing.role !== d.role && !force) {
      setConflict({ existing, d });
      return;
    }
    await sleep(600);
    const pending = { phone: full, role: existing?.role || d.role || 'buyer', isNew: !existing, next, sentAt: Date.now() };
    savePending(pending);
    nav('/verify-otp', { state: pending });
  };

  return (
    <div>
      <Link to="/register" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-mist-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Account types
      </Link>
      <p className="eyebrow">{presetRole ? `${ROLE_META[presetRole]?.label} account · step 2 of 3` : 'Sign in or register'}</p>
      <h1 className="mt-2 text-[28px] font-bold leading-tight">Enter your mobile number</h1>
      <p className="mt-1.5 text-mist-600">We'll send a 6-digit code to sign you in. New numbers get an account automatically.</p>

      <form onSubmit={handleSubmit((d) => submit(d))} noValidate className="mt-6 space-y-4">
        {!presetRole && (
          <Field label="I want to" htmlFor="si-role" hint="Leave as-is if you already have an account">
            <Select id="si-role" {...register('role')} placeholder="Sign in to my existing account" options={ROLE_CARDS.map((c) => ({ value: c.role, label: `Register as ${c.title.toLowerCase()}` }))} />
          </Field>
        )}
        <Field label="Mobile number" htmlFor="si-phone" error={errors.phone?.message} required>
          <div className="flex gap-2">
            <Select aria-label="Country code" {...register('cc')} options={COUNTRY_CODES} className="w-[118px] shrink-0" />
            <Input id="si-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98610 21001" {...register('phone')} error={errors.phone} className="font-mono text-[15px]" />
          </div>
        </Field>
        <div>
          <Checkbox
            {...register('consent')}
            label={
              <>
                I agree to the <Link to="/support" className="font-semibold text-accent-700 underline">Terms</Link> and <Link to="/support" className="font-semibold text-accent-700 underline">Privacy Policy</Link>, and consent to receive a one-time code by SMS.
              </>
            }
          />
          {errors.consent && <p className="field-error">{errors.consent.message}</p>}
        </div>
        {conflict && (
          <Alert tone="warn" title={`This number is registered as ${ROLE_META[conflict.existing.role].label}`}>
            One account per number. Continue to sign in to your {ROLE_META[conflict.existing.role].label.toLowerCase()} account, or use a different number to register as {ROLE_META[role]?.label.toLowerCase()}.
            <div className="mt-2">
              <Button size="sm" variant="secondary" onClick={() => submit(conflict.d, true)}>
                Sign in as {ROLE_META[conflict.existing.role].label}
              </Button>
            </div>
          </Alert>
        )}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} icon={MessageSquareText}>
          Send code
        </Button>
        <MockNotice>
          No SMS is sent. Demo numbers: dealer <span className="font-mono">98610 21001</span>, seller <span className="font-mono">…21002</span>, agent <span className="font-mono">…21003</span>, buyer <span className="font-mono">…21004</span>. Any other number creates a new account.
        </MockNotice>
      </form>
    </div>
  );
}
