import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { CarImage, GALLERY_VIEWS } from './CarArt';
import { Modal } from '../ui';
import { cn } from '../../utils/format';

export function Gallery({ vehicle }) {
  const photos = vehicle.photos?.length || 0;
  const count = photos || GALLERY_VIEWS.length;
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const label = (k) => (photos ? `Photo ${k + 1}` : GALLERY_VIEWS[k].label);
  const go = (d) => setI((x) => (x + d + count) % count);
  const Main = ({ tall }) => (
    <div className="relative overflow-hidden rounded-xl bg-mist-100">
      <CarImage vehicle={vehicle} index={i} className={cn('w-full', tall ? 'aspect-[16/9]' : 'aspect-[16/10] md:aspect-[16/9]')} />
      <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-card hover:bg-white" aria-label="Previous photo">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-card hover:bg-white" aria-label="Next photo">
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-3 left-3 rounded-md bg-ink-950/70 px-2 py-1 text-xs font-medium text-white num">
        {i + 1} / {count} · {label(i)}
      </div>
      {!tall && (
        <button type="button" onClick={() => setFull(true)} className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-ink-900 hover:bg-white">
          <Expand className="h-3.5 w-3.5" /> Full screen
        </button>
      )}
    </div>
  );
  const Thumbs = () => (
    <div className="mt-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
      {Array.from({ length: count }, (_, k) => (
        <button
          key={k}
          type="button"
          onClick={() => setI(k)}
          className={cn('overflow-hidden rounded-lg ring-2 ring-offset-1 transition', k === i ? 'ring-accent-500' : 'ring-transparent opacity-80 hover:opacity-100')}
          aria-label={`Show ${label(k)}`}
        >
          <CarImage vehicle={vehicle} index={k} className="aspect-[4/3] w-full" />
        </button>
      ))}
    </div>
  );
  return (
    <div>
      <Main />
      <Thumbs />
      {!photos && <p className="mt-2 text-xs text-mist-500">Illustrated preview. The seller's own photos replace these once uploaded.</p>}
      <Modal open={full} onClose={() => setFull(false)} title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} size="xl">
        <Main tall />
        <Thumbs />
      </Modal>
    </div>
  );
}
