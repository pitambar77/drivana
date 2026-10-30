import { Link } from 'react-router-dom';
import { Fuel, Gauge, GitCompareArrows, Heart, MapPin, Settings2, Star } from 'lucide-react';
import { CarImage } from './CarArt';
import { VerificationBadge } from '../ui';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { cn, km, tzs } from '../../utils/format';
import { useTilt } from '../interactive/Interactive';

export function vehicleTitle(v) {
  return `${v.year} ${v.make} ${v.model}`;
}

export function SellerTypeTag({ role }) {
  const map = { dealer: 'Dealer', seller: 'Owner', agent: 'Agent' };
  return <span className="rounded bg-mist-100 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-mist-600">{map[role] || role}</span>;
}

export function VehicleCard({ vehicle: v, layout = 'grid', onRemove, actions }) {
  const { state, toggleSaved, toggleCompare } = useStore();
  const toast = useToast();
  const tilt = useTilt(layout === 'row' ? 3 : 6);
  const saved = state.saved.includes(v.id);
  const comparing = state.compare.includes(v.id);
  const onCompare = (e) => {
    e.preventDefault();
    const r = toggleCompare(v.id);
    if (r === 'full') toast('You can compare up to 3 cars. Remove one first.', { tone: 'warn' });
    else toast(r === 'added' ? 'Added to compare' : 'Removed from compare', { tone: 'info' });
  };
  const onSave = (e) => {
    e.preventDefault();
    toggleSaved(v.id);
    toast(saved ? 'Removed from saved cars' : 'Saved to your shortlist', { tone: saved ? 'info' : 'success' });
  };
  return (
    <article {...tilt} className={cn('card tilt group relative flex min-w-0 overflow-hidden hover:shadow-lift', layout === 'row' ? 'flex-col sm:flex-row' : 'flex-col')}>
      <Link to={`/cars/${v.id}`} className={cn('relative block shrink-0 overflow-hidden', layout === 'row' ? 'sm:w-64' : '')} aria-label={`View ${vehicleTitle(v)}`}>
        <CarImage vehicle={v} className={cn('w-full transition-transform duration-500 ease-out group-hover:scale-[1.06]', layout === 'row' ? 'aspect-[16/10] sm:h-full' : 'aspect-[16/10]')} view="side" />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {v.featured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-ink-900/90 px-1.5 py-0.5 text-[11px] font-bold text-white">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> Featured
            </span>
          )}
          {v.condition !== 'Used' && <span className="rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-bold text-ink-900 shadow-card">{v.condition === 'New' ? 'New' : 'Certified'}</span>}
        </div>
      </Link>
      <div className="absolute right-2.5 top-2.5 flex gap-1.5">
        <button type="button" onClick={onCompare} aria-pressed={comparing} aria-label="Compare" title="Compare" className={cn('flex h-8 w-8 items-center justify-center rounded-full shadow-card backdrop-blur', comparing ? 'bg-accent-600 text-white' : 'bg-white/90 text-ink-800 hover:bg-white')}>
          <GitCompareArrows className="h-4 w-4" />
        </button>
        <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save car'} title="Save" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur hover:bg-white">
          <Heart className={cn('h-4 w-4', saved ? 'fill-bad-600 text-bad-600' : 'text-ink-800')} />
        </button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <SellerTypeTag role={v.sellerRole} />
            <span className="flex min-w-0 items-center gap-0.5 truncate text-[12px] text-mist-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {v.city}
            </span>
          </div>
          <Link to={`/cars/${v.id}`} className="block">
            <h3 className="truncate text-[15.5px] font-bold leading-snug group-hover:text-accent-700" style={{ fontStretch: '104%' }}>
              {vehicleTitle(v)}
            </h3>
          </Link>
          <p className="truncate text-[13px] text-mist-500">{v.variant}</p>
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-mist-600">
          <li className="flex items-center gap-1 num">
            <Gauge className="h-3.5 w-3.5 text-mist-400" />
            {km(v.mileage)}
          </li>
          <li className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5 text-mist-400" />
            {v.fuel}
          </li>
          <li className="flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5 text-mist-400" />
            {v.transmission}
          </li>
        </ul>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1.5 pt-1">
          <p className="whitespace-nowrap font-display text-sm font-bold text-ink-900 num" style={{ fontStretch: '110%' }}>
            {tzs(v.price)}
          </p>
          <VerificationBadge status={v.verification} size="sm" />
        </div>
        {(actions || onRemove) && <div className="flex gap-2 border-t border-mist-100 pt-3">{actions}{onRemove && <button type="button" onClick={onRemove} className="btn btn-sm btn-ghost text-bad-600">Remove</button>}</div>}
      </div>
    </article>
  );
}
