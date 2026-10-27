import { useState } from 'react';
import { Camera, ShieldCheck, SunMedium, Video } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Field, Input, PageHeader, Section, Select, StatusBadge } from '../../components/ui';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { ReviewTimeline } from '../dealer/DealerDocuments';

const ID_TYPES = ['Driving licence', 'PAN card', 'Passport', 'Voter ID', 'Aadhaar (masked)'];

export default function SellerIdentity() {
  const { me } = useStore();
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [last4, setLast4] = useState('');
  const last4Err = last4 && !/^[0-9A-Z]{4}$/i.test(last4) ? 'Enter exactly the last 4 characters' : '';
  return (
    <div className="space-y-6">
      <PageHeader title="Identity verification" description="We check that you're the person selling the car. Your ID is never shown to buyers." actions={<StatusBadge status={me.docStatus} />} />
      <div className="card p-5">
        <ReviewTimeline status={me.docStatus} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Section title="1. Choose your ID">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ID type" htmlFor="id-type">
                <Select id="id-type" value={idType} onChange={(e) => setIdType(e.target.value)} options={ID_TYPES} />
              </Field>
              <Field label="Last 4 characters of the ID number" htmlFor="id-last4" error={last4Err} hint="We only store the last 4 for matching">
                <Input id="id-last4" value={last4} onChange={(e) => setLast4(e.target.value.toUpperCase().slice(0, 4))} className="font-mono uppercase" error={last4Err} placeholder="4821" />
              </Field>
            </div>
            {idType.startsWith('Aadhaar') && (
              <Alert tone="info" className="mt-4" title="Upload a masked Aadhaar only">
                Download the masked version from the UIDAI website — it hides the first 8 digits. Don't upload a full Aadhaar number.
              </Alert>
            )}
          </Section>
          <DocumentCard
            type="personal_id"
            label={idType}
            description="Front side, all four corners visible. Your name must match the RC of the car."
            required
            extra={{ maskedNumber: last4 && !last4Err ? `XXXX XXXX ${last4}` : null }}
          />
          <DocumentCard
            type="verification_video"
            label="Verification video"
            description="Optional. A 10-second selfie video holding your ID. Gets you verified faster."
            required={false}
            accept="video/mp4,video/quicktime,video/webm"
            kind="video"
            maxMB={50}
          />
        </div>
        <aside className="space-y-4">
          <Section title="Tips for a quick approval">
            <ul className="space-y-3 text-sm text-mist-700">
              <li className="flex gap-2.5">
                <SunMedium className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> Shoot in daylight without glare on the card.
              </li>
              <li className="flex gap-2.5">
                <Camera className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> Keep the whole card in frame; no cropping.
              </li>
              <li className="flex gap-2.5">
                <Video className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> In the video, say your name and show the car's number plate if you can.
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> Your listing stays live while we review.
              </li>
            </ul>
          </Section>
          <Alert tone="info" title="What verification means">
            A verified ID confirms who you are. It does not confirm that the car's papers are genuine — buyers should still check the RC on the government portal.
          </Alert>
        </aside>
      </div>
    </div>
  );
}
