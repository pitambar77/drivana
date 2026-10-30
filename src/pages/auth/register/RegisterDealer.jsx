import { useState } from 'react';
import { useStore } from '../../../store/AppStore';
import { Checkbox, Field, FileUpload, RadioCards, Alert } from '../../../components/ui';
import { CITIES, MAKES } from '../../../data/catalog';
import { PLANS } from '../../../config/site';
import { tzs } from '../../../utils/format';
import { ChipsField, LANGUAGES, NavButtons, PhoneVerifyStep, RE, RegisterFrame, ReviewBlock, STATES, SelectField, SuccessPanel, TextField, useWizard } from './RegisterKit';

const STEPS = ['Mobile', 'Business', 'Contact person', 'Showroom', 'Documents', 'Plan & review'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const V = {
  0: (d) => ({ phoneVerified: !d.phoneVerified && 'Verify your mobile number to continue' }),
  1: (d) => ({
    businessName: (d.businessName || '').trim().length < 3 && 'Enter the registered business name',
    businessType: !d.businessType && 'Choose the business type',
    yearEstablished: !(Number(d.yearEstablished) >= 1950 && Number(d.yearEstablished) <= 2026) && 'Enter a year between 1950 and 2026',
    pan: !RE.pan.test((d.pan || '').toUpperCase()) && 'PAN is 10 characters, e.g. AAKCK4471M',
    gstin: d.gstin && !RE.gstin.test(d.gstin.toUpperCase()) && 'GSTIN is 15 characters, e.g. 21AAKCK4471M1Z6',
    website: d.website && !RE.url.test(d.website) && 'Start with https://',
    stockSize: !d.stockSize && 'Tell us roughly how many cars you stock',
  }),
  2: (d) => ({
    name: (d.name || '').trim().length < 3 && "Enter the contact person's full name",
    designation: !(d.designation || '').trim() && 'Enter their designation',
    email: !RE.email.test(d.email || '') && 'Enter a valid email address',
    altPhone: d.altPhone && !RE.mobile.test(d.altPhone.replace(/\D/g, '')) && 'Enter a 10-digit mobile number',
  }),
  3: (d) => ({
    line1: (d.line1 || '').trim().length < 5 && 'Enter the showroom address',
    city: !d.city && 'Choose the city',
    pin: !RE.pin.test(d.pin || '') && 'PIN code is 6 digits',
    days: !(d.days || []).length && 'Choose at least one working day',
    open: !d.open && 'Opening time',
    close: (!d.close || (d.open && d.close <= d.open)) && 'Closing time must be after opening',
  }),
  4: (d) => ({ certificate: !d.certificate && 'Upload your business registration certificate' }),
  5: (d) => ({ terms: !d.terms && 'Accept the terms to create your account', conduct: !d.conduct && 'Confirm the dealer listing standards' }),
};

export default function RegisterDealer() {
  const { registerUser, uploadDocument, login } = useStore();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const w = useWizard({ cc: '+91', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], open: '10:00', close: '19:30', plan: 'dealer-single', brands: [] }, V);
  const d = w.data;
  const next = () => w.validate(step) && setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    if (!w.validate(5)) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    const city = CITIES.find((c) => c.name === d.city);
    const u = registerUser({
      role: 'dealer',
      phone: d.phone,
      name: d.name.trim(),
      email: d.email.trim(),
      city: d.city,
      business: d.businessName.trim(),
      businessType: d.businessType,
      yearEstablished: Number(d.yearEstablished),
      pan: d.pan.toUpperCase(),
      gstin: d.gstin ? d.gstin.toUpperCase() : '',
      website: d.website || '',
      tradeLicence: d.tradeLicence || '',
      stockSize: d.stockSize,
      brands: d.brands,
      designation: d.designation,
      altPhone: d.altPhone || '',
      language: d.language || 'English',
      address: { line1: d.line1, line2: d.line2 || '', landmark: d.landmark || '', city: d.city, state: STATES[city?.state] || '', pin: d.pin, mapLink: d.mapLink || '' },
      hours: { days: d.days, open: d.open, close: d.close },
      preferredPlan: d.plan,
      marketing: !!d.marketing,
    });
    uploadDocument({ userId: u.id, type: 'business_certificate', label: 'Business registration certificate', fileName: d.certificate.fileName, size: d.certificate.size, preview: d.certificate.preview });
    if (d.gstCert) uploadDocument({ userId: u.id, type: 'gst_certificate', label: 'GST registration certificate', fileName: d.gstCert.fileName, size: d.gstCert.size, preview: d.gstCert.preview, maskedNumber: d.gstin?.toUpperCase() });
    login(u.id);
    setBusy(false);
    setDone(true);
  };

  if (done)
    return (
      <SuccessPanel
        role="dealer"
        name={d.name}
        next={[
          ['Business certificate in review', 'Usually 2 working days. Your listings can go live meanwhile.'],
          ['Add your stock', 'Each car goes live as soon as its listing fee is paid.'],
          ['Set up enquiry alerts', 'Choose SMS, email or WhatsApp in Account settings.'],
        ]}
      />
    );

  const state = STATES[CITIES.find((c) => c.name === d.city)?.state];
  const frames = {
    0: ['Verify your business mobile', 'This number signs you in and shows on your listings.', <PhoneVerifyStep key="p" w={w} role="dealer" />],
    1: [
      'Tell us about your business',
      'Must match your registration certificate.',
      <div key="b" className="grid gap-4 sm:grid-cols-2">
        <TextField w={w} k="businessName" label="Registered business name" required className="sm:col-span-2" placeholder="Kalinga Motors Pvt. Ltd." />
        <SelectField w={w} k="businessType" label="Business type" required options={['Sole proprietorship', 'Partnership', 'Private limited company', 'LLP', 'Authorised brand dealership']} />
        <TextField w={w} k="yearEstablished" label="Year established" required inputMode="numeric" placeholder="2012" />
        <TextField w={w} k="pan" label="Business PAN" required inputClass="font-mono uppercase" placeholder="AAKCK4471M" maxLength={10} />
        <TextField w={w} k="gstin" label="GSTIN" optional inputClass="font-mono uppercase" placeholder="21AAKCK4471M1Z6" maxLength={15} />
        <TextField w={w} k="tradeLicence" label="Trade licence number" optional />
        <TextField w={w} k="website" label="Website" optional placeholder="https://" />
        <SelectField w={w} k="stockSize" label="Cars in stock (typical)" required options={['1–10', '11–50', '51–200', 'More than 200']} className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <ChipsField w={w} k="brands" label="Brands you mostly sell" options={MAKES} hint="Optional. Helps buyers find your showroom." />
        </div>
      </div>,
    ],
    2: [
      'Who should buyers and our team contact?',
      'Usually the owner or showroom manager.',
      <div key="c" className="grid gap-4 sm:grid-cols-2">
        <TextField w={w} k="name" label="Full name" required autoComplete="name" />
        <TextField w={w} k="designation" label="Designation" required placeholder="Owner, Sales manager…" />
        <TextField w={w} k="email" label="Work email" required type="email" autoComplete="email" hint="Receipts and verification results go here" />
        <TextField w={w} k="altPhone" label="Alternate mobile" optional inputMode="tel" />
        <SelectField w={w} k="language" label="Preferred language" options={LANGUAGES} placeholder="English" />
      </div>,
    ],
    3: [
      'Where is your showroom?',
      'Shown on your dealer profile so buyers can visit.',
      <div key="a" className="grid gap-4 sm:grid-cols-2">
        <TextField w={w} k="line1" label="Address line 1" required className="sm:col-span-2" placeholder="Plot 42, Patia Industrial Estate" autoComplete="address-line1" />
        <TextField w={w} k="line2" label="Address line 2" optional className="sm:col-span-2" autoComplete="address-line2" />
        <TextField w={w} k="landmark" label="Landmark" optional />
        <SelectField w={w} k="city" label="City" required options={CITIES.map((c) => c.name)} />
        <Field label="State" htmlFor="rg-state" hint="Filled in from the city">
          <input id="rg-state" className="input" value={state || ''} readOnly placeholder="—" />
        </Field>
        <TextField w={w} k="pin" label="PIN code" required inputMode="numeric" maxLength={6} inputClass="font-mono" />
        <TextField w={w} k="mapLink" label="Google Maps link" optional className="sm:col-span-2" placeholder="https://maps.app.goo.gl/…" />
        <div className="sm:col-span-2">
          <ChipsField w={w} k="days" label="Working days" required options={DAYS} />
        </div>
        <TextField w={w} k="open" label="Opens at" required type="time" />
        <TextField w={w} k="close" label="Closes at" required type="time" />
      </div>,
    ],
    4: [
      'Upload your business documents',
      'Reviewed after you start listing. Clear photo or PDF, up to 5 MB.',
      <div key="d" className="space-y-4">
        <Field label="Business registration certificate" required error={w.errors.certificate} hint="Shop & Establishment, Certificate of Incorporation, Udyam or partnership deed">
          <FileUpload value={d.certificate} onChange={(f) => w.set('certificate', f)} id="rg-cert" error={w.errors.certificate} />
        </Field>
        <Field label="GST certificate" optional>
          <FileUpload value={d.gstCert} onChange={(f) => w.set('gstCert', f)} id="rg-gst" />
        </Field>
        <Field label="Showroom photo" optional hint="Shown on your dealer profile">
          <FileUpload value={d.showroomPhoto} onChange={(f) => w.set('showroomPhoto', f)} accept="image/*" id="rg-photo" />
        </Field>
      </div>,
    ],
    5: [
      'Choose a plan and review',
      "You won't be charged now. You pay when you publish each listing.",
      <div key="r" className="space-y-4">
        <RadioCards name="plan" columns={2} value={d.plan} onChange={(v) => w.set('plan', v)} options={PLANS.filter((p) => p.role === 'dealer').map((p) => ({ value: p.id, label: `${p.name} · ${tzs(p.price)}`, description: p.features.slice(0, 2).join(' · ') }))} />
        <ReviewBlock title="Business" onEdit={() => setStep(1)} rows={[['Name', d.businessName], ['Type', d.businessType], ['Since', d.yearEstablished], ['PAN', d.pan?.toUpperCase()], ['GSTIN', d.gstin?.toUpperCase()], ['Stock', d.stockSize]]} />
        <ReviewBlock title="Contact" onEdit={() => setStep(2)} rows={[['Name', d.name], ['Designation', d.designation], ['Email', d.email], ['Mobile', d.phone]]} />
        <ReviewBlock title="Showroom" onEdit={() => setStep(3)} rows={[['Address', [d.line1, d.line2, d.landmark].filter(Boolean).join(', ')], ['City', `${d.city || ''}${state ? `, ${state}` : ''} ${d.pin || ''}`], ['Hours', `${(d.days || []).join(', ')} · ${d.open}–${d.close}`]]} />
        <ReviewBlock title="Documents" onEdit={() => setStep(4)} rows={[['Certificate', d.certificate?.fileName], ['GST certificate', d.gstCert?.fileName || 'Not uploaded'], ['Showroom photo', d.showroomPhoto?.fileName || 'Not uploaded']]} />
        <div className="space-y-2.5">
          <Checkbox checked={!!d.terms} onChange={(e) => w.set('terms', e.target.checked)} label="I accept the Dealer Terms and Privacy Policy" />
          {w.errors.terms && <p className="field-error">{w.errors.terms}</p>}
          <Checkbox checked={!!d.conduct} onChange={(e) => w.set('conduct', e.target.checked)} label="Our listings will show real prices, real photos and the correct registration number" />
          {w.errors.conduct && <p className="field-error">{w.errors.conduct}</p>}
          <Checkbox checked={!!d.marketing} onChange={(e) => w.set('marketing', e.target.checked)} label="Send me tips and offers for dealers (optional)" />
        </div>
        <Alert tone="info">Listings go live as soon as payment succeeds. The "Documents verified" badge appears after we review your certificate.</Alert>
      </div>,
    ],
  };
  const [title, desc, body] = frames[step];
  return (
    <RegisterFrame role="dealer" steps={STEPS} step={step} onJump={setStep} title={title} description={desc} footer={<NavButtons step={step} onBack={back} onNext={step === 5 ? submit : next} nextLabel={step === 5 ? 'Create dealer account' : 'Continue'} loading={busy} />}>
      {body}
    </RegisterFrame>
  );
}
