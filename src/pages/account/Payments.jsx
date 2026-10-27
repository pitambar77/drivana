import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Receipt, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Button, DataTable, DL, EmptyState, KpiCard, MockNotice, Modal, PageHeader, Section, Segmented, StatusBadge, VerificationBadge } from '../../components/ui';
import { PaymentStatusHero } from '../../components/payment/Payment';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { PLANS, ROLE_META, SITE } from '../../config/site';
import { dateTime, inr } from '../../utils/format';

export function ReceiptModal({ txn, open, onClose, vehicle, user }) {
  if (!txn) return null;
  const plan = PLANS.find((p) => p.id === txn.planId);
  return (
    <Modal open={open} onClose={onClose} title={`Receipt ${txn.id}`} size="md" footer={<Button onClick={onClose}>Close</Button>}>
      <div className="space-y-5 text-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-lg font-bold">{SITE.name} Technologies Pvt. Ltd.</p>
            <p className="text-[12.5px] text-mist-500">{SITE.address}</p>
          </div>
          <StatusBadge status={txn.status} />
        </div>
        <DL
          items={[
            ['Billed to', user?.business || user?.name],
            ['Date', dateTime(txn.createdAt)],
            ['Transaction', <span key="t" className="font-mono">{txn.id}</span>],
            ['Gateway reference', <span key="g" className="font-mono text-[12.5px]">{txn.gatewayRef}</span>],
            ['Method', txn.method],
            ['Listing', vehicle ? `${vehicleTitle(vehicle)} (${vehicle.id.toUpperCase()})` : txn.listingId],
          ]}
        />
        <div className="rounded-lg border border-mist-200">
          <div className="flex justify-between border-b border-mist-100 px-4 py-2.5">
            <span>{plan?.name || txn.planId}</span>
            <span className="num">{inr(txn.amount)}</span>
          </div>
          <div className="flex justify-between border-b border-mist-100 px-4 py-2.5 text-mist-600">
            <span>GST 18%</span>
            <span className="num">{inr(txn.gst)}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 font-bold">
            <span>Total</span>
            <span className="num">{inr(txn.total)}</span>
          </div>
        </div>
        <MockNotice>Sample receipt. A real GST invoice is issued by the backend after payment capture.</MockNotice>
      </div>
    </Modal>
  );
}

