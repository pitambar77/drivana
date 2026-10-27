import { useState } from 'react';
import { Ban, CheckCheck, Pencil } from 'lucide-react';
import { useStore, ACTIVE_STATUSES } from '../../store/AppStore';
import { Alert, Button, ConfirmDialog, PageHeader, Plate, StatusBadge, useToast } from '../../components/ui';
import VehicleFormWizard from '../../components/vehicle/VehicleFormWizard';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { CarImage } from '../../components/vehicle/CarArt';

export default function SellerVehicleForm() {
  const { state, me, setListingStatus } = useStore();
  const toast = useToast();
  const active = state.vehicles.find((v) => v.sellerId === me.id && ACTIVE_STATUSES.includes(v.status));
  const [mode, setMode] = useState(active ? 'edit' : 'new');
  const [sold, setSold] = useState(false);
  const blockedNew = mode === 'new' && active;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Private seller · one active listing"
        title={mode === 'edit' && active ? 'Edit your vehicle' : 'List your car'}
        description={mode === 'edit' && active ? 'Changes to a live listing appear right away. Changing the registration number or VIN re-runs the duplicate check.' : 'Fill in your car\'s details. You pay the listing fee at the end.'}
        actions={
          active && mode === 'edit' ? (
            <Button variant="secondary" onClick={() => setMode('new')}>
              List a different car
            </Button>
          ) : null
        }
      />

      {blockedNew ? (
        <div className="card p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warn-50 text-warn-600">
              <Ban className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold">You already have an active listing</h2>
              <p className="mt-1 text-sm text-mist-600">
                Private seller accounts can have one active vehicle at a time. To list another car, mark your current one as sold or delete it first. Dealers can list multiple vehicles.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-mist-200 p-3">
            <CarImage vehicle={active} view="side" className="h-14 w-24 rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{vehicleTitle(active)}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Plate value={active.regNumber} size="sm" />
                <StatusBadge status={active.status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={Pencil} onClick={() => setMode('edit')}>
                Edit this listing
              </Button>
              {active.status === 'live' && (
                <Button icon={CheckCheck} onClick={() => setSold(true)}>
                  Mark as sold
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {active && mode === 'edit' && (
            <Alert tone="info" title={`Editing ${active.id.toUpperCase()} · ${vehicleTitle(active)}`}>
              This is your one active listing.
            </Alert>
          )}
          <VehicleFormWizard key={mode + (active?.id || '')} mode="seller" listingId={mode === 'edit' ? active?.id : undefined} onCancelTo="/seller" />
        </>
      )}
      <ConfirmDialog
        open={sold}
        onClose={() => setSold(false)}
        title="Mark your car as sold?"
        message="Your current listing leaves search results and you can list a different car."
        confirmLabel="Mark as sold"
        onConfirm={() => {
          setListingStatus(active.id, 'sold');
          setMode('new');
          toast('Marked as sold. You can now list another car.');
        }}
      />
    </div>
  );
}
