import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { BookmarkPlus, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Breadcrumbs, Button, CardSkeleton, EmptyState, Modal, SearchInput, Select, useToast } from '../../components/ui';
import { FilterPanel } from '../../components/vehicle/FilterPanel';
import { VehicleCard } from '../../components/vehicle/VehicleCard';
import { FILTER_KEYS, SORTS, applyFilters, chipLabel, sortVehicles } from '../../utils/filters';
import { cn } from '../../utils/format';
import { TYPE_KEYS, VEHICLE_TYPES, bodyTitle, categoryFromPath, categoryOf } from '../../data/vehicleTypes';

const PAGE = 12;

// const resultsCar = {
//   v1031: ["https://commons.wikimedia.org/wiki/Special:FilePath/Maruti_Suzuki_Brezza_-_front.jpg"],
//   v1005: ["https://commons.wikimedia.org/wiki/Special:FilePath/Maruti_Suzuki_Brezza_-_front.jpg"],

//   v1029: ["https://commons.wikimedia.org/wiki/Special:FilePath/Honda_Amaze_(front).png"],
//   v1003: ["https://commons.wikimedia.org/wiki/Special:FilePath/Honda_Amaze_(front).png"],

//   v1026: ["https://commons.wikimedia.org/wiki/Special:FilePath/Kia_Sonnet.jpg"],

//   v1001: ["https://commons.wikimedia.org/wiki/Special:FilePath/2022_Maruti_Suzuki_Baleno_Alpha_(India)_front_view.jpg"],

//   v1020: ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80"],

//   v1006: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80"],
//   v1032: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80"],

//   v1033: ["https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80"],
//   v1007: ["https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80"],

//   v1040: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80"],
//   v1014: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80"],

//   v1030: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80"],
//   v1004: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80"],

//   v1008: ["https://commons.wikimedia.org/wiki/Special:FilePath/2022_Volkswagen_Virtus_1.5_GT_(India)_front_view_01.png"],
//   v1034: ["https://commons.wikimedia.org/wiki/Special:FilePath/2022_Volkswagen_Virtus_1.5_GT_(India)_front_view_01.png"],

//   v1002: ["https://commons.wikimedia.org/wiki/Special:FilePath/2023_Tata_Nexon_XZA%2B_front_view.jpg"],
//   v1028: ["https://commons.wikimedia.org/wiki/Special:FilePath/2023_Tata_Nexon_XZA%2B_front_view.jpg"],

//   v1023: ["https://commons.wikimedia.org/wiki/Special:FilePath/2023_BMW_3-Series_Gran_Sedan_320Li_M_Sport.jpg"],

//   v1038: ["https://commons.wikimedia.org/wiki/Category:Mercedes-Benz_C-Class"],
//   v1012: ["https://commons.wikimedia.org/wiki/Category:Mercedes-Benz_C-Class"],

//   v1017: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"],

//   v1035: ["https://commons.wikimedia.org/wiki/Category:Hyundai_i20"],
//   v1100: ["https://commons.wikimedia.org/wiki/Category:Hyundai_i20"],

//   v1011: ["https://commons.wikimedia.org/wiki/Category:Kia_Seltos"],
//   v1037: ["https://commons.wikimedia.org/wiki/Category:Kia_Seltos"],

//   v1013: ["https://commons.wikimedia.org/wiki/Category:Hyundai_Verna"],
//   v1039: ["https://commons.wikimedia.org/wiki/Category:Hyundai_Verna"],

//   v1022: ["https://commons.wikimedia.org/wiki/Category:Suzuki_Baleno"],

//   v1019: ["https://commons.wikimedia.org/wiki/Category:Škoda_Slavia"],

//   v1025: ["https://commons.wikimedia.org/wiki/Category:Mahindra_Thar"],
//   v1010: ["https://commons.wikimedia.org/wiki/Category:Mahindra_Scorpio-N"],

//   v1015: ["https://commons.wikimedia.org/wiki/Category:MG_Hector"],
// };

