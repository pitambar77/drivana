import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, Calculator, Car, CreditCard, FileSearch, Handshake, LifeBuoy, MessageSquare, PhoneCall, Search, ShieldCheck, UserRound, Zap } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Button, Select } from '../../components/ui';
import { VehicleCard } from '../../components/vehicle/VehicleCard';
import { CarArt } from '../../components/vehicle/CarArt';
import { BODY_TYPES, CATEGORIES, CITIES, CONDITIONS, MAKES, modelsFor } from '../../data/catalog';
import { PLANS } from '../../config/site';
import { PRICE_STEPS } from '../../utils/filters';
import { inr, lakh, num } from '../../utils/format';

function HeroSearch() {
  const nav = useNavigate();
  const [f, setF] = useState({ make: '', model: '', maxPrice: '', city: '', condition: '', body: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value, ...(k === 'make' ? { model: '' } : {}) }));
  const go = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    nav(`/cars?${p.toString()}`);
  };
  return (
    <form onSubmit={go} className="rounded-2xl bg-white p-4 shadow-pop md:p-5" aria-label="Search cars">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select aria-label="Brand" value={f.make} onChange={set('make')} placeholder="Any brand" options={MAKES} />
        <Select aria-label="Model" value={f.model} onChange={set('model')} placeholder={f.make ? 'Any model' : 'Model'} options={f.make ? modelsFor(f.make) : []} disabled={!f.make} />
        <Select aria-label="Budget" value={f.maxPrice} onChange={set('maxPrice')} placeholder="Any budget" options={PRICE_STEPS.map((p) => ({ value: String(p), label: `Up to ${lakh(p)}` }))} />
        <Select aria-label="City" value={f.city} onChange={set('city')} placeholder="All cities" options={CITIES.map((c) => c.name)} />
        <Select aria-label="Condition" value={f.condition} onChange={set('condition')} placeholder="New or used" options={CONDITIONS} />
        <Select aria-label="Body type" value={f.body} onChange={set('body')} placeholder="Any body type" options={BODY_TYPES} />
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {['Under ₹5 Lakh', 'Automatic', 'Electric'].map((t, i) => (
            <Link key={t} to={['/cars?maxPrice=500000', '/cars?transmission=Automatic', '/cars?fuel=Electric'][i]} className="rounded-full bg-mist-100 px-2.5 py-1 text-[12.5px] font-semibold text-ink-700 hover:bg-mist-200">
              {t}
            </Link>
          ))}
        </div>
        <Button type="submit" size="lg" icon={Search} className="sm:w-auto">
          Search cars
        </Button>
      </div>
    </form>
  );
}

