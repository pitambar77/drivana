import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, ExternalLink, FileText, Globe, Info, KeyRound, ShieldAlert } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Alert, Breadcrumbs, Button, CopyText, Field, Input, Plate } from '../../components/ui';
import { normId, prettyReg } from '../../utils/format';

const REG_RE = /^([A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}|\d{2}BH\d{4}[A-Z]{1,2})$/;

export default function VerifyVehicle() {
  const { state } = useStore();
  const [params] = useSearchParams();
  const [reg, setReg] = useState(params.get('reg') ? prettyReg(params.get('reg')) : '');
  const [touched, setTouched] = useState(false);
  const n = normId(reg);
  const valid = REG_RE.test(n);
  const portal = state.config.verificationPortalUrl;

  return (
    <div>
      <section className="border-b border-mist-200 bg-white">
        <div className="container-page py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Verify a vehicle' }]} className="mb-4" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Before you pay a token amount</p>
              <h1 className="mt-2 text-[30px] font-bold leading-tight md:text-[38px]">Check the car's record on the official government portal</h1>
              <p className="mt-3 max-w-xl text-[15.5px] text-mist-600">
                Registration details — owner count, registration date, fuel, insurance and loan status — are held by the transport department. AutoDealer doesn't look these up for you; you check them yourself on the official site.
              </p>
            </div>
            <div className="card p-5">
              <Field label="Registration number" htmlFor="vv-reg" error={touched && reg && !valid ? 'Use the format OD 02 AB 1234 or 22 BH 1234 AA' : ''} hint="Find it on the number plate or in the listing">
                <Input id="vv-reg" value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} onBlur={() => setTouched(true)} placeholder="OD 02 BK 4471" className="font-mono uppercase" error={touched && reg && !valid} />
              </Field>
              {valid && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-mist-50 px-3 py-2.5">
                  <Plate value={n} />
                  <CopyText text={n} />
                </div>
              )}
              <Button href={portal} className="mt-4 w-full" iconRight={ExternalLink} disabled={!valid}>
                Open {state.config.verificationPortalName.split('—')[0].trim()}
              </Button>
              <p className="mt-2 flex items-start gap-1.5 text-[12px] text-mist-500">
                <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Opens {portal.replace(/^https?:\/\//, '').replace(/\/$/, '')} in a new tab. Verification happens on that external government site, not on AutoDealer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-10 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-bold">How to verify, step by step</h2>
          <ol className="mt-5 space-y-5">
            {[
              ['Copy the registration number', 'Use the number from the listing or the car\'s plate. Copy it exactly — one wrong letter shows a different vehicle.'],
              ['Open the official portal', 'Go to the vehicle-details search on the government portal. Some services ask you to sign in with your mobile number and an OTP from the government.'],
              ['Enter the number and search', 'Fill the captcha the portal shows and submit. You\'ll see the registration record.'],
              ['Compare with the listing and the RC', 'Match the model, fuel, registration date and owner serial number with what the seller told you and with the printed RC.'],
              ['Ask about anything that doesn\'t match', 'If insurance has expired, a loan (hypothecation) is still recorded, or the owner count differs, ask the seller before you go further.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 font-mono text-sm font-semibold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold text-ink-900">{t}</p>
                  <p className="mt-0.5 text-sm text-mist-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-base font-bold">
              <KeyRound className="h-4 w-4 text-accent-600" /> Identifiers to check
            </h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-ink-900">Registration number</dt>
                <dd className="text-mist-600">On the plates, the RC and the listing. Used for the portal search.</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-900">VIN / chassis number</dt>
                <dd className="text-mist-600">17 characters, stamped on the chassis and printed on the RC. The last 5 should match the portal.</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-900">Engine number</dt>
                <dd className="text-mist-600">Stamped on the engine block and printed on the RC.</dd>
              </div>
            </dl>
          </div>
          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-base font-bold">
              <FileText className="h-4 w-4 text-accent-600" /> Ask the seller for
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-700">
              {['Original RC (smart card or book)', 'Valid insurance policy', 'Pollution under control (PUC) certificate', 'Bank NOC if the car had a loan', 'Service history and both keys'].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page pb-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Alert tone="info" icon={Info} title="What AutoDealer checks">
            We block a listing when its registration number or VIN already appears in another active listing, and our team reviews seller documents after a listing goes live. We do not have access to government records.
          </Alert>
          <Alert tone="warn" icon={ShieldAlert} title="Warning signs">
            Pressure to pay a token online before a viewing, a seller who won't show the RC, or a portal record that doesn't match the car. Report the listing to support if you see these.
          </Alert>
        </div>
      </section>
    </div>
  );
}