const resultsCar = {
  // Maruti Suzuki
  v1031: ["/m-brezza-2.jpeg"],
  v1005: ["/m-brezza.avif"],
  v1001: ["/m-swift.webp"],
  v1020: ["/m-ertiga.jpg"],
  v1016: ["/m-baleno.avif"],

  // Honda
  v1029: ["/hoda-ameze.avif"],
  v1003: ["/hoda-ameze-2.jpg"],
  v1040: ["/honda-city-3.avif"],
  v1014: ["/honda-city-2.webp"],

  // Kia
  v1026: ["/kia-sonet.avif"],
  v1011: ["/kia-seltos.avif"],
  v1037: ["/kia-seltos-2.avif"],

  // Tata
  v1006: ["/Tata-Harrier.webp"],
  v1032: ["/Tata-Harrier-2.avif"],
  v1002: ["/tata-nexon.jpg"],
  v1028: ["/tata-nexon.jpg"],
  v1017: ["/tata-punch.jpg"],

  // Toyota
  v1033: ["/toyota-fortuner.webp"],
  v1007: ["/toyota-fortuner-3.webp"],
  v1022: ["/toyota-glanza.webp"],

  // MG
  v1030: ["/mg-ev-zs.avif"],
  v1004: ["/mg-ev-2.jpg"],
  v1015: ["/mg-ev.jpg"],

  // Volkswagen
  v1008: ["/volswagen-2.jpeg"],
  v1034: ["/volswagen-3.webp"],

  // BMW
  v1023: ["/BMW-3-gran.jpg"],

  // Mercedes-Benz
  v1038: ["/mercedes-c.avif"],
  v1012: ["/mercedes-c-2.jpg"],

  // Hyundai
  v1035: ["/i-20-2.jpeg"],
  v1100: ["/i-20.avif"],
  v1013: ["/verna-1.avif"],
  v1039: ["/verna-2.jpg"],

  // Skoda
  v1019: ["/skoda-salvia.png"],

  // Mahindra
  v1025: ["/thar.webp"],
  v1010: ["/scropio-n.jpg"],
};

export default function Browse() {
  const { state, role, addSavedSearch } = useStore();
  const { pathname } = useLocation();
  const category = categoryFromPath(pathname);
  const T = VEHICLE_TYPES[category];
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

  const results = useMemo(() => sortVehicles(applyFilters(state.vehicles.filter((v) => isPublic(v) && categoryOf(v) === category), filters), sort, filters.q), [state.vehicles, filters, sort, category]);
  const typeCounts = useMemo(() => Object.fromEntries(TYPE_KEYS.map((k) => [k, state.vehicles.filter((v) => isPublic(v) && categoryOf(v) === k).length])), [state.vehicles]);



  const chips = FILTER_KEYS.filter((k) => filters[k]);
  const title = filters.body ? bodyTitle(filters.body) : filters.make ? `${filters.make} ${T.nounPlural}` : `${T.plural} for sale`;

  const saveSearch = () => {
    if (role !== 'buyer') {
      toast('Sign in as a buyer to save searches.', { tone: 'info' });
      return;
    }
    const label = `${T.plural}: ${chips.map((k) => chipLabel(k, filters[k])).join(', ') || 'all'}`;
    addSavedSearch(label, { ...Object.fromEntries(chips.map((k) => [k, filters[k]])), ...(category !== 'car' ? { type: category } : {}) });
    toast('Search saved to your dashboard.');
  };

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: `Buy ${T.plural.toLowerCase()}`, to: T.path }, ...(filters.make ? [{ label: filters.make }] : [])]} className="mb-3" />
      <nav aria-label="Vehicle type" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TYPE_KEYS.map((k) => {
          const Ty = VEHICLE_TYPES[k];
          const on = k === category;
          return (
            <Link
              key={k}
              to={Ty.path}
              aria-current={on ? 'page' : undefined}
              className={cn('inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors', on ? 'border-ink-900 bg-ink-900 text-white' : 'border-mist-200 bg-white text-ink-800 hover:border-mist-300')}
            >
              <Ty.icon className="h-4 w-4" /> {Ty.plural}
              <span className={cn('text-[12px]', on ? 'text-ink-300' : 'text-mist-400')}>{typeCounts[k]}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[26px] font-bold md:text-[30px]">{title}</h1>
          <p className="mt-1 text-sm text-mist-600 num" aria-live="polite">
            {loading ? 'Searching…' : `${results.length} ${results.length === 1 ? T.noun : T.nounPlural} found${filters.city ? ` in ${filters.city}` : ' across India'}`}
          </p>
        </div>
        <SearchInput value={q} onChange={setQ} placeholder="Search make, model or city" className="w-full md:w-80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">
            <FilterPanel filters={filters} onChange={update} onReset={reset} category={category} />
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
              title={`No ${T.nounPlural} match these filters`}
              message={`Try a wider budget, another city, or remove a filter. New ${T.nounPlural} are listed every day.`}
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
                  // <VehicleCard key={v.id} vehicle={v} layout={layout} />
                  <VehicleCard
                                    key={v.id}
                                    layout={layout}
                                    vehicle={{
                                      ...v,
                                      photos: resultsCar[v.id] || v.photos,
                                    }}
                                  />
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
        title={`Filter ${T.nounPlural}`}
        footer={
          <Button onClick={() => setDrawer(false)} className="w-full">
            Show {results.length} {results.length === 1 ? T.noun : T.nounPlural}
          </Button>
        }
      >
        <FilterPanel filters={filters} onChange={update} onReset={reset} category={category} />
      </Modal>
    </div>
  );
}
