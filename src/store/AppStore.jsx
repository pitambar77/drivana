// Mock application store. Replace these actions with API calls when the
// Node/Express/MongoDB backend is ready — the component layer only talks to `useStore()`.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildSeed } from '../data/seed';
import { normId, uid } from '../utils/format';
import { PLANS } from '../config/site';
import { buildFinanceRecords, withFinanceDemo } from '../utils/finance';

const KEY = 'autodealer-demo-state-v1';
const Ctx = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.version === 3) return withFinanceDemo(s);
    }
  } catch {
    /* storage unavailable — use fresh seed */
  }
  return withFinanceDemo(buildSeed());
}

/** Listing statuses that count as "active" for the one-listing rule and duplicate checks. */
export const ACTIVE_STATUSES = ['live', 'pending_payment', 'draft', 'suspended'];

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try {
      // Photos are data URLs; drop very large ones before persisting to stay under quota.
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota or private mode — state still works in memory */
    }
  }, [state]);

  const actions = useMemo(() => {
    const now = () => new Date().toISOString();
    const actorName = (s) => s.users.find((u) => u.id === s.session?.userId)?.name || 'System';
    const withAudit = (s, entry) => ({
      ...s,
      audit: [{ id: uid('a'), at: now(), actor: actorName(s), actorRole: s.session?.role || 'system', ...entry }, ...s.audit],
    });
    const patchVehicle = (s, id, patch) => ({ ...s, vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)) });

    const aggregateDocStatus = (docs) => {
      if (!docs.length) return 'not_submitted';
      if (docs.some((d) => d.status === 'flagged')) return 'flagged';
      if (docs.some((d) => d.status === 'rejected')) return 'rejected';
      if (docs.some((d) => d.status === 'pending')) return 'pending';
      return 'verified';
    };
    const syncUserDocs = (s, userId) => {
      const docs = s.documents.filter((d) => d.userId === userId);
      return { ...s, users: s.users.map((u) => (u.id === userId ? { ...u, docStatus: aggregateDocStatus(docs) } : u)) };
    };

    return {
      reset() {
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
        setState(withFinanceDemo(buildSeed()));
      },

      // ── Session (mock auth)
      login(userId) {
        setState((s) => {
          const u = s.users.find((x) => x.id === userId);
          return u ? { ...s, session: { userId: u.id, role: u.role, at: now() } } : s;
        });
      },
      logout() {
        setState((s) => ({ ...s, session: null }));
      },
      findUserByPhone(phone) {
        const n = normId(phone);
        return ref.current.users.find((u) => normId(u.phone) === n);
      },
      registerUser({ phone, role, name, email = '', city = 'Bhubaneswar', ...profile }) {
        const user = {
          id: uid('u'),
          role,
          name: name || 'New member',
          phone,
          email,
          city,
          status: 'active',
          docStatus: 'not_submitted',
          registeredAt: now(),
          ...profile,
        };
        setState((s) => ({ ...s, users: [user, ...s.users] }));
        return user;
      },
      updateUser(id, patch) {
        setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
      },
      setUserStatus(id, status, note) {
        setState((s) =>
          withAudit(
            {
              ...s,
              users: s.users.map((u) => (u.id === id ? { ...u, status } : u)),
              // Suspending a user hides their live listings; reactivating restores only those.
              vehicles: s.vehicles.map((v) => {
                if (v.sellerId !== id) return v;
                if (status === 'suspended' && v.status === 'live') return { ...v, status: 'suspended', suspendedWithUser: true };
                if (status === 'active' && v.suspendedWithUser) return { ...v, status: 'live', suspendedWithUser: false };
                return v;
              }),
            },
            { action: status === 'suspended' ? 'Suspended user' : 'Reactivated user', entityType: 'user', entityId: id, note },
          ),
        );
      },

      // ── Listings
      findDuplicates(data, excludeId) {
        const reg = normId(data.regNumber);
        const vin = normId(data.vin);
        return ref.current.vehicles.filter(
          (v) =>
            v.id !== excludeId &&
            ACTIVE_STATUSES.concat('live').includes(v.status) &&
            ((reg && normId(v.regNumber) === reg) || (vin && normId(v.vin) === vin)),
        ).map((v) => ({
          id: v.id,
          matchedOn: [reg && normId(v.regNumber) === reg && 'registration number', vin && normId(v.vin) === vin && 'VIN / chassis number'].filter(Boolean),
          title: `${v.year} ${v.make} ${v.model}`,
          city: v.city,
          sellerRole: v.sellerRole,
        }));
      },
      saveListing(data, id) {
        const s = ref.current;
        const sellerId = s.session?.userId;
        const me = s.users.find((u) => u.id === sellerId);
        if (id) {
          setState((st) => patchVehicle(st, id, { ...data, updatedAt: now() }));
          return id;
        }
        const newId = `v${Math.floor(2000 + Math.random() * 7000)}`;
        const v = {
          photos: [],
          specs: {},
          ...data,
          id: newId,
          sellerId,
          sellerRole: me?.role,
          status: 'draft',
          verification: 'unverified',
          paymentStatus: 'unpaid',
          featured: false,
          views: 0,
          createdAt: now(),
          publishedAt: null,
        };
        setState((st) => withAudit({ ...st, vehicles: [v, ...st.vehicles] }, { action: 'Created draft listing', entityType: 'listing', entityId: newId }));
        return newId;
      },
      /** Runs validation + duplicate detection. Returns {ok, duplicates}. Never publishes without payment. */
      submitListing(id) {
        const v = ref.current.vehicles.find((x) => x.id === id);
        if (!v) return { ok: false, duplicates: [] };
        const duplicates = actions.findDuplicates(v, id);
        if (duplicates.length) {
          setState((s) =>
            withAudit(patchVehicle(s, id, { status: 'blocked_duplicate', duplicateOf: duplicates.map((d) => d.id) }), {
              action: 'Blocked duplicate',
              entityType: 'listing',
              entityId: id,
              note: `Matches ${duplicates.map((d) => d.id).join(', ')} on ${duplicates[0].matchedOn.join(' & ')}.`,
            }),
          );
          return { ok: false, duplicates };
        }
        setState((s) => patchVehicle(s, id, { status: v.paymentStatus === 'paid' ? 'live' : 'pending_payment', duplicateOf: [] }));
        return { ok: true, duplicates: [] };
      },
      deleteListing(id) {
        setState((s) => withAudit({ ...s, vehicles: s.vehicles.filter((v) => v.id !== id) }, { action: 'Deleted listing', entityType: 'listing', entityId: id }));
      },
      setListingStatus(id, status) {
        setState((s) => withAudit(patchVehicle(s, id, { status }), { action: `Marked listing ${status.replace(/_/g, ' ')}`, entityType: 'listing', entityId: id }));
      },
      moderateListing(id, action, note = '') {
        const map = {
          flag: [{ verification: 'flagged' }, 'Flagged listing'],
          suspend: [{ status: 'suspended' }, 'Suspended listing'],
          remove: [{ status: 'removed' }, 'Removed listing'],
          restore: [{ status: 'live' }, 'Restored listing'],
          verify: [{ verification: 'verified' }, 'Verified listing'],
          unverify: [{ verification: 'unverified' }, 'Cleared verification'],
          keepBlocked: [{}, 'Confirmed duplicate block'],
          releaseDuplicate: [{ status: 'pending_payment', duplicateOf: [] }, 'Released duplicate block'],
        };
        const [patch, label] = map[action];
        setState((s) => withAudit(patchVehicle(s, id, patch), { action: label, entityType: 'listing', entityId: id, note }));
      },
      addNote(listingId, text) {
        setState((s) => ({
          ...s,
          notes: [{ id: uid('n'), listingId, text, at: now(), author: actorName(s) }, ...s.notes],
        }));
      },
      bumpViews(id) {
        setState((s) => patchVehicle(s, id, { views: (s.vehicles.find((v) => v.id === id)?.views || 0) + 1 }));
      },

      // ── Payments (simulated gateway)
      pay({ listingId, planId, method, outcome }) {
        const plan = PLANS.find((p) => p.id === planId);
        const txn = {
          id: `TXN${Math.floor(270000 + Math.random() * 90000)}`,
          gatewayRef: `pay_mock_${Math.random().toString(36).slice(2, 12)}`,
          userId: ref.current.session?.userId,
          listingId,
          planId,
          amount: plan.price,
          gst: Math.round(plan.price * 0.18),
          total: Math.round(plan.price * 1.18),
          method,
          status: outcome, // success | failed | cancelled | pending
          createdAt: now(),
        };
        setState((s) => {
          let next = { ...s, payments: [txn, ...s.payments] };
          const v = s.vehicles.find((x) => x.id === listingId);
          if (v) {
            if (outcome === 'success') {
              next = patchVehicle(next, listingId, {
                paymentStatus: 'paid',
                planId,
                status: 'live',
                publishedAt: now(),
                expiresAt: new Date(Date.now() + plan.validityDays * 864e5).toISOString(),
                featured: planId === 'seller-boost' || v.featured,
              });
              next = withAudit(next, { action: 'Published listing', entityType: 'listing', entityId: listingId, note: `Payment ${txn.id} succeeded — auto-published, awaiting document verification.` });
            } else {
              // failed / cancelled / pending never activate a listing
              next = patchVehicle(next, listingId, { paymentStatus: outcome === 'success' ? 'paid' : outcome, status: 'pending_payment' });
            }
          }
          return next;
        });
        return txn;
      },
      resolvePending(txnId, outcome) {
        const txn = ref.current.payments.find((p) => p.id === txnId);
        if (!txn) return;
        setState((s) => ({ ...s, payments: s.payments.map((p) => (p.id === txnId ? { ...p, status: outcome } : p)) }));
        if (outcome === 'success') {
          const plan = PLANS.find((p) => p.id === txn.planId);
          setState((s) =>
            withAudit(
              patchVehicle(s, txn.listingId, {
                paymentStatus: 'paid',
                status: 'live',
                publishedAt: now(),
                expiresAt: new Date(Date.now() + (plan?.validityDays || 60) * 864e5).toISOString(),
              }),
              { action: 'Published listing', entityType: 'listing', entityId: txn.listingId, note: `Pending payment ${txnId} confirmed.` },
            ),
          );
        } else {
          setState((s) => patchVehicle(s, txn.listingId, { paymentStatus: outcome }));
        }
      },

      // ── Enquiries
      addEnquiry(data) {
        const s = ref.current;
        const v = s.vehicles.find((x) => x.id === data.vehicleId);
        const e = { id: uid('e'), status: 'new', createdAt: now(), sellerId: v?.sellerId, buyerId: s.session?.role === 'buyer' ? s.session.userId : null, channel: 'form', ...data };
        setState((st) => ({ ...st, enquiries: [e, ...st.enquiries] }));
        return e;
      },
      setEnquiryStatus(id, status) {
        setState((s) => ({ ...s, enquiries: s.enquiries.map((e) => (e.id === id ? { ...e, status } : e)) }));
      },

      // ── Documents
      uploadDocument(doc) {
        const d = { id: uid('d'), status: 'pending', uploadedAt: now(), reviewNote: '', ...doc };
        setState((s) => {
          const others = s.documents.filter((x) => !(x.userId === d.userId && x.type === d.type));
          return syncUserDocs({ ...s, documents: [d, ...others] }, d.userId);
        });
        return d;
      },
      removeDocument(id) {
        setState((s) => {
          const d = s.documents.find((x) => x.id === id);
          return syncUserDocs({ ...s, documents: s.documents.filter((x) => x.id !== id) }, d?.userId);
        });
      },
      reviewDocument(id, status, note = '') {
        setState((s) => {
          const d = s.documents.find((x) => x.id === id);
          let next = { ...s, documents: s.documents.map((x) => (x.id === id ? { ...x, status, reviewNote: note, reviewedAt: now() } : x)) };
          next = syncUserDocs(next, d.userId);
          return withAudit(next, { action: `${status === 'verified' ? 'Verified' : status === 'rejected' ? 'Rejected' : 'Flagged'} document`, entityType: 'user', entityId: d.userId, note: note || d.label });
        });
      },

      // ── Buyer tools
      toggleSaved(id) {
        setState((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved] }));
      },
      toggleCompare(id) {
        const s = ref.current;
        if (s.compare.includes(id)) {
          setState((st) => ({ ...st, compare: st.compare.filter((x) => x !== id) }));
          return 'removed';
        }
        if (s.compare.length >= 3) return 'full';
        setState((st) => ({ ...st, compare: [...st.compare, id] }));
        return 'added';
      },
      clearCompare() {
        setState((s) => ({ ...s, compare: [] }));
      },
      pushRecent(id) {
        setState((s) => (s.recent[0] === id ? s : { ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12) }));
      },
      addSavedSearch(label, query) {
        setState((s) => ({ ...s, savedSearches: [{ id: uid('ss'), label, query, createdAt: now() }, ...s.savedSearches] }));
      },
      removeSavedSearch(id) {
        setState((s) => ({ ...s, savedSearches: s.savedSearches.filter((x) => x.id !== id) }));
      },
      setBuyerPrefs(p) {
        setState((s) => ({ ...s, buyerPrefs: { ...s.buyerPrefs, ...p } }));
      },

      addReferral({ lenderId, loanAmount, tenureMonths, buyerName, buyerPhone, vehicleId = null }) {
        setState((s) => {
          const lender = s.config.loanProviders.find((l) => l.id === lenderId);
          const r = {
            id: `LR${Math.floor(6000 + Math.random() * 3000)}`,
            lenderId,
            lender: lender?.name || 'Lender',
            buyerId: s.session?.role === 'buyer' ? s.session.userId : null,
            buyerName,
            buyerPhone,
            vehicleId,
            loanAmount,
            tenureMonths,
            status: 'referred',
            commission: 0,
            expectedCommission: Math.round((loanAmount * (lender?.commissionPct || 0)) / 100),
            createdAt: now(),
          };
          return { ...s, referrals: [r, ...s.referrals] };
        });
      },
      setReferralStatus(id, status, note = '') {
        setState((s) => {
          const r0 = s.referrals.find((r) => r.id === id);
          if (!r0 || r0.status === status) return s;
          const at = now();
          const next = {
            ...s,
            referrals: s.referrals.map((r) =>
              r.id === id ? { ...r, status, commission: status === 'disbursed' ? r.expectedCommission : 0, history: [{ status, at, by: r.lender, note }, ...(r.history || [])] } : r,
            ),
          };
          // Leads that came from a finance enquiry keep the selling dealer in the loop.
          if (!r0.enquiryId || !r0.dealerId) return next;
          const label = { contacted: 'contacted the buyer', application: 'started the loan application', sanctioned: 'sanctioned the loan', disbursed: 'paid the loan amount to you', rejected: 'declined the loan', referred: 'reopened the lead' }[status] || status;
          const n = {
            id: uid('nt'),
            at,
            audience: 'dealer',
            recipientId: r0.dealerId,
            recipientName: '',
            channels: ['Dashboard', 'SMS'],
            title: `${r0.lender} ${label}`,
            body: `Loan for ${r0.buyerName} (${r0.id})${note ? ` — ${note}` : ''}.`,
            link: '/dealer/enquiries',
            refId: r0.enquiryId,
          };
          return { ...next, notifications: [n, ...(next.notifications || [])] };
        });
      },

      /** Calculator "Make an enquiry": notifies the selling dealer and the chosen partner bank. */
      submitFinanceEnquiry(input) {
        const s = ref.current;
        let n;
        do n = Math.floor(1100 + Math.random() * 8800);
        while (s.enquiries.some((e) => e.id === `FE-${n}`) || s.referrals.some((r) => r.id === `LR${n}`));
        const id = `FE-${n}`;
        const at = now();
        const buyerId = s.session?.role === 'buyer' ? s.session.userId : null;
        const { enquiry, referral, notifications } = buildFinanceRecords(s, { ...input, buyerId }, { id, at });
        setState((st) =>
          withAudit(
            {
              ...st,
              enquiries: [enquiry, ...st.enquiries],
              referrals: [referral, ...st.referrals],
              notifications: [...notifications, ...(st.notifications || [])],
            },
            { action: 'Finance enquiry sent', entityType: 'listing', entityId: enquiry.vehicleId, note: `${id}: dealer and ${referral.lender} notified (lead ${referral.id}).` },
          ),
        );
        return { enquiry, referral, notifications };
      },

      // ── Agent handover
      updateHandoverStep(handoverId, key, patch) {
        setState((s) => ({
          ...s,
          handovers: s.handovers.map((h) =>
            h.id === handoverId ? { ...h, steps: h.steps.map((st) => (st.key === key ? { ...st, ...patch, updatedAt: now() } : st)) } : h,
          ),
        }));
      },
      setHandoverBuyer(handoverId, buyerName) {
        setState((s) => ({ ...s, handovers: s.handovers.map((h) => (h.id === handoverId ? { ...h, buyerName } : h)) }));
      },
      ensureHandover(vehicleId) {
        const s = ref.current;
        const existing = s.handovers.find((h) => h.vehicleId === vehicleId);
        if (existing) return existing.id;
        const template = s.handovers[0]?.steps || [];
        const h = {
          id: uid('h'),
          vehicleId,
          agentId: s.session?.userId,
          buyerName: '',
          steps: template.map((st) => ({ ...st, status: 'pending', updatedAt: null, note: '' })),
        };
        setState((st) => ({ ...st, handovers: [h, ...st.handovers] }));
        return h.id;
      },

      // ── Platform configuration
      updateConfig(patch) {
        setState((s) => withAudit({ ...s, config: { ...s.config, ...patch } }, { action: 'Updated platform configuration', entityType: 'config', entityId: Object.keys(patch).join(', ') }));
      },
    };
  }, []);

  const value = useMemo(() => {
    const me = state.session ? state.users.find((u) => u.id === state.session.userId) : null;
    return {
      state,
      me,
      role: state.session?.role || null,
      user: (id) => state.users.find((u) => u.id === id),
      vehicle: (id) => state.vehicles.find((v) => v.id === id),
      ...actions,
    };
  }, [state, actions]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

/** Public marketplace only ever shows live listings. */
export const isPublic = (v) => v.status === 'live';
