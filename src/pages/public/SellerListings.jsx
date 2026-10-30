// Public seller profile with every live listing.
//   /dealers/:id  — dealer profile: showroom details, hours, brands, services and full inventory
//   /sellers/:id  — private owners and agents (dealer ids here redirect to /dealers/:id)
import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Building2, CalendarDays, Car, CheckCircle2, Clock, ExternalLink, Globe, Handshake, Languages, MapPin, MessageSquare, Navigation, Phone, Store, UserRound, Wrench,
} from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Avatar, Badge, Breadcrumbs, Button, CopyText, EmptyState, SearchInput, Select } from '../../components/ui';
import { VehicleCard } from '../../components/vehicle/VehicleCard';
import { BODY_TYPES, FUELS, TRANSMISSIONS } from '../../data/catalog';
import { SORTS, sortVehicles } from '../../utils/filters';
import { dayRange, dealerProfile, dealerTrust, fmtTime, openStatus } from '../../utils/dealers';
import { cn, date, km, tzs, tzsShort } from '../../utils/format';

export const SELLER_TYPE = {
  dealer: { label: 'Dealer', icon: Building2 },
  seller: { label: 'Private owner', icon: UserRound },
  agent: { label: 'Agent', icon: Handshake },
};

export const sellerName = (u) => u?.business || u?.agency || u?.name || 'Seller';

/** Public profile URL for any seller role. */
export const sellerPath = (role, id) => (role === 'dealer' ? `/dealers/${id}` : `/sellers/${id}`);

/** All live listings for a seller, newest first. */
export function useSellerListings(sellerId) {
  const { state } = useStore();
  return useMemo(
    () => state.vehicles.filter((v) => v.sellerId === sellerId && isPublic(v)).sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)),
    [state.vehicles, sellerId],
  );
}

const pill = (on) =>
  cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors', on ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-mist-200 bg-white text-mist-700 hover:border-mist-300');
const small = '[&_select]:h-9 [&_select]:py-0 [&_select]:text-[13px]';

