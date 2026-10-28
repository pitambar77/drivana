import { useState } from 'react';
import { Clock, Eye, FileText, FileVideo, RefreshCw, Upload } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Badge, Button, FileUpload, Modal, StatusBadge, useToast } from '../ui';
import { dateTime } from '../../utils/format';

const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** A rendered stand-in for documents that were seeded without a real file. */
export function DocPreview({ doc, user }) {
  if (doc.preview) return <img src={doc.preview} alt={doc.label} className="max-h-[60vh] w-full rounded-lg object-contain" />;
  if (doc.type === 'verification_video')
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg bg-ink-950 text-ink-300">
        <FileVideo className="h-10 w-10" />
        <p className="mt-2 text-sm">{doc.fileName}</p>
        <p className="text-xs text-ink-400">Video preview isn't stored in the demo</p>
      </div>
    );
  return (
    <div className="keep-light mx-auto aspect-[1/1.3] w-full max-w-sm rounded-lg border border-[#E1E6EE] bg-[#FBFAF6] p-6 font-serif text-[#0F1B2E] shadow-[0_2px_8px_rgba(0,0,0,.15)]">
      <div className="border-b-2 border-[#0F1B2E] pb-2 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#525E72]">Sample document</p>
        <p className="mt-1 text-base font-bold">{doc.label}</p>
      </div>
      <dl className="mt-5 space-y-3 text-[12.5px]">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[#6E7B90]">Name</dt>
          <dd className="font-semibold">{user?.business || user?.name}</dd>
        </div>
        {doc.maskedNumber && (
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-[#6E7B90]">Number</dt>
            <dd className="font-mono">{doc.maskedNumber}</dd>
          </div>
        )}
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[#6E7B90]">Address</dt>
          <dd>{user?.city}, India</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[#6E7B90]">File</dt>
          <dd className="font-mono text-[11px]">{doc.fileName}</dd>
        </div>
      </dl>
      <div className="mt-8 flex justify-end">
        <span className="rotate-[-8deg] rounded border-2 border-accent-700/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-700/70">Placeholder</span>
      </div>
    </div>
  );
}

/**
 * Upload / status card for one document type.
 * Uploading sets status to "pending"; admins move it to verified / rejected / flagged.
 */
export function DocumentCard({ type, label, description, required = true, policyBadge, accept, kind, maxMB, extra }) {
  const { state, me, uploadDocument } = useStore();
  const toast = useToast();
  const doc = state.documents.find((d) => d.userId === me.id && d.type === type);
  const [file, setFile] = useState(null);
  const [replacing, setReplacing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [err, setErr] = useState('');

  const submit = () => {
    if (!file) {
      setErr('Choose a file to upload.');
      return;
    }
    uploadDocument({ userId: me.id, type, label, fileName: file.fileName, size: file.size, preview: file.preview, maskedNumber: extra?.maskedNumber || null });
    setFile(null);
    setReplacing(false);
    setErr('');
    toast(`${label} uploaded. Our team will review it — your listings can go live meanwhile.`);
  };

  const showUploader = !doc || replacing || doc.status === 'rejected';
  const Icon = kind === 'video' ? FileVideo : FileText;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-mist-100 px-5 py-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist-100 text-ink-800">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-bold text-ink-900">
              {label}
              {policyBadge || (required ? <Badge tone="dark">Required</Badge> : <Badge>Optional</Badge>)}
            </p>
            {description && <p className="mt-0.5 text-[13px] text-mist-600">{description}</p>}
          </div>
        </div>
        <StatusBadge status={doc ? doc.status : 'not_submitted'} />
      </div>
      <div className="space-y-4 p-5">
        {doc && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-mist-50 p-3">
            {doc.preview ? <img src={doc.preview} alt="" className="h-12 w-12 rounded object-cover" /> : <Icon className="h-8 w-8 text-mist-400" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{doc.fileName}</p>
              <p className="text-xs text-mist-500">
                {doc.size ? `${fmtSize(doc.size)} · ` : ''}uploaded {dateTime(doc.uploadedAt)}
              </p>
            </div>
            <Button size="sm" variant="ghost" icon={Eye} onClick={() => setPreview(true)}>
              Preview
            </Button>
            {!replacing && doc.status !== 'rejected' && (
              <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => setReplacing(true)}>
                Replace
              </Button>
            )}
          </div>
        )}
        {doc?.status === 'pending' && (
          <Alert tone="info" icon={Clock} title="In review">
            Usually reviewed within 2 working days. Your listings stay live while we check.
          </Alert>
        )}
        {doc?.status === 'verified' && <Alert tone="success" title="Verified">Your listings show the "Documents verified" badge.</Alert>}
        {doc?.status === 'rejected' && (
          <Alert tone="error" title="Rejected — please upload again">
            {doc.reviewNote || 'The document could not be accepted.'}
          </Alert>
        )}
        {doc?.status === 'flagged' && (
          <Alert tone="warn" title="Under further review">
            {doc.reviewNote || 'Our team needs more time on this document.'} We may contact you.
          </Alert>
        )}
        {showUploader && (
          <div className="space-y-3">
            <FileUpload value={file} onChange={(f) => { setFile(f); setErr(''); }} accept={accept} kind={kind} maxMB={maxMB} label={doc ? 'Upload a new file' : `Upload ${label.toLowerCase()}`} error={err} id={`up-${type}`} />
            <div className="flex justify-end gap-2">
              {replacing && (
                <Button variant="ghost" onClick={() => { setReplacing(false); setFile(null); }}>
                  Cancel
                </Button>
              )}
              <Button icon={Upload} onClick={submit}>
                Submit for review
              </Button>
            </div>
          </div>
        )}
      </div>
      <Modal open={preview} onClose={() => setPreview(false)} title={label} size="lg">
        {doc && <DocPreview doc={doc} user={me} />}
      </Modal>
    </div>
  );
}
