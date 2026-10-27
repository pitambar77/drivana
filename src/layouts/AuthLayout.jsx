import { Outlet } from 'react-router-dom';
import { BadgeCheck, PhoneCall, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/layout/Brand';
import { CarArt } from '../components/vehicle/CarArt';

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_minmax(440px,0.9fr)]">
      <div className="flex flex-col py-6" style={{ paddingLeft: 'max(20px, env(safe-area-inset-left, 0px))', paddingRight: 'max(20px, env(safe-area-inset-right, 0px))' }}>
        <Logo />
        <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center py-10">
          <Outlet />
        </div>
        <p className="text-center text-xs text-mist-500">Demo build — sign-in, OTP and payments are simulated.</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between" style={{ paddingRight: 'env(safe-area-inset-right, 0px)' }}>
        <div className="px-12 pt-16">
          <p className="eyebrow text-accent-300">For dealers, owners and agents</p>
          <h2 className="mt-3 max-w-md text-[34px] font-bold leading-[1.1] text-white">Publish in minutes. Get calls from real buyers.</h2>
          <ul className="mt-8 space-y-4 text-[15px] text-ink-200">
            <li className="flex gap-3">
              <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
              Buyers call or message you directly. No commission on the sale.
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
              Duplicate registration numbers and VINs are blocked automatically.
            </li>
            <li className="flex gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
              Verified-document badge once our team reviews your papers.
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-accent-900/40 to-transparent" />
          <CarArt vehicle={{ bodyType: 'SUV', colorHex: '#3D66E8' }} view="rear" className="aspect-[16/9] w-full bg-transparent" />
        </div>
      </aside>
    </div>
  );
}
