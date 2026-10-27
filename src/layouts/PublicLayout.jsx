import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GitCompareArrows, Heart, LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react';
import { Logo } from '../components/layout/Brand';
import { Avatar } from '../components/ui';
import { useStore } from '../store/AppStore';
import { ROLE_META, SITE } from '../config/site';
import { cn } from '../utils/format';

const LINKS = [
  { to: '/cars', label: 'Buy a car' },
  { to: '/how-it-works', label: 'Sell your car' },
  { to: '/loan-calculator', label: 'Loan calculator' },
  { to: '/verify-vehicle', label: 'Verify a vehicle' },
  { to: '/support', label: 'Support' },
];

export function Navbar() {
  const { state, me, role, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [loc.pathname]);

  return (
    <header className="sticky z-40 border-b border-mist-200 bg-white/95 backdrop-blur" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="container-page flex h-16 items-center gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-[14px] font-semibold transition-colors', isActive ? 'text-accent-700' : 'text-ink-700 hover:bg-mist-100 hover:text-ink-900')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link to="/compare" className="btn-icon relative" aria-label="Compare cars" title="Compare">
            <GitCompareArrows className="h-[18px] w-[18px]" />
            {state.compare.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">{state.compare.length}</span>}
          </Link>
          <Link to={role === 'buyer' ? '/buyer/saved' : '/buyer/welcome?next=/buyer/saved'} className="btn-icon relative" aria-label="Saved cars" title="Saved cars">
            <Heart className="h-[18px] w-[18px]" />
            {state.saved.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-bold text-white">{state.saved.length}</span>}
          </Link>
          {me ? (
            <div className="relative ml-1">
              <button type="button" onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-mist-100" aria-haspopup="menu" aria-expanded={menu}>
                <Avatar name={me.name} size={32} />
                <span className="hidden text-[13px] font-semibold text-ink-800 md:block">{me.name.split(' ')[0]}</span>
              </button>
              {menu && (
                <div className="absolute right-0 top-11 w-56 animate-fade-up rounded-xl border border-mist-200 bg-white p-1.5 shadow-pop" role="menu">
                  <p className="px-2.5 py-2 text-xs text-mist-500">
                    Signed in as <span className="font-semibold text-ink-800">{ROLE_META[role].label}</span>
                  </p>
                  <Link to={ROLE_META[role].home} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-mist-100" role="menuitem">
                    <LayoutDashboard className="h-4 w-4" /> My dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      nav('/');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-bad-600 hover:bg-bad-50"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin" className="btn btn-md btn-ghost hidden sm:inline-flex">
              Sign in
            </Link>
          )}
          <Link to={me && role !== 'buyer' && role !== 'admin' ? `${ROLE_META[role].home}${role === 'seller' ? '/vehicle' : '/vehicles/new'}` : '/register'} className="btn btn-md btn-primary hidden md:inline-flex">
            <Plus className="h-4 w-4" /> List your car
          </Link>
          <button type="button" className="btn-icon lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-mist-200 bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => cn('rounded-lg px-3 py-2.5 text-[15px] font-semibold', isActive ? 'bg-accent-50 text-accent-700' : 'text-ink-800')}>
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-mist-100 pt-3">
              {!me && (
                <Link to="/signin" className="btn btn-md btn-secondary">
                  Sign in
                </Link>
              )}
              <Link to="/register" className={cn('btn btn-md btn-primary', me && 'col-span-2')}>
                List your car
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const cols = [
    ['Buy', [['Browse all cars', '/cars'], ['SUVs', '/cars?body=SUV'], ['Electric cars', '/cars?fuel=Electric'], ['Compare cars', '/compare'], ['Loan calculator', '/loan-calculator']]],
    ['Sell', [['How it works', '/how-it-works'], ['Listing plans', '/how-it-works#plans'], ['Register as dealer', '/signin?role=dealer'], ['Sell as owner', '/signin?role=seller'], ['Join as agent', '/signin?role=agent']]],
    ['Help', [['Support & FAQ', '/support'], ['Verify a vehicle', '/verify-vehicle'], ['Buyer account', '/buyer/welcome'], ['Admin console', '/admin/login']]],
  ];
  return (
    <footer className="mt-auto bg-ink-950 text-ink-200">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs space-y-3">
          <Logo dark />
          <p className="text-sm text-ink-300">{SITE.tagline}. Contact sellers directly — Drivana never takes a cut of the car's price.</p>
          <p className="text-[13px] text-ink-400">
            {SITE.supportPhone}
            <br />
            {SITE.supportEmail}
          </p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-400">{title}</h3>
            <ul className="space-y-2">
              {links.map(([l, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-ink-200 hover:text-white">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-[12.5px] text-ink-400 md:flex-row md:justify-between">
          <p>© 2026 {SITE.name} Technologies Pvt. Ltd. Demo build with mock data.</p>
          <p>Listings are published by sellers. "Live" does not mean documents are verified.</p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
