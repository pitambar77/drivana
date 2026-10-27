import { useState } from 'react';
import { Eye, EyeOff, Globe, KeyRound, Landmark, Mail, MessageSquareText, PlugZap, Scale, Wallet } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Badge, Button, Field, Input, MockNotice, PageHeader, Section, Select, Toggle, useToast } from '../../components/ui';
import { maskSecret, sleep } from '../../utils/format';

/** Masked credential field: shows bullets until revealed; editing replaces the stored value. */
function SecretInput({ id, label, value, onChange, hint }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} htmlFor={id} hint={hint || 'Stored encrypted on the server. Only the last 4 characters are shown.'}>
      <div className="relative">
        <Input id={id} value={show ? value : maskSecret(value)} onChange={(e) => show && onChange(e.target.value)} readOnly={!show} className="pr-10 font-mono text-[13px]" autoComplete="off" spellCheck={false} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-mist-500 hover:text-ink-900" aria-label={show ? `Hide ${label}` : `Reveal ${label} to edit`}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
}

function SaveBar({ dirty, onSave, onReset, onTest, testing }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-mist-100 pt-4">
      {onTest && (
        <Button variant="ghost" icon={PlugZap} onClick={onTest} loading={testing} className="mr-auto">
          Test connection
        </Button>
      )}
      <Button variant="secondary" disabled={!dirty} onClick={onReset}>
        Discard
      </Button>
      <Button disabled={!dirty} onClick={onSave}>
        Save
      </Button>
    </div>
  );
}

function useSection(key) {
  const { state, updateConfig } = useStore();
  const toast = useToast();
  const [draft, setDraft] = useState(state.config[key]);
  const [testing, setTesting] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.config[key]);
  return {
    draft,
    set: (patch) => setDraft((d) => (typeof d === 'object' && !Array.isArray(d) ? { ...d, ...patch } : patch)),
    setDraft,
    dirty,
    save: () => {
      updateConfig({ [key]: draft });
      toast('Configuration saved.');
    },
    reset: () => setDraft(state.config[key]),
    test: async () => {
      setTesting(true);
      await sleep(900);
      setTesting(false);
      toast('Sandbox responded with 200 OK (simulated).', { tone: 'info', title: 'Connection test' });
    },
    testing,
  };
}

