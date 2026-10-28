import { useState } from 'react';
import { useStore } from '../../../store/AppStore';
import { Alert, Checkbox, Field, FileUpload, Input, Select, Toggle } from '../../../components/ui';
import { CITIES } from '../../../data/catalog';
import { ChipsField, LANGUAGES, NavButtons, PhoneVerifyStep, RE, RegisterFrame, ReviewBlock, SelectField, SuccessPanel, TextField, YesNo, ageFrom, useWizard } from './RegisterKit';

const STEPS = ['Mobile', 'Personal details', 'Identity', 'Selling preferences', 'Review'];
const ID_TYPES = ['Driving licence', 'PAN card', 'Passport', 'Voter ID', 'Aadhaar (masked)'];

const V = {
  0: (d) => ({ phoneVerified: !d.phoneVerified && 'Verify your mobile number to continue' }),
  1: (d) => ({
    name: (d.name || '').trim().length < 3 && 'Enter your full name as on the RC',
    email: !RE.email.test(d.email || '') && 'Enter a valid email address',
    dob: !d.dob ? 'Enter your date of birth' : ageFrom(d.dob) < 18 && 'You must be 18 or older to sell a car',
    city: !d.city && 'Choose your city',
    pin: !RE.pin.test(d.pin || '') && 'PIN code is 6 digits',
  }),
  2: (d) => ({
    idType: !d.idType && 'Choose an ID type',
    last4: !/^[0-9A-Z]{4}$/i.test(d.last4 || '') && 'Enter the last 4 characters of the ID number',
    idFile: !d.idFile && 'Upload a photo or scan of your ID',
  }),
  3: (d) => ({ contact: !(d.contact || []).length && 'Choose at least one way buyers can reach you', hasRc: !d.hasRc && 'Let us know if you have the RC' }),
  4: (d) => ({ terms: !d.terms && 'Accept the terms to continue', owner: !d.owner && 'Confirm you are the registered owner', oneListing: !d.oneListing && 'Acknowledge the one-listing rule' }),
};

