// Side-by-side comparison of the current car against similar listings.
// Shown on the vehicle details page below "Similar cars".
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, ChevronUp, GitCompareArrows, Minus, Trophy, X } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Badge, Button, EmptyState, Toggle, VerificationBadge, useToast } from '../ui';
import { CarImage } from './CarArt';
import { vehicleTitle } from './VehicleCard';
import { calcEmi } from '../../utils/emi';
import { MATCH_MODES, findMatches } from '../../utils/similarity';
import { cn, tzs, km, num } from '../../utils/format';
import { vehiclePath, compareMessage, categoryOf, typeOf } from '../../data/vehicleTypes';

const PREVIEW = 4; // matches shown before "Compare all"
const SELLER = { dealer: 'Dealer', seller: 'Private owner', agent: 'Agent' };

// Each row: label, how to show it, optional `best` (higher is better → number) for highlighting.
function rowsFor(base, rate) {
  const category = categoryOf(base);
  const noun = typeOf(base).noun;
  const emi = (c) => calcEmi({ price: c.price, downPayment: c.price * 0.2, ratePct: rate, months: 60 }).emi;
  return [
    {
      group: 'Price & ownership',
      rows: [
        ['Price', (c) => <span className="font-display text-[15px] font-bold">{tzs(c.price)}</span>, (c) => -c.price, (c) => c.price],
        [
          `Price vs this ${noun}`,
          (c) => {
            if (c.id === base.id) return <span className="text-mist-500">—</span>;
            const d = c.price - base.price;
            if (Math.abs(d) < 1000) return <span className="text-mist-600">Same price</span>;
            const Icon = d < 0 ? ArrowDownRight : ArrowUpRight;
            return (
              <span className={cn('inline-flex items-center gap-1 font-semibold', d < 0 ? 'text-ok-700' : 'text-bad-600')}>
                <Icon className="h-3.5 w-3.5" />
                {tzs(Math.abs(d))} {d < 0 ? 'cheaper' : 'more'}
              </span>
            );
          },
          null,
          (c) => c.price,
        ],
        ['Est. EMI (20% down, 5 yrs)', (c) => `${tzs(emi(c))}/mo`, (c) => -c.price],
        ['Model year', (c) => c.year, (c) => c.year],
        ['Kilometres', (c) => km(c.mileage), (c) => -c.mileage],
        ['Ownership', (c) => c.owners],
        ['Condition', (c) => c.condition],
        ['Location', (c) => c.city],
      ],
    },
    ...(category === 'motorcycle'
      ? [
    {
      group: 'Engine & riding',
      rows: [
        ['Variant', (c) => c.variant],
        ['Type', (c) => c.bodyType],
        ['Fuel', (c) => c.fuel],
        ['Engine', (c) => (c.fuel === 'Electric' ? 'Electric motor' : c.specs?.engineCc ? `${num(c.specs.engineCc)} cc` : '—'), (c) => c.specs?.engineCc || 0],
        ['Power', (c) => (c.specs?.powerBhp ? `${c.specs.powerBhp} bhp` : '—'), (c) => c.specs?.powerBhp || 0],
        [
          'Fuel economy / range',
          (c) => (c.fuel === 'Electric' ? (c.specs?.rangeKm ? `${c.specs.rangeKm} km per charge` : '—') : c.specs?.mileageKmpl ? `${c.specs.mileageKmpl} km/l` : '—'),
          (c) => (c.fuel === 'Electric' ? null : c.specs?.mileageKmpl || 0),
        ],
        ['Kerb weight', (c) => (c.specs?.weightKg ? `${c.specs.weightKg} kg` : '—'), (c) => (c.specs?.weightKg ? -c.specs.weightKg : null)],
        ['ABS', (c) => c.specs?.abs || '—'],
        ['Transmission', (c) => c.transmission],
        ['Colour', (c) => c.color],
      ],
    },
        ]
      : category === 'lorry'
        ? [
    {
      group: 'Load & engine',
      rows: [
        ['Variant / body', (c) => c.variant],
        ['Truck type', (c) => c.bodyType],
        ['Payload', (c) => (c.specs?.payloadT ? `${c.specs.payloadT} tonnes` : '—'), (c) => c.specs?.payloadT || 0],
        ['Gross weight (GVW)', (c) => (c.specs?.gvwT ? `${c.specs.gvwT} tonnes` : '—')],
        ['Axle configuration', (c) => c.specs?.axle || '—'],
        ['Engine power', (c) => (c.specs?.powerHp ? `${c.specs.powerHp} hp` : '—'), (c) => c.specs?.powerHp || 0],
        ['Cabin', (c) => c.specs?.cabin || '—'],
        ['Tyres', (c) => c.specs?.tyres ?? '—'],
        ['Fuel', (c) => c.fuel],
        ['Transmission', (c) => c.transmission],
        ['Colour', (c) => c.color],
      ],
    },
          ]
        : [
    {
      group: 'Engine & performance',
      rows: [
        ['Variant', (c) => c.variant],
        ['Fuel', (c) => c.fuel],
        ['Transmission', (c) => c.transmission],
        ['Engine', (c) => (c.specs?.engineCc ? `${num(c.specs.engineCc)} cc` : c.fuel === 'Electric' ? 'Electric motor' : '—'), (c) => c.specs?.engineCc || 0],
        ['Power', (c) => (c.specs?.powerBhp ? `${c.specs.powerBhp} bhp` : '—'), (c) => c.specs?.powerBhp || 0],
        [
          'Fuel economy / battery',
          (c) => (c.fuel === 'Electric' ? (c.specs?.batteryKwh ? `${c.specs.batteryKwh} kWh` : '—') : c.specs?.mileageKmpl ? `${c.specs.mileageKmpl} km/l` : '—'),
          (c) => (c.fuel === 'Electric' ? null : c.specs?.mileageKmpl || 0),
        ],
      ],
    },
    {
      group: 'Space & safety',
      rows: [
        ['Body type', (c) => c.bodyType],
        ['Seats', (c) => c.specs?.seats ?? '—', (c) => c.specs?.seats || 0],
        ['Airbags', (c) => c.specs?.airbags ?? '—', (c) => c.specs?.airbags || 0],
        ['Colour', (c) => c.color],
      ],
    },
          ]),
    {
      group: 'Seller & trust',
      rows: [
        ['Sold by', (c) => SELLER[c.sellerRole]],
        ['Documents', (c) => <VerificationBadge status={c.verification} size="sm" />, null, (c) => c.verification],
      ],
    },
  ];
}

