import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Eye, UserCheck, UserX } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Avatar, Badge, Button, ConfirmDialog, CsvModal, DataTable, DL, Modal, PageHeader, SearchInput, Select, StatusBadge, Tabs, useToast } from '../../components/ui';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { ROLE_META } from '../../config/site';
import { date, dateTime, inr, toCSV, tryDownload } from '../../utils/format';

export default function AdminUsers() {
  const { state, setUserStatus } = useStore();
  const toast = useToast();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('');
  const [doc, setDoc] = useState('');
  const [profile, setProfile] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [csv, setCsv] = useState(null);

  const users = state.users.filter((u) => u.role !== 'admin');
  const counts = useMemo(() => {
    const c = { all: users.length };
    users.forEach((u) => (c[u.role] = (c[u.role] || 0) + 1));
    return c;
  }, [users]);
  const rows = users.filter((u) => {
    const t = q.trim().toLowerCase();
    if (t && !`${u.name} ${u.business || ''} ${u.agency || ''} ${u.phone} ${u.email} ${u.id}`.toLowerCase().includes(t)) return false;
    if (role !== 'all' && u.role !== role) return false;
    if (status && u.status !== status) return false;
    if (doc && u.docStatus !== doc) return false;
    return true;
  });
  const p = profile ? state.users.find((u) => u.id === profile) : null;

  const exportCsv = () => {
    const text = toCSV(rows, [
      { label: 'ID', value: 'id' },
      { label: 'Name', value: 'name' },
      { label: 'Business', value: (u) => u.business || u.agency || '' },
      { label: 'Role', value: 'role' },
      { label: 'Phone', value: 'phone' },
      { label: 'Email', value: 'email' },
      { label: 'City', value: 'city' },
      { label: 'Registered', value: (u) => u.registeredAt.slice(0, 10) },
      { label: 'Account status', value: 'status' },
      { label: 'Document status', value: 'docStatus' },
    ]);
    tryDownload('autodealer-users.csv', text);
    setCsv(text);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="User directory" description="Everyone registered on AutoDealer. Suspending a user hides their listings and blocks sign-in." actions={<Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>} />
      <Tabs
        value={role}
        onChange={setRole}
        tabs={[
          { value: 'all', label: 'All', count: counts.all },
          { value: 'dealer', label: 'Dealers', count: counts.dealer || 0 },
          { value: 'seller', label: 'Private sellers', count: counts.seller || 0 },
          { value: 'agent', label: 'Agents', count: counts.agent || 0 },
          { value: 'buyer', label: 'Buyers', count: counts.buyer || 0 },
        ]}
      />
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-mist-100 p-4 md:flex-row">
          <SearchInput value={q} onChange={setQ} placeholder="Name, business, phone, email or ID" className="md:w-80" />
          <Select aria-label="Account status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Any account status" options={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} className="md:w-48" />
          <Select aria-label="Document status" value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Any document status" options={[{ value: 'verified', label: 'Verified' }, { value: 'pending', label: 'Pending' }, { value: 'rejected', label: 'Rejected' }, { value: 'flagged', label: 'Flagged' }, { value: 'not_submitted', label: 'Not submitted' }]} className="md:w-52" />
        </div>
        <DataTable
          rows={rows}
          initialSort={{ key: 'reg', dir: 'desc' }}
          columns={[
            {
              key: 'name',
              header: 'User',
              sort: (u) => u.name,
              render: (u) => (
                <button type="button" onClick={() => setProfile(u.id)} className="flex min-w-[200px] items-center gap-3 text-left">
                  <Avatar name={u.business || u.agency || u.name} size={34} tone="mist" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink-900 hover:text-accent-700">{u.business || u.agency || u.name}</span>
                    <span className="block truncate text-[12.5px] text-mist-500">{u.business || u.agency ? u.name : u.id}</span>
                  </span>
                </button>
              ),
            },
            { key: 'role', header: 'Role', sort: (u) => u.role, render: (u) => <Badge tone={u.role === 'dealer' ? 'dark' : u.role === 'buyer' ? 'neutral' : 'blue'}>{ROLE_META[u.role].label}</Badge> },
            {
              key: 'contact',
              header: 'Contact',
              render: (u) => (
                <div className="min-w-[160px]">
                  <p className="font-mono text-[12.5px]">{u.phone}</p>
                  <p className="truncate text-[12.5px] text-mist-500">{u.email}</p>
                </div>
              ),
            },
            { key: 'city', header: 'City', sort: (u) => u.city },
            { key: 'reg', header: 'Registered', sort: (u) => u.registeredAt, render: (u) => date(u.registeredAt) },
            { key: 'status', header: 'Account', render: (u) => <StatusBadge status={u.status} /> },
            { key: 'doc', header: 'Documents', render: (u) => (u.role === 'buyer' ? <span className="text-[12.5px] text-mist-400">n/a</span> : <StatusBadge status={u.docStatus} />) },
            {
              key: 'actions',
              header: '',
              align: 'right',
              render: (u) => (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" icon={Eye} onClick={() => setProfile(u.id)}>
                    Profile
                  </Button>
                  {u.status === 'active' ? (
                    <Button size="sm" variant="ghost" icon={UserX} className="text-bad-600" onClick={() => setConfirm({ user: u, action: 'suspend' })}>
                      Suspend
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" icon={UserCheck} className="text-ok-700" onClick={() => setConfirm({ user: u, action: 'reactivate' })}>
                      Reactivate
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal side open={!!p} onClose={() => setProfile(null)} title={p ? p.business || p.agency || p.name : ''} description={p ? `${ROLE_META[p.role].label} · ${p.id}` : ''}>
        {p && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={p.status} prefix="Account" />
              {p.role !== 'buyer' && <StatusBadge status={p.docStatus} prefix="Documents" />}
            </div>
            <DL
              items={[
                ['Name', p.name],
                ['Phone', <span key="p" className="font-mono">{p.phone}</span>],
                ['Email', p.email || '—'],
                ['City', p.city],
                ['Registered', date(p.registeredAt)],
                p.gstin && ['GSTIN', <span key="g" className="font-mono">{p.gstin}</span>],
              ]}
            />
            {p.role !== 'buyer' && (
              <div>
                <h3 className="mb-2 text-sm font-bold">Documents</h3>
                <ul className="divide-y divide-mist-100 rounded-lg border border-mist-200">
                  {state.documents.filter((d) => d.userId === p.id).map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                      <span className="min-w-0 truncate">{d.label}</span>
                      <StatusBadge status={d.status} />
                    </li>
                  ))}
                  {!state.documents.some((d) => d.userId === p.id) && <li className="px-3 py-3 text-sm text-mist-500">Nothing uploaded.</li>}
                </ul>
                <Link to="/admin/documents" className="mt-2 inline-block text-[13px] font-semibold text-accent-700 hover:underline">
                  Open document queue →
                </Link>
              </div>
            )}
            {p.role !== 'buyer' && (
              <div>
                <h3 className="mb-2 text-sm font-bold">Listings</h3>
                <ul className="divide-y divide-mist-100 rounded-lg border border-mist-200">
                  {state.vehicles.filter((v) => v.sellerId === p.id).map((v) => (
                    <li key={v.id}>
                      <Link to={`/admin/listings/${v.id}`} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm hover:bg-mist-50">
                        <span className="min-w-0 truncate">{vehicleTitle(v)}</span>
                        <StatusBadge status={v.status} />
                      </Link>
                    </li>
                  ))}
                  {!state.vehicles.some((v) => v.sellerId === p.id) && <li className="px-3 py-3 text-sm text-mist-500">No listings.</li>}
                </ul>
              </div>
            )}
            {p.role !== 'buyer' && (
              <div>
                <h3 className="mb-2 text-sm font-bold">Payments</h3>
                <p className="text-sm text-mist-600">
                  {state.payments.filter((x) => x.userId === p.id && x.status === 'success').length} successful ·{' '}
                  {inr(state.payments.filter((x) => x.userId === p.id && x.status === 'success').reduce((s, x) => s + x.total, 0))} total
                </p>
              </div>
            )}
            <div>
              <h3 className="mb-2 text-sm font-bold">Admin history</h3>
              <ul className="space-y-2 text-[13px]">
                {state.audit.filter((a) => a.entityId === p.id).map((a) => (
                  <li key={a.id} className="rounded-lg bg-mist-50 px-3 py-2">
                    <span className="font-semibold">{a.action}</span> by {a.actor} · {dateTime(a.at)}
                    {a.note && <p className="text-mist-600">{a.note}</p>}
                  </li>
                ))}
                {!state.audit.some((a) => a.entityId === p.id) && <li className="text-mist-500">No admin actions yet.</li>}
              </ul>
            </div>
            <div className="border-t border-mist-100 pt-4">
              {p.status === 'active' ? (
                <Button variant="danger" icon={UserX} onClick={() => setConfirm({ user: p, action: 'suspend' })}>
                  Suspend user
                </Button>
              ) : (
                <Button icon={UserCheck} onClick={() => setConfirm({ user: p, action: 'reactivate' })}>
                  Reactivate user
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        tone={confirm?.action === 'suspend' ? 'danger' : 'primary'}
        withReason
        reasonRequired={confirm?.action === 'suspend'}
        title={confirm?.action === 'suspend' ? `Suspend ${confirm?.user.name}?` : `Reactivate ${confirm?.user.name}?`}
        message={confirm?.action === 'suspend' ? "They won't be able to sign in and their listings will be hidden from buyers." : 'They can sign in again, and listings hidden by the suspension go live again.'}
        confirmLabel={confirm?.action === 'suspend' ? 'Suspend user' : 'Reactivate'}
        onConfirm={(reason) => {
          setUserStatus(confirm.user.id, confirm.action === 'suspend' ? 'suspended' : 'active', reason);
          toast(confirm.action === 'suspend' ? 'User suspended.' : 'User reactivated.', { tone: confirm.action === 'suspend' ? 'warn' : 'success' });
        }}
      />
      <CsvModal open={!!csv} onClose={() => setCsv(null)} filename="autodealer-users.csv" csv={csv || ''} />
    </div>
  );
}
