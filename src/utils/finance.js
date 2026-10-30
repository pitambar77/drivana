// Finance enquiry: one customer submission from the loan calculator creates
//   1. an enquiry in the selling dealer's inbox (type: 'finance'),
//   2. a lead (loan referral) for the partner bank the customer chose,
//   3. notifications to both, recording which channels were used.
// Pure helpers so the store and the demo data build records the same way.
import { calcEmi } from './emi';
import { bankInfo } from '../data/partnerBanks';
import { inr } from './format';

export const sellerDisplayName = (u) => u?.business || u?.agency || u?.name || 'Seller';

/**
 * input: { vehicleId, lenderId, price, downPayment, ratePct, months, buyerName, buyerPhone, buyerEmail,
 *          city, employment, income, callTime, testDrive, exchange, message, buyerId }
 */
export function buildFinanceRecords(state, input, { id, at }) {
  const v = state.vehicles.find((x) => x.id === input.vehicleId);
  const seller = state.users.find((u) => u.id === v?.sellerId);
  const bank = bankInfo(state.config.loanProviders.find((l) => l.id === input.lenderId));
  const calc = calcEmi({ price: input.price, downPayment: input.downPayment, ratePct: input.ratePct, months: input.months });
  const refId = `LR${id.replace(/\D/g, '')}`;
  const title = v ? `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}` : 'car';
  const extras = [input.testDrive && 'a test drive', input.exchange && 'exchanging their current car'].filter(Boolean);

  const finance = {
    lenderId: bank?.id,
    lender: bank?.name,
    price: Number(input.price),
    downPayment: Number(input.downPayment),
    loanAmount: calc.principal,
    ratePct: Number(input.ratePct),
    months: Number(input.months),
    emi: calc.emi,
    employment: input.employment,
    income: input.income || '',
    callTime: input.callTime || 'Any time',
    testDrive: !!input.testDrive,
    exchange: !!input.exchange,
    referralId: refId,
  };

  const message = [
    `Finance enquiry for the ${title}.`,
    `Wants a loan of ${inr(calc.principal)} from ${bank?.name} over ${input.months} months (EMI about ${inr(calc.emi)} at ${Number(input.ratePct).toFixed(2)}%), paying ${inr(input.downPayment)} down.`,
    extras.length ? `Also interested in ${extras.join(' and ')}.` : '',
    input.message ? `Message: “${input.message.trim()}”` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const enquiry = {
    id,
    type: 'finance',
    vehicleId: v?.id,
    sellerId: v?.sellerId,
    buyerId: input.buyerId || null,
    buyerName: input.buyerName.trim(),
    buyerPhone: input.buyerPhone,
    buyerEmail: (input.buyerEmail || '').trim(),
    buyerCity: input.city,
    message,
    channel: 'loan calculator',
    status: 'new',
    finance,
    createdAt: at,
  };

  const referral = {
    id: refId,
    enquiryId: id,
    source: 'calculator',
    lenderId: bank?.id,
    lender: bank?.name,
    buyerId: input.buyerId || null,
    buyerName: enquiry.buyerName,
    buyerPhone: enquiry.buyerPhone,
    buyerEmail: enquiry.buyerEmail,
    buyerCity: input.city,
    vehicleId: v?.id,
    dealerId: v?.sellerId,
    price: finance.price,
    downPayment: finance.downPayment,
    loanAmount: calc.principal,
    ratePct: finance.ratePct,
    tenureMonths: finance.months,
    emi: calc.emi,
    employment: finance.employment,
    income: finance.income,
    callTime: finance.callTime,
    note: (input.message || '').trim(),
    status: 'referred',
    commission: 0,
    expectedCommission: Math.round((calc.principal * (bank?.commissionPct || 0)) / 100),
    createdAt: at,
  };

  const notifications = [
    {
      id: `${id}-dealer`,
      at,
      audience: 'dealer',
      recipientId: v?.sellerId,
      recipientName: sellerDisplayName(seller),
      contact: [seller?.phone, seller?.email].filter(Boolean).join(' · '),
      channels: ['Dashboard', 'SMS', 'Email'],
      title: `New finance enquiry: ${title}`,
      body: `${enquiry.buyerName} wants a ${bank?.short || 'bank'} loan of ${inr(calc.principal)} for your ${title}. ${bank?.name} has also been notified.`,
      link: '/dealer/enquiries',
      refId: id,
    },
    {
      id: `${id}-bank`,
      at,
      audience: 'bank',
      recipientId: bank?.id,
      recipientName: bank?.name,
      contact: [bank?.desk?.email, bank?.desk?.phone].filter(Boolean).join(' · '),
      channels: ['Lead desk', 'Email'],
      title: `New car loan lead ${refId}`,
      body: `${enquiry.buyerName} (${input.city}) wants ${inr(calc.principal)} over ${input.months} months for a ${title} from ${sellerDisplayName(seller)}.`,
      link: `/bank-portal?bank=${bank?.id}&lead=${refId}`,
      refId: id,
    },
  ];

  return { enquiry, referral, notifications };
}

/** Demo record so the dealer inbox and bank lead desk have a finance enquiry to show. */
export function withFinanceDemo(s) {
  let next = { ...s, notifications: s.notifications || [] };
  if (next.enquiries.some((e) => e.id === 'FE-1001')) return next;
  const v = next.vehicles.find((x) => x.id === 'v1005' && x.status === 'live') || next.vehicles.find((x) => x.status === 'live' && x.sellerRole === 'dealer');
  const buyer = next.users.find((u) => u.id === 'u_buyer1');
  const lender = next.config.loanProviders.find((l) => l.id === 'lp2' && l.enabled) || next.config.loanProviders.find((l) => l.enabled);
  if (!v || !buyer || !lender) return next;
  const at = new Date(Date.now() - 26 * 36e5).toISOString();
  const { enquiry, referral, notifications } = buildFinanceRecords(
    next,
    {
      vehicleId: v.id,
      lenderId: lender.id,
      price: v.price,
      downPayment: Math.round((v.price * 0.2) / 10000) * 10000,
      ratePct: bankInfo(lender).rate,
      months: 60,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      buyerEmail: buyer.email,
      city: buyer.city,
      employment: 'Salaried',
      income: '₹50,000 – ₹1 lakh',
      callTime: 'Evening (4–8)',
      testDrive: true,
      message: 'Can I get delivery before the end of the month?',
    },
    { id: 'FE-1001', at },
  );
  next = {
    ...next,
    enquiries: [{ ...enquiry, status: 'contacted' }, ...next.enquiries],
    referrals: [{ ...referral, status: 'contacted', history: [{ status: 'contacted', at: new Date(Date.now() - 20 * 36e5).toISOString(), by: lender.name }] }, ...next.referrals],
    notifications: [...notifications, ...next.notifications],
  };
  return next;
}
