import { lakh, num } from './format';

export const FILTER_KEYS = ['q', 'make', 'model', 'minPrice', 'maxPrice', 'minYear', 'maxYear', 'maxKm', 'fuel', 'transmission', 'city', 'condition', 'body'];

export function applyFilters(list, f) {
  const q = (f.q || '').trim().toLowerCase();
  const fuels = f.fuel ? f.fuel.split(',') : [];
  return list.filter((v) => {
    if (q && !`${v.year} ${v.make} ${v.model} ${v.variant} ${v.city} ${v.bodyType}`.toLowerCase().includes(q)) return false;
    if (f.make && v.make !== f.make) return false;
    if (f.model && v.model !== f.model) return false;
    if (f.minPrice && v.price < Number(f.minPrice)) return false;
    if (f.maxPrice && v.price > Number(f.maxPrice)) return false;
    if (f.minYear && v.year < Number(f.minYear)) return false;
    if (f.maxYear && v.year > Number(f.maxYear)) return false;
    if (f.maxKm && v.mileage > Number(f.maxKm)) return false;
    if (fuels.length && !fuels.includes(v.fuel)) return false;
    if (f.transmission && v.transmission !== f.transmission) return false;
    if (f.city && v.city !== f.city) return false;
    if (f.condition && v.condition !== f.condition) return false;
    if (f.body && v.bodyType !== f.body) return false;
    return true;
  });
}

export function sortVehicles(list, sort, q = '') {
  const arr = [...list];
  switch (sort) {
    case 'newest':
      return arr.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
    case 'price_asc':
      return arr.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return arr.sort((a, b) => b.price - a.price);
    case 'km_asc':
      return arr.sort((a, b) => a.mileage - b.mileage);
    case 'year_desc':
      return arr.sort((a, b) => b.year - a.year);
    default: {
      // relevance: featured & verified first, then text match quality, then freshness
      const t = q.toLowerCase();
      const score = (v) =>
        (v.featured ? 4 : 0) +
        (v.verification === 'verified' ? 2 : 0) +
        (t && `${v.make} ${v.model}`.toLowerCase().startsWith(t) ? 3 : 0) -
        (Date.now() - new Date(v.publishedAt || v.createdAt)) / (864e5 * 30);
      return arr.sort((a, b) => score(b) - score(a));
    }
  }
}

export const SORTS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'newest', label: 'Newest listed' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'km_asc', label: 'Kilometres: lowest' },
  { value: 'year_desc', label: 'Model year: newest' },
];

export function chipLabel(key, value) {
  switch (key) {
    case 'q':
      return `"${value}"`;
    case 'minPrice':
      return `From ${lakh(value)}`;
    case 'maxPrice':
      return `Up to ${lakh(value)}`;
    case 'minYear':
      return `${value} or newer`;
    case 'maxYear':
      return `${value} or older`;
    case 'maxKm':
      return `Under ${num(value)} km`;
    case 'fuel':
      return value.split(',').join(' / ');
    default:
      return value;
  }
}

export const PRICE_STEPS = [200000, 300000, 500000, 700000, 1000000, 1500000, 2000000, 3000000, 5000000, 8000000];
