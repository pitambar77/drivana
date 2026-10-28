import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, CreditCard, Save, XCircle } from 'lucide-react';
import { Alert, Button, Checkbox, Field, Input, Modal, MockNotice, PhotoUploader, Plate, Select, Stepper, Textarea, useToast, DL } from '../ui';
import { VehicleCard } from './VehicleCard';
import { useStore, ACTIVE_STATUSES } from '../../store/AppStore';
import { BODY_TYPES, CITIES, COLORS, CONDITIONS, FUELS, MAKES, OWNERSHIP, TRANSMISSIONS, findModel, modelsFor } from '../../data/catalog';
import { cn, km, lakh, normId, prettyReg } from '../../utils/format';

const REG_RE = /^([A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}|\d{2}BH\d{4}[A-Z]{1,2})$/;
const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;
const FEATURES = ['Power steering', 'ABS with EBD', 'Rear parking sensors', 'Touchscreen infotainment', 'Apple CarPlay / Android Auto', 'Automatic climate control', 'Cruise control', 'Sunroof', 'Alloy wheels', 'Keyless entry', '360° camera', 'Ventilated seats'];
const thisYear = 2026;
const numStr = (msg, min, max) =>
  z
    .string()
    .trim()
    .min(1, msg)
    .refine((v) => !Number.isNaN(Number(v.replace(/,/g, ''))), 'Enter numbers only')
    .refine((v) => Number(v.replace(/,/g, '')) >= min, `Must be at least ${min.toLocaleString('en-IN')}`)
    .refine((v) => Number(v.replace(/,/g, '')) <= max, `Must be ${max.toLocaleString('en-IN')} or less`);

const schema = z
  .object({
    make: z.string().min(1, 'Choose a brand'),
    model: z.string().min(1, 'Choose a model'),
    variant: z.string().trim().min(1, 'Enter the variant, e.g. VXi or SX (O)'),
    year: z.string().min(1, 'Choose the model year'),
    bodyType: z.string().min(1, 'Choose a body type'),
    color: z.string().min(1, 'Choose a colour'),
    price: numStr('Enter your asking price', 50000, 50000000),
    mileage: numStr('Enter kilometres driven', 0, 500000),
    condition: z.string().min(1, 'Choose the condition'),
    fuel: z.string().min(1, 'Choose the fuel type'),
    transmission: z.string().min(1, 'Choose the transmission'),
    owners: z.string().min(1, 'Choose ownership'),
    city: z.string().min(1, 'Choose the city where the car is'),
    regNumber: z.string().trim().optional(),
    vin: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase())
      .refine((v) => VIN_RE.test(v), 'VIN / chassis number must be 17 characters (letters I, O and Q are not used)'),
    engineNo: z.string().trim().min(6, 'Enter the engine number from the RC'),
    insuranceUntil: z.string().optional(),
    ownerName: z.string().optional(),
    ownerPhone: z.string().optional(),
    ownerRelation: z.string().optional(),
    modifications: z.string().max(400, 'Keep it under 400 characters').optional(),
    authorised: z.boolean().optional(),
    engineCc: z.string().optional(),
    powerBhp: z.string().optional(),
    seats: z.string().min(1, 'Enter seating capacity'),
    mileageKmpl: z.string().optional(),
    features: z.array(z.string()).optional(),
    description: z.string().trim().min(40, 'Write at least 40 characters — buyers skip listings with thin descriptions').max(1500, 'Keep it under 1,500 characters'),
    photos: z.array(z.string()).optional(),
    mode: z.string(),
  })
  .superRefine((d, ctx) => {
    if (d.condition !== 'New') {
      if (!d.regNumber || !REG_RE.test(normId(d.regNumber))) ctx.addIssue({ code: 'custom', path: ['regNumber'], message: 'Enter a valid registration number, e.g. OD 02 AB 1234 or 22 BH 1234 AA' });
    }
    if (d.mode === 'agent') {
      if (!d.ownerName || d.ownerName.trim().length < 3) ctx.addIssue({ code: 'custom', path: ['ownerName'], message: "Enter the registered owner's full name as on the RC" });
      if (!d.ownerPhone || !/^[6-9]\d{4}\s?\d{5}$/.test(d.ownerPhone.trim())) ctx.addIssue({ code: 'custom', path: ['ownerPhone'], message: 'Enter a 10-digit mobile number for the owner' });
      if (!d.authorised) ctx.addIssue({ code: 'custom', path: ['authorised'], message: 'Confirm the owner has authorised you to sell this car' });
    }
  });

