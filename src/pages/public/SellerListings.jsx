// Public seller page: every live listing from one dealer, private owner or agent.
// Route: /sellers/:id   (linked from the vehicle details page)
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, Car, Handshake, MapPin, MessageSquare, Phone, UserRound } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Avatar, Breadcrumbs, Button, CopyText, EmptyState, Select, StatusBadge } from '../../components/ui';
import { VehicleCard } from '../../components/vehicle/VehicleCard';
import { BODY_TYPES } from '../../data/catalog';
import { SORTS, sortVehicles } from '../../utils/filters';
import { cn, date, km, lakh } from '../../utils/format';

export const SELLER_TYPE = {
  dealer: { label: 'Dealer', icon: Building2 },
  seller: { label: 'Private owner', icon: UserRound },
  agent: { label: 'Agent', icon: Handshake },
};

export const sellerName = (u) => u?.business || u?.agency || u?.name || 'Seller';

/** All live listings for a seller, newest first. */
export function useSellerListings(sellerId) {
  const { state } = useStore();
  return useMemo(
    () => state.vehicles.filter((v) => v.sellerId === sellerId && isPublic(v)).sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)),
    [state.vehicles, sellerId],
  );
}

export default function SellerListings() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useStore();
  const seller = user(id);
  const cars = useSellerListings(id);
  const [body, setBody] = useState('');
  const [make, setMake] = useState('');
  const [sort, setSort] = useState('newest');
  const [reveal, setReveal] = useState(false);
  const from = params.get('from');

  if (!seller || !['dealer', 'seller', 'agent'].includes(seller.role) || seller.status === 'suspended') {
    return (
      <div className="container-page py-16">
        <EmptyState icon={Car} title="Seller not found" message="This seller isn't on AutoDealer any more, or the link is wrong." action={<Button to="/cars">Browse all cars</Button>} />
      </div>
    );
  }

  const T = SELLER_TYPE[seller.role];
  const makes = [...new Set(cars.map((c) => c.make))].sort();
  const bodies = BODY_TYPES.filter((b) => cars.some((c) => c.bodyType === b));
  const view = sortVehicles(
    cars.filter((c) => (!body || c.bodyType === body) && (!make || c.make === make)),
    sort,
  );
  const prices = cars.map((c) => c.price);
  const cities = [...new Set(cars.map((c) => c.city))];
  const verified = cars.filter((c) => c.verification === 'verified').length;

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: 'Buy a car', to: '/cars' }, { label: sellerName(seller) }]} className="mb-4" />
      {from && (
        <Link to={`/cars/${from}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-mist-600 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Back to the car you were viewing
        </Link>
      )}

      <section className="card mb-6 overflow-hidden">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={sellerName(seller)} size={64} />
            <div className="min-w-0">
              <p className="eyebrow">{T.label}</p>
              <h1 className="mt-0.5 truncate text-[24px] font-bold md:text-[28px]">{sellerName(seller)}</h1>
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-mist-600">
                <li className="flex items-center gap-1.5">
                  <T.icon className="h-3.5 w-3.5" /> {seller.business || seller.agency ? seller.name : T.label}
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {seller.city}
                </li>
                <li className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> On AutoDealer since {date(seller.registeredAt, { month: 'short', year: 'numeric' })}
                </li>
                <li className="flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5" /> Documents: <StatusBadge status={seller.docStatus === 'verified' ? 'verified' : seller.docStatus === 'not_submitted' ? 'not_submitted' : 'pending'} />
                </li>
              </ul>
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
            <span className="select-all font-mono text-[15px] font-semibold text-ink-900 num">{seller.phone}</span>
            <CopyText text={seller.phone} />
          </div>
        )}
        <dl className="grid grid-cols-2 border-t border-mist-100 sm:grid-cols-4">
          {[
            ['Cars for sale', cars.length],
            ['Price range', cars.length ? (prices.length > 1 ? `${lakh(Math.min(...prices))} – ${lakh(Math.max(...prices))}` : lakh(prices[0])) : '—'],
            ['Documents verified', `${verified} of ${cars.length}`],
            ['Cities', cities.join(', ') || '—'],
          ].map(([k, val], i) => (
            <div key={k} className={cn('min-w-0 px-5 py-3.5 md:px-6', i > 0 && 'sm:border-l', i % 2 === 1 && 'border-l', i >= 2 && 'border-t sm:border-t-0', 'border-mist-100')}>
              <dt className="text-[12px] text-mist-500">{k}</dt>
              <dd className="mt-0.5 truncate font-semibold text-ink-900 num">{val}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold">
          {view.length} car{view.length === 1 ? '' : 's'} from {sellerName(seller)}
        </h2>
        {cars.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {bodies.length > 1 && <Select aria-label="Body type" value={body} onChange={(e) => setBody(e.target.value)} placeholder="All body types" options={bodies} className="w-[160px]" />}
            {makes.length > 1 && <Select aria-label="Brand" value={make} onChange={(e) => setMake(e.target.value)} placeholder="All brands" options={makes} className="w-[160px]" />}
            <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} options={SORTS.filter((s) => s.value !== 'relevance')} className="w-[190px]" />
          </div>
        )}
      </div>

      {view.length === 0 ? (
        <EmptyState
          icon={Car}
          title={cars.length ? 'No cars match these filters' : 'No cars for sale right now'}
          message={cars.length ? 'Clear a filter to see all of this seller\'s cars.' : 'This seller has no live listings at the moment.'}
          action={cars.length ? <Button variant="secondary" onClick={() => { setBody(''); setMake(''); }}>Clear filters</Button> : <Button to="/cars">Browse all cars</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  );
}
