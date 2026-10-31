import { useEffect, useMemo, useState } from "react";
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
import bannerCar from "../../assets/banner-bg-4.jpg";
import { RangeInput } from "../../components/vehicle/EmiWidget";
import {
  BODY_TYPES,
  CATEGORIES,
  CITIES,
  CONDITIONS,
  MAKES,
  modelsFor,
  makesFor,
} from "../../data/catalog";
import { PLANS } from "../../config/site";
import { PRICE_STEPS } from "../../utils/filters";
import { cn, tzs, num, tzsShort } from "../../utils/format";
import {
  TYPE_KEYS,
  VEHICLE_TYPES,
  categoryOf,
  vehiclePath,
} from "../../data/vehicleTypes";

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

const vehicleTypeImages = {
  car: {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
    alt: "Premium sports car",
  },
  motorcycle: {
    src: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=85",
    alt: "Motorcycle on the road",
  },
  lorry: {
    src: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1000&q=85",
    alt: "Heavy commercial truck",
  },
};

const heroSlides = [
  {
    image: bannerCar,
    label: "Find Your Car",
  },
  {
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=85",
    label: "Explore Premium",
  },
  {
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85",
    label: "Drive Your Dream",
  },
];

function HeroSearch() {
  const nav = useNavigate();
  const [type, setType] = useState("car");
  const T = VEHICLE_TYPES[type];
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
    nav(`${T.path}?${p.toString()}`);
  };
  const switchType = (k) => {
    setType(k);
    setF((s) => ({ ...s, make: "", model: "", maxPrice: "", body: "" }));
  };
  return (
    <form
      onSubmit={go}
      className="rounded-2xl bg-white p-4 shadow-pop md:p-5"
      aria-label={`Search ${T.nounPlural}`}
    >
      <div
        role="tablist"
        aria-label="What are you looking for?"
        className="mb-3 flex gap-1.5 overflow-x-auto"
      >
        {TYPE_KEYS.map((k) => {
          const Ty = VEHICLE_TYPES[k];
          const on = k === type;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => switchType(k)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[14px] font-semibold transition-colors",
                on
                  ? "bg-ink-900 text-white"
                  : "bg-mist-100 text-ink-700 hover:bg-mist-200",
              )}
            >
              <Ty.icon className="h-4 w-4" /> {Ty.plural}
            </button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          aria-label="Brand"
          value={f.make}
          onChange={set("make")}
          placeholder="Any brand"
          options={makesFor(type)}
        />
        <Select
          aria-label="Model"
          value={f.model}
          onChange={set("model")}
          placeholder={f.make ? "Any model" : "Model"}
          options={f.make ? modelsFor(f.make, type) : []}
          disabled={!f.make}
        />
        <Select
          aria-label="Budget"
          value={f.maxPrice}
          onChange={set("maxPrice")}
          placeholder="Any budget"
          options={T.priceSteps.map((p) => ({
            value: String(p),
            label: `Up to ${tzsShort(p)}`,
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
          aria-label={T.bodyLabel}
          value={f.body}
          onChange={set("body")}
          placeholder={`Any ${T.bodyLabel.toLowerCase()}`}
          options={T.bodies}
        />
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(type === "lorry"
            ? [
                ["Tippers", "/lorries?body=Tipper"],
                ["10+ tonnes", "/lorries?payload=10"],
                ["Light trucks", "/lorries?body=Light%20truck"],
              ]
            : type === "motorcycle"
              ? [
                  ["Scooters", "/motorcycles?body=Scooter"],
                  ["Under TSh 3M", "/motorcycles?maxPrice=3000000"],
                  ["Electric", "/motorcycles?fuel=Electric"],
                ]
              : [
                  ["Under TSh 15M", "/cars?maxPrice=15000000"],
                  ["Automatic", "/cars?transmission=Automatic"],
                  ["Electric", "/cars?fuel=Electric"],
                ]
          ).map(([t, to]) => (
            <Link
              key={t}
              to={to}
              className="rounded-full bg-mist-100 px-2.5 py-1 text-[12.5px] font-semibold text-ink-700 hover:bg-mist-200"
            >
              {t}
            </Link>
          ))}
        </div>
        <Button type="submit" size="lg" icon={Search} className="sm:w-auto">
          Search {T.nounPlural}
        </Button>
      </div>
    </form>
  );
}

/** "What can I afford?" — monthly budget slider that reverse-calculates a price and shows matching cars live. */
function AffordabilityBand({ live }) {
  const [emi, setEmi] = useState(550000);
  const [downPct, setDownPct] = useState(20);
  const [months, setMonths] = useState(60);
  const rate = 9.25 / 1200;
  const loan =
    (emi * ((1 + rate) ** months - 1)) / (rate * (1 + rate) ** months);
  const maxPrice = Math.round(loan / (1 - downPct / 100) / 100000) * 100000;
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
              min={150000}
              max={2500000}
              step={50000}
              onChange={setEmi}
              display={`${tzs(emi)}/mo`}
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
                {tzsShort(maxPrice)}
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
                  to={`${vehiclePath(v)}`}
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
                      {tzs(v.price)}
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

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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

  const liveCars = live.filter((v) => categoryOf(v) === "car");
  const typeCounts = Object.fromEntries(
    TYPE_KEYS.map((k) => [k, live.filter((v) => categoryOf(v) === k).length]),
  );
  const brandCounts = MAKES.map((m) => ({
    make: m,
    count: liveCars.filter((v) => v.make === m).length,
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
      {/* <section className="relative overflow-hidden bg-[#13282D]">
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
      </section> */}

      <section className="relative isolate mb-28 overflow-visible">
        {/* Full-width background image */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-b-3xl bg-[#13282D]">
          <img
            src={bannerCar}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B191D]/70 via-[#13282D]/25 to-[#13282D]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13282D]/25 via-transparent to-[#13282D]/10" />

          {/* Accent lighting */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 85% 20%, rgba(232,32,28,0.22), transparent 45%), radial-gradient(ellipse at 10% 90%, rgba(248,208,0,0.12), transparent 40%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="container-page relative pb-32 pt-14 sm:pb-36 sm:pt-20 lg:pb-40 lg:pt-24">
          <div className="max-w-3xl">
            {/* Live listing indicator */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>

              <p className="text-xs font-semibold tracking-wide text-white sm:text-sm">
                <CountUp value={live.length} /> vehicles live
                <span className="mx-2 text-white/40">•</span>
                <CountUp value={verifiedCount} /> with verified documents
              </p>
            </div>

            {/* Main heading */}
            <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
              Your next ride.
              <br />
              <span className="text-[#F8D000]">Your deal.</span>{" "}
              <span className="text-white">Your way.</span>
            </h1>

            {/* Accent divider */}
            <div className="mt-6 flex h-1.5 w-28 overflow-hidden rounded-full">
              <span className="w-[38%] bg-[#F8D000]" />
              <span className="flex-1 bg-[#E8201C]" />
            </div>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              Discover cars, motorcycles and lorries from trusted dealers,
              owners and agents across India. Check registration details,
              estimate your EMI and connect directly with the seller. No
              middleman.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/cars" size="lg" iconRight={ArrowRight}>
                Explore cars
              </Button>

              <Link
                to="/register"
                className="btn btn-lg border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/20"
              >
                Create free account
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#F8D000]" />
                <span>Direct seller contact</span>
              </div>

              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#F8D000]" />
                <span>Verified documents</span>
              </div>

              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#F8D000]" />
                <span>No middleman</span>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="absolute inset-x-0 bottom-0 translate-y-1/2 px-4 lg:hidden">
            <HeroSearch />
          </div>
        </div>

        {/* Desktop search overlapping the banner */}
        <div className="container-page absolute inset-x-0 bottom-0 z-10 hidden translate-y-1/2 lg:block">
          <HeroSearch />
        </div>
      </section>

      {/* Background image slider + hero content */}
      {/* <section className="relative isolate mb-28 overflow-visible">

  <div className="absolute inset-0 -z-10 overflow-hidden rounded-b-3xl bg-[#13282D]">
    {heroSlides.map((slide, index) => (
      <img
        key={slide.label}
        src={slide.image}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
          activeSlide === index ? "opacity-100" : "opacity-0"
        }`}
      />
    ))}

    <div className="absolute inset-0 bg-gradient-to-r from-[#0B191D]/90 via-[#13282D]/65 to-[#13282D]/30" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#13282D]/80 via-transparent to-[#13282D]/20" />
  </div>

  <div className="container-page relative pb-32 pt-14 sm:pb-36 sm:pt-20 lg:pb-40 lg:pt-24">
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <p className="text-xs font-semibold text-white sm:text-sm">
          <CountUp value={live.length} /> cars live
          <span className="mx-2 text-white/50">•</span>
          <CountUp value={verifiedCount} /> with verified documents
        </p>
      </div>

      <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
        Your next car.
        <br />
        <span className="text-[#F8D000]">Your deal.</span>{" "}
        Your way.
      </h1>

      <div className="mt-6 flex h-1.5 w-28 overflow-hidden rounded-full">
        <span className="w-[38%] bg-[#F8D000]" />
        <span className="flex-1 bg-[#E8201C]" />
      </div>

      <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
        Discover cars from trusted dealers, owners and agents across India.
        Check registration details, estimate your EMI and connect directly
        with the seller. No middleman. Just smarter car buying.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button to="/cars" size="lg" iconRight={ArrowRight}>
          Explore cars
        </Button>

        <Link
          to="/register"
          className="btn btn-lg border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
        >
          Create free account
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/85">
        <span className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-[#F8D000]" />
          Direct seller contact
        </span>
        <span className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-[#F8D000]" />
          Verified documents
        </span>
        <span className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-[#F8D000]" />
          No middleman
        </span>
      </div>
    </div>


    <div className="absolute inset-x-0 bottom-0 px-4 translate-y-1/2 lg:hidden">
      <HeroSearch />
    </div>
  </div>


  <div className="absolute right-4 top-5 z-20 flex items-center gap-2 sm:right-8 sm:top-8">
    <button
      type="button"
      onClick={() =>
        setActiveSlide(
          (current) =>
            (current - 1 + heroSlides.length) % heroSlides.length
        )
      }
      aria-label="Previous slide"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl text-white backdrop-blur-xl transition hover:bg-white/25"
    >
      &#8592;
    </button>

    <div className="flex max-w-[65vw] items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-white/10 p-1.5 shadow-xl backdrop-blur-xl">
      {heroSlides.map((slide, index) => (
        <button
          key={slide.label}
          type="button"
          onClick={() => setActiveSlide(index)}
          aria-label={`Show ${slide.label}`}
          aria-pressed={activeSlide === index}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-300 sm:px-4 sm:text-sm ${
            activeSlide === index
              ? "bg-white text-[#13282D] shadow-md"
              : "text-white hover:bg-white/15"
          }`}
        >
          {slide.label}
        </button>
      ))}
    </div>

    <button
      type="button"
      onClick={() =>
        setActiveSlide(
          (current) => (current + 1) % heroSlides.length
        )
      }
      aria-label="Next slide"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl text-white backdrop-blur-xl transition hover:bg-white/25"
    >
      &#8594;
    </button>
  </div>

  <div className="container-page absolute inset-x-0 bottom-0 z-10 hidden translate-y-1/2 lg:block">
    <HeroSearch />
  </div>
</section> */}

      {/* <AffordabilityBand live={live} /> */}
      {/* Vehicle types */}
      <section className="container-page pt-12" aria-labelledby="types-title">
        <div className="mb-5">
          <p className="eyebrow">Buy & sell</p>
          <h2 id="types-title" className="mt-1 text-2xl font-bold">
            Cars, motorcycles and lorries
          </h2>
        </div>
        {/* <div className="grid gap-4 md:grid-cols-3">
          {TYPE_KEYS.map((k) => {
            const Ty = VEHICLE_TYPES[k];
            const sample = { category: k, bodyType: { car: "SUV", motorcycle: "Sport", lorry: "Tipper" }[k], colorHex: { car: "#2E5744", motorcycle: "#A8262E", lorry: "#2C5AA3" }[k] };
            return (
              <Link key={k} to={Ty.path} className="card group overflow-hidden transition-shadow hover:shadow-lift">
                <CarArt vehicle={sample} className="aspect-[16/8] w-full transition-transform duration-500 group-hover:scale-[1.04]" />
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 group-hover:text-accent-700">
                      <Ty.icon className="h-5 w-5" /> {Ty.plural}
                    </p>
                    <p className="mt-0.5 text-[13.5px] text-mist-600">{Ty.tagline}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-mist-100 px-2.5 py-1 text-[12.5px] font-semibold text-ink-800 num">{typeCounts[k]} for sale</span>
                </div>
                <div className="flex flex-wrap gap-1.5 border-t border-mist-100 px-4 py-3">
                  {Ty.bodies.slice(0, 4).map((b) => (
                    <span key={b} className="rounded-md bg-mist-100 px-2 py-0.5 text-[12px] font-semibold text-mist-700">
                      {b}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div> */}

        <div className="grid gap-4 md:grid-cols-3">
          {TYPE_KEYS.map((k) => {
            const Ty = VEHICLE_TYPES[k];
            const image = vehicleTypeImages[k];

            return (
              <Link
                key={k}
                to={Ty.path}
                className="card group overflow-hidden transition-shadow hover:shadow-lift"
              >
                {/* Real vehicle image */}
                <div className="aspect-[16/8] w-full overflow-hidden bg-mist-100">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Vehicle information */}
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 group-hover:text-accent-700">
                      <Ty.icon className="h-5 w-5" />
                      {Ty.plural}
                    </p>

                    <p className="mt-0.5 text-[13.5px] text-mist-600">
                      {Ty.tagline}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-mist-100 px-2.5 py-1 text-[12.5px] font-semibold text-ink-800 num">
                    {typeCounts[k]} for sale
                  </span>
                </div>

                {/* Vehicle body types */}
                <div className="flex flex-wrap gap-1.5 border-t border-mist-100 px-4 py-3">
                  {Ty.bodies.slice(0, 4).map((b) => (
                    <span
                      key={b}
                      className="rounded-md bg-mist-100 px-2 py-0.5 text-[12px] font-semibold text-mist-700"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      {/* Categories */}
      <section className="container-page py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">Popular car categories</h2>
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
            const count = liveCars.filter((v) =>
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
                      {tzs(p.price)}
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
