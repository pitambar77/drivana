import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  Car,
  CreditCard,
  FileSearch,
  Handshake,
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  Search,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";
import { useStore, isPublic } from "../../store/AppStore";
import { Button, Select } from "../../components/ui";
import { VehicleCard } from "../../components/vehicle/VehicleCard";
import { CarArt } from "../../components/vehicle/CarArt";
import { CountUp, Reveal } from "../../components/interactive/Interactive";
import bannerCar from "../../assets/defender-home.webp";
import { RangeInput } from "../../components/vehicle/EmiWidget";
import {
  BODY_TYPES,
  CATEGORIES,
  CITIES,
  CONDITIONS,
  MAKES,
  modelsFor,
} from "../../data/catalog";
import { PLANS } from "../../config/site";
import { PRICE_STEPS } from "../../utils/filters";
import { cn, inr, lakh, num } from "../../utils/format";

const categoryImages = {
  SUV: "/suv2.jpg",
  Sedan: "/sedan.webp",
  Hatchback: "/hatchback.avif",
  MUV: "/hatchback2.avif",
  Electric: "/electic.jpeg",
  Luxury: "/luxury-car.webp",
};

const featuredImages = {
  v1001: ["/m-swift-2.jpg"], // Maruti Suzuki Swift
  v1005: ["/m-brezza.avif"], // Maruti Suzuki Brezza
  v1006: ["/Tata-Harrier-2.avif"], // Tata Harrier
  v1020: ["/m-ertiga.jpg"], // Maruti Suzuki Ertiga
};

const recentVehicleImages = {
  v1008: ["/volswagen-3.webp"],
  v1002: ["/tata-nexon.jpg"],
  v1003: ["/hoda-ameze.avif"],
  v1022: ["/verna-2.jpg"],
  v1023: ["/BMW-3-series.jpg"],
  
  v1039: ["/i-20-2.jpeg"],
  v1100: ["/toyota-glanza.webp"],
  v1010: ["/scropio-n.jpg"],

  // Add more vehicle IDs and image paths here
  // v1021: ["/cars/creta.jpg"],
};

