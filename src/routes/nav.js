import {
  BarChart3, Bell, Car, CreditCard, FileCheck2, FileText, GitCompareArrows, Handshake, Heart, Inbox, LayoutDashboard, Landmark, ListChecks, PlusCircle, Search, Settings, ShieldCheck, UserCog, Users, AlertOctagon,
} from 'lucide-react';

// Sidebar navigation per role. `match` lets nested routes highlight their parent.
export const NAV = {
  dealer: [
    { to: '/dealer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dealer/listings', label: 'Listings', icon: Car, match: ['/dealer/vehicles'] },
    { to: '/dealer/vehicles/new', label: 'Add vehicle', icon: PlusCircle },
    { to: '/dealer/enquiries', label: 'Enquiries', icon: Inbox },
    { to: '/dealer/documents', label: 'Business documents', icon: FileCheck2 },
    { to: '/payments', label: 'Payments', icon: CreditCard, match: ['/checkout'] },
    { to: '/account', label: 'Account', icon: UserCog },
  ],
  seller: [
    { to: '/seller', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/seller/vehicle', label: 'My vehicle', icon: Car },
    { to: '/seller/listing-status', label: 'Listing status', icon: ListChecks },
    { to: '/seller/identity', label: 'Identity verification', icon: ShieldCheck },
    { to: '/payments', label: 'Payments', icon: CreditCard, match: ['/checkout'] },
    { to: '/account', label: 'Account', icon: UserCog },
  ],
  agent: [
    { to: '/agent', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/agent/listings', label: 'Listings & enquiries', icon: Inbox },
    { to: '/agent/vehicles/new', label: 'Add vehicle', icon: PlusCircle, match: ['/agent/vehicles'] },
    { to: '/agent/handover', label: 'Handover tracking', icon: Handshake },
    { to: '/agent/documents', label: 'ID & authorisation', icon: FileCheck2 },
    { to: '/payments', label: 'Payments', icon: CreditCard, match: ['/checkout'] },
    { to: '/account', label: 'Account', icon: UserCog },
  ],
  buyer: [
    { to: '/buyer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/buyer/saved', label: 'Saved cars', icon: Heart },
    { to: '/compare', label: 'Compare', icon: GitCompareArrows },
    { to: '/cars', label: 'Browse cars', icon: Search },
    { to: '/account', label: 'Account', icon: UserCog },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/documents', label: 'Document queue', icon: FileText, badge: 'docs' },
    { to: '/admin/listings', label: 'Listings', icon: Car, badge: 'flags' },
    { to: '/admin/payments', label: 'Payments ledger', icon: CreditCard },
    { to: '/admin/loan-referrals', label: 'Loan referrals', icon: Landmark },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/settings', label: 'Configuration', icon: Settings },
  ],
};

export const ICONS = { Bell, AlertOctagon };

/** Every screen in the brief, used by the demo navigator. */
export const SCREENS = [
  ['Public website', [
    [1, 'Home', '/'], [2, 'Browse / search', '/cars'], [3, 'Vehicle details', '/cars/v1005'], [4, 'Vehicle verification help', '/verify-vehicle'],
    [5, 'Loan calculator', '/loan-calculator'], [6, 'How it works / plans', '/how-it-works'], [7, 'Contact & support', '/support'],
  ]],
  ['Account & payments', [
    [8, 'Role selection', '/register'], [9, 'Phone sign-in', '/signin?role=dealer'], [10, 'OTP verification', '/verify-otp'], [11, 'Account settings', '/account', 'dealer'],
    [12, 'Listing plan & checkout', '/checkout/v1009', 'dealer'], [13, 'Payment result & history', '/payments', 'dealer'],
  ]],
  ['Dealer', [
    [14, 'Dealer dashboard', '/dealer', 'dealer'], [15, 'Business documents', '/dealer/documents', 'dealer'], [16, 'Vehicle form (multi-step)', '/dealer/vehicles/new', 'dealer'],
    [17, 'Listing management', '/dealer/listings', 'dealer'], [18, 'Enquiries', '/dealer/enquiries', 'dealer'],
  ]],
  ['Private seller', [
    [19, 'Seller dashboard', '/seller', 'seller'], [20, 'Identity upload', '/seller/identity', 'seller'], [21, 'Seller vehicle form', '/seller/vehicle', 'seller'], [22, 'Duplicate detection / status', '/seller/listing-status', 'seller'],
  ]],
  ['Agent', [
    [23, 'Agent dashboard', '/agent', 'agent'], [24, 'ID & owner authorisation', '/agent/documents', 'agent'], [25, 'Agent vehicle form', '/agent/vehicles/new', 'agent'],
    [26, 'Ownership / handover tracking', '/agent/handover', 'agent'], [27, 'Listings & enquiries', '/agent/listings', 'agent'],
  ]],
  ['Buyer', [
    [28, 'Buyer sign-in / onboarding', '/buyer/welcome'], [29, 'Buyer dashboard', '/buyer', 'buyer'], [30, 'Saved vehicles', '/buyer/saved', 'buyer'], [31, 'Compare vehicles', '/compare'], [32, 'Contact / enquiry', '/cars/v1005/contact'],
  ]],
  ['Administrator', [
    [33, 'Admin login', '/admin/login'], [34, 'Admin dashboard', '/admin', 'admin'], [35, 'Platform configuration', '/admin/settings', 'admin'], [36, 'User directory', '/admin/users', 'admin'],
    [37, 'Document queue', '/admin/documents', 'admin'], [38, 'Listings moderation', '/admin/listings', 'admin'], [39, 'Listing detail & audit', '/admin/listings/v1003', 'admin'],
    [40, 'Payments ledger', '/admin/payments', 'admin'], [41, 'Loan referrals', '/admin/loan-referrals', 'admin'], [42, 'Reports & monitoring', '/admin/reports', 'admin'],
  ]],
];
