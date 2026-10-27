import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Building2, Car, Check, Handshake } from 'lucide-react';
import { Button } from '../../components/ui';
import { cn } from '../../utils/format';

export const ROLE_CARDS = [
  {
    role: 'dealer',
    icon: Building2,
    title: 'Dealer',
    desc: 'You run a showroom or used-car business.',
    points: ['List as many vehicles as you stock', 'Business certificate required', 'Lead inbox and performance charts'],
  },
  {
    role: 'seller',
    icon: Car,
    title: 'Private seller',
    desc: 'You are selling your own car.',
    points: ['One active listing at a time', 'Personal ID required', 'Buyers contact you directly'],
  },
  {
    role: 'agent',
    icon: Handshake,
    title: 'Agent',
    desc: 'You sell cars on behalf of their owners.',
    points: ['List for multiple owners', 'ID + owner authorisation', 'Owner → buyer handover tracker'],
  },
];

export default function RoleSelect() {
  const [role, setRole] = useState('');
  const nav = useNavigate();
  return (
    <div>
      <p className="eyebrow">Create your account · step 1 of 3</p>
      <h1 className="mt-2 text-[28px] font-bold leading-tight">How will you sell on Drivana?</h1>
      <p className="mt-1.5 text-mist-600">Each account has one type. You can't switch later, so pick the one that fits.</p>
      <div className="mt-6 space-y-3" role="radiogroup" aria-label="Account type">
        {ROLE_CARDS.map((c) => (
          <button
            key={c.role}
            type="button"
            role="radio"
            aria-checked={role === c.role}
            onClick={() => setRole(c.role)}
            onDoubleClick={() => nav(`/signin?role=${c.role}`)}
            className={cn('flex w-full items-start gap-4 rounded-xl border bg-white p-4 text-left transition', role === c.role ? 'border-accent-500 ring-2 ring-accent-100' : 'border-mist-200 hover:border-mist-300')}
          >
            <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', role === c.role ? 'bg-accent-600 text-white' : 'bg-mist-100 text-ink-800')}>
              <c.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[16px] font-bold text-ink-900">{c.title}</span>
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border', role === c.role ? 'border-accent-600 bg-accent-600 text-white' : 'border-mist-300')}>{role === c.role && <Check className="h-3 w-3" strokeWidth={3} />}</span>
              </span>
              <span className="block text-sm text-mist-600">{c.desc}</span>
              <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {c.points.map((p) => (
                  <span key={p} className="text-[12.5px] text-mist-500">
                    · {p}
                  </span>
                ))}
              </span>
            </span>
          </button>
        ))}
      </div>
      <Button size="lg" className="mt-6 w-full" disabled={!role} iconRight={ArrowRight} onClick={() => nav(`/signin?role=${role}`)}>
        {role ? `Continue as ${ROLE_CARDS.find((c) => c.role === role).title.toLowerCase()}` : 'Choose an account type'}
      </Button>
      <div className="mt-6 flex flex-col gap-2 border-t border-mist-100 pt-5 text-sm text-mist-600 sm:flex-row sm:justify-between">
        <span>
          Already registered?{' '}
          <Link to="/signin" className="font-semibold text-accent-700 hover:underline">
            Sign in
          </Link>
        </span>
        <span>
          Just buying?{' '}
          <Link to="/buyer/welcome" className="font-semibold text-accent-700 hover:underline">
            Continue as buyer
          </Link>
        </span>
      </div>
    </div>
  );
}