export default function AdminSettings() {
  const { state, updateConfig } = useStore();
  const toast = useToast();
  const pg = useSection('paymentGateway');
  const otp = useSection('otpProvider');
  const em = useSection('email');
  const lp = useSection('loanProviders');
  const [ver, setVer] = useState({ name: state.config.verificationPortalName, url: state.config.verificationPortalUrl });
  const [verErr, setVerErr] = useState('');
  const [policy, setPolicy] = useState({ agentAuthorizationRequired: state.config.agentAuthorizationRequired, listingValidityDays: state.config.listingValidityDays, defaultInterestRate: state.config.defaultInterestRate });

  const saveVer = () => {
    try {
      const u = new URL(ver.url);
      if (u.protocol !== 'https:') throw new Error('https');
    } catch {
      setVerErr('Enter a full https:// address for the official portal');
      return;
    }
    setVerErr('');
    updateConfig({ verificationPortalName: ver.name, verificationPortalUrl: ver.url });
    toast('Verification link updated. Buyers see it on the verification page.');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Platform configuration" description="Providers, credentials, policies and official links. Changes are recorded in the audit trail." />
      <MockNotice>These are sandbox placeholders. A real deployment loads secrets from the server's vault and never sends them to the browser.</MockNotice>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title={<span className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Payment gateway</span>} actions={<Badge tone={pg.draft.mode === 'live' ? 'red' : 'amber'}>{pg.draft.mode === 'live' ? 'Live mode' : 'Test mode'}</Badge>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Provider" htmlFor="pg-prov">
              <Select id="pg-prov" value={pg.draft.provider} onChange={(e) => pg.set({ provider: e.target.value })} options={['Razorpay', 'Cashfree', 'PayU', 'Stripe']} />
            </Field>
            <Field label="Mode" htmlFor="pg-mode">
              <Select id="pg-mode" value={pg.draft.mode} onChange={(e) => pg.set({ mode: e.target.value })} options={[{ value: 'test', label: 'Test (sandbox)' }, { value: 'live', label: 'Live' }]} />
            </Field>
            <SecretInput id="pg-key" label="Key ID" value={pg.draft.keyId} onChange={(v) => pg.set({ keyId: v })} hint="Public key used by checkout" />
            <SecretInput id="pg-secret" label="Key secret" value={pg.draft.keySecret} onChange={(v) => pg.set({ keySecret: v })} />
          </div>
          {pg.draft.mode === 'live' && <Alert tone="warn" className="mt-4" title="Live mode charges real money">Only switch once the backend webhook is verified.</Alert>}
          <SaveBar dirty={pg.dirty} onSave={pg.save} onReset={pg.reset} onTest={pg.test} testing={pg.testing} />
        </Section>

        <Section title={<span className="flex items-center gap-2"><MessageSquareText className="h-4 w-4" /> OTP / SMS provider</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Provider" htmlFor="otp-prov">
              <Select id="otp-prov" value={otp.draft.provider} onChange={(e) => otp.set({ provider: e.target.value })} options={['MSG91', 'Twilio Verify', '2Factor', 'Gupshup']} />
            </Field>
            <Field label="Sender ID" htmlFor="otp-sender" hint="6 characters, DLT-registered">
              <Input id="otp-sender" value={otp.draft.senderId} maxLength={6} onChange={(e) => otp.set({ senderId: e.target.value.toUpperCase() })} className="font-mono uppercase" />
            </Field>
            <SecretInput id="otp-key" label="Auth key" value={otp.draft.authKey} onChange={(v) => otp.set({ authKey: v })} />
            <Field label="Template ID" htmlFor="otp-tpl">
              <Input id="otp-tpl" value={otp.draft.templateId} onChange={(e) => otp.set({ templateId: e.target.value })} className="font-mono text-[13px]" />
            </Field>
          </div>
          <SaveBar dirty={otp.dirty} onSave={otp.save} onReset={otp.reset} onTest={otp.test} testing={otp.testing} />
        </Section>

        <Section title={<span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Provider" htmlFor="em-prov">
              <Select id="em-prov" value={em.draft.provider} onChange={(e) => em.set({ provider: e.target.value })} options={['Amazon SES', 'SendGrid', 'Postmark', 'SMTP']} />
            </Field>
            <Field label="From address" htmlFor="em-from">
              <Input id="em-from" type="email" value={em.draft.fromAddress} onChange={(e) => em.set({ fromAddress: e.target.value })} />
            </Field>
            <Field label="SMTP host" htmlFor="em-host">
              <Input id="em-host" value={em.draft.smtpHost} onChange={(e) => em.set({ smtpHost: e.target.value })} className="font-mono text-[13px]" />
            </Field>
            <SecretInput id="em-pass" label="SMTP password" value={em.draft.smtpPassword} onChange={(v) => em.set({ smtpPassword: v })} />
          </div>
          <SaveBar dirty={em.dirty} onSave={em.save} onReset={em.reset} onTest={em.test} testing={em.testing} />
        </Section>

        <Section title={<span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Official verification link</span>} description="Where buyers are sent to check a registration. Verification happens on that external site.">
          <div className="space-y-4">
            <Field label="Portal name" htmlFor="ver-name">
              <Input id="ver-name" value={ver.name} onChange={(e) => setVer({ ...ver, name: e.target.value })} />
            </Field>
            <Field label="Portal URL" htmlFor="ver-url" error={verErr}>
              <Input id="ver-url" type="url" value={ver.url} onChange={(e) => setVer({ ...ver, url: e.target.value })} error={verErr} className="font-mono text-[13px]" />
            </Field>
          </div>
          <SaveBar dirty={ver.name !== state.config.verificationPortalName || ver.url !== state.config.verificationPortalUrl} onSave={saveVer} onReset={() => setVer({ name: state.config.verificationPortalName, url: state.config.verificationPortalUrl })} />
        </Section>
      </div>

      <Section title={<span className="flex items-center gap-2"><Landmark className="h-4 w-4" /> Loan providers</span>} description="Lending partners shown on the EMI calculator. Commission is a % of the disbursed loan.">
        <div className="space-y-3">
          {lp.draft.map((l, i) => (
            <div key={l.id} className="grid items-end gap-3 rounded-xl border border-mist-200 p-4 md:grid-cols-[1.4fr_120px_1.2fr_auto]">
              <Field label="Lender" htmlFor={`lp-name-${l.id}`}>
                <Input id={`lp-name-${l.id}`} value={l.name} onChange={(e) => lp.setDraft(lp.draft.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              </Field>
              <Field label="Commission" htmlFor={`lp-pct-${l.id}`}>
                <Input id={`lp-pct-${l.id}`} type="number" step="0.05" min="0" max="5" suffix="%" value={l.commissionPct} onChange={(e) => lp.setDraft(lp.draft.map((x, j) => (j === i ? { ...x, commissionPct: Number(e.target.value) } : x)))} />
              </Field>
              <SecretInput id={`lp-key-${l.id}`} label="API key" value={l.apiKey} onChange={(v) => lp.setDraft(lp.draft.map((x, j) => (j === i ? { ...x, apiKey: v } : x)))} hint=" " />
              <div className="pb-2">
                <Toggle id={`lp-on-${l.id}`} label="Enabled" checked={l.enabled} onChange={(v) => lp.setDraft(lp.draft.map((x, j) => (j === i ? { ...x, enabled: v } : x)))} />
              </div>
            </div>
          ))}
        </div>
        <SaveBar dirty={lp.dirty} onSave={lp.save} onReset={lp.reset} />
      </Section>

      <Section title={<span className="flex items-center gap-2"><Scale className="h-4 w-4" /> Marketplace policies</span>}>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr_1fr]">
          <Toggle
            id="pol-auth"
            label="Require owner authorisation for agents"
            description="When on, agents must upload a signed owner letter before an agent listing can be paid for and published."
            checked={policy.agentAuthorizationRequired}
            onChange={(v) => setPolicy({ ...policy, agentAuthorizationRequired: v })}
          />
          <Field label="Listing validity" htmlFor="pol-days" hint="Days a paid listing stays live">
            <Input id="pol-days" type="number" min={7} max={180} suffix="days" value={policy.listingValidityDays} onChange={(e) => setPolicy({ ...policy, listingValidityDays: Number(e.target.value) })} />
          </Field>
          <Field label="Default EMI interest rate" htmlFor="pol-rate" hint="Pre-filled on the loan calculator">
            <Input id="pol-rate" type="number" step="0.05" suffix="% p.a." value={policy.defaultInterestRate} onChange={(e) => setPolicy({ ...policy, defaultInterestRate: Number(e.target.value) })} />
          </Field>
        </div>
        <SaveBar
          dirty={policy.agentAuthorizationRequired !== state.config.agentAuthorizationRequired || policy.listingValidityDays !== state.config.listingValidityDays || policy.defaultInterestRate !== state.config.defaultInterestRate}
          onSave={() => {
            updateConfig(policy);
            toast('Policies saved.');
          }}
          onReset={() => setPolicy({ agentAuthorizationRequired: state.config.agentAuthorizationRequired, listingValidityDays: state.config.listingValidityDays, defaultInterestRate: state.config.defaultInterestRate })}
        />
      </Section>
      <p className="flex items-center gap-2 text-[12.5px] text-mist-500">
        <KeyRound className="h-4 w-4" /> Rotate secrets every 90 days. Revealing a secret is logged with your name.
      </p>
    </div>
  );
}