export default function Home() {
  const { state } = useStore();
  const live = useMemo(() => state.vehicles.filter(isPublic), [state.vehicles]);
  const featured = live.filter((v) => v.featured).slice(0, 4);
  const recent = [...live].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 8);
  const brandCounts = MAKES.map((m) => ({ make: m, count: live.filter((v) => v.make === m).length })).filter((b) => b.count).sort((a, b) => b.count - a.count).slice(0, 12);
  const verifiedCount = live.filter((v) => v.verification === 'verified').length;
  const heroCar = { bodyType: 'SUV', colorHex: '#3D66E8' };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#13282d]">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: 'radial-gradient(60% 60% at 80% 30%, rgba(61,102,232,0.35), transparent 70%)' }} />
        <div className="container-page relative grid gap-8 pb-10 pt-10 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-16">
          <div className="min-w-0">
            <p className="eyebrow text-[#f15856]">{num(live.length)} cars live · {num(verifiedCount)} with verified documents</p>
            <h1 className="mt-3 max-w-xl text-[38px] font-extrabold leading-[1.02] text-white md:text-[54px]" style={{ fontStretch: '118%' }}>
              Find the car. Call the seller. Skip the middleman.
            </h1>
            <p className="mt-4 max-w-lg text-[16px] text-ink-200">Browse cars from dealers, owners and agents across India. Check the registration on the government portal, estimate your EMI, and talk to the seller directly.</p>
            <div className="mt-6 lg:hidden">
              <HeroSearch />
            </div>
          </div>
          <div className="relative hidden lg:block">
            {/* <CarArt vehicle={heroCar} view="rear" className="aspect-[16/10] w-full rounded-2xl bg-transparent" /> */}
              <img
    src="/banner-car.jpg"
    alt="Featured car"
    className="aspect-[16/10] w-full rounded-2xl object-contain"
  />
            <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-xl bg-white/95 px-3.5 py-2.5 shadow-pop">
              <BadgeCheck className="h-5 w-5 text-ok-600" />
              <div>
                <p className="text-[13px] font-bold text-ink-900">Duplicate-checked listings</p>
                <p className="text-[12px] text-mist-600">Every reg. number & VIN appears once</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:col-span-2 lg:block">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">Browse by category</h2>
          <Link to="/cars" className="hidden text-sm font-semibold text-accent-700 hover:underline sm:block">
            All cars →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => {
            const q = new URLSearchParams(c.query).toString();
            const count = live.filter((v) => (c.query.body ? v.bodyType === c.query.body : c.query.fuel ? v.fuel === c.query.fuel : v.price >= c.query.minPrice)).length;
            const art = { bodyType: c.query.body || (c.key === 'Luxury' ? 'Sedan' : 'SUV'), colorHex: { SUV: '#2E5744', Sedan: '#1E2228', Hatchback: '#A8262E', MUV: '#B7BCC4', Electric: '#2C5AA3', Luxury: '#5C626B' }[c.key] };
            return (
              <Link key={c.key} to={`/cars?${q}`} className="card group overflow-hidden transition-shadow hover:shadow-lift">
                <CarArt vehicle={art} className="aspect-[16/9] w-full" />
                <div className="flex items-center justify-between px-3.5 py-3">
                  <span className="font-semibold text-ink-900 group-hover:text-accent-700">{c.label}</span>
                  <span className="text-[12.5px] text-mist-500 num">{count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-white py-12">
        <div className="container-page">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured</p>
              <h2 className="mt-1 text-2xl font-bold">Hand-picked this week</h2>
            </div>
            <Link to="/cars?sort=relevance" className="text-sm font-semibold text-accent-700 hover:underline">
              See more →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="container-page py-12">
        <h2 className="mb-5 text-2xl font-bold">Popular brands</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brandCounts.map((b) => (
            <Link key={b.make} to={`/cars?make=${encodeURIComponent(b.make)}`} className="flex items-center justify-between rounded-xl border border-mist-200 bg-white px-4 py-3.5 transition-colors hover:border-accent-300 hover:bg-accent-50/40">
              <span className="truncate font-display text-[15px] font-bold text-ink-900" style={{ fontStretch: '110%' }}>
                {b.make}
              </span>
              <span className="ml-2 shrink-0 text-[12.5px] text-mist-500 num">{b.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently added */}
      <section className="bg-white py-12">
        <div className="container-page">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Just listed</p>
              <h2 className="mt-1 text-2xl font-bold">Recently added</h2>
            </div>
            <Link to="/cars?sort=newest" className="text-sm font-semibold text-accent-700 hover:underline">
              Newest first →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-14">
        <div className="max-w-2xl">
          <p className="eyebrow">How Drivana works</p>
          <h2 className="mt-1 text-[28px] font-bold">Buying a car in four steps</h2>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            [Search, 'Search & shortlist', 'Filter by budget, fuel, kilometres and city. Save cars and compare up to three side by side.'],
            [FileSearch, 'Check the paperwork', 'Use the registration number on the official VAHAN portal to confirm owner count, insurance and status.'],
            [Calculator, 'Estimate your EMI', 'Plan your down payment and tenure. Ask for loan help if you need it.'],
            [PhoneCall, 'Contact the seller', 'Call, message or send an enquiry. You pay the seller directly — no platform fee for buyers.'],
          ].map(([Icon, t, d], i) => (
            <li key={t} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="font-mono text-[12px] text-mist-400">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-[16px] font-bold">{t}</h3>
              <p className="mt-1.5 text-sm text-mist-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Benefits */}
      <section className="bg-white py-14">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-mist-200 p-6 md:p-8">
            <UserRound className="h-7 w-7 text-accent-600" />
            <h2 className="mt-4 text-[22px] font-bold">For buyers</h2>
            <ul className="mt-4 space-y-3 text-[15px] text-mist-700">
              {['Free to browse, save and compare — no sign-up needed', 'Talk to the seller directly; no commission on the price', 'Clear badges: live is not the same as document-verified', 'Every registration number and VIN appears in only one listing'].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ok-600" />
                  {t}
                </li>
              ))}
            </ul>
            <Button to="/cars" className="mt-6" iconRight={ArrowRight}>
              Start browsing
            </Button>
          </div>
          <div className="rounded-2xl bg-ink-950 p-6 text-white md:p-8">
            <Zap className="h-7 w-7 text-accent-300" />
            <h2 className="mt-4 text-[22px] font-bold text-white">For sellers</h2>
            <ul className="mt-4 space-y-3 text-[15px] text-ink-200">
              {['Listing goes live the moment payment succeeds — no waiting for approval', 'Phone sign-in with OTP, no passwords to remember', 'Lead inbox with enquiry status tracking', 'Dealers manage stock in bulk; agents track handovers'].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
                  {t}
                </li>
              ))}
            </ul>
            <Button to="/register" className="mt-6" iconRight={ArrowRight}>
              List your car
            </Button>
          </div>
        </div>
      </section>

      {/* Registration CTAs */}
      <section className="container-page py-14">
        <h2 className="text-[28px] font-bold">Choose how you sell</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [Building2, 'Dealer', 'Showrooms and used-car dealers with a business registration. List as many cars as you stock.', '/signin?role=dealer', 'Register as dealer'],
            [Car, 'Private seller', 'Selling your own car? One active listing per account, with your ID verified.', '/signin?role=seller', 'Sell my car'],
            [Handshake, 'Agent', 'List cars on behalf of owners with their authorisation and track each handover.', '/signin?role=agent', 'Join as agent'],
          ].map(([Icon, t, d, to, cta]) => (
            <div key={t} className="card flex flex-col p-6">
              <Icon className="h-7 w-7 text-ink-900" />
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-1.5 flex-1 text-sm text-mist-600">{d}</p>
              <Button to={to} variant="secondary" className="mt-5 w-full">
                {cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Plans + support */}
      <section className="bg-white py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">Listing plans</p>
            <h2 className="mt-1 text-[26px] font-bold">Pay once per listing. No commission.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {['seller-basic', 'agent-standard', 'dealer-pro'].map((id) => {
                const p = PLANS.find((x) => x.id === id);
                return (
                  <div key={id} className="rounded-xl border border-mist-200 p-4">
                    <p className="text-[13px] font-semibold text-mist-600">{p.name}</p>
                    <p className="mt-1 font-display text-2xl font-bold num" style={{ fontStretch: '110%' }}>
                      {inr(p.price)}
                    </p>
                    <p className="text-[12px] text-mist-500">+ GST · {p.vehicles > 1 ? `${p.vehicles} cars` : 'per car'} · {p.validityDays} days</p>
                  </div>
                );
              })}
            </div>
            <Link to="/how-it-works#plans" className="mt-4 inline-block text-sm font-semibold text-accent-700 hover:underline">
              Compare all plans →
            </Link>
          </div>
          <div className="rounded-2xl bg-mist-50 p-6">
            <LifeBuoy className="h-7 w-7 text-accent-600" />
            <h2 className="mt-3 text-xl font-bold">Need help?</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/support" className="flex items-center gap-2 font-semibold text-ink-800 hover:text-accent-700">
                  <MessageSquare className="h-4 w-4" /> Contact support & FAQs
                </Link>
              </li>
              <li>
                <Link to="/verify-vehicle" className="flex items-center gap-2 font-semibold text-ink-800 hover:text-accent-700">
                  <FileSearch className="h-4 w-4" /> How to verify a vehicle
                </Link>
              </li>
              <li>
                <Link to="/loan-calculator" className="flex items-center gap-2 font-semibold text-ink-800 hover:text-accent-700">
                  <CreditCard className="h-4 w-4" /> Loan & EMI calculator
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