/** Returns the winning value for a row, or null when there's no clear winner. */
function bestOf(cars, score) {
  if (!score || cars.length < 2) return null;
  const vals = cars.map(score).filter((x) => x != null);
  if (vals.length < 2) return null;
  const max = Math.max(...vals);
  return vals.every((x) => x === max) ? null : max;
}

function Verdict({ label, match, base, detail }) {
  if (!match) return null;
  const c = match.car || match;
  return (
    <Link to={`${vehiclePath(c)}`} className="card flex min-w-0 items-center gap-3 p-3 transition-shadow hover:shadow-lift">
      <CarImage vehicle={c} view="side" className="h-12 w-[72px] shrink-0 rounded-md" />
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-accent-600">
          <Trophy className="h-3 w-3" /> {label}
        </p>
        <p className="truncate text-sm font-semibold text-ink-900">{c.id === base.id ? `This ${typeOf(base).noun}` : vehicleTitle(c)}</p>
        <p className="truncate text-[12px] text-mist-500">{detail(c)}</p>
      </div>
    </Link>
  );
}

export function SimilarComparison({ vehicle: base }) {
  const { state, toggleCompare } = useStore();
  const T = typeOf(base);
  const toast = useToast();
  const [mode, setMode] = useState('best');
  const [band, setBand] = useState(15);
  const [showAll, setShowAll] = useState(false);
  const [diffOnly, setDiffOnly] = useState(false);
  const [openFeatures, setOpenFeatures] = useState(true);
  const rate = state.config.defaultInterestRate;

  const pool = useMemo(() => state.vehicles.filter((v) => isPublic(v) && categoryOf(v) === categoryOf(base)), [state.vehicles, base]);
  const matches = useMemo(() => findMatches(base, pool, mode, band), [base, pool, mode, band]);
  const shown = showAll ? matches : matches.slice(0, PREVIEW);
  const cars = [base, ...shown.map((m) => m.car)];
  const byId = Object.fromEntries(matches.map((m) => [m.car.id, m]));
  const groups = rowsFor(base, rate);
  const features = [...new Set(cars.flatMap((c) => c.specs?.features || []))].sort((a, b) => {
    const has = (f) => (base.specs?.features || []).includes(f);
    return Number(has(b)) - Number(has(a)) || a.localeCompare(b);
  });

  const all = [base, ...matches.map((m) => m.car)];
  const pick = (fn) => all.reduce((best, c) => (fn(c) > fn(best) ? c : best), all[0]);
  const verdicts = matches.length
    ? [
        ['Lowest price', pick((c) => -c.price), (c) => tzs(c.price)],
        ['Lowest kilometres', pick((c) => -c.mileage), (c) => km(c.mileage)],
        ['Newest', pick((c) => c.year), (c) => `${c.year} model`],
        ['Most features', pick((c) => (c.specs?.features || []).length), (c) => `${(c.specs?.features || []).length} features`],
      ]
    : [];

  // A row is kept in "differences only" mode when its plain values aren't all equal.
  const differs = (fmt, key) => !diffOnly || new Set(cars.map((c) => String((key || fmt)(c)))).size > 1;

  const addCompare = (id) => {
    const m = compareMessage(toggleCompare(id), state.vehicles.find((x) => x.id === id));
    toast(m.text, { tone: m.tone });
  };

  const modeInfo = MATCH_MODES.find((m) => m.value === mode);
  const colW = 'min-w-[190px] w-[190px]';

  return (
    <section className="mt-12" aria-labelledby="cmp-title">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Side-by-side</p>
          <h2 id="cmp-title" className="mt-1 text-xl font-bold">
            Compare with similar {T.nounPlural}
          </h2>
          <p className="mt-1 text-sm text-mist-600">
            {matches.length} {matches.length === 1 ? T.noun : T.nounPlural} match · {modeInfo.hint}
          </p>
        </div>
        <Toggle id="cmp-diff" label="Show only differences" checked={diffOnly} onChange={setDiffOnly} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Match by">
        {MATCH_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => {
              setMode(m.value);
              setShowAll(false);
            }}
            className={cn('rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors', mode === m.value ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-mist-200 text-mist-700 hover:border-mist-300')}
          >
            {m.label}
          </button>
        ))}
        {mode === 'price' && (
          <div className="ml-1 inline-flex items-center gap-1 rounded-full bg-mist-100 p-0.5" aria-label="Price band">
            {[10, 15, 25].map((b) => (
              <button key={b} type="button" onClick={() => setBand(b)} aria-pressed={band === b} className={cn('rounded-full px-2.5 py-1 text-[12px] font-semibold', band === b ? 'bg-white text-ink-900 shadow-card' : 'text-mist-600')}>
                ±{b}%
              </button>
            ))}
            <span className="px-2 text-[12px] text-mist-500 num">
              {tzs(base.price * (1 - band / 100))} – {tzs(base.price * (1 + band / 100))}
            </span>
          </div>
        )}
      </div>

      {matches.length === 0 ? (
        <EmptyState icon={GitCompareArrows} title={`No ${T.nounPlural} match this filter`} message="Try another filter above, or widen the price band." />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {verdicts.map(([label, c, detail]) => (
              <Verdict key={label} label={label} match={c} base={base} detail={detail} />
            ))}
          </div>

          <div className="card overflow-x-auto">
            <table className="w-max min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-[2] min-w-[150px] w-[150px] border-b border-mist-200 bg-white p-3 text-left align-bottom text-[12px] font-bold uppercase tracking-wide text-mist-500 md:min-w-[190px] md:w-[190px]">
                    {cars.length} {T.nounPlural}
                  </th>
                  {cars.map((c) => {
                    const m = byId[c.id];
                    const isBase = c.id === base.id;
                    return (
                      <th key={c.id} className={cn(colW, 'border-b border-l border-mist-200 p-3 text-left align-top font-normal', isBase && 'bg-accent-50/40')}>
                        <Link to={`${vehiclePath(c)}`} className="block">
                          <CarImage vehicle={c} view="side" className="aspect-[16/10] w-full rounded-lg" />
                        </Link>
                        <div className="mt-2 flex items-center gap-1.5">
                          {isBase ? <Badge tone="dark">This {T.noun}</Badge> : <Badge tone={m.score >= 70 ? 'green' : m.score >= 50 ? 'blue' : 'neutral'}>{m.score}% match</Badge>}
                        </div>
                        <Link to={`${vehiclePath(c)}`} className="mt-1.5 block font-display text-[14px] font-bold leading-snug text-ink-900 hover:text-accent-700">
                          {vehicleTitle(c)}
                        </Link>
                        <p className="text-[12.5px] text-mist-500">{c.variant}</p>
                        {!isBase && m.reasons.length > 0 && (
                          <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-mist-500" title={m.reasons.join(' · ')}>
                            {m.reasons.slice(0, 3).join(' · ')}
                          </p>
                        )}
                        {!isBase && (
                          <div className="mt-2.5 flex gap-1.5">
                            <Button size="sm" to={`${vehiclePath(c)}`} className="flex-1">
                              View
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => addCompare(c.id)} aria-label={`Add ${vehicleTitle(c)} to compare`} className={cn(state.compare.includes(c.id) && 'border-accent-200 bg-accent-50 text-accent-700')}>
                              <GitCompareArrows className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <GroupRows key={g.group} title={g.group} span={cars.length + 1}>
                    {g.rows
                      .filter(([, fmt, , key]) => differs(fmt, key))
                      .map(([label, fmt, score]) => {
                        const best = bestOf(cars, score);
                        return (
                          <tr key={label} className="border-t border-mist-100">
                            <td className="sticky left-0 z-[1] bg-white px-3 py-2.5 text-[13px] font-semibold text-mist-600">{label}</td>
                            {cars.map((c) => {
                              const win = best != null && score(c) === best;
                              return (
                                <td key={c.id} className={cn('border-l border-mist-100 px-3 py-2.5 num', c.id === base.id && 'bg-accent-50/40', win ? 'font-bold text-ok-700' : 'text-ink-900')}>
                                  <span className="inline-flex items-center gap-1.5">
                                    {fmt(c)}
                                    {win && <Trophy className="h-3.5 w-3.5 shrink-0" aria-label="Best in this row" />}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </GroupRows>
                ))}

                <tr className="border-t border-mist-200">
                  <td colSpan={cars.length + 1} className="p-0">
                    <button type="button" onClick={() => setOpenFeatures((o) => !o)} className="sticky left-0 flex items-center gap-2 bg-mist-50 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-mist-600" aria-expanded={openFeatures}>
                      Features ({features.length}) {openFeatures ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
                <tr className="border-t border-mist-100">
                  <td className="sticky left-0 z-[1] bg-white px-3 py-2.5 text-[13px] font-semibold text-mist-600">Feature count</td>
                  {(() => {
                    const best = bestOf(cars, (c) => (c.specs?.features || []).length);
                    return cars.map((c) => {
                      const n = (c.specs?.features || []).length;
                      return (
                        <td key={c.id} className={cn('border-l border-mist-100 px-3 py-2.5 num', c.id === base.id && 'bg-accent-50/40', best === n ? 'font-bold text-ok-700' : 'text-ink-900')}>
                          {n} of {features.length}
                        </td>
                      );
                    });
                  })()}
                </tr>
                {openFeatures &&
                  features
                    .filter((f) => !diffOnly || new Set(cars.map((c) => (c.specs?.features || []).includes(f))).size > 1)
                    .map((f) => (
                      <tr key={f} className="border-t border-mist-100">
                        <td className="sticky left-0 z-[1] bg-white px-3 py-2 text-[13px] text-mist-600">{f}</td>
                        {cars.map((c) => {
                          const has = (c.specs?.features || []).includes(f);
                          return (
                            <td key={c.id} className={cn('border-l border-mist-100 px-3 py-2', c.id === base.id && 'bg-accent-50/40')}>
                              {has ? <Check className="h-4 w-4 text-ok-600" aria-label="Yes" /> : <X className="h-4 w-4 text-mist-300" aria-label="No" />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                <tr className="border-t border-mist-200">
                  <td className="sticky left-0 z-[1] bg-white px-3 py-3" />
                  {cars.map((c) => (
                    <td key={c.id} className={cn('border-l border-mist-100 px-3 py-3', c.id === base.id && 'bg-accent-50/40')}>
                      {c.id === base.id ? (
                        <span className="inline-flex items-center gap-1 text-[12.5px] text-mist-500">
                          <Minus className="h-3.5 w-3.5" /> You're viewing this {T.noun}
                        </span>
                      ) : (
                        <Button size="sm" variant="secondary" to={`${vehiclePath(c)}/contact`} className="w-full">
                          Contact seller
                        </Button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-[12.5px] text-mist-500">
              <Trophy className="mr-1 inline h-3.5 w-3.5 text-ok-600" />
              marks the best value in each row. Scroll sideways to see every {T.noun}.
            </p>
            <div className="flex flex-wrap gap-2">
              {matches.length > PREVIEW && (
                <Button variant={showAll ? 'secondary' : 'primary'} onClick={() => setShowAll((s) => !s)}>
                  {showAll ? `Show top ${PREVIEW} only` : `Compare all ${matches.length} similar ${T.nounPlural}`}
                </Button>
              )}
              <Button variant="ghost" to="/compare" icon={GitCompareArrows}>
                My compare list ({state.compare.length})
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function GroupRows({ title, span, children }) {
  const list = Array.isArray(children) ? children : [children];
  if (!list.filter(Boolean).length) return null;
  return (
    <>
      <tr className="border-t border-mist-200">
        <td colSpan={span} className="p-0">
          <span className="sticky left-0 block w-max bg-mist-50 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-mist-600">{title}</span>
        </td>
      </tr>
      {children}
    </>
  );
}
