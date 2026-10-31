import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, GitCompareArrows, Plus, Trophy, X } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Breadcrumbs, Button, EmptyState, Modal, SearchInput, VerificationBadge, useToast } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { calcEmi } from '../../utils/emi';
import { cn, tzs, km, num } from '../../utils/format';
import { vehiclePath, compareMessage, categoryOf, typeFor } from '../../data/vehicleTypes';

const COMMON_TOP = [
  ['Price', (v) => tzs(v.price), (v) => -v.price],
  ['Est. EMI (20% down, 5 yrs)', (v) => `${tzs(calcEmi({ price: v.price, downPayment: v.price * 0.2, ratePct: 9.25, months: 60 }).emi)}/mo`, (v) => -v.price],
  ['Model year', (v) => v.year, (v) => v.year],
  ['Kilometres', (v) => km(v.mileage), (v) => -v.mileage],
  ['Fuel', (v) => v.fuel],
  ['Transmission', (v) => v.transmission],
  ['Condition', (v) => v.condition],
  ['Ownership', (v) => v.owners],
];
const COMMON_END = [
  ['Location', (v) => v.city],
  ['Seller', (v) => ({ dealer: 'Dealer', seller: 'Private owner', agent: 'Agent' })[v.sellerRole]],
];
/** Rows for each vehicle type; compare only ever holds one type. */
const ROWS = {
  car: [
    ...COMMON_TOP,
    ['Body type', (v) => v.bodyType],
    ['Engine', (v) => (v.specs?.engineCc ? `${num(v.specs.engineCc)} cc` : v.fuel === 'Electric' ? 'Electric' : '—')],
    ['Power', (v) => (v.specs?.powerBhp ? `${v.specs.powerBhp} bhp` : '—'), (v) => v.specs?.powerBhp || 0],
    ['Seats', (v) => v.specs?.seats ?? '—'],
    ['Fuel economy', (v) => (v.specs?.mileageKmpl ? `${v.specs.mileageKmpl} km/l` : '—'), (v) => v.specs?.mileageKmpl || 0],
    ['Airbags', (v) => v.specs?.airbags ?? '—', (v) => v.specs?.airbags || 0],
    ...COMMON_END,
  ],
  motorcycle: [
    ...COMMON_TOP,
    ['Type', (v) => v.bodyType],
    ['Engine', (v) => (v.fuel === 'Electric' ? 'Electric motor' : v.specs?.engineCc ? `${num(v.specs.engineCc)} cc` : '—'), (v) => v.specs?.engineCc || 0],
    ['Power', (v) => (v.specs?.powerBhp ? `${v.specs.powerBhp} bhp` : '—'), (v) => v.specs?.powerBhp || 0],
    ['Fuel economy / range', (v) => (v.fuel === 'Electric' ? (v.specs?.rangeKm ? `${v.specs.rangeKm} km per charge` : '—') : v.specs?.mileageKmpl ? `${v.specs.mileageKmpl} km/l` : '—'), (v) => (v.fuel === 'Electric' ? 0 : v.specs?.mileageKmpl || 0)],
    ['Kerb weight', (v) => (v.specs?.weightKg ? `${v.specs.weightKg} kg` : '—'), (v) => (v.specs?.weightKg ? -v.specs.weightKg : -9999)],
    ['ABS', (v) => v.specs?.abs || '—'],
    ...COMMON_END,
  ],
  lorry: [
    ...COMMON_TOP,
    ['Truck type', (v) => v.bodyType],
    ['Payload', (v) => (v.specs?.payloadT ? `${v.specs.payloadT} tonnes` : '—'), (v) => v.specs?.payloadT || 0],
    ['Gross weight (GVW)', (v) => (v.specs?.gvwT ? `${v.specs.gvwT} tonnes` : '—')],
    ['Axle configuration', (v) => v.specs?.axle || '—'],
    ['Engine power', (v) => (v.specs?.powerHp ? `${v.specs.powerHp} hp` : '—'), (v) => v.specs?.powerHp || 0],
    ['Cabin', (v) => v.specs?.cabin || '—'],
    ['Tyres', (v) => v.specs?.tyres ?? '—'],
    ...COMMON_END,
  ],
};

