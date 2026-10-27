import { useParams } from 'react-router-dom';
import { useStore } from '../../store/AppStore';
import { Button, EmptyState, PageHeader } from '../../components/ui';
import VehicleFormWizard from '../../components/vehicle/VehicleFormWizard';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';

export default function AgentVehicleForm() {
  const { id } = useParams();
  const { me, vehicle } = useStore();
  const v = id ? vehicle(id) : null;
  if (id && (!v || v.sellerId !== me.id)) {
    return <EmptyState title="Listing not found" action={<Button to="/agent/listings">Back to listings</Button>} />;
  }
  return (
    <div>
      <PageHeader eyebrow={v ? `Editing ${v.id.toUpperCase()}` : "List an owner's vehicle"} title={v ? vehicleTitle(v) : 'Add a vehicle for an owner'} description="Includes the registered owner's details and any modifications. Buyers contact you, not the owner." />
      <VehicleFormWizard key={id || 'new'} mode="agent" listingId={id} onCancelTo="/agent/listings" />
    </div>
  );
}