const STEP_FIELDS = {
  basics: ['make', 'model', 'variant', 'year', 'bodyType', 'color'],
  pricing: ['price', 'mileage', 'condition', 'fuel', 'transmission', 'owners', 'city'],
  registration: ['regNumber', 'vin', 'engineNo', 'insuranceUntil'],
  owner: ['ownerName', 'ownerPhone', 'ownerRelation', 'modifications', 'authorised'],
  specs: ['engineCc', 'powerBhp', 'seats', 'mileageKmpl', 'features', 'description'],
  photos: ['photos'],
  preview: [],
};
const STEP_LABELS = { basics: 'Make & model', pricing: 'Price & condition', registration: 'Registration', owner: 'Owner details', specs: 'Specs & description', photos: 'Photos', preview: 'Preview & publish' };
const STEP_SHORT = { basics: 'Model', pricing: 'Price', registration: 'Registration', owner: 'Owner', specs: 'Specs', photos: 'Photos', preview: 'Publish' };

function toForm(v, mode) {
  return {
    mode,
    make: v?.make || '',
    model: v?.model || '',
    variant: v?.variant || '',
    year: v?.year ? String(v.year) : '',
    bodyType: v?.bodyType || '',
    color: v?.color || '',
    price: v?.price ? String(v.price) : '',
    mileage: v?.mileage != null ? String(v.mileage) : '',
    condition: v?.condition || (mode === 'dealer' ? '' : 'Used'),
    fuel: v?.fuel || '',
    transmission: v?.transmission || '',
    owners: v?.owners || '',
    city: v?.city || '',
    regNumber: v?.regNumber ? prettyReg(v.regNumber) : '',
    vin: v?.vin || '',
    engineNo: v?.engineNo || '',
    insuranceUntil: v?.insuranceUntil ? v.insuranceUntil.slice(0, 10) : '',
    ownerName: v?.ownerInfo?.name || '',
    ownerPhone: v?.ownerInfo?.phone?.replace(/^\+91\s?/, '') || '',
    ownerRelation: v?.ownerInfo?.relation || 'Registered owner',
    modifications: v?.modifications || '',
    authorised: !!v?.ownerInfo,
    engineCc: v?.specs?.engineCc != null ? String(v.specs.engineCc) : '',
    powerBhp: v?.specs?.powerBhp ? String(v.specs.powerBhp) : '',
    seats: v?.specs?.seats ? String(v.specs.seats) : '',
    mileageKmpl: v?.specs?.mileageKmpl ? String(v.specs.mileageKmpl) : '',
    features: v?.specs?.features || [],
    description: v?.description || '',
    photos: v?.photos || [],
  };
}

function toVehicle(d) {
  const color = COLORS.find((c) => c.name === d.color);
  const n = (s) => (s === '' || s == null ? null : Number(String(s).replace(/,/g, '')));
  return {
    make: d.make,
    model: d.model,
    variant: d.variant.trim(),
    year: Number(d.year),
    bodyType: d.bodyType,
    color: d.color,
    colorHex: color?.hex || '#8A919C',
    price: n(d.price),
    mileage: n(d.mileage),
    condition: d.condition,
    fuel: d.fuel,
    transmission: d.transmission,
    owners: d.owners,
    city: d.city,
    regNumber: d.condition === 'New' ? normId(d.regNumber) : normId(d.regNumber),
    vin: d.vin.toUpperCase(),
    engineNo: d.engineNo.toUpperCase(),
    insuranceUntil: d.insuranceUntil ? new Date(d.insuranceUntil).toISOString() : null,
    ownerInfo: d.mode === 'agent' ? { name: d.ownerName.trim(), phone: `+91 ${d.ownerPhone.trim()}`, relation: d.ownerRelation || 'Registered owner' } : null,
    modifications: d.mode === 'agent' ? (d.modifications || '').trim() : '',
    specs: {
      engineCc: n(d.engineCc),
      powerBhp: n(d.powerBhp),
      seats: n(d.seats),
      mileageKmpl: n(d.mileageKmpl),
      features: d.features || [],
    },
    description: d.description.trim(),
    photos: d.photos || [],
  };
}

