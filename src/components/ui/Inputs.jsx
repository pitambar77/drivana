import { useRef, useState } from 'react';
import { FileText, FileVideo, ImagePlus, Trash2, UploadCloud, Star } from 'lucide-react';
import { cn, readFileAsDataURL } from '../../utils/format';

/** Six-box OTP input with paste support and arrow-key navigation. */
export function OtpInput({ value, onChange, length = 6, error, disabled }) {
  const refs = useRef([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');
  const setAt = (i, d) => {
    const next = digits.map((x, j) => (j === i ? d : x)).join('').replace(/\s+$/, '');
    onChange(next.replace(/\s/g, ''));
  };
  return (
    <div className="flex gap-2 sm:gap-2.5" onPaste={(e) => {
      const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (t) {
        e.preventDefault();
        onChange(t);
        refs.current[Math.min(t.length, length - 1)]?.focus();
      }
    }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          id={`otp-${i}`}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          value={d.trim()}
          onChange={(e) => {
            const c = e.target.value.replace(/\D/g, '').slice(-1);
            setAt(i, c || ' ');
            if (c && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d.trim() && i > 0) refs.current[i - 1]?.focus();
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
            if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
          }}
          className={cn(
            'h-12 w-11 rounded-lg border bg-white text-center font-mono text-xl font-semibold text-ink-900 transition-shadow focus:border-accent-500 focus:shadow-focus focus:outline-none sm:h-14 sm:w-12',
            error ? 'border-bad-600' : 'border-mist-300',
          )}
        />
      ))}
    </div>
  );
}

const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/**
 * Single-document uploader with type/size validation and preview.
 * value: { fileName, size, preview, mime } | null
 */
export function FileUpload({ value, onChange, accept = 'image/*,application/pdf', maxMB = 5, label = 'Upload file', hint, kind = 'doc', error: extError, id }) {
  const input = useRef(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState('');
  const handle = async (file) => {
    if (!file) return;
    const okTypes = accept.split(',').map((s) => s.trim());
    const typeOk = okTypes.some((t) => (t.endsWith('/*') ? file.type.startsWith(t.slice(0, -1)) : file.type === t));
    if (!typeOk) return setErr(`That file type isn't accepted. Use ${kind === 'video' ? 'MP4 or MOV video' : 'JPG, PNG or PDF'}.`);
    if (file.size > maxMB * 1048576) return setErr(`File is ${fmtSize(file.size)}. Maximum is ${maxMB} MB.`);
    setErr('');
    const isImage = file.type.startsWith('image/');
    // Keep previews small for local storage: only images get a data URL.
    const preview = isImage && file.size < 2.5 * 1048576 ? await readFileAsDataURL(file) : null;
    onChange({ fileName: file.name, size: file.size, mime: file.type, preview });
  };
  const error = err || extError;
  if (value) {
    const Icon = value.mime?.startsWith('video') || kind === 'video' ? FileVideo : FileText;
    return (
      <div className="flex items-center gap-3 rounded-xl border border-mist-200 bg-white p-3">
        {value.preview ? (
          <img src={value.preview} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-mist-100 text-mist-500">
            <Icon className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{value.fileName}</p>
          <p className="text-xs text-mist-500">{value.size ? fmtSize(value.size) : ''}</p>
        </div>
        <button type="button" onClick={() => onChange(null)} className="btn-icon" aria-label="Remove file">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <div>
      <button
        type="button"
        id={id}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors',
          drag ? 'border-accent-500 bg-accent-50' : error ? 'border-bad-600/60 bg-bad-50/40' : 'border-mist-300 bg-mist-50 hover:border-accent-400 hover:bg-accent-50/40',
        )}
      >
        <UploadCloud className="h-7 w-7 text-accent-600" />
        <span className="text-sm font-semibold text-ink-900">{label}</span>
        <span className="text-xs text-mist-500">{hint || `Drag & drop or click · ${kind === 'video' ? 'MP4/MOV' : 'JPG, PNG or PDF'} up to ${maxMB} MB`}</span>
      </button>
      <input ref={input} type="file" accept={accept} className="sr-only" onChange={(e) => handle(e.target.files?.[0])} tabIndex={-1} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** Multi-photo uploader with previews, reordering of the cover photo and removal. */
export function PhotoUploader({ photos, onChange, max = 12, error }) {
  const input = useRef(null);
  const [err, setErr] = useState('');
  const add = async (files) => {
    const list = Array.from(files || []);
    const room = max - photos.length;
    if (!room) return setErr(`You can add up to ${max} photos.`);
    const bad = list.find((f) => !f.type.startsWith('image/'));
    if (bad) return setErr(`"${bad.name}" isn't an image. Use JPG or PNG.`);
    const big = list.find((f) => f.size > 4 * 1048576);
    if (big) return setErr(`"${big.name}" is larger than 4 MB.`);
    setErr('');
    const urls = await Promise.all(list.slice(0, room).map(readFileAsDataURL));
    onChange([...photos, ...urls]);
  };
  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
        {photos.map((p, i) => (
          <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-mist-200 bg-mist-100">
            <img src={p} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-ink-900/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              {i > 0 && (
                <button type="button" onClick={() => onChange([p, ...photos.filter((_, j) => j !== i)])} className="rounded bg-white/90 p-1 text-ink-900" aria-label="Make cover photo" title="Make cover">
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} className="rounded bg-white/90 p-1 text-bad-600" aria-label="Remove photo">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {photos.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              add(e.dataTransfer.files);
            }}
            className={cn('flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-center text-xs font-semibold text-mist-600 hover:border-accent-400 hover:text-accent-700', error || err ? 'border-bad-600/60' : 'border-mist-300')}
          >
            <ImagePlus className="h-5 w-5" />
            Add photos
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => add(e.target.files)} tabIndex={-1} />
      <p className={cn('mt-2 text-xs', err || error ? 'font-medium text-bad-600' : 'text-mist-500')}>
        {err || error || `${photos.length}/${max} photos · first photo is the cover · JPG/PNG up to 4 MB each`}
      </p>
    </div>
  );
}
