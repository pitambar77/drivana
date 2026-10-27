import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/AppStore';
import { PageHeader, Tabs } from '../../components/ui';
import { ListingsManager } from '../../components/listings/ListingsManager';
import { EnquiryInbox } from '../../components/listings/EnquiryInbox';

export default function AgentListings() {
  const { state, me } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'listings';
  const listings = state.vehicles.filter((v) => v.sellerId === me.id).length;
  const enq = state.enquiries.filter((e) => e.sellerId === me.id).length;
  return (
    <div>
      <PageHeader title="Listings & enquiries" description="Manage the cars you list for owners and follow up with interested buyers." />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={(t) => setParams(t === 'listings' ? {} : { tab: t }, { replace: true })}
        tabs={[
          { value: 'listings', label: 'Listings', count: listings },
          { value: 'enquiries', label: 'Enquiries', count: enq },
        ]}
      />
      {tab === 'listings' ? <ListingsManager base="/agent" showOwner /> : <EnquiryInbox />}
    </div>
  );
}