export default function Compare() {
  const { state, vehicle, toggleCompare, clearCompare } = useStore();
  const toast = useToast();
  const [picker, setPicker] = useState(false);
  const [q, setQ] = useState('');
  const cars = state.compare.map(vehicle).filter(Boolean);
  const category = cars[0] ? categoryOf(cars[0]) : 'car';
  const T = typeFor(category);
  const featureSet = [...new Set(cars.flatMap((v) => v.specs?.features || []))];
  const best = (score) => {
    if (!score || cars.length < 2) return null;
    const vals = cars.map(score);
    const max = Math.max(...vals);
    return vals.filter((x) => x === max).length === vals.length ? null : max;
  };
  const candidates = useMemo(() => {
    const pool = [...new Set([...state.saved, ...state.recent])].map(vehicle).filter((v) => v && isPublic(v));
    const t = q.trim().toLowerCase();
    const list = t ? state.vehicles.filter((v) => isPublic(v) && `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(t)) : pool;
    return list.filter((v) => !state.compare.includes(v.id) && (!cars.length || categoryOf(v) === category)).slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, state.saved, state.recent, state.vehicles, state.compare, vehicle, category]);

  const add = (id) => {
    const r = toggleCompare(id);
    if (r !== 'added' && r !== 'removed') {
      const m = compareMessage(r, state.vehicles.find((x) => x.id === id));
      toast(m.text, { tone: m.tone });
    }
    setPicker(false);
    setQ('');
  };

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: `Compare ${T.nounPlural}` }]} className="mb-4" />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-bold">Compare {T.nounPlural}</h1>
          <p className="mt-1 text-mist-600">Side by side, up to three of the same type. The best value in each row is highlighted.</p>
        </div>
        {cars.length > 0 && (
          <Button variant="ghost" onClick={clearCompare}>
            Clear all
          </Button>
        )}
      </div>

      {cars.length === 0 ? (
        <EmptyState icon={GitCompareArrows} title="Nothing to compare yet" message="Tap the compare icon on any car, motorcycle or lorry, or add one from your saved and recently viewed vehicles." action={<><Button onClick={() => setPicker(true)} icon={Plus}>Add a vehicle</Button><Button variant="secondary" to="/cars">Browse vehicles</Button></>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-[200px]" />
              {[0, 1, 2].map((i) => (
                <col key={i} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="p-4 align-bottom text-left text-[12px] font-bold uppercase tracking-wide text-mist-500">{cars.length} of 3 selected</th>
                {[0, 1, 2].map((i) => {
                  const v = cars[i];
                  return (
                    <th key={i} className="border-l border-mist-100 p-4 text-left align-top font-normal">
                      {v ? (
                        <div className="relative">
                          <button type="button" onClick={() => toggleCompare(v.id)} className="absolute right-1 top-1 z-[1] rounded-full bg-white/90 p-1 text-mist-600 shadow-card hover:text-bad-600" aria-label={`Remove ${vehicleTitle(v)}`}>
                            <X className="h-4 w-4" />
                          </button>
                          <Link to={`${vehiclePath(v)}`}>
                            <CarImage vehicle={v} view="side" className="aspect-[16/10] w-full rounded-lg" />
                          </Link>
                          <Link to={`${vehiclePath(v)}`} className="mt-3 block font-display text-[15px] font-bold leading-snug text-ink-900 hover:text-accent-700" style={{ fontStretch: '104%' }}>
                            {vehicleTitle(v)}
                          </Link>
                          <p className="text-[13px] text-mist-500">{v.variant}</p>
                          <div className="mt-2">
                            <VerificationBadge status={v.verification} size="sm" />
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setPicker(true)} className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-mist-300 text-sm font-semibold text-mist-600 hover:border-accent-400 hover:text-accent-700">
                          <Plus className="h-5 w-5" /> Add a {T.noun}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ROWS[category].map(([label, fmt, score]) => {
                const b = best(score);
                return (
                  <tr key={label} className="border-t border-mist-100">
                    <td className="bg-mist-50/60 px-4 py-3 text-[13px] font-semibold text-mist-600">{label}</td>
                    {[0, 1, 2].map((i) => {
                      const v = cars[i];
                      const win = v && b != null && score(v) === b;
                      return (
                        <td key={i} className={cn('border-l border-mist-100 px-4 py-3 num', win ? 'font-bold text-ok-700' : 'text-ink-900')}>
                          {v ? (
                            <span className="inline-flex items-center gap-1.5">
                              {fmt(v)}
                              {win && <Trophy className="h-3.5 w-3.5" />}
                            </span>
                          ) : (
                            ''
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {featureSet.length > 0 && (
                <tr className="border-t border-mist-200">
                  <td colSpan={4} className="bg-mist-50 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-mist-500">
                    Features
                  </td>
                </tr>
              )}
              {featureSet.map((f) => (
                <tr key={f} className="border-t border-mist-100">
                  <td className="bg-mist-50/60 px-4 py-2.5 text-[13px] text-mist-600">{f}</td>
                  {[0, 1, 2].map((i) => {
                    const v = cars[i];
                    return (
                      <td key={i} className="border-l border-mist-100 px-4 py-2.5">
                        {v && (v.specs?.features?.includes(f) ? <Check className="h-4 w-4 text-ok-600" aria-label="Yes" /> : <X className="h-4 w-4 text-mist-300" aria-label="No" />)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-mist-200">
                <td className="px-4 py-4" />
                {[0, 1, 2].map((i) => (
                  <td key={i} className="border-l border-mist-100 px-4 py-4">
                    {cars[i] && (
                      <Button size="sm" to={`/cars/${cars[i].id}/contact`} className="w-full">
                        Contact seller
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <Modal open={picker} onClose={() => setPicker(false)} title={`Add a ${cars.length ? T.noun : "vehicle"} to compare`} description="From your saved and recently viewed vehicles, or search all listings.">
        <SearchInput value={q} onChange={setQ} placeholder="Search make or model" />
        <ul className="mt-4 divide-y divide-mist-100">
          {candidates.map((v) => (
            <li key={v.id}>
              <button type="button" onClick={() => add(v.id)} className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-mist-50">
                <CarImage vehicle={v} view="side" className="h-10 w-16 shrink-0 rounded" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{vehicleTitle(v)}</p>
                  <p className="text-[12.5px] text-mist-500">
                    {tzs(v.price)} · {km(v.mileage)}
                  </p>
                </div>
                <Plus className="h-4 w-4 text-accent-600" />
              </button>
            </li>
          ))}
          {candidates.length === 0 && <li className="py-6 text-center text-sm text-mist-500">Nothing found. Try another search.</li>}
        </ul>
      </Modal>
    </div>
  );
}
