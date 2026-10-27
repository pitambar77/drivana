import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FileCheck2, Lock, Phone, Trash2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Badge, Button, ConfirmDialog, DL, Field, Input, MockNotice, Modal, OtpInput, PageHeader, Section, Select, StatusBadge, Toggle, useToast } from '../../components/ui';
import { CITIES } from '../../data/catalog';
import { ROLE_META } from '../../config/site';
import { DEMO_OTP } from '../auth/OtpVerify';
import { date } from '../../utils/format';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')),
  city: z.string().min(1, 'Choose your city'),
  business: z.string().trim().optional(),
  gstin: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.toUpperCase()), 'GSTIN is 15 characters, e.g. 21AAKCK4471M1Z6'),
});

const DOC_PAGE = { dealer: '/dealer/documents', seller: '/seller/identity', agent: '/agent/documents' };

export default function Account() {
  const { me, role, updateUser, logout } = useStore();
  const toast = useToast();
  const [phoneModal, setPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [code, setCode] = useState('');
  const [phoneStep, setPhoneStep] = useState('enter');
  const [phoneErr, setPhoneErr] = useState('');
  const [del, setDel] = useState(false);
  const prefs = me.notifications || { sms: true, email: true, whatsapp: false, weekly: true };
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(schema), defaultValues: { name: me.name, email: me.email || '', city: me.city || '', business: me.business || me.agency || '', gstin: me.gstin || '' } });

  const save = (d) => {
    updateUser(me.id, { name: d.name, email: d.email, city: d.city, ...(role === 'dealer' ? { business: d.business, gstin: d.gstin?.toUpperCase() } : role === 'agent' ? { agency: d.business } : {}) });
    reset(d);
    toast('Profile updated.');
  };

  const sendCode = () => {
    if (!/^[6-9]\d{9}$/.test(newPhone.replace(/\D/g, ''))) return setPhoneErr('Enter a 10-digit mobile number');
    setPhoneErr('');
    setPhoneStep('code');
  };
  const confirmPhone = () => {
    if (code !== DEMO_OTP) return setPhoneErr('That code is incorrect.');
    const d = newPhone.replace(/\D/g, '');
    updateUser(me.id, { phone: `+91 ${d.slice(0, 5)} ${d.slice(5)}` });
    setPhoneModal(false);
    setPhoneStep('enter');
    setCode('');
    setNewPhone('');
    toast('Mobile number changed. Use it next time you sign in.');
  };

  return (
    <div>
      <PageHeader title="Account settings" description="Your profile, sign-in number and notification preferences." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Section title="Personal information">
            <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="ac-name" error={errors.name?.message} required>
                  <Input id="ac-name" {...register('name')} error={errors.name} />
                </Field>
                <Field label="Email" htmlFor="ac-email" error={errors.email?.message} hint="For receipts and verification updates">
                  <Input id="ac-email" type="email" {...register('email')} error={errors.email} />
                </Field>
                <Field label="City" htmlFor="ac-city" error={errors.city?.message} required>
                  <Select id="ac-city" {...register('city')} options={CITIES.map((c) => c.name)} placeholder="Choose city" error={errors.city} />
                </Field>
                {(role === 'dealer' || role === 'agent') && (
                  <Field label={role === 'dealer' ? 'Business name' : 'Agency name'} htmlFor="ac-biz">
                    <Input id="ac-biz" {...register('business')} />
                  </Field>
                )}
                {role === 'dealer' && (
                  <Field label="GSTIN" htmlFor="ac-gst" error={errors.gstin?.message} optional>
                    <Input id="ac-gst" {...register('gstin')} error={errors.gstin} className="font-mono uppercase" />
                  </Field>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" disabled={!isDirty} onClick={() => reset()}>
                  Discard
                </Button>
                <Button type="submit" disabled={!isDirty} loading={isSubmitting}>
                  Save changes
                </Button>
              </div>
            </form>
          </Section>

          <Section title="Notifications" description="How we tell you about enquiries and listing updates.">
            <div className="space-y-4">
              {[
                ['sms', 'SMS for new enquiries', 'Instant text when a buyer contacts you.'],
                ['email', 'Email updates', 'Payment receipts, verification results and expiry reminders.'],
                ['whatsapp', 'WhatsApp alerts', 'Enquiries and reminders on WhatsApp.'],
                ['weekly', 'Weekly performance summary', 'Views and enquiries on your listings each Monday.'],
              ].map(([k, l, d]) => (
                <Toggle key={k} id={`nt-${k}`} label={l} description={d} checked={!!prefs[k]} onChange={(v) => updateUser(me.id, { notifications: { ...prefs, [k]: v } })} />
              ))}
            </div>
          </Section>

          <Section title="Security & account">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Lock className="mt-0.5 h-5 w-5 text-mist-400" />
                <div>
                  <p className="text-sm font-semibold">Sign out everywhere</p>
                  <p className="text-[13px] text-mist-500">Ends sessions on all your devices. You'll sign in again with an OTP.</p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  toast('Signed out of all other devices.', { tone: 'info' });
                }}
              >
                Sign out other devices
              </Button>
            </div>
            <div className="mt-5 flex flex-col gap-4 border-t border-mist-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Trash2 className="mt-0.5 h-5 w-5 text-bad-600" />
                <div>
                  <p className="text-sm font-semibold">Close my account</p>
                  <p className="text-[13px] text-mist-500">Removes your listings from search. Payment records are kept for tax purposes.</p>
                </div>
              </div>
              <Button variant="secondary" className="text-bad-600" onClick={() => setDel(true)}>
                Request account closure
              </Button>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Sign-in number">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-mist-400" />
              <span className="font-mono text-[15px] font-semibold num">{me.phone}</span>
              <Badge tone="green">Verified</Badge>
            </div>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => setPhoneModal(true)}>
              Change number
            </Button>
          </Section>
          <Section title="Account type">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900 text-white">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold">{ROLE_META[role].label}</p>
                <p className="text-[13px] text-mist-500">Member since {date(me.registeredAt)}</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-mist-600">Account type can't be changed. To sell differently, register a new account with another number.</p>
          </Section>
          {role !== 'buyer' && (
            <Section title="Document status">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm">
                  <FileCheck2 className="h-4 w-4 text-mist-400" /> Verification
                </span>
                <StatusBadge status={me.docStatus} />
              </div>
              <DL
                className="mt-4"
                items={[
                  ['Account status', <StatusBadge key="s" status={me.status} />],
                  ['Listings', 'Publish once paid; verification follows'],
                ]}
              />
              <Button to={DOC_PAGE[role]} variant="secondary" size="sm" className="mt-4">
                {me.docStatus === 'not_submitted' ? 'Upload documents' : 'View documents'}
              </Button>
            </Section>
          )}
        </div>
      </div>

      <Modal
        open={phoneModal}
        onClose={() => setPhoneModal(false)}
        title="Change sign-in number"
        description={phoneStep === 'enter' ? "We'll send a code to the new number to confirm it's yours." : `Enter the code sent to +91 ${newPhone}`}
        footer={
          phoneStep === 'enter' ? (
            <Button onClick={sendCode}>Send code</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setPhoneStep('enter')}>
                Edit number
              </Button>
              <Button onClick={confirmPhone}>Confirm new number</Button>
            </>
          )
        }
      >
        {phoneStep === 'enter' ? (
          <Field label="New mobile number" htmlFor="ac-newphone" error={phoneErr}>
            <Input id="ac-newphone" prefix="+91" inputMode="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} error={phoneErr} />
          </Field>
        ) : (
          <div className="space-y-3">
            <OtpInput value={code} onChange={setCode} error={!!phoneErr} />
            {phoneErr && <p className="field-error">{phoneErr}</p>}
            <MockNotice>Use code {DEMO_OTP}.</MockNotice>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={del}
        onClose={() => setDel(false)}
        tone="danger"
        title="Close your account?"
        message="We'll unpublish your listings and close the account after 7 days. Sign in again before then to cancel."
        confirmLabel="Request closure"
        onConfirm={() => {
          toast('Closure requested. Your listings are hidden. (Demo: nothing was deleted.)', { tone: 'info' });
          logout();
        }}
      />
      {me.status === 'suspended' && <Alert tone="error" className="mt-6" title="Account suspended">Contact support to restore access.</Alert>}
    </div>
  );
}
