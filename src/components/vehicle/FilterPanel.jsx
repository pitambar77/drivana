import { RotateCcw } from 'lucide-react';
import { Select, Checkbox } from '../ui';
import { BODY_TYPES, CITIES, CONDITIONS, FUELS, MAKES, TRANSMISSIONS, modelsFor } from '../../data/catalog';
import { PRICE_STEPS } from '../../utils/filters';
import { lakh, num } from '../../utils/format';

const YEARS = Array.from({ length: 11 }, (_, i) => 2026 - i);
const KMS = [10000, 25000, 50000, 75000, 100000, 150000];

function Group({ title, children }) {
  return (
    <fieldset className="space-y-2.5 border-b border-mist-100 pb-5 last:border-0">
      <legend className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-mist-500">{title}</legend>
      {children}
    </fieldset>
  );
}

export function FilterPanel({ filters, onChange, onReset }) {
  const set = (k) => (e) => onChange({ [k]: e.target.value, ...(k === 'make' ? { model: '' } : {}) });
  const fuels = filters.fuel ? filters.fuel.split(',') : [];
  const toggleFuel = (f) => {
    const next = fuels.includes(f) ? fuels.filter((x) => x !== f) : [...fuels, f];
    onChange({ fuel: next.join(',') });
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Filters</h2>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent-700 hover:underline">
          <RotateCcw className="h-3.5 w-3.5" /> Reset all
        </button>
      </div>
      <Group title="Brand & model">
        <Select aria-label="Brand" value={filters.make || ''} onChange={set('make')} placeholder="Any brand" options={MAKES} />
        <Select aria-label="Model" value={filters.model || ''} onChange={set('model')} placeholder={filters.make ? 'Any model' : 'Choose a brand first'} options={filters.make ? modelsFor(filters.make) : []} disabled={!filters.make} />
      </Group>
      <Group title="Budget">
        <div className="grid grid-cols-2 gap-2">
          <Select aria-label="Minimum price" value={filters.minPrice || ''} onChange={set('minPrice')} placeholder="Min" options={PRICE_STEPS.map((p) => ({ value: String(p), label: lakh(p) }))} />
          <Select aria-label="Maximum price" value={filters.maxPrice || ''} onChange={set('maxPrice')} placeholder="Max" options={PRICE_STEPS.map((p) => ({ value: String(p), label: lakh(p) }))} />
        </div>
      </Group>
      <Group title="Model year">
        <div className="grid grid-cols-2 gap-2">
          <Select aria-label="From year" value={filters.minYear || ''} onChange={set('minYear')} placeholder="From" options={YEARS.map(String)} />
          <Select aria-label="To year" value={filters.maxYear || ''} onChange={set('maxYear')} placeholder="To" options={YEARS.map(String)} />
        </div>
      </Group>
      <Group title="Kilometres driven">
        <Select aria-label="Maximum kilometres" value={filters.maxKm || ''} onChange={set('maxKm')} placeholder="Any" options={KMS.map((k) => ({ value: String(k), label: `Under ${num(k)} km` }))} />
      </Group>
      <Group title="Fuel type">
        <div className="grid grid-cols-2 gap-2">
          {FUELS.map((f) => (
            <Checkbox key={f} label={f} checked={fuels.includes(f)} onChange={() => toggleFuel(f)} />
          ))}
        </div>
      </Group>
      <Group title="Transmission">
        <div className="grid grid-cols-3 gap-1.5">
          {['', ...TRANSMISSIONS].map((t) => (
            <button
              key={t || 'any'}
              type="button"
              onClick={() => onChange({ transmission: t })}
              className={`rounded-lg border px-2 py-1.5 text-[13px] font-semibold ${(filters.transmission || '') === t ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-mist-200 text-mist-700 hover:border-mist-300'}`}
            >
              {t || 'Any'}
            </button>
          ))}
        </div>
      </Group>
      <Group title="Body type">
        <Select aria-label="Body type" value={filters.body || ''} onChange={set('body')} placeholder="Any body type" options={BODY_TYPES} />
      </Group>
      <Group title="Location">
        <Select aria-label="City" value={filters.city || ''} onChange={set('city')} placeholder="All cities" options={CITIES.map((c) => c.name)} />
      </Group>
      <Group title="Condition">
        <Select aria-label="Condition" value={filters.condition || ''} onChange={set('condition')} placeholder="Any condition" options={CONDITIONS} />
      </Group>
    </div>
  );
}
