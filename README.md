# Drivana — Car Marketplace Frontend

A complete, responsive car-selling marketplace UI built with **React + Vite + Tailwind CSS**. It covers all **42 screens** from the brief: public website, phone/OTP sign-in, listing checkout, dealer / private-seller / agent / buyer dashboards, and a full admin console.

Everything runs on **local mock data** — no backend is needed. OTP, payments, document review and loan referrals are simulated and clearly labelled "Demo mode" in the UI.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve dist/ locally
npm run build:single # one self-contained HTML file → dist-single/index.html (in-memory router)
```

Requires Node.js 18+.

> When deploying `dist/`, configure your host to fall back to `index.html` for unknown paths (SPA routing). On Netlify add a `_redirects` file with `/* /index.html 200`; on Vercel the default SPA preset works.

## Demo accounts

Sign in at `/signin` with any of these numbers. The OTP is always **246810**.

| Role | Mobile | Lands on |
| --- | --- | --- |
| Dealer (Kalinga Motors) | 98610 21001 | `/dealer` |
| Private seller | 98610 21002 | `/seller` |
| Agent | 98610 21003 | `/agent` |
| Buyer | 98610 21004 | `/buyer` (or `/buyer/welcome`) |
| Admin | `admin@drivana.example` + any 8+ char password | `/admin` (via `/admin/login`) |

Any other mobile number creates a new account for the role you picked.

The floating **"All 42 screens"** button (bottom-left) switches persona and jumps to any screen. It also has **Reset demo data**. Remove `<DemoNavigator />` from `src/main.jsx` before going live.

## Screens and routes

| # | Screen | Route |
| --- | --- | --- |
| 1 | Home / landing | `/` |
| 2 | Browse / search results | `/cars` (filters live in the URL) |
| 3 | Vehicle details | `/cars/:id` |
| 4 | Government verification help | `/verify-vehicle` |
| 5 | Loan / EMI calculator | `/loan-calculator` |
| 6 | How it works / listing plans | `/how-it-works` |
| 7 | Contact / support | `/support` |
| 8 | Role selection | `/register` |
| 9 | Phone sign-in / registration | `/signin?role=dealer` |
| 10 | OTP verification | `/verify-otp` |
| 11 | Account / profile settings | `/account` |
| 12 | Listing plan & checkout | `/checkout/:listingId` |
| 13 | Payment result & history | `/payments/result/:txnId`, `/payments` |
| 14 | Dealer dashboard | `/dealer` |
| 15 | Dealer business documents | `/dealer/documents` |
| 16 | Dealer vehicle form (multi-step) | `/dealer/vehicles/new`, `/dealer/vehicles/:id/edit` |
| 17 | Dealer listing management | `/dealer/listings` |
| 18 | Dealer enquiries | `/dealer/enquiries` |
| 19 | Private seller dashboard | `/seller` |
| 20 | Seller identity upload | `/seller/identity` |
| 21 | Seller vehicle form | `/seller/vehicle` |
| 22 | Duplicate detection / listing status | `/seller/listing-status` |
| 23 | Agent dashboard | `/agent` |
| 24 | Agent ID & owner authorisation | `/agent/documents` |
| 25 | Agent vehicle form | `/agent/vehicles/new` |
| 26 | Ownership / handover tracking | `/agent/handover` |
| 27 | Agent listings & enquiries | `/agent/listings` |
| 28 | Buyer sign-in / onboarding | `/buyer/welcome` |
| 29 | Buyer dashboard | `/buyer` |
| 30 | Saved vehicles | `/buyer/saved` |
| 31 | Compare vehicles | `/compare` |
| 32 | Contact / enquiry interface | `/cars/:id/contact` |
| 33 | Admin login | `/admin/login` |
| 34 | Admin dashboard | `/admin` |
| 35 | Platform configuration | `/admin/settings` |
| 36 | User directory & profiles | `/admin/users` |
| 37 | Document verification queue | `/admin/documents` |
| 38 | Listings directory & moderation | `/admin/listings` |
| 39 | Listing detail & audit trail | `/admin/listings/:id` |
| 40 | Payments & listing-fee ledger | `/admin/payments` |
| 41 | Loan referrals & commissions | `/admin/loan-referrals` |
| 42 | Reports & monitoring | `/admin/reports` |

## Business rules implemented

1. Dealers manage many listings; **private sellers get one active listing** (draft, awaiting payment, live or suspended). The seller form blocks a second car and offers "edit" or "mark as sold".
2. Agents list on behalf of owners; owner details stay private, and the owner-authorisation requirement is a toggle in Admin → Configuration.
3. A listing goes **live only after a successful payment** and passing checks (required documents uploaded + duplicate check). No manual approval step.
4. **Live ≠ verified.** Listing status, payment status and document verification are three separate badges everywhere.
5. **Duplicate registration numbers / VINs are blocked** with an explanation and suggested fixes (seller listing-status page, admin duplicate review).
6. Failed, cancelled and pending payments never activate a listing. Pending payments can be resolved from the result page (simulated bank callback).
7. Admins can flag, suspend, remove and restore listings — each action asks for a reason and lands in the audit trail.
8. Government verification uses an **external, configurable link** (Admin → Configuration → Official verification link).
9. EMI results are estimates with a visible disclaimer. Buyers contact sellers directly; there is no car checkout.

## Project structure

```
src/
  components/
    ui/           Buttons, badges, form fields, modals, toasts, tables, pagination, tabs,
                  stepper, KPI cards, file/photo upload, OTP input, date-range filter, plate
    vehicle/      CarArt (illustrated renders), VehicleCard, Gallery, FilterPanel,
                  EmiWidget, EnquiryForm, VehicleFormWizard (shared by dealer/seller/agent)
    listings/     ListingsManager, EnquiryInbox
    documents/    DocumentCard (upload + review status), DocPreview
    payment/      PaymentSummary, PaymentStatusHero
    charts/       Recharts wrappers (area, bar, line, donut) + date bucketing
    layout/       Logo, DemoNavigator
  layouts/        PublicLayout, DashboardLayout (role sidebars), AuthLayout
  pages/          public/ auth/ account/ dealer/ seller/ agent/ buyer/ admin/
  routes/         AppRoutes, ProtectedRoute (role guard), nav config
  store/          AppStore — mock state + all actions (swap for API calls later)
  data/           catalog.js (makes, models, cities), seed.js (deterministic mock data)
  config/         site.js — brand, plans & fees, default platform config
  utils/          formatting (₹ Lakh/Crore, dates), EMI maths, filters, CSV export
  styles/         Tailwind layers and component classes
tailwind.config.js  Design tokens: ink (navy), accent (blue), mist (neutrals), status colours, fonts
```

## Connecting a backend

All reads and writes go through `useStore()` in `src/store/AppStore.jsx`. Each action (`saveListing`, `submitListing`, `pay`, `uploadDocument`, `reviewDocument`, `moderateListing`, `addEnquiry`, …) maps one-to-one to a future REST endpoint. Replace the body of each action with a `fetch` to your Express API and keep the same signature; pages don't need to change.

Things the backend must enforce (the frontend only mirrors them):

- Role checks on every route (`ProtectedRoute` is UI-only).
- One active listing per private seller; duplicate reg/VIN check with a unique index.
- Publishing only from a verified payment-gateway webhook, never from the client.
- Secrets (gateway, OTP, SMTP, lender keys) live in server env/vault; the config screen should only ever receive masked values.

## Images

Seed listings use illustrated vehicle renders (`CarArt`) so the demo works offline and inside sandboxed previews. Photos uploaded in the vehicle form are stored as data URLs and shown instead. In production, store uploads in S3/Cloudinary and put the URLs in `vehicle.photos`.

Demo state is saved to `localStorage` (key `drivana-demo-state-v3`). Large photo uploads may exceed the browser quota; the app keeps working in memory if that happens.
