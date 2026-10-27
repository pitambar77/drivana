import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send } from 'lucide-react';
import { Button, Field, Input, Textarea, Checkbox, Alert, MockNotice } from '../ui';
import { useStore } from '../../store/AppStore';
import { sleep } from '../../utils/format';

const schema = z.object({
  buyerName: z.string().trim().min(2, 'Enter your name'),
  buyerPhone: z
    .string()
    .trim()
    .regex(/^(\+?91[\s-]?)?[6-9]\d{4}\s?\d{5}$/, 'Enter a 10-digit Indian mobile number'),
  buyerEmail: z.string().trim().email('Enter a valid email').or(z.literal('')),
  message: z.string().trim().min(10, 'Tell the seller a little more (at least 10 characters)').max(600, 'Keep it under 600 characters'),
  testDrive: z.boolean().optional(),
  loanHelp: z.boolean().optional(),
});

/**
 * Enquiry form used on the details page and the dedicated contact screen.
 * simulateFailure → the demo can show the error state on request.
 */
export function EnquiryForm({ vehicle, compact, onSent }) {
  const { me, addEnquiry } = useStore();
  const [sent, setSent] = useState(null);
  const [failed, setFailed] = useState(false);
  const [forceFail, setForceFail] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      buyerName: me?.role === 'buyer' ? me.name : '',
      buyerPhone: me?.role === 'buyer' ? me.phone.replace('+91 ', '') : '',
      buyerEmail: me?.role === 'buyer' ? me.email : '',
      message: `Hi, I'm interested in your ${vehicle.year} ${vehicle.make} ${vehicle.model}. Is it still available?`,
      testDrive: true,
      loanHelp: false,
    },
  });

  const submit = async (data) => {
    setFailed(false);
    await sleep(700);
    if (forceFail) {
      setFailed(true);
      return;
    }
    const extras = [data.testDrive && 'Wants a test drive', data.loanHelp && 'Interested in loan assistance'].filter(Boolean).join(' · ');
    const e = addEnquiry({ vehicleId: vehicle.id, buyerName: data.buyerName, buyerPhone: data.buyerPhone, buyerEmail: data.buyerEmail, message: extras ? `${data.message}\n\n${extras}` : data.message });
    setSent(e);
    onSent?.(e);
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-ok-100 bg-ok-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-ok-600" />
        <h3 className="mt-2 text-base font-bold">Enquiry sent to the seller</h3>
        <p className="mt-1 text-sm text-mist-700">
          Reference <span className="font-mono font-semibold">{sent.id.toUpperCase()}</span>. The seller sees it in their enquiries inbox and usually replies within a day.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => {
            setSent(null);
            reset();
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3.5">
      {failed && (
        <Alert tone="error" title="Your enquiry didn't go through">
          The connection to the server dropped. Your message is still here — try sending it again.
        </Alert>
      )}
      <div className={compact ? 'space-y-3.5' : 'grid gap-3.5 sm:grid-cols-2'}>
        <Field label="Your name" error={errors.buyerName?.message} htmlFor={`en-name-${vehicle.id}`} required>
          <Input id={`en-name-${vehicle.id}`} {...register('buyerName')} error={errors.buyerName} autoComplete="name" />
        </Field>
        <Field label="Mobile number" error={errors.buyerPhone?.message} htmlFor={`en-phone-${vehicle.id}`} required>
          <Input id={`en-phone-${vehicle.id}`} prefix="+91" {...register('buyerPhone')} error={errors.buyerPhone} inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" />
        </Field>
      </div>
      {!compact && (
        <Field label="Email" optional error={errors.buyerEmail?.message} htmlFor={`en-email-${vehicle.id}`}>
          <Input id={`en-email-${vehicle.id}`} type="email" {...register('buyerEmail')} error={errors.buyerEmail} autoComplete="email" />
        </Field>
      )}
      <Field label="Message" error={errors.message?.message} htmlFor={`en-msg-${vehicle.id}`} required>
        <Textarea id={`en-msg-${vehicle.id}`} rows={compact ? 3 : 4} {...register('message')} error={errors.message} />
      </Field>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Checkbox label="I'd like a test drive" {...register('testDrive')} />
        <Checkbox label="Help me with a car loan" {...register('loanHelp')} />
      </div>
      <Button type="submit" className="w-full" loading={isSubmitting} icon={Send}>
        Send enquiry
      </Button>
      <MockNotice>
        Saved to the seller's mock inbox; no SMS or email is sent.{' '}
        <button type="button" className="font-semibold underline" onClick={() => setForceFail((x) => !x)}>
          {forceFail ? 'Simulating a failed send — click to turn off' : 'Simulate a failed send'}
        </button>
      </MockNotice>
    </form>
  );
}