/** Which uploaded documents are required before a listing can go to payment. */
export function requiredDocsFor(mode, config) {
  if (mode === 'dealer') return [['business_certificate', 'Business registration certificate', '/dealer/documents']];
  if (mode === 'seller') return [['personal_id', 'Personal ID document', '/seller/identity']];
  return [
    ['personal_id', 'Agent identity document', '/agent/documents'],
    ...(config.agentAuthorizationRequired ? [['owner_authorization', 'Owner authorisation letter', '/agent/documents']] : []),
  ];
}

export function DuplicateModal({ open, onClose, duplicates, regNumber, vin, supportTo = '/support' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="This car is already listed on AutoDealer"
      description="We blocked publication to protect buyers from duplicate or fraudulent listings."
      footer={
        <>
          <Button variant="secondary" to={supportTo}>
            Contact support
          </Button>
          <Button onClick={onClose}>Review my details</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert tone="error" icon={XCircle} title="Publication blocked">
          An active listing uses the same {duplicates?.[0]?.matchedOn.join(' and ')}. Each registration number and VIN can only appear in one active listing.
        </Alert>
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-mist-50 p-3 text-sm">
          <Plate value={regNumber} />
          <span className="font-mono text-[12.5px] text-mist-600">VIN {vin}</span>
        </div>
        <div>
          <p className="mb-2 text-[13px] font-semibold">What you can do</p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-mist-700">
            <li>Check for a typing mistake in the registration number or VIN — compare with the RC.</li>
            <li>If you sold this car to a dealer or listed it before, ask them to remove that listing, or mark yours sold.</li>
            <li>If you believe someone else listed your car without permission, contact support with a photo of your RC. We'll investigate.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default function VehicleFormWizard({ mode, listingId, onCancelTo }) {
  const { state, me, saveListing, submitListing, findDuplicates, vehicle } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const existing = listingId ? vehicle(listingId) : null;
  const steps = ['basics', 'pricing', 'registration', ...(mode === 'agent' ? ['owner'] : []), 'specs', 'photos', 'preview'];
  const [step, setStep] = useState(0);
  const [dups, setDups] = useState(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: toForm(existing, mode), mode: 'onTouched' });

  const make = watch('make');
  const model = watch('model');
  const condition = watch('condition');
  const regNumber = watch('regNumber');
  const vin = watch('vin');

  // Prefill specs from the catalogue when a model is picked on a new listing.
  useEffect(() => {
    const m = findModel(make, model);
    if (!m || existing) return;
    setValue('bodyType', m.body);
    if (!getValues('engineCc')) setValue('engineCc', String(m.cc));
    if (!getValues('powerBhp')) setValue('powerBhp', String(m.bhp));
    if (!getValues('seats')) setValue('seats', String(m.seats));
  }, [make, model, existing, setValue, getValues]);

  // Live duplicate hint on the registration step.
  const liveDups = useMemo(() => {
    const reg = normId(regNumber);
    const v = (vin || '').toUpperCase();
    if (reg.length < 8 && v.length < 17) return [];
    return findDuplicates({ regNumber: reg.length >= 8 ? reg : '', vin: v.length === 17 ? v : '' }, listingId);
  }, [regNumber, vin, findDuplicates, listingId]);

  const docsNeeded = requiredDocsFor(mode, state.config);
  const myDocs = state.documents.filter((d) => d.userId === me?.id);
  const missingDocs = docsNeeded.filter(([type]) => !myDocs.some((d) => d.type === type && d.status !== 'rejected'));

  const key = steps[step];
  const next = async () => {
    const ok = await trigger(STEP_FIELDS[key]);
    if (!ok) {
      toast('Fix the highlighted fields to continue.', { tone: 'error' });
      return;
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const persist = (data) => saveListing(toVehicle(data), listingId);

  const saveDraft = handleSubmit(
    (data) => {
      const id = persist(data);
      toast(existing ? 'Changes saved.' : 'Draft saved. It stays private until you pay and publish.');
      nav(onCancelTo, { replace: true, state: { highlight: id } });
    },
    () => toast('Some fields need attention before saving.', { tone: 'error' }),
  );

  const publish = handleSubmit(
    async (data) => {
      setBusy(true);
      const id = persist(data);
      // Let state flush before the duplicate check reads it.
      await new Promise((r) => setTimeout(r, 60));
      const res = submitListing(id);
      setBusy(false);
      if (!res.ok) {
        setDups({ list: res.duplicates, id });
        return;
      }
      const v = vehicle(id);
      if (existing && existing.paymentStatus === 'paid') {
        toast('Listing updated. Changes are live.');
        nav(onCancelTo);
      } else {
        nav(`/checkout/${id}`, { state: { fromForm: true, wasPaid: v?.paymentStatus === 'paid' } });
      }
    },
    (errs) => {
      const first = Object.keys(errs)[0];
      const stepIdx = steps.findIndex((s) => STEP_FIELDS[s].includes(first));
      if (stepIdx >= 0) setStep(stepIdx);
      toast('Some details are missing or invalid. We took you to the first one.', { tone: 'error' });
    },
  );

  const preview = { ...toVehicle({ ...getValues(), price: getValues('price') || '0', mileage: getValues('mileage') || '0', description: getValues('description') || '' }), id: listingId || 'preview', sellerRole: mode, verification: 'unverified', featured: false, status: 'draft' };
  const years = Array.from({ length: 20 }, (_, i) => String(thisYear - i));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <form onSubmit={(e) => e.preventDefault()} noValidate className="card min-w-0">
        <div className="border-b border-mist-100 px-5 py-4">
          <Stepper steps={steps.map((s) => STEP_SHORT[s])} current={step} onStepClick={setStep} />
          <p className="mt-2 text-[13px] text-mist-500 lg:hidden">
            Step {step + 1} of {steps.length}: <span className="font-semibold text-ink-800">{STEP_LABELS[key]}</span>
          </p>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          {key === 'basics' && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Brand" required error={errors.make?.message} htmlFor="vf-make">
                <Select id="vf-make" {...register('make', { onChange: () => setValue('model', '') })} placeholder="Select brand" options={MAKES} error={errors.make} />
              </Field>
              <Field label="Model" required error={errors.model?.message} htmlFor="vf-model">
                <Select id="vf-model" {...register('model')} placeholder={make ? 'Select model' : 'Select a brand first'} options={make ? modelsFor(make) : []} disabled={!make} error={errors.model} />
              </Field>
              <Field label="Variant" required error={errors.variant?.message} htmlFor="vf-variant" hint={findModel(make, model) ? `Common variants: ${findModel(make, model).variants.join(', ')}` : 'As written on the boot badge or invoice'}>
                <Input id="vf-variant" {...register('variant')} error={errors.variant} placeholder="e.g. ZXi+" list="vf-variants" />
                <datalist id="vf-variants">
                  {(findModel(make, model)?.variants || []).map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </Field>
              <Field label="Model year" required error={errors.year?.message} htmlFor="vf-year">
                <Select id="vf-year" {...register('year')} placeholder="Select year" options={years} error={errors.year} />
              </Field>
              <Field label="Body type" required error={errors.bodyType?.message} htmlFor="vf-body" hint="Filled in from the model; change it if needed">
                <Select id="vf-body" {...register('bodyType')} placeholder="Select body type" options={BODY_TYPES} error={errors.bodyType} />
              </Field>
              <Field label="Colour" required error={errors.color?.message} htmlFor="vf-color">
                <Select id="vf-color" {...register('color')} placeholder="Select colour" options={COLORS.map((c) => c.name)} error={errors.color} />
              </Field>
            </div>
          )}

          {key === 'pricing' && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Asking price" required error={errors.price?.message} htmlFor="vf-price" hint={watch('price') && !errors.price ? `Shown to buyers as ${lakh(Number(String(watch('price')).replace(/,/g, '')))}` : 'Enter the full amount in rupees'}>
                <Input id="vf-price" prefix="₹" inputMode="numeric" {...register('price')} error={errors.price} placeholder="685000" />
              </Field>
              <Field label="Kilometres driven" required error={errors.mileage?.message} htmlFor="vf-km" hint="Read it from the odometer">
                <Input id="vf-km" suffix="km" inputMode="numeric" {...register('mileage')} error={errors.mileage} placeholder="38420" />
              </Field>
              <Field label="Condition" required error={errors.condition?.message} htmlFor="vf-cond">
                <Select id="vf-cond" {...register('condition')} placeholder="Select condition" options={mode === 'dealer' ? CONDITIONS : CONDITIONS.filter((c) => c !== 'New')} error={errors.condition} />
              </Field>
              <Field label="Ownership" required error={errors.owners?.message} htmlFor="vf-own">
                <Select id="vf-own" {...register('owners')} placeholder="Select ownership" options={condition === 'New' ? ['New'] : OWNERSHIP} error={errors.owners} />
              </Field>
              <Field label="Fuel type" required error={errors.fuel?.message} htmlFor="vf-fuel">
                <Select id="vf-fuel" {...register('fuel')} placeholder="Select fuel" options={FUELS} error={errors.fuel} />
              </Field>
              <Field label="Transmission" required error={errors.transmission?.message} htmlFor="vf-trans">
                <Select id="vf-trans" {...register('transmission')} placeholder="Select transmission" options={TRANSMISSIONS} error={errors.transmission} />
              </Field>
              <Field label="Car location" required error={errors.city?.message} htmlFor="vf-city" className="md:col-span-2">
                <Select id="vf-city" {...register('city')} placeholder="Select city" options={CITIES.map((c) => c.name)} error={errors.city} />
              </Field>
            </div>
          )}

          {key === 'registration' && (
            <div className="space-y-4">
              <Alert tone="info" title="Copy these exactly from the Registration Certificate (RC)">
                Buyers use the registration number to check the car on the official government portal. We use it and the VIN to block duplicate listings.
              </Alert>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Registration number" required={condition !== 'New'} optional={condition === 'New'} error={errors.regNumber?.message} htmlFor="vf-reg" hint={condition === 'New' ? 'New cars can be listed before registration' : 'e.g. OD 02 AB 1234'}>
                  <Input id="vf-reg" {...register('regNumber')} error={errors.regNumber} className="font-mono uppercase" placeholder="OD 02 AB 1234" autoCapitalize="characters" />
                </Field>
                <Field label="VIN / chassis number" required error={errors.vin?.message} htmlFor="vf-vin" hint={`${(vin || '').length}/17 characters`}>
                  <Input id="vf-vin" {...register('vin')} error={errors.vin} className="font-mono uppercase" placeholder="MA3EWDE1S00123456" maxLength={17} autoCapitalize="characters" />
                </Field>
                <Field label="Engine number" required error={errors.engineNo?.message} htmlFor="vf-eng">
                  <Input id="vf-eng" {...register('engineNo')} error={errors.engineNo} className="font-mono uppercase" placeholder="K12MN1234567" autoCapitalize="characters" />
                </Field>
                <Field label="Insurance valid until" optional htmlFor="vf-ins">
                  <Input id="vf-ins" type="date" {...register('insuranceUntil')} />
                </Field>
              </div>
              {liveDups.length > 0 && (
                <Alert tone="warn" title="Possible duplicate" icon={AlertTriangle}>
                  This {liveDups[0].matchedOn.join(' and ')} matches an active listing ({liveDups[0].title}, {liveDups[0].city}). You can continue, but publishing will be blocked until it's resolved.
                </Alert>
              )}
              <MockNotice>Try registration <span className="font-mono font-semibold">{prettyReg(state.vehicles.find((v) => v.status === 'live' && v.regNumber)?.regNumber)}</span> to see duplicate detection.</MockNotice>
            </div>
          )}

          {key === 'owner' && (
            <div className="space-y-4">
              <Alert tone="info" title="Owner details stay private">
                Buyers see you as the contact. The owner's details are only visible to you and AutoDealer's verification team.
              </Alert>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Registered owner's name" required error={errors.ownerName?.message} htmlFor="vf-oname" hint="As printed on the RC">
                  <Input id="vf-oname" {...register('ownerName')} error={errors.ownerName} />
                </Field>
                <Field label="Owner's mobile number" required error={errors.ownerPhone?.message} htmlFor="vf-ophone">
                  <Input id="vf-ophone" prefix="+91" inputMode="tel" {...register('ownerPhone')} error={errors.ownerPhone} placeholder="94370 12345" />
                </Field>
                <Field label="Owner type" htmlFor="vf-orel">
                  <Select id="vf-orel" {...register('ownerRelation')} options={['Registered owner', 'Company-owned (authorised signatory)', 'Legal heir of owner']} />
                </Field>
              </div>
              <Field label="Modifications" optional error={errors.modifications?.message} htmlFor="vf-mods" hint="Aftermarket parts, CNG kit, wraps, lift kits. Say whether they're endorsed on the RC.">
                <Textarea id="vf-mods" rows={3} {...register('modifications')} error={errors.modifications} placeholder="e.g. Company-fitted CNG kit, endorsed on RC" />
              </Field>
              <Controller
                control={control}
                name="authorised"
                render={({ field }) => (
                  <div>
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      label="The owner has authorised me to list and sell this vehicle"
                      description={state.config.agentAuthorizationRequired ? 'Upload the signed authorisation letter under ID & authorisation before publishing.' : 'A signed letter is optional under the current policy, but speeds up verification.'}
                    />
                    {errors.authorised && <p className="field-error">{errors.authorised.message}</p>}
                  </div>
                )}
              />
            </div>
          )}

          {key === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Field label="Engine (cc)" htmlFor="vf-cc" hint="0 for electric">
                  <Input id="vf-cc" inputMode="numeric" {...register('engineCc')} />
                </Field>
                <Field label="Power (bhp)" htmlFor="vf-bhp">
                  <Input id="vf-bhp" inputMode="numeric" {...register('powerBhp')} />
                </Field>
                <Field label="Seats" required error={errors.seats?.message} htmlFor="vf-seats">
                  <Input id="vf-seats" inputMode="numeric" {...register('seats')} error={errors.seats} />
                </Field>
                <Field label="Fuel economy" htmlFor="vf-kmpl" optional>
                  <Input id="vf-kmpl" inputMode="decimal" suffix="km/l" {...register('mileageKmpl')} />
                </Field>
              </div>
              <Controller
                control={control}
                name="features"
                render={({ field }) => (
                  <fieldset>
                    <legend className="label">Features</legend>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {FEATURES.map((f) => (
                        <Checkbox
                          key={f}
                          label={f}
                          checked={field.value?.includes(f)}
                          onChange={(e) => field.onChange(e.target.checked ? [...(field.value || []), f] : field.value.filter((x) => x !== f))}
                        />
                      ))}
                    </div>
                  </fieldset>
                )}
              />
              <Field label="Description" required error={errors.description?.message} htmlFor="vf-desc" hint={`${(watch('description') || '').length}/1,500 · Mention service history, accidents, tyres and why you're selling`}>
                <Textarea id="vf-desc" rows={6} {...register('description')} error={errors.description} />
              </Field>
            </div>
          )}

          {key === 'photos' && (
            <div className="space-y-4">
              <Controller control={control} name="photos" render={({ field }) => <PhotoUploader photos={field.value || []} onChange={field.onChange} />} />
              {(watch('photos') || []).length === 0 && (
                <Alert tone="warn" title="Listings with photos get far more calls">
                  You can publish without photos, but add at least the front, side, rear, cabin and odometer. Until you do, buyers see an illustrated placeholder.
                </Alert>
              )}
            </div>
          )}

          {key === 'preview' && (
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-[280px_1fr]">
                <div className="pointer-events-none">
                  <VehicleCard vehicle={preview} />
                </div>
                <DL
                  cols={2}
                  items={[
                    ['Price', lakh(preview.price)],
                    ['Kilometres', km(preview.mileage)],
                    ['Fuel / gearbox', `${preview.fuel} · ${preview.transmission}`],
                    ['Ownership', preview.owners],
                    ['Registration', <Plate key="p" value={preview.regNumber} size="sm" />],
                    ['VIN', <span key="v" className="font-mono text-[12.5px]">{preview.vin}</span>],
                    ['Location', preview.city],
                    ['Photos', `${preview.photos.length} uploaded`],
                    mode === 'agent' && ['Owner (private)', preview.ownerInfo?.name],
                  ]}
                />
              </div>
              <div className="rounded-xl border border-mist-200">
                <p className="border-b border-mist-100 px-4 py-3 text-sm font-bold">Before your listing goes live</p>
                <ul className="divide-y divide-mist-100 text-sm">
                  <li className="flex items-start gap-3 px-4 py-3">
                    {liveDups.length ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad-600" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" />}
                    <span>{liveDups.length ? 'Duplicate check: matches an active listing — publishing will be blocked' : 'Duplicate check: no active listing uses this registration number or VIN'}</span>
                  </li>
                  {docsNeeded.map(([type, label, to]) => {
                    const missing = missingDocs.some(([t]) => t === type);
                    return (
                      <li key={type} className="flex items-start gap-3 px-4 py-3">
                        {missing ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn-600" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" />}
                        <span className="flex-1">
                          {label}: {missing ? 'not uploaded yet' : 'uploaded (review happens after publishing)'}
                          {missing && (
                            <Button variant="ghost" size="sm" to={to} className="ml-1 h-auto px-1 py-0 text-accent-700 underline">
                              Upload now
                            </Button>
                          )}
                        </span>
                      </li>
                    );
                  })}
                  <li className="flex items-start gap-3 px-4 py-3">
                    {existing?.paymentStatus === 'paid' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" /> : <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />}
                    <span>{existing?.paymentStatus === 'paid' ? 'Listing fee: already paid' : 'Listing fee: paid on the next screen. The listing goes live automatically once payment succeeds.'}</span>
                  </li>
                </ul>
              </div>
              {missingDocs.length > 0 && (
                <Alert tone="warn" title="Upload your documents to publish">
                  You can save this as a draft now. Publishing needs the documents above to be uploaded; our team verifies them after the listing goes live.
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-mist-100 bg-mist-50/60 px-5 py-3.5">
          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="secondary" icon={ArrowLeft} onClick={back}>
                Back
              </Button>
            ) : (
              <Button variant="ghost" to={onCancelTo}>
                Cancel
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {key === 'preview' ? (
              <>
                <Button variant="secondary" icon={Save} onClick={saveDraft}>
                  {existing ? 'Save changes' : 'Save as draft'}
                </Button>
                <Button icon={CreditCard} onClick={publish} loading={busy} disabled={missingDocs.length > 0}>
                  {existing?.paymentStatus === 'paid' ? 'Save & keep live' : 'Continue to payment'}
                </Button>
              </>
            ) : (
              <Button iconRight={ArrowRight} onClick={next}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <div className="card p-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-mist-500">Live preview</p>
          <p className="mt-2 font-display text-lg font-bold" style={{ fontStretch: '108%' }}>
            {[watch('year'), make, model].filter(Boolean).join(' ') || 'Your car'}
          </p>
          <p className="text-sm text-mist-500">{watch('variant') || 'Variant'}</p>
          <p className="mt-2 font-display text-xl font-bold num">{watch('price') ? lakh(Number(String(watch('price')).replace(/,/g, ''))) : '₹ —'}</p>
          {regNumber && (
            <div className="mt-3">
              <Plate value={regNumber} size="sm" />
            </div>
          )}
        </div>
        <div className={cn('card p-4 text-[13px] text-mist-600')}>
          <p className="mb-1.5 font-semibold text-ink-900">How publishing works</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Fill in details and check the preview.</li>
            <li>Pay the listing fee.</li>
            <li>Your listing goes live straight away.</li>
            <li>Our team reviews your documents and adds a "Verified" badge.</li>
          </ol>
        </div>
      </aside>

      <DuplicateModal open={!!dups} onClose={() => setDups(null)} duplicates={dups?.list} regNumber={normId(regNumber)} vin={(vin || '').toUpperCase()} supportTo={mode === 'seller' ? '/seller/listing-status' : '/support'} />
    </div>
  );
}

export { ACTIVE_STATUSES };
