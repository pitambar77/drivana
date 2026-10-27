import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookmarkPlus, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Breadcrumbs, Button, CardSkeleton, EmptyState, Modal, SearchInput, Select, useToast } from '../../components/ui';
import { FilterPanel } from '../../components/vehicle/FilterPanel';
import { VehicleCard } from '../../components/vehicle/VehicleCard';
import { FILTER_KEYS, SORTS, applyFilters, chipLabel, sortVehicles } from '../../utils/filters';
import { cn } from '../../utils/format';

const PAGE = 12;

export default function Browse() {
  const { state, role, addSavedSearch } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shown, setShown] = useState(PAGE);
  const [layout, setLayout] = useState('grid');
  const [q, setQ] = useState(params.get('q') || '');

  const filters = useMemo(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ''])), [params]);
  const sort = params.get('sort') || 'relevance';

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };
  const reset = () => {
    setQ('');
    setParams(sort !== 'relevance' ? { sort } : {}, { replace: true });
  };

  // Debounce the free-text search into the URL.
  useEffect(() => {
    const t = setTimeout(() => q !== filters.q && update({ q }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Simulated network latency so loading skeletons are visible.
  useEffect(() => {
    setLoading(true);
    setShown(PAGE);
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, [params]);

  const results = useMemo(() => sortVehicles(applyFilters(state.vehicles.filter(isPublic), filters), sort, filters.q), [state.vehicles, filters, sort]);
  const chips = FILTER_KEYS.filter((k) => filters[k]);
  const title = filters.body ? `${filters.body}s` : filters.make ? `${filters.make} cars` : 'Cars for sale';

  const saveSearch = () => {
    if (role !== 'buyer') {
      toast('Sign in as a buyer to save searches.', { tone: 'info' });
      return;
    }
    const label = chips.map((k) => chipLabel(k, filters[k])).join(', ') || 'All cars';
    addSavedSearch(label, Object.fromEntries(chips.map((k) => [k, filters[k]])));
    toast('Search saved to your dashboard.');
  };

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: 'Buy a car', to: '/cars' }, ...(filters.make ? [{ label: filters.make }] : [])]} className="mb-3" />
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[26px] font-bold md:text-[30px]">{title}</h1>
          <p className="mt-1 text-sm text-mist-600 num" aria-live="polite">
            {loading ? 'Searching…' : `${results.length} car${results.length === 1 ? '' : 's'} found${filters.city ? ` in ${filters.city}` : ' across India'}`}
          </p>
        </div>
        <SearchInput value={q} onChange={setQ} placeholder="Search make, model or city" className="w-full md:w-80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">
            <FilterPanel filters={filters} onChange={update} onReset={reset} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button variant="secondary" icon={SlidersHorizontal} onClick={() => setDrawer(true)} className="lg:hidden">
              Filters{chips.length ? ` (${chips.length})` : ''}
            </Button>
            <Select aria-label="Sort results" value={sort} onChange={(e) => update({ sort: e.target.value === 'relevance' ? '' : e.target.value })} options={SORTS} className="w-[190px]" />
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="md" icon={BookmarkPlus} onClick={saveSearch} className="hidden sm:inline-flex">
                Save search
              </Button>
              <div className="hidden rounded-lg bg-mist-100 p-0.5 md:flex">
                {[
                  ['grid', LayoutGrid],
                  ['row', List],
                ].map(([l, Icon]) => (
                  <button key={l} type="button" onClick={() => setLayout(l)} aria-label={`${l} view`} aria-pressed={layout === l} className={cn('rounded-md p-1.5', layout === l ? 'bg-white text-ink-900 shadow-card' : 'text-mist-500')}>
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {chips.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'q') setQ('');
                    update({ [k]: '', ...(k === 'make' ? { model: '' } : {}) });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 py-1 pl-3 pr-2 text-[13px] font-semibold text-accent-800 hover:bg-accent-100"
                >
                  {chipLabel(k, filters[k])}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <button type="button" onClick={reset} className="text-[13px] font-semibold text-mist-600 hover:text-ink-900">
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No cars match these filters"
              message="Try a wider budget, another city, or remove a filter. New cars are listed every day."
              action={
                <>
                  <Button variant="secondary" onClick={reset}>
                    Clear all filters
                  </Button>
                  <Button onClick={saveSearch} icon={BookmarkPlus}>
                    Save this search
                  </Button>
                </>
              }
            />
          ) : (
            <>
              <div className={cn('grid gap-4', layout === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {results.slice(0, shown).map((v) => (
                  <VehicleCard key={v.id} vehicle={v} layout={layout} />
                ))}
              </div>
              <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-[13px] text-mist-500 num">
                  Showing {Math.min(shown, results.length)} of {results.length}
                </p>
                {shown < results.length && (
                  <Button variant="secondary" onClick={() => setShown((s) => s + PAGE)}>
                    Load {Math.min(PAGE, results.length - shown)} more
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={drawer}
        onClose={() => setDrawer(false)}
        side
        title="Filter cars"
        footer={
          <Button onClick={() => setDrawer(false)} className="w-full">
            Show {results.length} cars
          </Button>
        }
      >
        <FilterPanel filters={filters} onChange={update} onReset={reset} />
      </Modal>
    </div>
  );
}