export default function RegisterSeller() {
  const { registerUser, uploadDocument, login } = useStore();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const w = useWizard({ cc: '+91', idType: 'Driving licence', contact: ['Call', 'WhatsApp'], bestTime: 'Evening (5–9 pm)', hideNumber: false }, V);
  const d = w.data;
  const next = () => w.validate(step) && setStep((s) => s + 1);

  const submit = async () => {
    if (!w.validate(4)) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    const u = registerUser({
      role: 'seller',
      phone: d.phone,
      name: d.name.trim(),
      email: d.email.trim(),
      city: d.city,
      pin: d.pin,
      dob: d.dob,
      language: d.language || 'English',
      contactMethods: d.contact,
      bestTime: d.bestTime,
      hideNumber: d.hideNumber,
      hasRc: d.hasRc,
      hasLoan: d.hasLoan || 'No',
    });
    uploadDocument({ userId: u.id, type: 'personal_id', label: d.idType, fileName: d.idFile.fileName, size: d.idFile.size, preview: d.idFile.preview, maskedNumber: `XXXX XXXX ${d.last4.toUpperCase()}` });
    if (d.video) uploadDocument({ userId: u.id, type: 'verification_video', label: 'Verification video', fileName: d.video.fileName, size: d.video.size });
    login(u.id);
    setBusy(false);
    setDone(true);
  };

  if (done)
    return (
      <SuccessPanel
        role="seller"
        name={d.name}
        next={[
          ['ID in review', 'Usually within 2 working days. You can list your car now.'],
          ['One active listing', 'Mark it sold when you are done to list another car.'],
          ...(d.hasLoan === 'Yes' ? [['Get your bank NOC', 'Buyers will ask for it because the car still has a loan.']] : []),
        ]}
      />
    );

  const frames = {
    0: ['Verify your mobile number', 'Buyers call you on this number. You sign in with it too.', <PhoneVerifyStep key="p" w={w} role="seller" />],
    1: [
      'About you',
      'Use your name exactly as it appears on the RC.',
      <div key="b" className="grid gap-4 sm:grid-cols-2">
        <TextField w={w} k="name" label="Full name" required className="sm:col-span-2" autoComplete="name" />
        <TextField w={w} k="email" label="Email" required type="email" autoComplete="email" />
        <TextField w={w} k="dob" label="Date of birth" required type="date" max="2008-12-31" />
        <SelectField w={w} k="city" label="City" required options={CITIES.map((c) => c.name)} />
        <TextField w={w} k="pin" label="PIN code" required inputMode="numeric" maxLength={6} inputClass="font-mono" />
        <SelectField w={w} k="language" label="Preferred language" options={LANGUAGES} placeholder="English" />
      </div>,
    ],
    2: [
      'Verify your identity',
      'Your ID is only seen by AutoDealer\'s verification team, never by buyers.',
      <div key="c" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ID type" required htmlFor="rg-idType" error={w.errors.idType}>
            <Select id="rg-idType" value={d.idType} onChange={(e) => w.set('idType', e.target.value)} options={ID_TYPES} />
          </Field>
          <Field label="Last 4 characters of ID number" required htmlFor="rg-last4" error={w.errors.last4} hint="We store only these 4">
            <Input id="rg-last4" value={d.last4 || ''} onChange={(e) => w.set('last4', e.target.value.toUpperCase().slice(0, 4))} className="font-mono uppercase" error={w.errors.last4} />
          </Field>
        </div>
        {d.idType?.startsWith('Aadhaar') && <Alert tone="info" title="Upload the masked Aadhaar">It hides the first 8 digits. Download it from the UIDAI website.</Alert>}
        <Field label="ID document" required error={w.errors.idFile}>
          <FileUpload value={d.idFile} onChange={(f) => w.set('idFile', f)} id="rg-idfile" error={w.errors.idFile} />
        </Field>
        <Field label="10-second selfie video holding your ID" optional hint="Gets you verified faster">
          <FileUpload value={d.video} onChange={(f) => w.set('video', f)} accept="video/mp4,video/quicktime,video/webm" kind="video" maxMB={50} id="rg-video" />
        </Field>
      </div>,
    ],
    3: [
      'How should buyers reach you?',
      'You can change these later in Account settings.',
      <div key="d" className="space-y-5">
        <ChipsField w={w} k="contact" label="Contact methods" required options={['Call', 'WhatsApp', 'In-app chat', 'Email']} />
        <SelectField w={w} k="bestTime" label="Best time to call" options={['Morning (9 am–12 pm)', 'Afternoon (12–5 pm)', 'Evening (5–9 pm)', 'Any time']} />
        <Toggle id="rg-hide" label="Hide my number until a buyer verifies their phone" description="Buyers see your number only after confirming theirs with an OTP." checked={!!d.hideNumber} onChange={(v) => w.set('hideNumber', v)} />
        <YesNo w={w} k="hasRc" label="Do you have the original RC with you?" />
        {w.errors.hasRc && <p className="field-error">{w.errors.hasRc}</p>}
        <YesNo w={w} k="hasLoan" label="Is there a loan on the car?" hint="If yes, you'll need a NOC from the bank before transfer." />
      </div>,
    ],
    4: [
      'Review and create your account',
      null,
      <div key="r" className="space-y-4">
        <ReviewBlock title="Personal details" onEdit={() => setStep(1)} rows={[['Name', d.name], ['Email', d.email], ['Date of birth', d.dob], ['City', `${d.city || ''} ${d.pin || ''}`], ['Mobile', d.phone]]} />
        <ReviewBlock title="Identity" onEdit={() => setStep(2)} rows={[['ID', `${d.idType} ending ${d.last4 || ''}`], ['File', d.idFile?.fileName], ['Video', d.video?.fileName || 'Not uploaded']]} />
        <ReviewBlock title="Preferences" onEdit={() => setStep(3)} rows={[['Contact', (d.contact || []).join(', ')], ['Best time', d.bestTime], ['RC with you', d.hasRc], ['Loan on car', d.hasLoan || 'No']]} />
        <div className="space-y-2.5">
          <Checkbox checked={!!d.owner} onChange={(e) => w.set('owner', e.target.checked)} label="I am the registered owner of the car I will list" />
          {w.errors.owner && <p className="field-error">{w.errors.owner}</p>}
          <Checkbox checked={!!d.oneListing} onChange={(e) => w.set('oneListing', e.target.checked)} label="I understand private sellers can have one active listing at a time" />
          {w.errors.oneListing && <p className="field-error">{w.errors.oneListing}</p>}
          <Checkbox checked={!!d.terms} onChange={(e) => w.set('terms', e.target.checked)} label="I accept the Terms and Privacy Policy" />
          {w.errors.terms && <p className="field-error">{w.errors.terms}</p>}
        </div>
      </div>,
    ],
  };
  const [title, desc, body] = frames[step];
  return (
    <RegisterFrame role="seller" steps={STEPS} step={step} onJump={setStep} title={title} description={desc} footer={<NavButtons step={step} onBack={() => setStep((s) => s - 1)} onNext={step === 4 ? submit : next} nextLabel={step === 4 ? 'Create seller account' : 'Continue'} loading={busy} />}>
      {body}
    </RegisterFrame>
  );
}