export default function SellerListings() {
  const { id } = useParams();
  const loc = useLocation();
  const [params] = useSearchParams();
  const { user } = useStore();
  const raw = user(id);
  const cars = useSellerListings(id);
  const [reveal, setReveal] = useState(false);
  const from = params.get('from');
  const onDealerRoute = loc.pathname.startsWith('/dealers/');

  if (!raw || !['dealer', 'seller', 'agent'].includes(raw.role) || raw.status === 'suspended') {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={onDealerRoute ? Store : Car}
          title={onDealerRoute ? 'Dealer not found' : 'Seller not found'}
          message="This account isn't on AutoDealer any more, or the link is wrong."
          action={<Button to={onDealerRoute ? '/dealers' : '/cars'}>{onDealerRoute ? 'See all dealers' : 'Browse all cars'}</Button>}
        />
      </div>
    );
  }
  // One canonical URL per role.
  if (raw.role === 'dealer' && !onDealerRoute) return <Navigate to={`/dealers/${id}${loc.search}`} replace />;
  if (raw.role !== 'dealer' && onDealerRoute) return <Navigate to={`/sellers/${id}${loc.search}`} replace />;

  const isDealer = raw.role === 'dealer';
  const seller = isDealer ? dealerProfile(raw) : raw;
  const T = SELLER_TYPE[seller.role];
  const trust = dealerTrust(seller);
  const prices = cars.map((c) => c.price);
  const verifiedCars = cars.filter((c) => c.verification === 'verified').length;
  const open = isDealer ? openStatus(seller.hours) : null;
  const firstYear = seller.yearEstablished || new Date(seller.registeredAt).getFullYear();

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={isDealer ? [{ label: 'Buy a car', to: '/cars' }, { label: 'Dealers', to: '/dealers' }, { label: sellerName(seller) }] : [{ label: 'Buy a car', to: '/cars' }, { label: sellerName(seller) }]} className="mb-4" />
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {from && (
          <Link to={`/cars/${from}`} className="inline-flex items-center gap-1 text-sm font-semibold text-mist-600 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" /> Back to the car you were viewing
          </Link>
        )}
        {isDealer && (
          <Link to="/dealers" className="inline-flex items-center gap-1 text-sm font-semibold text-mist-600 hover:text-ink-900">
            {!from && <ArrowLeft className="h-4 w-4" />}
            {from ? 'See all dealers' : 'All dealers'}
          </Link>
        )}
      </div>

      <section className="card mb-6 overflow-hidden">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={sellerName(seller)} size={64} />
            <div className="min-w-0">
              <p className="eyebrow">{isDealer ? seller.businessType : T.label}</p>
              <h1 className="mt-0.5 truncate text-[24px] font-bold md:text-[28px]">{sellerName(seller)}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-mist-600">
                <Badge tone={trust.tone} icon={trust.key === 'verified' ? BadgeCheck : undefined}>
                  {isDealer ? trust.label : trust.key === 'verified' ? 'Documents verified' : trust.label}
                </Badge>
                <span className="flex items-center gap-1.5">
                  <T.icon className="h-3.5 w-3.5" /> {seller.business || seller.agency ? seller.name : T.label}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {[seller.address?.line2, seller.city].filter(Boolean).join(', ')}
                </span>
                {open && (
                  <span className={cn('flex items-center gap-1.5 font-semibold', open.open ? 'text-ok-700' : 'text-mist-500')}>
                    <Clock className="h-3.5 w-3.5" /> {open.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
            <Button variant="dark" icon={Phone} onClick={() => setReveal(true)}>
              {reveal ? 'Number shown' : `Call ${T.label.toLowerCase()}`}
            </Button>
            {cars[0] && (
              <Button variant="secondary" icon={MessageSquare} to={`/cars/${cars[0].id}/contact`}>
                Message
              </Button>
            )}
          </div>
        </div>
        {reveal && (
          <div className="flex items-center justify-between gap-3 border-t border-mist-100 bg-mist-50 px-5 py-3 md:px-6">
            <a href={`tel:${seller.phone.replace(/\s/g, '')}`} className="select-all font-mono text-[15px] font-semibold text-ink-900 num">
              {seller.phone}
            </a>
            <CopyText text={seller.phone} />
          </div>
        )}
        <dl className="grid grid-cols-2 border-t border-mist-100 sm:grid-cols-4">
          {[
            ['Cars for sale', cars.length],
            ['Price range', cars.length ? (prices.length > 1 ? `${tzsShort(Math.min(...prices))} – ${tzsShort(Math.max(...prices))}` : tzs(prices[0])) : '—'],
            ['Cars with verified documents', `${verifiedCars} of ${cars.length}`],
            isDealer ? ['In business since', firstYear] : ['On AutoDealer since', date(seller.registeredAt, { month: 'short', year: 'numeric' })],
          ].map(([k, val], i) => (
            <div key={k} className={cn('min-w-0 px-5 py-3.5 md:px-6', i > 0 && 'sm:border-l', i % 2 === 1 && 'border-l', i >= 2 && 'border-t sm:border-t-0', 'border-mist-100')}>
              <dt className="truncate text-[12px] text-mist-500">{k}</dt>
              <dd className="mt-0.5 break-words font-semibold text-ink-900 num sm:truncate" title={String(val)}>
                {val}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {isDealer ? (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]">
          <DealerAbout d={seller} />
          <Inventory seller={seller} cars={cars} cols="sm:grid-cols-2 xl:grid-cols-3" />
        </div>
      ) : (
        <Inventory seller={seller} cars={cars} cols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
      )}
    </div>
  );
}

function DealerAbout({ d }) {
  const a = d.address || {};
  const addr = [a.line1, a.line2, a.landmark, `${a.city || d.city}${a.pin ? ` ${a.pin}` : ''}`, a.state].filter(Boolean);
  const mapUrl = a.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([d.business, a.line1, a.line2, a.city || d.city].filter(Boolean).join(', '))}`;
  const Row = ({ icon: Icon, title, children }) => (
    <div className="flex gap-3 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-mist-500" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-mist-500">{title}</p>
        <div className="mt-0.5 text-[14px] text-ink-800">{children}</div>
      </div>
    </div>
  );
  return (
    <aside className="order-last min-w-0 space-y-4 lg:order-none lg:sticky lg:top-20 lg:self-start">
      <section className="card p-5">
        <h2 className="text-[17px] font-bold">About this dealer</h2>
        {d.about && <p className="mt-2 text-[14px] leading-relaxed text-mist-700">{d.about}</p>}
        <div className="mt-2 divide-y divide-mist-100">
          <Row icon={MapPin} title="Showroom address">
            {addr.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
            <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-accent-700 hover:underline">
              <Navigation className="h-3.5 w-3.5" /> Get directions
            </a>
          </Row>
          {d.hours?.open && (
            <Row icon={Clock} title="Opening hours">
              {dayRange(d.hours.days)}, {fmtTime(d.hours.open)} – {fmtTime(d.hours.close)}
            </Row>
          )}
          <Row icon={CalendarDays} title="Business">
            {d.yearEstablished ? `Established ${d.yearEstablished}` : d.businessType}
            <span className="block text-[13px] text-mist-500">On AutoDealer since {date(d.registeredAt, { month: 'short', year: 'numeric' })}</span>
          </Row>
          {d.languages.length > 0 && (
            <Row icon={Languages} title="Languages spoken">
              {d.languages.join(', ')}
            </Row>
          )}
          {d.website && (
            <Row icon={Globe} title="Website">
              <a href={/^https?:/.test(d.website) ? d.website : `https://${d.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-accent-700 hover:underline">
                {d.website.replace(/^https?:\/\//, '')} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Row>
          )}
        </div>
      </section>

      {d.brands.length > 0 && (
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <Car className="h-4 w-4 text-mist-500" /> Brands they deal in
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {d.brands.map((b) => (
              <span key={b} className="rounded-md bg-mist-100 px-2 py-1 text-[12.5px] font-semibold text-mist-700">
                {b}
              </span>
            ))}
          </div>
        </section>
      )}

      {d.services.length > 0 && (
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <Wrench className="h-4 w-4 text-mist-500" /> Services
          </h2>
          <ul className="mt-3 space-y-2">
            {d.services.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[14px] text-ink-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" /> {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="px-1 text-[12.5px] leading-relaxed text-mist-500">
        {d.docStatus === 'verified'
          ? 'AutoDealer has checked this dealer’s business registration documents.'
          : 'This dealer’s business documents haven’t been verified yet.'}{' '}
        Always check a car’s RC and inspect it before you pay.
      </p>
    </aside>
  );
}

function Inventory({ seller, cars, cols }) {
  const [q, setQ] = useState('');
  const [body, setBody] = useState('');
  const [make, setMake] = useState('');
  const [fuel, setFuel] = useState('');
  const [gear, setGear] = useState('');
  const [sort, setSort] = useState('newest');

  const makes = [...new Set(cars.map((c) => c.make))].sort();
  const bodies = BODY_TYPES.map((b) => [b, cars.filter((c) => c.bodyType === b).length]).filter(([, n]) => n);
  const fuels = FUELS.filter((f) => cars.some((c) => c.fuel === f));
  const gears = TRANSMISSIONS.filter((t) => cars.some((c) => c.transmission === t));
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const view = sortVehicles(
    cars.filter((c) => {
      if (body && c.bodyType !== body) return false;
      if (make && c.make !== make) return false;
      if (fuel && c.fuel !== fuel) return false;
      if (gear && c.transmission !== gear) return false;
      if (words.length) {
        const h = `${c.year} ${c.make} ${c.model} ${c.variant || ''} ${c.color || ''} ${c.fuel} ${c.transmission}`.toLowerCase();
        if (!words.every((w) => h.includes(w))) return false;
      }
      return true;
    }),
    sort,
  );
  const active = [q, body, make, fuel, gear].filter(Boolean).length;
  const clear = () => {
    setQ('');
    setBody('');
    setMake('');
    setFuel('');
    setGear('');
  };

  return (
    <section className="min-w-0" aria-labelledby="inventory-title">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="inventory-title" className="text-xl font-bold">
            {seller.role === 'dealer' ? 'Full inventory' : `Cars from ${sellerName(seller)}`}
          </h2>
          <p className="mt-0.5 text-sm text-mist-600 num" aria-live="polite">
            {active ? `${view.length} of ${cars.length} cars match` : `${cars.length} car${cars.length === 1 ? '' : 's'} for sale`}
          </p>
        </div>
        {cars.length > 1 && <SearchInput value={q} onChange={setQ} placeholder={`Search ${sellerName(seller)}'s cars`} className="w-full md:w-72" />}
      </div>

      {cars.length > 1 && (
        <div className="mb-5 space-y-3">
          {bodies.length > 1 && (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              <button type="button" className={pill(!body)} onClick={() => setBody('')}>
                All <span className="text-mist-400">{cars.length}</span>
              </button>
              {bodies.map(([b, n]) => (
                <button key={b} type="button" className={pill(body === b)} onClick={() => setBody(body === b ? '' : b)}>
                  {b} <span className="text-mist-400">{n}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {makes.length > 1 && <Select aria-label="Brand" value={make} onChange={(e) => setMake(e.target.value)} placeholder="All brands" options={makes} className={cn('w-[150px]', small)} />}
            {fuels.length > 1 && <Select aria-label="Fuel" value={fuel} onChange={(e) => setFuel(e.target.value)} placeholder="Any fuel" options={fuels} className={cn('w-[120px]', small)} />}
            {gears.length > 1 && <Select aria-label="Transmission" value={gear} onChange={(e) => setGear(e.target.value)} placeholder="Any gearbox" options={gears} className={cn('w-[140px]', small)} />}
            <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} options={SORTS.filter((s) => s.value !== 'relevance')} className={cn('w-[180px]', small)} />
            {active > 0 && (
              <button type="button" onClick={clear} className="px-2 text-[13px] font-semibold text-accent-700 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {view.length === 0 ? (
        <EmptyState
          icon={Car}
          title={cars.length ? 'No cars match these filters' : 'No cars for sale right now'}
          message={cars.length ? "Clear a filter to see all of this seller's cars." : 'This seller has no live listings at the moment. Check back soon.'}
          action={
            cars.length ? (
              <Button variant="secondary" onClick={clear}>
                Clear filters
              </Button>
            ) : (
              <Button to={seller.role === 'dealer' ? '/dealers' : '/cars'}>{seller.role === 'dealer' ? 'See other dealers' : 'Browse all cars'}</Button>
            )
          }
        />
      ) : (
        <div className={cn('grid gap-4', cols)}>
          {view.map((c) => (
            <VehicleCard key={c.id} vehicle={c} />
          ))}
        </div>
      )}
      {cars.length > 0 && (
        <p className="mt-6 text-[12.5px] text-mist-500">
          Average kilometres across these cars: {km(cars.reduce((t, c) => t + c.mileage, 0) / cars.length)}. Listings are added by the seller; check each car's RC before you pay.
        </p>
      )}
    </section>
  );
}