function HeroSearch() {
  const nav = useNavigate();
  const [f, setF] = useState({
    make: "",
    model: "",
    maxPrice: "",
    city: "",
    condition: "",
    body: "",
  });
  const set = (k) => (e) =>
    setF((s) => ({
      ...s,
      [k]: e.target.value,
      ...(k === "make" ? { model: "" } : {}),
    }));
  const go = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    nav(`/cars?${p.toString()}`);
  };
  return (
    <form
      onSubmit={go}
      className="rounded-2xl bg-white p-4 shadow-pop md:p-5"
      aria-label="Search cars"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          aria-label="Brand"
          value={f.make}
          onChange={set("make")}
          placeholder="Any brand"
          options={MAKES}
        />
        <Select
          aria-label="Model"
          value={f.model}
          onChange={set("model")}
          placeholder={f.make ? "Any model" : "Model"}
          options={f.make ? modelsFor(f.make) : []}
          disabled={!f.make}
        />
        <Select
          aria-label="Budget"
          value={f.maxPrice}
          onChange={set("maxPrice")}
          placeholder="Any budget"
          options={PRICE_STEPS.map((p) => ({
            value: String(p),
            label: `Up to ${lakh(p)}`,
          }))}
        />
        <Select
          aria-label="City"
          value={f.city}
          onChange={set("city")}
          placeholder="All cities"
          options={CITIES.map((c) => c.name)}
        />
        <Select
          aria-label="Condition"
          value={f.condition}
          onChange={set("condition")}
          placeholder="New or used"
          options={CONDITIONS}
        />
        <Select
          aria-label="Body type"
          value={f.body}
          onChange={set("body")}
          placeholder="Any body type"
          options={BODY_TYPES}
        />
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {["Under ₹5 Lakh", "Automatic", "Electric"].map((t, i) => (
            <Link
              key={t}
              to={
                [
                  "/cars?maxPrice=500000",
                  "/cars?transmission=Automatic",
                  "/cars?fuel=Electric",
                ][i]
              }
              className="rounded-full bg-mist-100 px-2.5 py-1 text-[12.5px] font-semibold text-ink-700 hover:bg-mist-200"
            >
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

/** "What can I afford?" — monthly budget slider that reverse-calculates a price and shows matching cars live. */
function AffordabilityBand({ live }) {
  const [emi, setEmi] = useState(18000);
  const [downPct, setDownPct] = useState(20);
  const [months, setMonths] = useState(60);
  const rate = 9.25 / 1200;
  const loan =
    (emi * ((1 + rate) ** months - 1)) / (rate * (1 + rate) ** months);
  const maxPrice = Math.round(loan / (1 - downPct / 100) / 5000) * 5000;
  const matches = live
    .filter((v) => v.price <= maxPrice)
    .sort((a, b) => b.price - a.price);
  return (
    <section className="container-page -mt-2 py-12">
      <Reveal className="card overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-5 border-b border-mist-100 p-6 lg:border-b-0 lg:border-r md:p-8">
            <div>
              <p className="eyebrow">Budget planner</p>
              <h2 className="mt-1 text-2xl font-bold">What can I afford?</h2>
              <p className="mt-1 text-sm text-mist-600">
                Slide to your comfortable monthly EMI. We'll show cars that fit,
                live.
              </p>
            </div>
            <RangeInput
              id="aff-emi"
              label="Monthly EMI"
              value={emi}
              min={5000}
              max={80000}
              step={1000}
              onChange={setEmi}
              display={`${inr(emi)}/mo`}
            />
            <RangeInput
              id="aff-down"
              label="Down payment"
              value={downPct}
              min={0}
              max={50}
              step={5}
              onChange={setDownPct}
              display={`${downPct}%`}
            />
            <div className="flex gap-1.5">
              {[36, 48, 60, 72].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={cn(
                    "flex-1 rounded-lg border py-1.5 text-[13px] font-semibold",
                    months === m
                      ? "border-accent-500 bg-accent-50 text-accent-700"
                      : "border-mist-200 text-mist-600 hover:border-mist-300",
                  )}
                  aria-pressed={months === m}
                >
                  {m / 12} yrs
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-ink-950 p-4 text-white">
              <p className="text-[12px] text-ink-300">
                You can look at cars up to
              </p>
              <p
                className="font-display text-3xl font-extrabold num"
                style={{ fontStretch: "112%" }}
                aria-live="polite"
              >
                {lakh(maxPrice)}
              </p>
              <p className="text-[12px] text-ink-300">
                Estimate at 9.25% p.a. Not a loan offer.
              </p>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <p className="text-sm text-mist-600">
                <span className="font-display text-2xl font-bold text-ink-900 num">
                  {matches.length}
                </span>{" "}
                cars fit this budget
              </p>
              <Link
                to={`/cars?maxPrice=${maxPrice}&sort=price_desc`}
                className="text-sm font-semibold text-accent-700 hover:underline"
              >
                See all →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {matches.slice(0, 3).map((v) => (
                <Link
                  key={v.id}
                  to={`/cars/${v.id}`}
                  className="group overflow-hidden rounded-xl border border-mist-200 transition-colors hover:border-accent-300"
                >
                  <CarArt
                    vehicle={v}
                    className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="font-display font-bold text-ink-900 num">
                      {lakh(v.price)}
                    </p>
                  </div>
                </Link>
              ))}
              {matches.length === 0 && (
                <p className="col-span-3 py-10 text-center text-sm text-mist-500">
                  Nothing yet at this budget. Try a longer tenure or a bigger
                  down payment.
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  const { state } = useStore();
  const live = useMemo(() => state.vehicles.filter(isPublic), [state.vehicles]);
  const featured = live.filter((v) => v.featured).slice(0, 4);


  const recent = [...live]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 8);

      console.log(
    "Featured vehicles:",
    recent.map((v) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      photos: v.photos,
    })),
  );


  const brandCounts = MAKES.map((m) => ({
    make: m,
    count: live.filter((v) => v.make === m).length,
  }))
    .filter((b) => b.count)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const verifiedCount = live.filter(
    (v) => v.verification === "verified",
  ).length;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#13282D]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 60% at 82% 28%, rgba(232,32,28,0.22), transparent 70%), radial-gradient(40% 45% at 8% 100%, rgba(248,208,0,0.10), transparent 70%)",
          }}
        />
        <div className="container-page relative grid gap-8 pb-10 pt-10 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-16">
          <div className="min-w-0">
            <p className="eyebrow !text-accent-400">
              <CountUp value={live.length} /> cars live ·{" "}
              <CountUp value={verifiedCount} /> with verified documents
            </p>
            <h1
              className="mt-3 max-w-xl text-[38px] font-extrabold leading-[1.02] !text-white md:text-[54px]"
              style={{ fontStretch: "118%" }}
            >
              Find the car. Call the seller. Skip the middleman.
            </h1>
            <span
              className="mt-5 block h-1.5 w-24 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #F8D000 0 38%, #E8201C 38% 100%)",
              }}
              aria-hidden="true"
            />
            <p className="mt-5 max-w-lg text-[16px] text-ink-200">
              Browse cars from dealers, owners and agents across India. Check
              the registration on the government portal, estimate your EMI, and
              talk to the seller directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button to="/cars" size="lg" iconRight={ArrowRight}>
                Browse cars
              </Button>
              <Link
                to="/register"
                className="btn btn-lg border border-white/25 bg-white/5 text-white hover:bg-white/10"
              >
                Create free account
              </Link>
            </div>
            <div className="mt-6 lg:hidden">
              <HeroSearch />
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img
              src={bannerCar}
              alt="Dark green hatchback parked outdoors"
              className="aspect-[16/10] w-full rounded-2xl object-cover shadow-pop"
            />
            <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-xl bg-white/95 px-3.5 py-2.5 shadow-pop">
              <BadgeCheck className="h-5 w-5 text-ok-600" />
              <div>
                <p className="text-[13px] font-bold text-ink-900">
                  Duplicate-checked listings
                </p>
                <p className="text-[12px] text-mist-600">
                  Every reg. number & VIN appears once
                </p>
              </div>
            </div>
          </div>
          <div className="hidden lg:col-span-2 lg:block">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* <AffordabilityBand live={live} /> */}

      {/* Categories */}
      <section className="container-page py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">Browse by category</h2>
          <Link
            to="/cars"
            className="hidden text-sm font-semibold text-accent-700 hover:underline sm:block"
          >
            All cars →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => {
            const q = new URLSearchParams(c.query).toString();
            const count = live.filter((v) =>
              c.query.body
                ? v.bodyType === c.query.body
                : c.query.fuel
                  ? v.fuel === c.query.fuel
                  : v.price >= c.query.minPrice,
            ).length;
            const art = {
              bodyType: c.query.body || (c.key === "Luxury" ? "Sedan" : "SUV"),
              colorHex: {
                SUV: "#2E5744",
                Sedan: "#1E2228",
                Hatchback: "#A8262E",
                MUV: "#B7BCC4",
                Electric: "#2C5AA3",
                Luxury: "#5C626B",
              }[c.key],
            };
            return (
              <Link
                key={c.key}
                to={`/cars?${q}`}
                className="card group overflow-hidden transition-shadow hover:shadow-lift"
              >
                {/* <CarArt vehicle={art} className="aspect-[16/9] w-full" /> */}
                <img
                  src={categoryImages[c.key]}
                  alt={`${c.label} cars`}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="flex items-center justify-between px-3.5 py-3">
                  <span className="font-semibold text-ink-900 group-hover:text-accent-700">
                    {c.label}
                  </span>
                  <span className="text-[12.5px] text-mist-500 num">
                    {count}
                  </span>
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
            <Link
              to="/cars?sort=relevance"
              className="text-sm font-semibold text-accent-700 hover:underline"
            >
              See more →
            </Link>
          </div>
          {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v, i) => (
              <Reveal key={v.id} delay={i * 80}>
                <VehicleCard vehicle={v} />
              </Reveal>
            ))}
          </div> */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v, i) => {
              const vehicleWithPhoto = {
                ...v,
                photos: featuredImages[v.id] || v.photos,
              };

              return (
                <Reveal key={v.id} delay={i * 80}>
                  <VehicleCard vehicle={vehicleWithPhoto} />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="container-page py-12">
        <h2 className="mb-5 text-2xl font-bold">Popular brands</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brandCounts.map((b) => (
            <Link
              key={b.make}
              to={`/cars?make=${encodeURIComponent(b.make)}`}
              className="flex items-center justify-between rounded-xl border border-mist-200 bg-white px-4 py-3.5 transition-colors hover:border-accent-300 hover:bg-accent-50/40"
            >
              <span
                className="truncate font-display text-[15px] font-bold text-ink-900"
                style={{ fontStretch: "110%" }}
              >
                {b.make}
              </span>
              <span className="ml-2 shrink-0 text-[12.5px] text-mist-500 num">
                {b.count}
              </span>
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
            <Link
              to="/cars?sort=newest"
              className="text-sm font-semibold text-accent-700 hover:underline"
            >
              Newest first →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((v, i) => (
              <Reveal key={v.id} delay={(i % 4) * 80}>
                {/* <VehicleCard vehicle={v} /> */}
                <VehicleCard
                  vehicle={{
                    ...v,
                    photos: recentVehicleImages[v.id] || v.photos,
                  }}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-14">
        <div className="max-w-2xl">
          <p className="eyebrow">How AutoDealer works</p>
          <h2 className="mt-1 text-[28px] font-bold">
            Buying a car in four steps
          </h2>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            [
              Search,
              "Search & shortlist",
              "Filter by budget, fuel, kilometres and city. Save cars and compare up to three side by side.",
            ],
            [
              FileSearch,
              "Check the paperwork",
              "Use the registration number on the official VAHAN portal to confirm owner count, insurance and status.",
            ],
            [
              Calculator,
              "Estimate your EMI",
              "Plan your down payment and tenure. Ask for loan help if you need it.",
            ],
            [
              PhoneCall,
              "Contact the seller",
              "Call, message or send an enquiry. You pay the seller directly — no platform fee for buyers.",
            ],
          ].map(([Icon, t, d], i) => (
            <li key={t} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="font-mono text-[12px] text-mist-400">
                  Step {i + 1}
                </span>
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
              {[
                "Free to browse, save and compare — no sign-up needed",
                "Talk to the seller directly; no commission on the price",
                "Clear badges: live is not the same as document-verified",
                "Every registration number and VIN appears in only one listing",
              ].map((t) => (
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
            <h2 className="mt-4 text-[22px] font-bold text-white">
              For sellers
            </h2>
            <ul className="mt-4 space-y-3 text-[15px] text-ink-200">
              {[
                "Listing goes live the moment payment succeeds — no waiting for approval",
                "Phone sign-in with OTP, no passwords to remember",
                "Lead inbox with enquiry status tracking",
                "Dealers manage stock in bulk; agents track handovers",
              ].map((t) => (
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
            [
              Building2,
              "Dealer",
              "Showrooms and used-car dealers with a business registration. List as many cars as you stock.",
              "/register/dealer",
              "Register as dealer",
            ],
            [
              Car,
              "Private seller",
              "Selling your own car? One active listing per account, with your ID verified.",
              "/register/seller",
              "Sell my car",
            ],
            [
              Handshake,
              "Agent",
              "List cars on behalf of owners with their authorisation and track each handover.",
              "/register/agent",
              "Join as agent",
            ],
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
            <h2 className="mt-1 text-[26px] font-bold">
              Pay once per listing. No commission.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["seller-basic", "agent-standard", "dealer-pro"].map((id) => {
                const p = PLANS.find((x) => x.id === id);
                return (
                  <div
                    key={id}
                    className="rounded-xl border border-mist-200 p-4"
                  >
                    <p className="text-[13px] font-semibold text-mist-600">
                      {p.name}
                    </p>
                    <p
                      className="mt-1 font-display text-2xl font-bold num"
                      style={{ fontStretch: "110%" }}
                    >
                      {inr(p.price)}
                    </p>
                    <p className="text-[12px] text-mist-500">
                      + GST ·{" "}
                      {p.vehicles > 1 ? `${p.vehicles} cars` : "per car"} ·{" "}
                      {p.validityDays} days
                    </p>
                  </div>
                );
              })}
            </div>
            <Link
              to="/how-it-works#plans"
              className="mt-4 inline-block text-sm font-semibold text-accent-700 hover:underline"
            >
              Compare all plans →
            </Link>
          </div>
          <div className="rounded-2xl bg-mist-50 p-6">
            <LifeBuoy className="h-7 w-7 text-accent-600" />
            <h2 className="mt-3 text-xl font-bold">Need help?</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/support"
                  className="flex items-center gap-2 font-semibold text-ink-800 hover:text-accent-700"
                >
                  <MessageSquare className="h-4 w-4" /> Contact support & FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/verify-vehicle"
                  className="flex items-center gap-2 font-semibold text-ink-800 hover:text-accent-700"
                >
                  <FileSearch className="h-4 w-4" /> How to verify a vehicle
                </Link>
              </li>
              <li>
                <Link
                  to="/loan-calculator"
                  className="flex items-center gap-2 font-semibold text-ink-800 hover:text-accent-700"
                >
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
