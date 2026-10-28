// Central product configuration. Values marked (admin) can be overridden
// from Admin → Platform Configuration; those overrides live in the mock store.

export const SITE = {
  name: 'AutoDealer',
  tagline: 'Cars from verified dealers, owners and agents',
  supportPhone: '+91 80 4718 2290',
  supportEmail: 'support@autodealer.example',
  supportHours: 'Mon–Sat, 9:00 am – 7:00 pm IST',
  address: '4th Floor, Infocity Square, Chandrasekharpur, Bhubaneswar 751024',
  currency: 'INR',
  locale: 'en-IN',
  defaultCountryCode: '+91',
};

export const DEFAULT_CONFIG = {
  // (admin) Official verification portal — buyers are sent here, nothing is checked by AutoDealer
  verificationPortalName: 'Parivahan — VAHAN vehicle details',
  verificationPortalUrl: 'https://parivahan.gov.in/',
  // (admin) Agent owner-authorization policy
  agentAuthorizationRequired: true,
  // (admin) Listing validity
  listingValidityDays: 60,
  // (admin) Providers — sandbox placeholders only
  paymentGateway: { provider: 'Razorpay', mode: 'test', keyId: 'rzp_test_7Hq2LmX93kP9', keySecret: 'sk_test_51NqAbcDeFgH0aR4xY' },
  otpProvider: { provider: 'MSG91', senderId: 'AUTODL', authKey: 'msg91_8823aa7d9c1e44f2b0', templateId: 'otp_login_v2' },
  email: { provider: 'Amazon SES', fromAddress: 'no-reply@autodealer.example', smtpHost: 'email-smtp.ap-south-1.amazonaws.com', smtpPassword: 'BOQx7Ses93LmZ1pK' },
  loanProviders: [
    { id: 'lp1', name: 'Saraswat Auto Finance', commissionPct: 0.75, enabled: true, apiKey: 'saf_live_disabled_9921' },
    { id: 'lp2', name: 'NorthStar Bank Car Loans', commissionPct: 0.6, enabled: true, apiKey: 'nsb_sbx_31ff02a' },
    { id: 'lp3', name: 'Kalinga Credit Co-op', commissionPct: 0.9, enabled: false, apiKey: 'kcc_sbx_77a10c' },
  ],
  defaultInterestRate: 9.25,
};

// Listing plans. Fees are in INR. (admin) configurable in a real backend.
export const PLANS = [
  {
    id: 'seller-basic',
    role: 'seller',
    name: 'Owner Listing',
    price: 499,
    validityDays: 60,
    vehicles: 1,
    features: ['1 active vehicle', '20 photos', 'Listed for 60 days', 'Call & chat enquiries'],
  },
  {
    id: 'seller-boost',
    role: 'seller',
    name: 'Owner Listing + Boost',
    price: 899,
    validityDays: 60,
    vehicles: 1,
    highlight: true,
    features: ['Everything in Owner Listing', 'Top of search for 7 days', '"Featured" badge', 'Priority support'],
  },
  {
    id: 'agent-standard',
    role: 'agent',
    name: 'Agent Listing',
    price: 699,
    validityDays: 60,
    vehicles: 1,
    features: ['Per vehicle', 'Owner details kept private', 'Handover tracker', 'Listed for 60 days'],
  },
  {
    id: 'dealer-single',
    role: 'dealer',
    name: 'Dealer Single',
    price: 599,
    validityDays: 60,
    vehicles: 1,
    features: ['Per vehicle', 'Dealer profile badge', 'Lead inbox', 'Listed for 60 days'],
  },
  {
    id: 'dealer-pro',
    role: 'dealer',
    name: 'Dealer Pro Pack',
    price: 4999,
    validityDays: 60,
    vehicles: 10,
    highlight: true,
    features: ['10 vehicle credits', 'Bulk edit', 'Performance analytics', 'Featured slots ×2'],
  },
];

export const ROLE_META = {
  dealer: { label: 'Dealer', home: '/dealer' },
  seller: { label: 'Private Seller', home: '/seller' },
  agent: { label: 'Agent', home: '/agent' },
  buyer: { label: 'Buyer', home: '/buyer' },
  admin: { label: 'Administrator', home: '/admin' },
};
