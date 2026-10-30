// Partner bank details shown on the loan calculator and the partner lead desk.
// Which banks appear (and their commission) is controlled in Admin → Configuration → Loan providers;
// this file adds the customer-facing facts. Banks added in admin without an entry here get DEFAULT_BANK.

export const BANK_INFO = {
  lp1: {
    short: 'Saraswat',
    tagline: 'Car loans for salaried and self-employed buyers, new and used cars.',
    rate: 9.1,
    processingFee: '0.5% of the loan (min TSh 75,000)',
    maxFundingPct: 85,
    maxMonths: 84,
    decision: 'Eligibility call within 4 working hours',
    desk: { name: 'Auto loan desk', phone: '+91 22 6120 4400', email: 'autoloans@saraswat-auto.example' },
    eligibility: ['Age 21–65 years', 'Salaried: TSh 600,000+ monthly take-home', 'Self-employed: 2 years of ITR', 'Car up to 8 years old at loan end'],
    documents: ['PAN card and Aadhaar', 'Last 3 months’ salary slips or 2 years’ ITR', 'Last 6 months’ bank statement', 'Car proforma invoice or RC copy (from the dealer)'],
  },
  lp2: {
    short: 'NorthStar',
    tagline: 'Fast digital approvals with doorstep document pickup.',
    rate: 8.85,
    processingFee: 'Flat TSh 150,000',
    maxFundingPct: 90,
    maxMonths: 84,
    decision: 'In-principle approval within 1 working day',
    desk: { name: 'Car loans team', phone: '+91 80 4718 9000', email: 'carloans@northstarbank.example' },
    eligibility: ['Age 21–60 years', 'Salaried: TSh 750,000+ monthly take-home', 'Self-employed: 3 years in business', 'Credit score 700 or above preferred'],
    documents: ['PAN card and Aadhaar', 'Last 3 months’ salary slips or 2 years’ ITR', 'Last 3 months’ bank statement', 'Car proforma invoice or RC copy (from the dealer)'],
  },
  lp3: {
    short: 'Kalinga Co-op',
    tagline: 'Co-operative credit for buyers in Odisha.',
    rate: 9.6,
    processingFee: '0.75% of the loan',
    maxFundingPct: 80,
    maxMonths: 60,
    decision: 'Branch call within 2 working days',
    desk: { name: 'Loans branch', phone: '+91 674 255 0110', email: 'loans@kalingacoop.example' },
    eligibility: ['Age 21–60 years', 'Resident of Odisha', 'Member of the co-operative (can join while applying)'],
    documents: ['PAN card and Aadhaar', 'Income proof', 'Last 6 months’ bank statement', 'Car proforma invoice or RC copy'],
  },
};

export const DEFAULT_BANK = {
  tagline: 'Car loans from one of our lending partners.',
  rate: 9.5,
  processingFee: 'Shared on the call',
  maxFundingPct: 80,
  maxMonths: 84,
  decision: 'Call within 1–2 working days',
  desk: { name: 'Loan desk', phone: '', email: '' },
  eligibility: ['Age 21–60 years', 'Regular income proof'],
  documents: ['PAN card and Aadhaar', 'Income proof', 'Bank statement', 'Car invoice or RC copy'],
};

/** A configured loan provider merged with its customer-facing details. */
export const bankInfo = (lender) => (lender ? { ...DEFAULT_BANK, short: lender.name.split(' ')[0], ...BANK_INFO[lender.id], ...lender } : null);

/** Enabled partner banks, best indicative rate first. */
export const partnerBanks = (config) => config.loanProviders.filter((l) => l.enabled).map(bankInfo).sort((a, b) => a.rate - b.rate);

export const EMPLOYMENT = ['Salaried', 'Self-employed professional', 'Business owner', 'Other'];
export const INCOME = ['Under TSh 750,000', 'TSh 750,000 – 1.5M', 'TSh 1.5M – 3M', 'Over TSh 3M'];
export const CALL_TIMES = ['Any time', 'Morning (9–12)', 'Afternoon (12–4)', 'Evening (4–8)'];

/** Where the bank is in the process, in the order shown to everyone. */
export const LOAN_STEPS = [
  { value: 'referred', label: 'Enquiry received', desc: 'The bank has your details and loan request.' },
  { value: 'contacted', label: 'Bank contacted you', desc: 'Eligibility checked on a call.' },
  { value: 'application', label: 'Application started', desc: 'Documents collected and loan application filed.' },
  { value: 'sanctioned', label: 'Loan sanctioned', desc: 'The bank has approved the loan amount.' },
  { value: 'disbursed', label: 'Paid to the dealer', desc: 'Loan amount released to the dealer. Car ready for delivery.' },
];
