export const cn = (...c) => c.filter(Boolean).join(' ');

const inrFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat('en-IN');

export const inr = (n) => inrFmt.format(Math.round(Number(n) || 0));
export const num = (n) => numFmt.format(Math.round(Number(n) || 0));

/** Indian price convention: ₹8.45 Lakh / ₹1.2 Crore */
export function lakh(n) {
  const v = Number(n) || 0;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(v % 1e7 === 0 ? 0 : 2).replace(/\.?0+$/, '')} Crore`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  return inr(v);
}

export const km = (n) => `${num(n)} km`;

export function date(d, opts = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', opts);
}
export function dateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export function ago(d) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return date(d);
}

export const daysAgo = (n, h = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, (n * 17) % 60, 0, 0);
  return d.toISOString();
};

export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

/** Normalise registration numbers / VINs for comparisons: "OD 02 AB-1234" → "OD02AB1234" */
export const normId = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Pretty-print an Indian registration number: OD02AB1234 → OD 02 AB 1234 */
export function prettyReg(s) {
  const n = normId(s);
  const m = n.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  return m ? [m[1], m[2], m[3], m[4]].filter(Boolean).join(' ') : n;
}

export const maskPhone = (p) => (p ? p.replace(/(\+\d{2}\s?)(\d{2})\d{4}(\d{4})/, '$1$2•••• $3') : '');
export const maskSecret = (s) => (s ? `${s.slice(0, 4)}${'•'.repeat(Math.max(4, s.length - 8))}${s.slice(-4)}` : '');

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export function toCSV(rows, columns) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => esc(typeof c.value === 'function' ? c.value(r) : r[c.value])).join(',')).join('\n');
  return `${head}\n${body}`;
}

/** Try a real download; callers also show the CSV in a modal because some sandboxes block downloads. */
export function tryDownload(filename, text, type = 'text/csv') {
  try {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* ignored — modal fallback */
  }
}

export const readFileAsDataURL = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
