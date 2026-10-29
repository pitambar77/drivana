import { forwardRef, useId } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/format';

export function Field({ label, error, hint, required, children, className, htmlFor, optional }) {
  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="text-bad-600"> *</span>}
          {optional && <span className="font-normal text-mist-500"> (optional)</span>}
        </label>
      )}
      {children}
      {error ? <p className="field-error" role="alert">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ className, error, prefix, suffix, ...rest }, ref) {
  if (prefix || suffix) {
    return (
      <div className={cn('flex h-10 items-center overflow-hidden rounded-lg border bg-white transition-shadow focus-within:border-accent-500 focus-within:shadow-focus', error ? 'border-bad-600' : 'border-mist-300', className)}>
        {prefix && <span className="flex h-full items-center border-r border-mist-200 bg-mist-50 px-3 text-sm text-mist-600">{prefix}</span>}
        <input ref={ref} className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-ink-900 placeholder:text-mist-400 focus:outline-none" {...rest} />
        {suffix && <span className="flex h-full items-center px-3 text-sm text-mist-500">{suffix}</span>}
      </div>
    );
  }
  return <input ref={ref} className={cn('input', error && 'input-error', className)} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ className, error, rows = 4, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={cn('input', error && 'input-error', className)} {...rest} />;
});

export const Select = forwardRef(function Select({ className, error, options = [], placeholder, children, ...rest }, ref) {
  return (
    <div className={cn('relative', className)}>
      <select ref={ref} className={cn('input appearance-none pr-9', error && 'input-error')} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
    </div>
  );
});

export const Checkbox = forwardRef(function Checkbox({ label, description, className, id, ...rest }, ref) {
  const auto = useId();
  const cid = id || auto;
  return (
    <label htmlFor={cid} className={cn('flex cursor-pointer items-start gap-2.5 text-sm text-ink-800', className)}>
      <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0">
        <input ref={ref} id={cid} type="checkbox" className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[5px] border border-mist-300 bg-white checked:border-accent-600 checked:bg-accent-600 focus-visible:shadow-focus" {...rest} />
        <Check className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3.5} />
      </span>
      <span className="min-w-0">
        {label}
        {description && <span className="block text-xs text-mist-500">{description}</span>}
      </span>
    </label>
  );
});

export function Toggle({ checked, onChange, label, description, id }) {
  const auto = useId();
  const tid = id || auto;
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={tid} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {description && <span className="block text-[13px] text-mist-500">{description}</span>}
      </label>
      <button
        id={tid}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-accent-600' : 'bg-mist-300')}
      >
        <span className={cn('absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

export function RadioCards({ value, onChange, options, name, columns = 3 }) {
  return (
    <div className={cn('grid gap-2.5', columns === 2 ? 'sm:grid-cols-2' : columns === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3')} role="radiogroup">
      {options.map((o) => (
        <label
          key={o.value}
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition-colors',
            value === o.value ? 'border-accent-500 ring-2 ring-accent-100' : 'border-mist-200 hover:border-mist-300',
          )}
        >
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
          {o.icon && <o.icon className={cn('mt-0.5 h-5 w-5 shrink-0', value === o.value ? 'text-accent-600' : 'text-mist-500')} />}
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink-900">{o.label}</span>
            {o.description && <span className="block text-xs text-mist-500">{o.description}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