export function PaymentResult() {
  const { txnId } = useParams();
  const { state, me, role, vehicle, resolvePending } = useStore();
  const [receipt, setReceipt] = useState(false);
  const txn = state.payments.find((p) => p.id === txnId);
  const home = ROLE_META[role].home;
  if (!txn) return <EmptyState title="Transaction not found" message="Check Payments for your full history." action={<Button to="/payments">Payment history</Button>} />;
  const v = vehicle(txn.listingId);
  const canRetry = (txn.status === 'failed' || txn.status === 'cancelled') && v && v.paymentStatus !== 'paid';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6 md:p-10">
        <PaymentStatusHero status={txn.status} />
        <div className="mt-8 grid grid-cols-1 gap-3 rounded-xl bg-mist-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-[12px] text-mist-500">Payment</p>
            <StatusBadge status={txn.status} />
          </div>
          <div>
            <p className="text-[12px] text-mist-500">Listing</p>
            {v ? <StatusBadge status={v.status} /> : '—'}
          </div>
          <div>
            <p className="text-[12px] text-mist-500">Documents</p>
            {v ? <VerificationBadge status={v.verification} size="sm" /> : '—'}
          </div>
        </div>
        <DL
          className="mt-6"
          items={[
            ['Transaction', <span key="t" className="font-mono">{txn.id}</span>],
            ['Amount', inr(txn.total)],
            ['Method', txn.method],
            ['Date', dateTime(txn.createdAt)],
            ['Vehicle', v ? vehicleTitle(v) : txn.listingId],
            ['Gateway ref.', <span key="g" className="font-mono text-[12.5px]">{txn.gatewayRef}</span>],
          ]}
        />
        {txn.status === 'pending' && (
          <div className="mt-6 rounded-xl border border-dashed border-warn-100 bg-warn-50/50 p-4">
            <p className="text-sm font-semibold text-warn-700">Simulate the bank's confirmation</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => resolvePending(txn.id, 'success')}>
                Bank confirms payment
              </Button>
              <Button size="sm" variant="secondary" onClick={() => resolvePending(txn.id, 'failed')}>
                Bank declines payment
              </Button>
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {txn.status === 'success' && (
            <>
              <Button to={`/cars/${txn.listingId}`}>View live listing</Button>
              <Button variant="secondary" icon={Receipt} onClick={() => setReceipt(true)}>
                View receipt
              </Button>
            </>
          )}
          {canRetry && (
            <Button to={`/checkout/${txn.listingId}`} icon={RefreshCw}>
              Retry payment
            </Button>
          )}
          <Button variant="ghost" to={home}>
            Go to dashboard
          </Button>
        </div>
      </div>
      <p className="mt-4 text-center text-[13px] text-mist-500">
        Questions about a charge? <Link to="/support" className="font-semibold text-accent-700 hover:underline">Contact support</Link> with the transaction ID.
      </p>
      <ReceiptModal open={receipt} onClose={() => setReceipt(false)} txn={txn} vehicle={v} user={me} />
    </div>
  );
}

export function PaymentHistory() {
  const { state, me, vehicle } = useStore();
  const [filter, setFilter] = useState('all');
  const [receipt, setReceipt] = useState(null);
  const mine = useMemo(() => state.payments.filter((p) => p.userId === me.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [state.payments, me.id]);
  const rows = filter === 'all' ? mine : mine.filter((p) => p.status === filter);
  const paid = mine.filter((p) => p.status === 'success');

  return (
    <div>
      <PageHeader title="Payments" description="Listing fees and receipts. Payment status is separate from document verification." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total spent" value={inr(paid.reduce((s, p) => s + p.total, 0))} sub="incl. GST" />
        <KpiCard label="Successful" value={paid.length} tone="green" />
        <KpiCard label="Failed / cancelled" value={mine.filter((p) => p.status === 'failed' || p.status === 'cancelled').length} tone="red" />
        <KpiCard label="Pending" value={mine.filter((p) => p.status === 'pending').length} tone="amber" />
      </div>
      <Section
        title="Transaction history"
        bodyClass="p-0"
        actions={<Segmented value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'success', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'pending', label: 'Pending' }]} />}
      >
        <DataTable
          rows={rows}
          empty={<EmptyState title="No payments yet" message="Payments appear here after you check out a listing." />}
          columns={[
            { key: 'id', header: 'Transaction', render: (p) => <span className="font-mono text-[13px] font-semibold">{p.id}</span> },
            { key: 'createdAt', header: 'Date', sort: (p) => p.createdAt, render: (p) => dateTime(p.createdAt) },
            {
              key: 'listing',
              header: 'Listing',
              render: (p) => {
                const v = vehicle(p.listingId);
                return v ? (
                  <Link to={`/cars/${v.id}`} className="font-medium hover:text-accent-700">
                    {vehicleTitle(v)}
                  </Link>
                ) : (
                  p.listingId
                );
              },
            },
            { key: 'plan', header: 'Plan', render: (p) => PLANS.find((x) => x.id === p.planId)?.name },
            { key: 'total', header: 'Amount', align: 'right', sort: (p) => p.total, render: (p) => inr(p.total) },
            { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
            {
              key: 'actions',
              header: '',
              align: 'right',
              render: (p) => {
                const v = vehicle(p.listingId);
                return (
                  <div className="flex justify-end gap-1">
                    {p.status === 'success' && (
                      <Button size="sm" variant="ghost" icon={Receipt} onClick={() => setReceipt(p)}>
                        Receipt
                      </Button>
                    )}
                    {(p.status === 'failed' || p.status === 'cancelled') && v && v.paymentStatus !== 'paid' && v.status !== 'blocked_duplicate' && (
                      <Button size="sm" variant="secondary" to={`/checkout/${p.listingId}`}>
                        Retry
                      </Button>
                    )}
                    {p.status === 'pending' && (
                      <Button size="sm" variant="secondary" to={`/payments/result/${p.id}`}>
                        Check status
                      </Button>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </Section>
      <ReceiptModal open={!!receipt} onClose={() => setReceipt(null)} txn={receipt} vehicle={receipt ? vehicle(receipt.listingId) : null} user={me} />
    </div>
  );
}
