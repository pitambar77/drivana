// Partner bank lead desk (demo of what a bank receives).
// Route: /bank-portal?bank=lp2&lead=LR1234
// Finance enquiries from the loan calculator land here as new leads; the bank updates progress,
// and each update is pushed to the selling dealer and shown to the customer on their enquiry page.
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bell, Building2, Car, CheckCircle2, CircleDot, Clock, Inbox, Landmark, Mail, Phone, Send, User, XCircle } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Logo } from '../../components/layout/Brand';
import { StyleToggle } from '../../store/StyleContext';
import { Badge, CopyText, EmptyState, Input, KpiCard, MockNotice, SearchInput, Select, StatusBadge, Tabs, useToast } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { LOAN_STEPS, bankInfo } from '../../data/partnerBanks';
import { sellerDisplayName } from '../../utils/finance';
import { ago, cn, dateTime, inr, lakh } from '../../utils/format';

const OPEN = ['referred', 'contacted', 'application', 'sanctioned'];
const NEXT = {
  referred: [['contacted', 'Mark customer contacted', Phone]],
  contacted: [['application', 'Start application', Send]],
  application: [['sanctioned', 'Sanction loan', CheckCircle2]],
  sanctioned: [['disbursed', 'Mark paid to dealer', Landmark]],
};

