// How closely another listing matches the car a buyer is looking at.
// Used by the comparison section on the vehicle details page.

const MAX = 115; // sum of all weights below

/**
 * Returns { score (0–100), reasons[], priceDiffPct, shared } for candidate `c` against base car `v`.
 * Weights: same model 40, same variant +10, same body 15, price closeness 25,
 * same fuel 5, same gearbox 5, year closeness 5, shared features 10.
 */
export function matchScore(v, c) {
  let s = 0;
  const reasons = [];
  const sameModel = c.make === v.make && c.model === v.model;
  if (sameModel) {
    s += 40;
    reasons.push('Same model');
    if (c.variant && c.variant === v.variant) {
      s += 10;
      reasons.push('Same variant');
    }
  }
  if (c.bodyType === v.bodyType) {
    s += 15;
    if (!sameModel) reasons.push(`Same body type (${v.bodyType})`);
  }
  const priceDiffPct = v.price ? ((c.price - v.price) / v.price) * 100 : 0;
  const d = Math.abs(priceDiffPct) / 100;
  s += 25 * (1 - Math.min(d / 0.5, 1)); // full points at the same price, none beyond ±50%
  if (Math.abs(priceDiffPct) <= 15) reasons.push('Similar price');
  if (c.fuel === v.fuel) {
    s += 5;
    reasons.push(`${c.fuel}`);
  }
  if (c.transmission === v.transmission) {
    s += 5;
    reasons.push(`${c.transmission}`);
  }
  s += 5 * (1 - Math.min(Math.abs(c.year - v.year) / 5, 1));
  const fa = new Set(v.specs?.features || []);
  const fb = new Set(c.specs?.features || []);
  const shared = [...fa].filter((f) => fb.has(f)).length;
  const union = new Set([...fa, ...fb]).size || 1;
  s += 10 * (shared / union);
  if (shared >= 3) reasons.push(`${shared} shared features`);
  return { score: Math.round((s / MAX) * 100), reasons, priceDiffPct, shared };
}

/** Filters that decide which cars appear in the comparison. */
export const MATCH_MODES = [
  { value: 'best', label: 'Best matches', hint: 'Ranked by model, body type, price, fuel, gearbox, year and features' },
  { value: 'variant', label: 'Same model & variant', hint: 'Same make and model; same variant ranked first' },
  { value: 'price', label: 'Same price range', hint: 'Any car within the chosen price band' },
  { value: 'features', label: 'Same type & features', hint: 'Same body type with at least half the features in common' },
];

export function findMatches(v, pool, mode, band = 15) {
  const scored = pool.filter((c) => c.id !== v.id).map((c) => ({ car: c, ...matchScore(v, c) }));
  const fv = (v.specs?.features || []).length;
  let list;
  switch (mode) {
    case 'variant':
      list = scored.filter((m) => m.car.make === v.make && m.car.model === v.model);
      break;
    case 'price':
      list = scored.filter((m) => Math.abs(m.priceDiffPct) <= band);
      break;
    case 'features':
      list = scored.filter((m) => m.car.bodyType === v.bodyType && (fv === 0 || m.shared / fv >= 0.5));
      break;
    default:
      list = scored.filter((m) => m.score >= 30);
  }
  return list.sort((a, b) => b.score - a.score);
}
