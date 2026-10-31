import { Heart } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Button, EmptyState, PageHeader, StatusBadge, useToast } from '../../components/ui';
import { VehicleCard } from '../../components/vehicle/VehicleCard';
import { vehiclePath, compareMessage } from '../../data/vehicleTypes';

export default function SavedVehicles() {
  const { state, vehicle, toggleSaved, toggleCompare } = useStore();
  const toast = useToast();
  const saved = state.saved.map(vehicle).filter(Boolean);
  const unavailable = saved.filter((v) => v.status !== 'live');

  return (
    <div>
      <PageHeader
        title="Saved cars"
        description={`${saved.length} car${saved.length === 1 ? '' : 's'} on your shortlist. Prices and availability update automatically.`}
        actions={saved.length > 1 && <Button variant="secondary" to="/compare">Compare ({state.compare.length})</Button>}
      />
      {saved.length === 0 ? (
        <EmptyState icon={Heart} title="Your shortlist is empty" message="Tap the heart on any car, motorcycle or lorry to save it here." action={<Button to="/cars">Browse cars</Button>} />
      ) : (
        <>
          {unavailable.length > 0 && <p className="mb-4 text-sm text-mist-600">{unavailable.length} saved car{unavailable.length > 1 ? 's are' : ' is'} no longer available.</p>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {saved.map((v) =>
              v.status === 'live' ? (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onRemove={() => {
                    toggleSaved(v.id);
                    toast('Removed from saved cars.', { tone: 'info' });
                  }}
                  actions={
                    <>
                      <Button size="sm" to={`${vehiclePath(v)}`}>
                        View details
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const m = compareMessage(toggleCompare(v.id), v);
                          toast(m.text, { tone: m.tone });
                        }}
                      >
                        {state.compare.includes(v.id) ? 'In compare' : 'Compare'}
                      </Button>
                    </>
                  }
                />
              ) : (
                <div key={v.id} className="card flex flex-col items-start gap-3 p-5 opacity-80">
                  <StatusBadge status={v.status} />
                  <p className="font-semibold">
                    {v.year} {v.make} {v.model}
                  </p>
                  <p className="text-sm text-mist-600">This car is no longer listed.</p>
                  <Button size="sm" variant="ghost" className="text-bad-600" onClick={() => toggleSaved(v.id)}>
                    Remove
                  </Button>
                </div>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
