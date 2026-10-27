import { Info } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, PageHeader, StatusBadge } from '../../components/ui';
import { DocumentCard } from '../../components/documents/DocumentCard';

export function ReviewTimeline({ status }) {
  const steps = [
    ['Uploaded', status !== 'not_submitted'],
    ['In review', ['pending', 'verified', 'rejected', 'flagged'].includes(status)],
    [status === 'rejected' ? 'Rejected' : status === 'flagged' ? 'Escalated' : 'Verified', ['verified', 'rejected', 'flagged'].includes(status)],
  ];
  return (
    <ol className="flex items-center gap-2">
      {steps.map(([l, done], i) => (
        <li key={l} className="flex flex-1 items-center gap-2">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done ? (l === 'Rejected' || l === 'Escalated' ? 'bg-bad-600 text-white' : 'bg-ok-600 text-white') : 'bg-mist-200 text-mist-500'}`}>{i + 1}</span>
          <span className={`text-[13px] font-semibold ${done ? 'text-ink-900' : 'text-mist-500'}`}>{l}</span>
          {i < 2 && <span className={`h-0.5 flex-1 rounded ${steps[i + 1][1] ? 'bg-ok-600' : 'bg-mist-200'}`} />}
        </li>
      ))}
    </ol>
  );
}

export default function DealerDocuments() {
  const { me } = useStore();
  return (
    <div className="space-y-6">
      <PageHeader title="Business documents" description="Upload proof that your dealership is registered. We review it after your listings go live." actions={<StatusBadge status={me.docStatus} />} />
      <div className="card p-5">
        <ReviewTimeline status={me.docStatus} />
      </div>
      <Alert tone="info" icon={Info} title="What we accept">
        Shop & Establishment certificate, Certificate of Incorporation, Udyam registration or partnership deed. The business name must match "{me.business}". Clear photo or PDF, all four corners visible, up to 5 MB.
      </Alert>
      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentCard type="business_certificate" label="Business registration certificate" description="Required before you can publish listings." required />
        <DocumentCard type="gst_certificate" label="GST registration certificate" description="Optional. Adds your GSTIN to invoices." required={false} />
      </div>
    </div>
  );
}
