import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquareText } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Button, Checkbox, Field, Input, MockNotice, Select } from '../../components/ui';
import { ROLE_META } from '../../config/site';
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
    consent: z.literal(true, { message: 'You need to agree before we can send a code' }),
  })
  .superRefine((d, ctx) => {
    const c = COUNTRY_CODES.find((x) => x.value === d.cc);
    const digits = d.phone.replace(/\D/g, '');
    if (!c.re.test(digits)) ctx.addIssue({ code: 'custom', path: ['phone'], message: `Enter a valid ${c.len}-digit mobile number` });
  });

export const PENDING_KEY = 'autodealer-pending-otp';
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
  const [unknown, setUnknown] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { cc: '+91', phone: params.get('phone') || '', consent: false } });
  const phone = watch('phone');

  const submit = async (d) => {
    const full = formatPhone(d.cc, d.phone);
    const existing = findUserByPhone(full);
    await sleep(500);
    if (!existing) {
      setUnknown(full);
      return;
    }
    if (existing.role === 'admin') {
      nav('/admin/login');
      return;
    }
    const pending = { phone: full, role: existing.role, isNew: false, next, sentAt: Date.now() };
    savePending(pending);
    nav('/verify-otp', { state: pending });
  };

  return (
    <div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-2 text-[28px] font-bold leading-tight">Sign in to AutoDealer</h1>
      <p className="mt-1.5 text-mist-600">Enter the mobile number you registered with. We'll send a 6-digit code — no password needed.</p>

      <form onSubmit={handleSubmit(submit)} noValidate className="mt-6 space-y-4">
        <Field label="Mobile number" htmlFor="si-phone" error={errors.phone?.message} required>
          <div className="flex gap-2">
            <Select aria-label="Country code" {...register('cc')} options={COUNTRY_CODES} className="w-[118px] shrink-0" />
            <Input id="si-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98610 21001" {...register('phone', { onChange: () => setUnknown(null) })} error={errors.phone} className="font-mono text-[15px]" />
          </div>
        </Field>
        <div>
          <Checkbox {...register('consent')} label="I agree to receive a one-time sign-in code by SMS." />
          {errors.consent && <p className="field-error">{errors.consent.message}</p>}
        </div>
        {unknown && (
          <Alert tone="warn" title="No account with this number">
            {unknown} isn't registered yet. Create an account — it takes about two minutes.
            <div className="mt-2.5 flex flex-wrap gap-2">
              {(presetRole ? [presetRole] : ['dealer', 'seller', 'agent', 'buyer']).map((r) => (
                <Button key={r} size="sm" variant={presetRole ? 'primary' : 'secondary'} to={`/register/${r}?phone=${encodeURIComponent((phone || '').replace(/\D/g, ''))}`}>
                  Register as {ROLE_META[r].label.toLowerCase()}
                </Button>
              ))}
            </div>
          </Alert>
        )}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} icon={MessageSquareText}>
          Send sign-in code
        </Button>
        <div className="flex flex-col gap-1.5 border-t border-mist-100 pt-4 text-sm text-mist-600 sm:flex-row sm:justify-between">
          <span>
            New to AutoDealer?{' '}
            <Link to={presetRole ? `/register/${presetRole}` : '/register'} className="font-semibold text-accent-700 hover:underline">
              Create an account
            </Link>
          </span>
          <Link to="/admin/login" className="font-semibold text-mist-600 hover:text-ink-900">
            Staff sign-in
          </Link>
        </div>
        <MockNotice>
          No SMS is sent. Demo numbers: dealer <span className="font-mono">98610 21001</span>, seller <span className="font-mono">…21002</span>, agent <span className="font-mono">…21003</span>, buyer <span className="font-mono">…21004</span>.
        </MockNotice>
      </form>
    </div>
  );
}
