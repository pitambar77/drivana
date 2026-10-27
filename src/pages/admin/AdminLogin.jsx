import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Button, Checkbox, Field, Input, MockNotice } from '../../components/ui';
import { Logo } from '../../components/layout/Brand';
import { DEMO_USER_IDS } from '../../data/seed';
import { sleep } from '../../utils/format';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your work email').email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password').min(8, 'Passwords are at least 8 characters'),
  remember: z.boolean().optional(),
});
const ADMIN_EMAIL = 'admin@drivana.example';
const MAX_TRIES = 5;

export default function AdminLogin() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { login } = useStore();
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [tries, setTries] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '', remember: false } });
  const locked = tries >= MAX_TRIES;

  const submit = async (d) => {
    setError('');
    await sleep(700);
    if (d.email.toLowerCase() !== ADMIN_EMAIL) {
      const t = tries + 1;
      setTries(t);
      setError(t >= MAX_TRIES ? 'Too many failed attempts. This console is locked for 15 minutes.' : `That email and password combination isn't recognised. ${MAX_TRIES - t} attempt${MAX_TRIES - t === 1 ? '' : 's'} left.`);
      return;
    }
    login(DEMO_USER_IDS.admin);
    nav(params.get('next') ? decodeURIComponent(params.get('next')) : '/admin', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 py-10" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center justify-between">
          <Logo dark />
          <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-300">Admin console</span>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-pop md:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Sign in to administration</h1>
          <p className="mt-1 text-sm text-mist-600">Restricted to Drivana staff. All actions are logged.</p>
          <form onSubmit={handleSubmit(submit)} noValidate className="mt-6 space-y-4">
            {error && (
              <Alert tone="error" title={locked ? 'Console locked' : 'Sign-in failed'}>
                {error}
              </Alert>
            )}
            <Field label="Work email" htmlFor="al-email" error={errors.email?.message} required>
              <Input id="al-email" type="email" autoComplete="username" {...register('email')} error={errors.email} disabled={locked} />
            </Field>
            <Field label="Password" htmlFor="al-pass" error={errors.password?.message} required>
              <div className="relative">
                <Input id="al-pass" type={show ? 'text' : 'password'} autoComplete="current-password" {...register('password')} error={errors.password} className="pr-10" disabled={locked} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-mist-500 hover:text-ink-900" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <div className="flex items-center justify-between">
              <Checkbox {...register('remember')} label="Trust this device for 7 days" />
            </div>
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={locked} icon={KeyRound}>
              Sign in
            </Button>
          </form>
          <p className="mt-5 flex items-center gap-2 text-[12.5px] text-mist-500">
            <ShieldCheck className="h-4 w-4" /> Production builds add SSO and hardware-key 2FA.
          </p>
        </div>
        <MockNotice className="mt-4 border-white/15 bg-white/5 text-ink-200">
          Demo: email <span className="font-mono">{ADMIN_EMAIL}</span> with any password of 8+ characters. Other emails show the error state.
        </MockNotice>
      </div>
    </div>
  );
}
