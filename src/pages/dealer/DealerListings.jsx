import { useStore } from '../../store/AppStore';
import { PageHeader } from '../../components/ui';
import { ListingsManager } from '../../components/listings/ListingsManager';

export default function DealerListings() {
  const { state, me } = useStore();
  const mine = state.vehicles.filter((v) => v.sellerId === me.id);
  return (
    <div>
      <PageHeader title="Listings" description={`${mine.length} vehicles · ${mine.filter((v) => v.status === 'live').length} live. Listing status and document verification are tracked separately.`} />
      <ListingsManager base="/dealer" />
    </div>
  );
}
