import { useState } from 'react';
import { FileText, Info } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Badge, Button, CopyText, Modal, PageHeader, StatusBadge } from '../../components/ui';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { ReviewTimeline } from '../dealer/DealerDocuments';

const TEMPLATE = `OWNER AUTHORISATION LETTER

I, [Owner's full name as on RC], registered owner of vehicle number [Registration number],
VIN/chassis [17-character VIN], authorise [Agent's full name] of [Agency name]
to advertise this vehicle for sale on AutoDealer, show it to prospective buyers,
and coordinate the handover of the vehicle and its documents.

This authorisation does not transfer ownership. Ownership transfer will be completed
through the Regional Transport Office (RTO) by the owner and the buyer.

Valid until: [Date]

Owner's signature: ____________________     Date: __________
Agent's signature: ____________________     Date: __________

Attach: self-attested copy of the owner's ID and the RC.`;

export default function AgentDocuments() {
  const { state, me } = useStore();
  const [tpl, setTpl] = useState(false);
  const required = state.config.agentAuthorizationRequired;
  return (
    <div className="space-y-6">
      <PageHeader title="ID & owner authorisation" description="Prove who you are and that the owner has asked you to sell their car." actions={<StatusBadge status={me.docStatus} />} />
      <div className="card p-5">
        <ReviewTimeline status={me.docStatus} />
      </div>
      <Alert tone={required ? 'warn' : 'info'} icon={Info} title={required ? 'Owner authorisation is required' : 'Owner authorisation is optional'}>
        {required
          ? 'AutoDealer currently requires a signed authorisation letter from the registered owner before an agent listing can be published. Admins can change this policy.'
          : 'Under the current policy you can publish without a signed letter, but uploading one gets your listings verified faster. Admins can change this policy.'}
      </Alert>
      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentCard type="personal_id" label="Agent identity document" description="PAN card, driving licence or passport in your name." required />
        <DocumentCard
          type="owner_authorization"
          label="Owner authorisation letter"
          description="Signed by the registered owner, with their ID and the RC attached."
          required={required}
          policyBadge={<Badge tone={required ? 'dark' : 'neutral'}>{required ? 'Required by policy' : 'Optional by policy'}</Badge>}
        />
      </div>
      <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <FileText className="h-8 w-8 shrink-0 text-accent-600" />
        <div className="flex-1">
          <p className="font-semibold">Need a letter format?</p>
          <p className="text-sm text-mist-600">Use our template. Print it, have the owner sign it, and upload a photo or scan.</p>
        </div>
        <Button variant="secondary" onClick={() => setTpl(true)}>
          View template
        </Button>
      </div>
      <Modal open={tpl} onClose={() => setTpl(false)} title="Owner authorisation template" size="lg" footer={<><CopyText text={TEMPLATE} className="mr-auto" /><Button onClick={() => setTpl(false)}>Done</Button></>}>
        <pre className="whitespace-pre-wrap rounded-lg bg-mist-50 p-4 font-mono text-[12.5px] leading-relaxed text-ink-800">{TEMPLATE}</pre>
      </Modal>
    </div>
  );
}
