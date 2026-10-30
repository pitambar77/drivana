// Dealer directory helpers: who appears in the directory and the numbers shown on each dealer.
import { useMemo } from 'react';
import { useStore, isPublic } from '../store/AppStore';
import { DEALER_PROFILES } from '../data/dealerProfiles';

/** A dealer account merged with its showroom details. Fields saved on the account win. */
export function dealerProfile(u) {
  if (!u) return null;
  const base = DEALER_PROFILES[u.id] || {};
  const pick = (k) => (u[k] !== undefined && u[k] !== '' && !(Array.isArray(u[k]) && !u[k].length) ? u[k] : base[k]);
  return {
    ...base,
    ...u,
    businessType: pick('businessType') || 'Car dealer',
    yearEstablished: pick('yearEstablished'),
    about: pick('about'),
    address: pick('address') || { city: u.city },
    hours: pick('hours'),
    brands: pick('brands') || [],
    languages: pick('languages') || (u.language ? [u.language] : []),
    services: pick('services') || [],
    website: pick('website'),
  };
}

/** Dealers shown to the public: every registered dealer except suspended accounts. */
export const isListedDealer = (u) => u?.role === 'dealer' && u.status !== 'suspended';

/** Documents status shown on a dealer: verified, pending (submitted / under review) or not verified. */
export function dealerTrust(u) {
  if (u.docStatus === 'verified') return { key: 'verified', label: 'Verified dealer', tone: 'green' };
  if (u.docStatus === 'pending') return { key: 'pending', label: 'Documents in review', tone: 'amber' };
  return { key: 'unverified', label: 'Not yet verified', tone: 'neutral' };
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toMin = (t = '') => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};
export const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

/** Open-now status from { days, open, close } using the visitor's clock. */
export function openStatus(hours, now = new Date()) {
  if (!hours?.open || !hours?.close || !hours?.days?.length) return null;
  const today = DAY[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = hours.days.includes(today) && mins >= toMin(hours.open) && mins < toMin(hours.close);
  return { open, label: open ? `Open now · closes ${fmtTime(hours.close)}` : `Closed now · opens ${fmtTime(hours.open)}` };
}

/** Short day range, e.g. "Mon – Sat" or "Every day". */
export function dayRange(days = []) {
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const sorted = order.filter((d) => days.includes(d));
  if (sorted.length === 7) return 'Every day';
  const idx = sorted.map((d) => order.indexOf(d));
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  return contiguous && sorted.length > 2 ? `${sorted[0]} – ${sorted[sorted.length - 1]}` : sorted.join(', ');
}

/** Every listed dealer with live-stock stats, used by the directory. */
export function useDealers() {
  const { state } = useStore();
  return useMemo(() => {
    const live = state.vehicles.filter(isPublic);
    return state.users.filter(isListedDealer).map((u) => {
      const p = dealerProfile(u);
      const cars = live.filter((v) => v.sellerId === u.id).sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
      const prices = cars.map((c) => c.price);
      const count = (key) => Object.entries(cars.reduce((m, c) => ({ ...m, [c[key]]: (m[c[key]] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).map(([k]) => k);
      return {
        ...p,
        trust: dealerTrust(u),
        cars,
        stockMakes: count('make'),
        stockBodies: count('bodyType'),
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        certified: cars.filter((c) => c.condition === 'Certified pre-owned').length,
      };
    });
  }, [state.users, state.vehicles]);
}

/** Search text a dealer matches on: business, owner, city, area, brands, body types. */
export const dealerHaystack = (d) =>
  [d.business, d.name, d.city, d.address?.line1, d.address?.line2, d.address?.landmark, d.businessType, ...(d.brands || []), ...d.stockMakes, ...d.stockBodies].filter(Boolean).join(' ').toLowerCase();

export const DEALER_SORTS = [
  { value: 'stock', label: 'Most cars for sale' },
  { value: 'az', label: 'Name: A to Z' },
  { value: 'established', label: 'Longest in business' },
  { value: 'joined', label: 'Newest on AutoDealer' },
];

export function sortDealers(list, sort) {
  const l = [...list];
  if (sort === 'az') return l.sort((a, b) => (a.business || a.name).localeCompare(b.business || b.name));
  if (sort === 'established') return l.sort((a, b) => (a.yearEstablished || 9999) - (b.yearEstablished || 9999));
  if (sort === 'joined') return l.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  return l.sort((a, b) => b.cars.length - a.cars.length || (a.trust.key === 'verified' ? -1 : 1));
}
