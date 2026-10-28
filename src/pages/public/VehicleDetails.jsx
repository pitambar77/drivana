import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, CalendarDays, Car, Check, ExternalLink, Fuel, Gauge, GitCompareArrows, Handshake, Heart, MapPin, MessageSquare, Palette, Phone, Settings2, ShieldCheck, UserRound, Users } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Alert, Avatar, Breadcrumbs, Button, CopyText, EmptyState, Plate, Section, StatusBadge, VerificationBadge, useToast } from '../../components/ui';
import { Gallery } from '../../components/vehicle/Gallery';
import { EmiWidget } from '../../components/vehicle/EmiWidget';
import { EnquiryForm } from '../../components/vehicle/EnquiryForm';
import { VehicleCard, vehicleTitle } from '../../components/vehicle/VehicleCard';
import { cn, date, km, lakh, num } from '../../utils/format';



export function SellerCard({ vehicle: v, seller, compact }) {
  const [reveal, setReveal] = useState(false);
  const Icon = v.sellerRole === 'dealer' ? Building2 : v.sellerRole === 'agent' ? Handshake : UserRound;
  const type = { dealer: 'Dealer', seller: 'Private owner', agent: 'Agent (selling for the owner)' }[v.sellerRole];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={seller?.business || seller?.agency || seller?.name} size={44} />
        <div className="min-w-0">
          <p className="truncate font-bold text-ink-900">{seller?.business || seller?.agency || seller?.name}</p>
          <p className="flex items-center gap-1 text-[13px] text-mist-600">
            <Icon className="h-3.5 w-3.5" /> {type}
          </p>
        </div>
      </div>
      {!compact && (
        <ul className="space-y-1.5 text-[13px] text-mist-600">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-mist-400" />
            Seller documents: <StatusBadge status={seller?.docStatus === 'verified' ? 'verified' : seller?.docStatus === 'not_submitted' ? 'not_submitted' : 'pending'} />
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-mist-400" /> On AutoDealer since {date(seller?.registeredAt, { month: 'short', year: 'numeric' })}
          </li>
        </ul>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="dark" icon={Phone} onClick={() => setReveal(true)}>
          {reveal ? 'Number shown' : 'Call seller'}
        </Button>
        <Button variant="secondary" icon={MessageSquare} to={`/cars/${v.id}/contact`}>
          Message
        </Button>
      </div>
      {reveal && (
        <div className="flex items-center justify-between rounded-lg bg-mist-50 px-3 py-2.5">
          <a href={`tel:${seller?.phone?.replace(/\s/g, '')}`} className="font-mono text-[15px] font-semibold text-ink-900 num">
            {seller?.phone}
          </a>
          <CopyText text={seller?.phone || ''} />
        </div>
      )}
      {reveal && <p className="text-[12px] text-mist-500">Tell the seller you found the car on AutoDealer. Never pay a token amount before seeing the car and its RC.</p>}
    </div>
  );
}

export default function VehicleDetails() {
  const { id } = useParams();
  const { state, me, role, vehicle, user, pushRecent, bumpViews, toggleSaved, toggleCompare } = useStore();
  const toast = useToast();
  const v = vehicle(id);
  const seller = v ? user(v.sellerId) : null;

  useEffect(() => {
    if (v && isPublic(v)) {
      pushRecent(v.id);
      bumpViews(v.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const similar = useMemo(() => {
    if (!v) return [];
    return state.vehicles
      .filter((x) => isPublic(x) && x.id !== v.id && (x.bodyType === v.bodyType || x.make === v.make))
      .sort((a, b) => Math.abs(a.price - v.price) - Math.abs(b.price - v.price))
      .slice(0, 4);
  }, [state.vehicles, v]);

  if (!v) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={Car} title="We couldn't find that car" message="The link may be wrong or the listing was removed." action={<Button to="/cars">Browse all cars</Button>} />
      </div>
    );
  }

  const isOwner = me?.id === v.sellerId;
  if (!isPublic(v) && !isOwner && role !== 'admin') {
    return (
      <div className="container-page py-16">
        <EmptyState icon={Car} title="This listing isn't available" message={`The ${vehicleTitle(v)} is ${v.status === 'sold' ? 'sold' : 'no longer listed'}. Here are similar cars.`} action={<Button to={`/cars?body=${v.bodyType}`}>See similar {v.bodyType}s</Button>} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((s) => (
            <VehicleCard key={s.id} vehicle={s} />
          ))}
        </div>
      </div>
    );
  }

  const saved = state.saved.includes(v.id);
  const comparing = state.compare.includes(v.id);
  const specs = [
    [CalendarDays, 'Model year', v.year],
    [Gauge, 'Kilometres', km(v.mileage)],
    [Fuel, 'Fuel', v.fuel],
    [Settings2, 'Transmission', v.transmission],
    [Users, 'Ownership', v.owners],
    [Palette, 'Colour', v.color],
    [MapPin, 'Location', v.city],
    [Car, 'Body type', v.bodyType],
  ];
  const tech = [
    ['Engine', v.specs?.engineCc ? `${num(v.specs.engineCc)} cc` : v.fuel === 'Electric' ? 'Electric motor' : '—'],
    ['Max power', v.specs?.powerBhp ? `${v.specs.powerBhp} bhp` : '—'],
    ['Seating', v.specs?.seats ? `${v.specs.seats} seats` : '—'],
    [v.fuel === 'Electric' ? 'Battery' : 'Fuel economy', v.fuel === 'Electric' ? (v.specs?.batteryKwh ? `${v.specs.batteryKwh} kWh` : '—') : v.specs?.mileageKmpl ? `${v.specs.mileageKmpl} km/l` : '—'],
    ['Airbags', v.specs?.airbags ?? '—'],
    ['Insurance valid until', date(v.insuranceUntil)],
    ['Condition', v.condition],
    ['Variant', v.variant],
  ];

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: 'Buy a car', to: '/cars' }, { label: v.make, to: `/cars?make=${encodeURIComponent(v.make)}` }, { label: `${v.model} ${v.year}` }]} className="mb-4" />
      {!isPublic(v) && (
        <Alert tone="warn" className="mb-4" title={`Preview — this listing is ${v.status.replace(/_/g, ' ')}`}>
          Only you{role === 'admin' ? ' (admin)' : ''} can see this page. Buyers see it once the listing is live.
        </Alert>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <Gallery vehicle={v} />

          {/* Mobile title block */}
          <div className="lg:hidden">
            <TitleBlock v={v} />
          </div>

          <Section title="Overview">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
              {specs.map(([Icon, k, val]) => (
                <div key={k} className="flex min-w-0 items-start gap-2.5">
                  <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-mist-400" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-mist-500">{k}</p>
                    <p className="truncate text-sm font-semibold text-ink-900 num">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Description">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-mist-700">{v.description}</p>
            {v.modifications && (
              <p className="mt-3 rounded-lg bg-warn-50 px-3 py-2 text-sm text-warn-700">
                <span className="font-semibold">Modifications declared: </span>
                {v.modifications}
              </p>
            )}
          </Section>

          <Section title="Specifications & features">
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {tech.map(([k, val]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-mist-100 py-2.5 text-sm">
                  <dt className="text-mist-600">{k}</dt>
                  <dd className="text-right font-semibold text-ink-900 num">{val}</dd>
                </div>
              ))}
            </dl>
            {v.specs?.features?.length > 0 && (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {v.specs.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-mist-700">
                    <Check className="h-4 w-4 text-ok-600" /> {f}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Registration & verification" description="Check these against the RC and on the official portal before you pay anything.">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div>
                <p className="mb-1 text-[12px] text-mist-500">Registration number</p>
                <Plate value={v.regNumber} />
              </div>
              <div>
                <p className="mb-1 text-[12px] text-mist-500">VIN / chassis (last 5)</p>
                <p className="font-mono text-sm font-semibold">•••••••••••••{v.vin.slice(-5)}</p>
              </div>
              <div>
                <p className="mb-1 text-[12px] text-mist-500">Listing</p>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={v.status} />
                  <VerificationBadge status={v.verification} />
                </div>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-mist-600">
              "Live" means the seller paid and the listing passed automatic checks. "Documents verified" means our team has reviewed the seller's papers. Neither replaces your own check of the RC.
            </p>
            <Button to={`/verify-vehicle?reg=${v.regNumber}`} variant="secondary" size="sm" iconRight={ExternalLink} className="mt-4">
              How to verify this car
            </Button>
          </Section>

          <Section title="Loan estimate" className="lg:hidden">
            <EmiWidget price={v.price} rate={state.config.defaultInterestRate} />
          </Section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="card hidden p-5 lg:block">
            <TitleBlock v={v} />
          </div>
          <div className="card p-5">
            <div className="mb-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Heart}
                onClick={() => {
                  toggleSaved(v.id);
                  toast(saved ? 'Removed from saved cars' : 'Saved to your shortlist', { tone: saved ? 'info' : 'success' });
                }}
                className={cn('flex-1', saved && 'border-bad-100 bg-bad-50 text-bad-700')}
              >
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={GitCompareArrows}
                onClick={() => {
                  const r = toggleCompare(v.id);
                  toast(r === 'full' ? 'You can compare up to 3 cars.' : r === 'added' ? 'Added to compare' : 'Removed from compare', { tone: r === 'full' ? 'warn' : 'info' });
                }}
                className={cn('flex-1', comparing && 'border-accent-200 bg-accent-50 text-accent-700')}
              >
                {comparing ? 'In compare' : 'Compare'}
              </Button>
            </div>
            <SellerCard vehicle={v} seller={seller} />
          </div>
          <div className="card p-5">
            <h2 className="mb-3 text-[15px] font-bold">Send an enquiry</h2>
            <EnquiryForm vehicle={v} compact />
          </div>
          <div className="card hidden p-5 lg:block">
            <h2 className="mb-3 text-[15px] font-bold">Loan estimate</h2>
            <EmiWidget price={v.price} rate={state.config.defaultInterestRate} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">Similar cars</h2>
            <Link to={`/cars?body=${v.bodyType}`} className="text-sm font-semibold text-accent-700 hover:underline">
              More {v.bodyType}s →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <VehicleCard key={s.id} vehicle={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TitleBlock({ v }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        <VerificationBadge status={v.verification} />
        {v.condition !== 'Used' && <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[12px] font-semibold text-white">{v.condition}</span>}
      </div>
      <h1 className="text-[24px] font-bold leading-tight md:text-[26px]">{vehicleTitle(v)}</h1>
      <p className="text-[14.5px] text-mist-600">
        {v.variant} · {v.fuel} · {v.transmission}
      </p>
      <p className="mt-3 font-display text-[32px] font-extrabold leading-none text-ink-900 num" style={{ fontStretch: '112%' }}>
        {lakh(v.price)}
      </p>
      <p className="mt-1 text-[12.5px] text-mist-500 num">
        Listed {date(v.publishedAt || v.createdAt)} · {num(v.views)} views · ID {v.id.toUpperCase()}
      </p>
    </div>
  );
}
