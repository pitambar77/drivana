import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Eye, Flag, XCircle } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Avatar, Badge, Button, ConfirmDialog, DataTable, DL, EmptyState, Modal, PageHeader, SearchInput, StatusBadge, Tabs, useToast } from '../../components/ui';
import { DocPreview } from '../../components/documents/DocumentCard';
import { ROLE_META } from '../../config/site';
import { ago, dateTime } from '../../utils/format';

const ACTIONS = {
  verified: { label: 'Verify document', tone: 'primary', title: 'Verify this document?', msg: 'The user gets the "Documents verified" badge on their live listings once all required documents are verified.', reason: false },
  rejected: { label: 'Reject document', tone: 'danger', title: 'Reject this document?', msg: 'The user is asked to upload it again. Their live listings stay live but lose the verified badge.', reason: true },
  flagged: { label: 'Flag for investigation', tone: 'danger', title: 'Flag this document?', msg: 'Escalates to the trust & safety team. Consider suspending linked listings if fraud is suspected.', reason: true },
};

export default function AdminDocuments() {
  const { state, user, reviewDocument } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [view, setView] = useState(null);
  const [act, setAct] = useState(null);

  const count = (s) => state.documents.filter((d) => d.status === s).length;
  const rows = state.documents
    .filter((d) => d.status === tab)
    .filter((d) => {
      const u = user(d.userId);
      const t = q.trim().toLowerCase();
      return !t || `${u?.name} ${u?.business || ''} ${d.label} ${d.fileName}`.toLowerCase().includes(t);
    })
    .sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
  const doc = view ? state.documents.find((d) => d.id === view) : null;
  const du = doc ? user(doc.userId) : null;

  const actionButtons = (d, size = 'sm') => (
    <div className="flex flex-wrap justify-end gap-1">
      {d.status !== 'verified' && (
        <Button size={size} variant="secondary" icon={BadgeCheck} className="text-ok-700" onClick={() => setAct({ id: d.id, status: 'verified' })}>
          Verify
        </Button>
      )}
      {d.status !== 'rejected' && (
        <Button size={size} variant="ghost" icon={XCircle} className="text-bad-600" onClick={() => setAct({ id: d.id, status: 'rejected' })}>
          Reject
        </Button>
      )}
      {d.status !== 'flagged' && (
        <Button size={size} variant="ghost" icon={Flag} className="text-warn-700" onClick={() => setAct({ id: d.id, status: 'flagged' })}>
          Flag
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Document verification queue" description="Listings publish before review. Verifying documents adds the trust badge; it never blocks publication." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'pending', label: 'Pending', count: count('pending') },
          { value: 'verified', label: 'Verified', count: count('verified') },
          { value: 'rejected', label: 'Rejected', count: count('rejected') },
          { value: 'flagged', label: 'Flagged', count: count('flagged') },
        ]}
      />
      <div className="card">
        <div className="border-b border-mist-100 p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search user, business or file" className="md:w-80" />
        </div>
        <DataTable
          rows={rows}
          empty={<EmptyState icon={BadgeCheck} title={tab === 'pending' ? 'Queue is clear' : `No ${tab} documents`} message={tab === 'pending' ? 'Nice work — every uploaded document has been reviewed.' : undefined} />}
          columns={[
            {
              key: 'user',
              header: 'Submitted by',
              render: (d) => {
                const u = user(d.userId);
                return (
                  <div className="flex min-w-[200px] items-center gap-3">
                    <Avatar name={u?.business || u?.agency || u?.name} size={32} tone="mist" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{u?.business || u?.agency || u?.name}</p>
                      <p className="text-[12px] text-mist-500">{ROLE_META[u?.role]?.label}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              key: 'doc',
              header: 'Document',
              render: (d) => (
                <div className="min-w-[180px]">
                  <p className="font-medium">{d.label}</p>
                  <p className="truncate font-mono text-[11.5px] text-mist-500">{d.fileName}</p>
                </div>
              ),
            },
            { key: 'at', header: 'Uploaded', sort: (d) => d.uploadedAt, render: (d) => <span title={dateTime(d.uploadedAt)}>{ago(d.uploadedAt)}</span> },
            { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
            {
              key: 'a',
              header: '',
              align: 'right',
              render: (d) => (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="secondary" icon={Eye} onClick={() => setView(d.id)}>
                    Review
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={!!doc} onClose={() => setView(null)} size="xl" title={doc?.label || ''} description={du ? `${du.business || du.agency || du.name} · ${ROLE_META[du.role].label}` : ''} footer={doc && actionButtons(doc, 'md')}>
        {doc && (
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <DocPreview doc={doc} user={du} />
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={doc.status} />
                <Badge>{doc.type.replace(/_/g, ' ')}</Badge>
              </div>
              <DL
                cols={2}
                items={[
                  ['Name on account', du?.name],
                  ['Business', du?.business || du?.agency || '—'],
                  ['Phone', <span key="p" className="font-mono">{du?.phone}</span>],
                  ['City', du?.city],
                  ['ID number', doc.maskedNumber ? <span key="m" className="font-mono">{doc.maskedNumber}</span> : '—'],
                  ['Uploaded', dateTime(doc.uploadedAt)],
                ]}
              />
              <div className="rounded-lg bg-mist-50 p-3 text-[13px] text-mist-700">
                <p className="font-semibold text-ink-900">Checklist</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4">
                  <li>Name matches the account{du?.business ? ` and "${du.business}"` : ''}</li>
                  <li>Document is legible and not expired</li>
                  <li>No signs of editing; all corners visible</li>
                </ul>
              </div>
              {doc.reviewNote && (
                <p className="text-[13px]">
                  <span className="font-semibold">Previous note:</span> {doc.reviewNote}
                </p>
              )}
              <div>
                <p className="mb-1.5 text-[13px] font-semibold">Live listings by this user</p>
                <ul className="space-y-1 text-[13px]">
                  {state.vehicles.filter((v) => v.sellerId === doc.userId && v.status === 'live').map((v) => (
                    <li key={v.id}>
                      <Link to={`/admin/listings/${v.id}`} className="text-accent-700 hover:underline">
                        {v.year} {v.make} {v.model}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[12px] text-mist-500">Reviewing confirms the document looks authentic. It is not a government verification.</p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!act}
        onClose={() => setAct(null)}
        tone={act ? ACTIONS[act.status].tone : 'primary'}
        withReason={act ? ACTIONS[act.status].reason : false}
        reasonLabel={act?.status === 'rejected' ? 'Reason shown to the user' : 'Internal note'}
        title={act ? ACTIONS[act.status].title : ''}
        message={act ? ACTIONS[act.status].msg : ''}
        confirmLabel={act ? ACTIONS[act.status].label : ''}
        onConfirm={(reason) => {
          reviewDocument(act.id, act.status, reason);
          setView(null);
          toast(act.status === 'verified' ? 'Document verified.' : act.status === 'rejected' ? 'Document rejected. The user has been asked to re-upload.' : 'Document flagged for investigation.', { tone: act.status === 'verified' ? 'success' : 'warn' });
        }}
      />
    </div>
  );
}
