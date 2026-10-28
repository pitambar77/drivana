import { useState } from 'react';
import { useStore } from '../../../store/AppStore';
import { Alert, Badge, Checkbox, Field, FileUpload } from '../../../components/ui';
import { CITIES } from '../../../data/catalog';
import { ChipsField, NavButtons, PhoneVerifyStep, RE, RegisterFrame, ReviewBlock, STATES, SelectField, SuccessPanel, TextField, ageFrom, useWizard } from './RegisterKit';

const STEPS = ['Mobile', 'Personal details', 'Agency', 'Office address', 'Documents', 'Review'];

export default function RegisterAgent() {
  const { state, registerUser, uploadDocument, login } = useStore();
  const authRequired = state.config.agentAuthorizationRequired;
  const V = {
    0: (d) => ({ phoneVerified: !d.phoneVerified && 'Verify your mobile number to continue' }),
    1: (d) => ({
      name: (d.name || '').trim().length < 3 && 'Enter your full name',
      email: !RE.email.test(d.email || '') && 'Enter a valid email address',
      dob: !d.dob ? 'Enter your date of birth' : ageFrom(d.dob) < 18 && 'Agents must be 18 or older',
      pan: !RE.pan.test((d.pan || '').toUpperCase()) && 'PAN is 10 characters, e.g. ABCDE1234F',
    }),
    2: (d) => ({
      agency: (d.agency || '').trim().length < 3 && 'Enter your agency or trading name',
      experience: !d.experience && 'Choose your experience',
      cities: !(d.cities || []).length && 'Choose at least one city you operate in',
      gstin: d.gstin && !RE.gstin.test(d.gstin.toUpperCase()) && 'GSTIN is 15 characters',
      volume: !d.volume && 'Tell us how many cars you sell a month',
    }),
    3: (d) => ({ line1: (d.line1 || '').trim().length < 5 && 'Enter your office address', city: !d.city && 'Choose the city', pin: !RE.pin.test(d.pin || '') && 'PIN code is 6 digits' }),
    4: (d) => ({ idFile: !d.idFile && 'Upload your ID proof', authFile: authRequired && !d.authFile && 'Policy requires a signed owner authorisation letter' }),
    5: (d) => ({ terms: !d.terms && 'Accept the terms', conduct: !d.conduct && 'Accept the agent code of conduct', consent: !d.consent && 'Confirm you will only list with owner consent' }),
  };
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const w = useWizard({ cc: '+91', cities: [] }, V);
  const d = w.data;
  const next = () => w.validate(step) && setStep((s) => s + 1);

  const submit = async () => {
    if (!w.validate(5)) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    const st = STATES[CITIES.find((c) => c.name === d.city)?.state] || '';
    const u = registerUser({
      role: 'agent',
      phone: d.phone,
      name: d.name.trim(),
      email: d.email.trim(),
      city: d.city,
      dob: d.dob,
      pan: d.pan.toUpperCase(),
      agency: d.agency.trim(),
      experience: d.experience,
      operatingCities: d.cities,
      licenceNo: d.licence || '',
      gstin: d.gstin ? d.gstin.toUpperCase() : '',
      monthlyVolume: d.volume,
      address: { line1: d.line1, line2: d.line2 || '', city: d.city, state: st, pin: d.pin },
    });
    uploadDocument({ userId: u.id, type: 'personal_id', label: 'Agent identity document', fileName: d.idFile.fileName, size: d.idFile.size, preview: d.idFile.preview, maskedNumber: `XXXXX${d.pan.toUpperCase().slice(5)}` });
    if (d.authFile) uploadDocument({ userId: u.id, type: 'owner_authorization', label: 'Owner authorisation letter', fileName: d.authFile.fileName, size: d.authFile.size, preview: d.authFile.preview });
    login(u.id);
    setBusy(false);
    setDone(true);
  };

  if (done)
    return (
      <SuccessPanel
        role="agent"
        name={d.name}
        next={[
          ['ID in review', 'We check your PAN and ID within 2 working days.'],
          ['List an owner\'s car', 'Add the owner\'s details privately; buyers contact you.'],
          ['Track the handover', 'Use the timeline from authorisation to delivery.'],
        ]}
      />
    );

  const frames = {
    0: ['Verify your mobile number', 'Buyers reach you on this number for every car you list.', <PhoneVerifyStep key="p" w={w} role="agent" />],
    1: [
      'Your personal details',
      'Used for identity verification.',
      <div key="b" className="grid gap-4 sm:grid-cols-2">
        <TextField w={w} k="name" label="Full name" required className="sm:col-span-2" autoComplete="name" />
        <TextField w={w} k="email" label="Email" required type="email" autoComplete="email" />
        <TextField w={w} k="dob" label="Date of birth" required type="date" max="2008-12-31" />
        <TextField w={w} k="pan" label="PAN" required inputClass="font-mono uppercase" maxLength={10} placeholder="ABCDE1234F" />
      </div>,
    ],
    2: [
      'About your agency',
      'Shown to buyers on the listings you manage.',
      <div key="c" className="grid gap-4 sm:grid-cols-2">
        <TextField w={w} k="agency" label="Agency / trading name" required className="sm:col-span-2" placeholder="Sameer Car Consultants" />
        <SelectField w={w} k="experience" label="Experience" required options={['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', 'More than 10 years']} />
        <SelectField w={w} k="volume" label="Cars sold per month" required options={['1–5', '6–15', '16–30', 'More than 30']} />
        <TextField w={w} k="licence" label="RTO agent / broker licence no." optional />
        <TextField w={w} k="gstin" label="GSTIN" optional inputClass="font-mono uppercase" maxLength={15} />
        <div className="sm:col-span-2">
          <ChipsField w={w} k="cities" label="Cities you operate in" required options={CITIES.map((c) => c.name)} />
        </div>
      </div>,
    ],
    3: [
      'Office address',
      'Where owners and buyers can meet you.',
      <div key="a" className="grid gap-4 sm:grid-cols-2">
        <TextField w={w} k="line1" label="Address line 1" required className="sm:col-span-2" autoComplete="address-line1" />
        <TextField w={w} k="line2" label="Address line 2" optional className="sm:col-span-2" autoComplete="address-line2" />
        <SelectField w={w} k="city" label="City" required options={CITIES.map((c) => c.name)} />
        <TextField w={w} k="pin" label="PIN code" required inputMode="numeric" maxLength={6} inputClass="font-mono" />
      </div>,
    ],
    4: [
      'Upload documents',
      'Reviewed after you start listing.',
      <div key="d" className="space-y-4">
        <Field label="ID proof (PAN, driving licence or passport)" required error={w.errors.idFile}>
          <FileUpload value={d.idFile} onChange={(f) => w.set('idFile', f)} id="rg-id" error={w.errors.idFile} />
        </Field>
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="label mb-0">Signed owner authorisation letter</span>
            <Badge tone={authRequired ? 'dark' : 'neutral'}>{authRequired ? 'Required by policy' : 'Optional by policy'}</Badge>
          </div>
          <FileUpload value={d.authFile} onChange={(f) => w.set('authFile', f)} id="rg-auth" error={w.errors.authFile} />
          <p className="field-hint">For your first car. You can upload letters for more cars later under ID & authorisation.</p>
        </div>
        <Field label="Agency proof (visiting card, GST or shop licence)" optional>
          <FileUpload value={d.agencyProof} onChange={(f) => w.set('agencyProof', f)} id="rg-agency" />
        </Field>
      </div>,
    ],
    5: [
      'Review and create your account',
      null,
      <div key="r" className="space-y-4">
        <ReviewBlock title="Personal" onEdit={() => setStep(1)} rows={[['Name', d.name], ['Email', d.email], ['PAN', d.pan?.toUpperCase()], ['Mobile', d.phone]]} />
        <ReviewBlock title="Agency" onEdit={() => setStep(2)} rows={[['Agency', d.agency], ['Experience', d.experience], ['Cities', (d.cities || []).join(', ')], ['Volume', d.volume && `${d.volume} cars / month`]]} />
        <ReviewBlock title="Office" onEdit={() => setStep(3)} rows={[['Address', [d.line1, d.line2].filter(Boolean).join(', ')], ['City', `${d.city || ''} ${d.pin || ''}`]]} />
        <ReviewBlock title="Documents" onEdit={() => setStep(4)} rows={[['ID proof', d.idFile?.fileName], ['Owner authorisation', d.authFile?.fileName || 'Not uploaded'], ['Agency proof', d.agencyProof?.fileName || 'Not uploaded']]} />
        <Alert tone="info">Agent listings track the owner → agent → buyer handover. Legal ownership transfer still happens at the RTO.</Alert>
        <div className="space-y-2.5">
          <Checkbox checked={!!d.consent} onChange={(e) => w.set('consent', e.target.checked)} label="I will only list cars whose owners have authorised me" />
          {w.errors.consent && <p className="field-error">{w.errors.consent}</p>}
          <Checkbox checked={!!d.conduct} onChange={(e) => w.set('conduct', e.target.checked)} label="I accept the agent code of conduct (no hidden fees, honest condition reports)" />
          {w.errors.conduct && <p className="field-error">{w.errors.conduct}</p>}
          <Checkbox checked={!!d.terms} onChange={(e) => w.set('terms', e.target.checked)} label="I accept the Terms and Privacy Policy" />
          {w.errors.terms && <p className="field-error">{w.errors.terms}</p>}
        </div>
      </div>,
    ],
  };
  const [title, desc, body] = frames[step];
  return (
    <RegisterFrame role="agent" steps={STEPS} step={step} onJump={setStep} title={title} description={desc} footer={<NavButtons step={step} onBack={() => setStep((s) => s - 1)} onNext={step === 5 ? submit : next} nextLabel={step === 5 ? 'Create agent account' : 'Continue'} loading={busy} />}>
      {body}
    </RegisterFrame>
  );
}
