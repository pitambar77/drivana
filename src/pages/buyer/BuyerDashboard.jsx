import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calculator, FileSearch, GitCompareArrows, Heart, History, MessageSquareText, Search, Sparkles, Trash2 } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Badge, Button, EmptyState, IconButton, PageHeader, Section, useToast } from '../../components/ui';
import { VehicleCard, vehicleTitle } from '../../components/vehicle/VehicleCard';
import { ago, lakh } from '../../utils/format';

export default function BuyerDashboard() {
  const { state, me, vehicle, removeSavedSearch } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const recent = state.recent.map(vehicle).filter((v) => v && isPublic(v)).slice(0, 4);
  const [min, max] = (state.buyerPrefs.budget || '0-99999999').split('-').map(Number);
  const recommended = useMemo(
    () =>
      state.vehicles
        .filter((v) => isPublic(v) && v.price >= min && v.price <= max && (!state.buyerPrefs.bodies.length || state.buyerPrefs.bodies.includes(v.bodyType)) && !state.recent.includes(v.id))
        .sort((a, b) => (b.city === state.buyerPrefs.city) - (a.city === state.buyerPrefs.city) || (b.verification === 'verified') - (a.verification === 'verified'))
        .slice(0, 4),
    [state.vehicles, state.buyerPrefs, state.recent, min, max],
  );
  const myEnq = state.enquiries.filter((e) => e.buyerId === me.id).slice(0, 5);
  const shortcuts = [
    [Search, 'Browse cars', '/cars', `${state.vehicles.filter(isPublic).length} live`],
    [Heart, 'Saved cars', '/buyer/saved', `${state.saved.length} saved`],
    [GitCompareArrows, 'Compare', '/compare', `${state.compare.length}/3 selected`],
    [Calculator, 'EMI calculator', '/loan-calculator', 'Plan your budget'],
    [FileSearch, 'Verify a vehicle', '/verify-vehicle', 'Check the RC'],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back${me.name && me.name !== 'New buyer' ? `, ${me.name.split(' ')[0]}` : ''}`} description="Pick up where you left off." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {shortcuts.map(([Icon, l, to, sub]) => (
          <Link key={l} to={to} className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-lift">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-ink-900">{l}</span>
              <span className="block truncate text-[12px] text-mist-500">{sub}</span>
            </span>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <History className="h-5 w-5 text-mist-500" />
          <h2 className="text-lg font-bold">Recently viewed</h2>
        </div>
        {recent.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recent.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing viewed yet" message="Cars you open appear here." action={<Button to="/cars">Browse cars</Button>} />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Saved searches" description="Run them again to see new listings." bodyClass="p-0">
          {state.savedSearches.length ? (
            <ul className="divide-y divide-mist-100">
              {state.savedSearches.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Search className="h-4 w-4 shrink-0 text-mist-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.label}</p>
                    <p className="text-[12px] text-mist-500">Saved {ago(s.createdAt)}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => nav(`/cars?${new URLSearchParams(s.query).toString()}`)}>
                    Run
                  </Button>
                  <IconButton
                    icon={Trash2}
                    label="Delete saved search"
                    onClick={() => {
                      removeSavedSearch(s.id);
                      toast('Saved search deleted.', { tone: 'info' });
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState title="No saved searches" message="Use 'Save search' on the browse page." />
            </div>
          )}
        </Section>
        <Section title="Your enquiries" bodyClass="p-0">
          {myEnq.length ? (
            <ul className="divide-y divide-mist-100">
              {myEnq.map((e) => {
                const v = vehicle(e.vehicleId);
                return (
                  <li key={e.id}>
                    <Link to={`/cars/${e.vehicleId}`} className="flex items-center gap-3 px-5 py-3 hover:bg-mist-50">
                      <MessageSquareText className="h-4 w-4 shrink-0 text-mist-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{v ? vehicleTitle(v) : e.vehicleId}</p>
                        <p className="truncate text-[12.5px] text-mist-500">
                          {v ? lakh(v.price) : ''} · sent {ago(e.createdAt)}
                        </p>
                      </div>
                      <Badge tone={e.status === 'new' ? 'neutral' : 'blue'} dot>{e.status === 'new' ? 'Sent' : 'Seller replied'}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState title="No enquiries yet" message="Enquiries you send to sellers appear here." />
            </div>
          )}
        </Section>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-600" />
          <h2 className="text-lg font-bold">Recommended for you</h2>
          <Link to="/buyer/welcome" className="ml-auto text-sm font-semibold text-accent-700 hover:underline">
            Edit preferences
          </Link>
        </div>
        {recommended.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recommended.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        ) : (
          <EmptyState title="No matches for your preferences" message="Widen your budget or body types." />
        )}
      </section>
    </div>
  );
}
