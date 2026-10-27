import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronDown, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Alert, Breadcrumbs, Button, CopyText, Field, Input, MockNotice, Select, Textarea } from '../../components/ui';
import { SITE } from '../../config/site';
import { cn, sleep } from '../../utils/format';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().trim().regex(/^[6-9]\d{4}\s?\d{5}$/, 'Enter a 10-digit mobile number'),
  email: z.string().trim().email('Enter a valid email address'),
  topic: z.string().min(1, 'Choose a topic'),
  listingId: z.string().trim().max(12).optional(),
  message: z.string().trim().min(20, 'Describe the issue in at least 20 characters').max(1000, 'Keep it under 1,000 characters'),
});

const FAQ = [
  ['Why is my listing live but not "verified"?', 'Listings publish as soon as payment succeeds and automatic checks pass. Our team then reviews your documents — usually within two working days — and adds the "Documents verified" badge.'],
  ['My payment failed but money left my account. What now?', 'Failed payments are usually reversed by your bank within 5–7 working days. Your listing stays unpublished. Send us the transaction reference from Payments and we\'ll check with the gateway.'],
  ['Why was my car blocked as a duplicate?', 'Another active listing uses the same registration number or VIN. Check for typos against your RC. If the other listing isn\'t yours, contact us with a photo of your RC.'],
  ['Can a private seller list two cars?', 'No. Private seller accounts can have one active listing. Mark your current car as sold or remove it before listing another. Dealers can list multiple cars.'],
  ['Does Drivana verify the car with the government?', 'No. We link you to the official portal so you can check the registration yourself. We check documents uploaded by sellers, not government records.'],
  ['Is the EMI calculator a loan offer?', 'No. It\'s an estimate. Lenders decide your rate and eligibility after checking your documents.'],
  ['How do buyers pay for the car?', 'Directly to the seller, after inspecting the car and its papers. Drivana doesn\'t handle the car payment.'],
];

export default function Support() {
  const [open, setOpen] = useState(0);
  const [sent, setSent] = useState(null);
  const [failNext, setFailNext] = useState(false);
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { topic: '' } });

  const submit = async (d) => {
    setFailed(false);
    await sleep(800);
    if (failNext) {
      setFailed(true);
      return;
    }
    setSent({ ref: `SR-${Math.floor(100000 + Math.random() * 899999)}`, email: d.email });
    reset();
  };

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: 'Support' }]} className="mb-4" />
      <div className="mb-8 max-w-2xl">
        <h1 className="text-[28px] font-bold md:text-[34px]">How can we help?</h1>
        <p className="mt-1.5 text-mist-600">Questions about a listing, payment or verification? Send us a message or call during support hours.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-5 md:p-6">
          {sent ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-ok-600" />
              <h2 className="mt-3 text-xl font-bold">Message received</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-mist-600">
                Your reference is <span className="font-mono font-semibold text-ink-900">{sent.ref}</span>. We reply to {sent.email} within one working day.
              </p>
              <Button variant="secondary" className="mt-5" onClick={() => setSent(null)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
              <h2 className="text-lg font-bold">Contact support</h2>
              {failed && (
                <Alert tone="error" title="We couldn't send your message">
                  Our support system didn't respond. Your text is still here — try again, or call us on {SITE.supportPhone}.
                </Alert>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="sp-name" error={errors.name?.message} required>
                  <Input id="sp-name" {...register('name')} error={errors.name} autoComplete="name" />
                </Field>
                <Field label="Mobile number" htmlFor="sp-phone" error={errors.phone?.message} required>
                  <Input id="sp-phone" prefix="+91" inputMode="tel" {...register('phone')} error={errors.phone} />
                </Field>
                <Field label="Email" htmlFor="sp-email" error={errors.email?.message} required>
                  <Input id="sp-email" type="email" {...register('email')} error={errors.email} autoComplete="email" />
                </Field>
                <Field label="Topic" htmlFor="sp-topic" error={errors.topic?.message} required>
                  <Select id="sp-topic" {...register('topic')} error={errors.topic} placeholder="Choose a topic" options={['Listing or duplicate block', 'Payment or refund', 'Document verification', 'Report a suspicious listing', 'Account & sign-in', 'Something else']} />
                </Field>
              </div>
              <Field label="Listing ID" optional htmlFor="sp-listing" hint="Shown on the listing page, e.g. V1005">
                <Input id="sp-listing" {...register('listingId')} className="font-mono uppercase" />
              </Field>
              <Field label="Message" htmlFor="sp-msg" error={errors.message?.message} required>
                <Textarea id="sp-msg" rows={5} {...register('message')} error={errors.message} />
              </Field>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <MockNotice className="sm:max-w-sm">
                  Messages aren't delivered anywhere.{' '}
                  <button type="button" onClick={() => setFailNext((x) => !x)} className="font-semibold underline">
                    {failNext ? 'Failure on — turn off' : 'Simulate a failure'}
                  </button>
                </MockNotice>
                <Button type="submit" loading={isSubmitting} icon={Send}>
                  Send message
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="card divide-y divide-mist-100">
            {[
              [Phone, 'Phone', SITE.supportPhone, true],
              [Mail, 'Email', SITE.supportEmail, true],
              [Clock, 'Hours', SITE.supportHours],
              [MapPin, 'Office', SITE.address],
            ].map(([Icon, k, v, copy]) => (
              <div key={k} className="flex items-start gap-3 p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-mist-500">{k}</p>
                  <p className="select-all break-words text-sm font-semibold text-ink-900">{v}</p>
                </div>
                {copy && <CopyText text={v} />}
              </div>
            ))}
          </div>
          <Alert tone="info" title="Reporting fraud">
            If a seller asks for an advance before you see the car, stop and report the listing with its ID. Our team can suspend it while we investigate.
          </Alert>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Frequently asked questions</h2>
        <div className="card divide-y divide-mist-100">
          {FAQ.map(([q, a], i) => (
            <div key={q}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={open === i}>
                <span className="font-semibold text-ink-900">{q}</span>
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-mist-500 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm leading-relaxed text-mist-600">{a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
