import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { calcEmi } from '../../utils/emi';
import { inr, lakh } from '../../utils/format';

export function EmiDisclaimer({ className = '' }) {
  return (
    <p className={`flex gap-1.5 text-[12px] leading-relaxed text-mist-500 ${className}`}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      Estimate only. This is not a loan offer or approval. Your actual rate, EMI and eligibility are decided by the lender after checking your documents and credit profile.
    </p>
  );
}

function Range({ id, label, value, min, max, step, onChange, display }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-800">
          {label}
        </label>
        <span className="font-mono text-[13px] font-semibold text-ink-900 num">{display}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-accent-600" />
    </div>
  );
}

/** Compact calculator used on the vehicle details page. */
export function EmiWidget({ price, rate = 9.25 }) {
  const [down, setDown] = useState(Math.round((price * 0.2) / 10000) * 10000);
  const [months, setMonths] = useState(60);
  const r = useMemo(() => calcEmi({ price, downPayment: down, ratePct: rate, months }), [price, down, rate, months]);
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-ink-900 p-4 text-white">
        <p className="text-[12px] font-medium text-ink-200">Estimated EMI</p>
        <p className="font-display text-[28px] font-bold leading-tight num" style={{ fontStretch: '110%' }}>
          {inr(r.emi)}
          <span className="text-sm font-medium text-ink-300"> /month</span>
        </p>
        <p className="mt-1 text-[12px] text-ink-300 num">
          {months} months at {rate}% · loan {lakh(r.principal)}
        </p>
      </div>
      <Range id="emi-down" label="Down payment" value={down} min={0} max={Math.round(price * 0.8)} step={10000} onChange={setDown} display={lakh(down)} />
      <Range id="emi-tenure" label="Tenure" value={months} min={12} max={84} step={12} onChange={setMonths} display={`${months / 12} yrs`} />
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-mist-600">Total interest</span>
        <span className="font-semibold num">{inr(r.totalInterest)}</span>
      </div>
      <Link to={`/loan-calculator?price=${price}&down=${down}&months=${months}`} className="btn btn-sm btn-secondary w-full">
        Open full loan calculator
      </Link>
      <EmiDisclaimer />
    </div>
  );
}

export { Range as RangeInput };