export default function BankPortal() {
  const { state, user, vehicle, setReferralStatus } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const banks = state.config.loanProviders.filter((l) => l.enabled).map(bankInfo);
  const bank = banks.find((b) => b.id === params.get('bank')) || banks[0];
  const [tab, setTab] = useState('open');
  const [q, setQ] = useState('');
  const [note, setNote] = useState('');

  const leads = useMemo(
    () => state.referrals.filter((r) => r.lenderId === bank?.id).sort((a, b) => (b.enquiryId ? 1 : 0) - (a.enquiryId ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt)),
    [state.referrals, bank?.id],
  );
  const name = (r) => r.buyerName || user(r.buyerId)?.name || 'Customer';
  const list = leads.filter((r) => {
    if (tab === 'new' && r.status !== 'referred') return false;
    if (tab === 'open' && !OPEN.includes(r.status)) return false;
    if (tab === 'closed' && OPEN.includes(r.status)) return false;
    const t = q.trim().toLowerCase();
    if (t && !`${r.id} ${name(r)} ${r.buyerPhone || ''} ${r.vehicleId || ''}`.toLowerCase().includes(t)) return false;
    return true;
  });
  const current = leads.find((r) => r.id === params.get('lead')) || list[0] || null;
  const setLead = (id) => {
    const n = new URLSearchParams(params);
    n.set('lead', id);
    setParams(n, { replace: true });
    setNote('');
  };
  const setBank = (id) => setParams({ bank: id }, { replace: true });
  const alerts = (state.notifications || []).filter((n) => n.audience === 'bank' && n.recipientId === bank?.id).slice(0, 4);

  const update = (status) => {
    setReferralStatus(current.id, status, note.trim());
    setNote('');
    toast(current.enquiryId ? 'Updated. The dealer has been notified and the customer can see the new status.' : 'Lead updated.', { title: LOAN_STEPS.find((s) => s.value === status)?.label || 'Loan declined' });
  };

  return (
    <div className="min-h-screen bg-mist-50">
      <header className="sticky top-0 z-30 border-b border-mist-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-3">
          <Logo />
          <span className="hidden rounded-md bg-ink-900 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white sm:inline">Partner desk</span>
          <div className="ml-auto flex items-center gap-2">
            <Select aria-label="Bank" value={bank?.id || ''} onChange={(e) => setBank(e.target.value)} options={banks.map((b) => ({ value: b.id, label: b.name }))} className="hidden w-[240px] sm:block" />
            <StyleToggle compact />
          </div>
        </div>
      </header>

      <main className="container-page space-y-5 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to="/loan-calculator" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-mist-600 hover:text-ink-900">
              <ArrowLeft className="h-4 w-4" /> Back to the marketplace
            </Link>
            <h1 className="text-[26px] font-bold">{bank?.name || 'Partner bank'} · car loan leads</h1>
            <p className="mt-1 text-sm text-mist-600">Enquiries customers send from the AutoDealer loan calculator. Each update you make is shared with the dealer and the customer.</p>
          </div>
        </div>
        <Select aria-label="Bank (mobile)" value={bank?.id || ''} onChange={(e) => setBank(e.target.value)} options={banks.map((b) => ({ value: b.id, label: b.name }))} className="sm:hidden" />
        <MockNotice>This is what a partner bank sees. In production the lead would also arrive by email or API to {bank?.desk?.email || 'the bank'}.</MockNotice>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="New leads" value={leads.filter((r) => r.status === 'referred').length} icon={Inbox} tone="amber" sub="waiting for a call" />
          <KpiCard label="In progress" value={leads.filter((r) => ['contacted', 'application'].includes(r.status)).length} icon={Clock} />
          <KpiCard label="Sanctioned" value={leads.filter((r) => r.status === 'sanctioned').length} icon={CheckCircle2} tone="green" />
          <KpiCard label="Paid to dealers" value={lakh(leads.filter((r) => r.status === 'disbursed').reduce((t, r) => t + r.loanAmount, 0))} icon={Landmark} tone="dark" />
        </div>

        {alerts.length > 0 && (
          <section className="card p-4">
            <h2 className="mb-2 flex items-center gap-2 text-[14px] font-bold">
              <Bell className="h-4 w-4 text-accent-600" /> Latest notifications
            </h2>
            <ul className="divide-y divide-mist-100">
              {alerts.map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => setLead(n.link.split('lead=')[1])} className="flex w-full items-start justify-between gap-3 py-2 text-left hover:text-accent-700">
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-semibold text-ink-900">{n.title}</span>
                      <span className="block truncate text-[12.5px] text-mist-600">{n.body}</span>
                    </span>
                    <span className="shrink-0 text-[12px] text-mist-500">{ago(n.at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="card overflow-hidden">
          <div className="border-b border-mist-100 px-4 pt-2">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: 'open', label: 'Open', count: leads.filter((r) => OPEN.includes(r.status)).length },
                { value: 'new', label: 'New', count: leads.filter((r) => r.status === 'referred').length },
                { value: 'closed', label: 'Closed', count: leads.filter((r) => !OPEN.includes(r.status)).length },
                { value: 'all', label: 'All', count: leads.length },
              ]}
            />
          </div>
          <div className="grid lg:grid-cols-[minmax(300px,380px)_1fr]">
            <div className="border-mist-100 lg:border-r">
              <div className="border-b border-mist-100 p-3">
                <SearchInput value={q} onChange={setQ} placeholder="Lead ID, customer or phone" />
              </div>
              {list.length === 0 ? (
                <div className="p-4">
                  <EmptyState icon={Inbox} title="No leads here" message="New enquiries from the loan calculator appear in this list." />
                </div>
              ) : (
                <ul className="max-h-[640px] divide-y divide-mist-100 overflow-y-auto">
                  {list.map((r) => {
                    const v = vehicle(r.vehicleId);
                    return (
                      <li key={r.id}>
                        <button type="button" onClick={() => setLead(r.id)} className={cn('flex w-full gap-3 px-4 py-3 text-left hover:bg-mist-50', current?.id === r.id && 'bg-accent-50/60')}>
                          <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', r.status === 'referred' ? 'bg-accent-600' : 'bg-transparent')} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn('truncate text-sm', r.status === 'referred' ? 'font-bold text-ink-900' : 'font-semibold text-ink-800')}>{name(r)}</p>
                              <span className="shrink-0 text-[11.5px] text-mist-500">{ago(r.createdAt)}</span>
                            </div>
                            <p className="truncate text-[12.5px] text-mist-500">
                              {r.id} · {inr(r.loanAmount)} · {v ? `${v.make} ${v.model}` : 'No car chosen'}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <StatusBadge status={r.status} />
                              {r.enquiryId && (
                                <Badge tone="info" icon={Landmark}>
                                  Finance enquiry
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {current ? (
              <LeadDetail r={current} name={name(current)} note={note} setNote={setNote} onUpdate={update} />
            ) : (
              <div className="hidden p-10 lg:block">
                <EmptyState icon={Landmark} title="Choose a lead" message="Select a lead to see the customer, car and dealer." />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function LeadDetail({ r, name, note, setNote, onUpdate }) {
  const { user, vehicle } = useStore();
  const v = vehicle(r.vehicleId);
  const dealer = user(r.dealerId || v?.sellerId);
  const buyer = r.buyerId ? user(r.buyerId) : null;
  const phone = r.buyerPhone || buyer?.phone;
  const email = r.buyerEmail || buyer?.email;
  const price = r.price || v?.price;
  const step = LOAN_STEPS.findIndex((s) => s.value === r.status);
  const closed = !OPEN.includes(r.status);

  const Box = ({ icon: Icon, title, children }) => (
    <div className="rounded-xl border border-mist-200 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-mist-500">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      {children}
    </div>
  );
  const Line = ({ k, children }) => (
    <div className="flex justify-between gap-3 py-0.5 text-[13.5px]">
      <span className="text-mist-600">{k}</span>
      <span className="min-w-0 text-right font-semibold text-ink-900 num">{children}</span>
    </div>
  );

  return (
    <div className="min-w-0 space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[12.5px] font-semibold text-mist-500">
            {r.id}
            {r.enquiryId ? ` · enquiry ${r.enquiryId}` : ''}
          </p>
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-[13px] text-mist-500">Received {dateTime(r.createdAt)}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <ol className="flex flex-wrap gap-x-1 gap-y-2">
        {LOAN_STEPS.map((s, i) => (
          <li key={s.value} className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold', r.status === 'rejected' ? 'bg-mist-100 text-mist-500' : i <= step ? 'bg-ok-50 text-ok-700' : 'bg-mist-100 text-mist-500')}>
            {i <= step && r.status !== 'rejected' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />} {s.label}
          </li>
        ))}
        {r.status === 'rejected' && (
          <li className="flex items-center gap-1 rounded-full bg-bad-50 px-2.5 py-1 text-[12px] font-semibold text-bad-700">
            <XCircle className="h-3.5 w-3.5" /> Declined
          </li>
        )}
      </ol>

      <div className="grid gap-3 xl:grid-cols-2">
        <Box icon={User} title="Customer">
          {phone && (
            <div className="flex items-center justify-between gap-2 text-[13.5px]">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 font-mono font-semibold text-ink-900">
                <Phone className="h-3.5 w-3.5 text-mist-400" /> {phone}
              </a>
              <CopyText text={phone} />
            </div>
          )}
          {email && (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-[13.5px] text-ink-800">
              <Mail className="h-3.5 w-3.5 shrink-0 text-mist-400" /> {email}
            </p>
          )}
          <div className="mt-2 border-t border-mist-100 pt-2">
            {r.buyerCity && <Line k="City">{r.buyerCity}</Line>}
            {r.employment && <Line k="Earns as">{r.employment}</Line>}
            {r.income && <Line k="Monthly income">{r.income}</Line>}
            {r.callTime && <Line k="Best time to call">{r.callTime}</Line>}
          </div>
        </Box>

        <Box icon={Send} title="Loan requested">
          {price ? <Line k="Car price">{inr(price)}</Line> : null}
          {r.downPayment !== undefined && <Line k="Down payment">{inr(r.downPayment)}</Line>}
          <Line k="Loan amount">{inr(r.loanAmount)}</Line>
          {price ? <Line k="Funding">{Math.round((r.loanAmount / price) * 100)}% of price</Line> : null}
          <Line k="Tenure">{r.tenureMonths} months</Line>
          {r.ratePct && <Line k="Rate shown">{r.ratePct.toFixed(2)}%</Line>}
          {r.emi && <Line k="EMI shown">{inr(r.emi)}/mo</Line>}
        </Box>

        {v && (
          <Box icon={Car} title="Car">
            <Link to={`/cars/${v.id}`} target="_blank" className="flex gap-3 hover:text-accent-700">
              <CarImage vehicle={v} className="h-14 w-20 shrink-0 rounded-md object-cover" />
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {v.year} {v.make} {v.model}
                </span>
                <span className="block truncate text-[12.5px] text-mist-500">
                  {v.variant} · {v.fuel} · {v.regNumber || v.id.toUpperCase()}
                </span>
              </span>
            </Link>
          </Box>
        )}

        {dealer && (
          <Box icon={Building2} title="Dealer (for the invoice and RC)">
            <p className="font-semibold text-ink-900">{sellerDisplayName(dealer)}</p>
            <p className="text-[13px] text-mist-600">
              {dealer.name} · {dealer.city}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[13.5px]">
              <a href={`tel:${dealer.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 font-mono font-semibold text-ink-900">
                <Phone className="h-3.5 w-3.5 text-mist-400" /> {dealer.phone}
              </a>
              <CopyText text={dealer.phone} />
            </div>
          </Box>
        )}
      </div>

      {r.note && <p className="whitespace-pre-line rounded-xl bg-mist-50 p-3.5 text-[13.5px] text-ink-800">“{r.note}”</p>}

      <section className="rounded-xl border border-mist-200 p-4">
        <h3 className="text-[14px] font-bold">Update progress</h3>
        {closed ? (
          <p className="mt-1 text-[13.5px] text-mist-600">This lead is closed ({r.status === 'disbursed' ? 'loan paid to the dealer' : 'declined'}).</p>
        ) : (
          <>
            <p className="mt-0.5 text-[12.5px] text-mist-500">The dealer is notified and the customer sees the new status on their enquiry page.</p>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note, e.g. “Asked for 3 months’ bank statement”" className="mt-3" maxLength={140} aria-label="Note for the dealer" />
            <div className="mt-3 flex flex-wrap gap-2">
              {(NEXT[r.status] || []).map(([s, label, Icon]) => (
                <button key={s} type="button" onClick={() => onUpdate(s)} className="btn btn-md btn-primary">
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
              <button type="button" onClick={() => onUpdate('rejected')} className="btn btn-md btn-secondary text-bad-600">
                <XCircle className="h-4 w-4" /> Decline
              </button>
            </div>
          </>
        )}
      </section>

      {r.history?.length > 0 && (
        <section>
          <h3 className="mb-2 text-[14px] font-bold">History</h3>
          <ul className="space-y-2">
            {r.history.map((h, i) => (
              <li key={i} className="flex gap-2 text-[13px]">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mist-400" />
                <span className="min-w-0">
                  <span className="font-semibold text-ink-900">{LOAN_STEPS.find((s) => s.value === h.status)?.label || (h.status === 'rejected' ? 'Declined' : h.status)}</span>
                  <span className="text-mist-500"> · {dateTime(h.at)}</span>
                  {h.note && <span className="block text-mist-600">{h.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
