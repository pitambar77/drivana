import { PageHeader } from '../../components/ui';
import { EnquiryInbox } from '../../components/listings/EnquiryInbox';

export default function DealerEnquiries() {
  return (
    <div>
      <PageHeader title="Enquiries" description="Calls, chats and form enquiries from buyers. Update the status as you follow up." />
      <EnquiryInbox />
    </div>
  );
}
