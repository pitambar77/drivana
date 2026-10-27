import { useParams } from 'react-router-dom';
import { useStore } from '../../store/AppStore';
import { Button, EmptyState, PageHeader } from '../../components/ui';
import VehicleFormWizard from '../../components/vehicle/VehicleFormWizard';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';

export default function DealerVehicleForm() {
  const { id } = useParams();
  const { me, vehicle } = useStore();
  const v = id ? vehicle(id) : null;
  if (id && (!v || v.sellerId !== me.id)) {
    return <EmptyState title="Listing not found" message="It may have been deleted." action={<Button to="/dealer/listings">Back to listings</Button>} />;
  }
  return (
    <div>
      <PageHeader eyebrow={v ? `Editing ${v.id.toUpperCase()}` : 'New listing'} title={v ? vehicleTitle(v) : 'Add a vehicle'} description={v ? 'Changes to a live listing apply immediately.' : 'Six quick steps. Save as a draft at any point from the last step.'} />
      <VehicleFormWizard key={id || 'new'} mode="dealer" listingId={id} onCancelTo="/dealer/listings" />
    </div>
  );
}
