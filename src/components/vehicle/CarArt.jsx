// Studio-style vector renders used as placeholder photography for seeded listings.
// Real uploaded photos (data URLs or CDN URLs) always take priority — see <CarImage>.
import { useId, useState } from 'react';
import { cn, num } from '../../utils/format';

const recentVehicleImages = {
  // Maruti Suzuki
  v1031: ['/m-brezza.avif', '/m-brezza-4.webp','/brezza-dashboard.avif','/brezza-odometer.jpg'],
  v1005: ['/m-brezza.avif', '/m-brezza-2.jpeg','/brezza-dashboard.avif','/brezza-odometer.jpg'],
  v1001: ['/m-swift.webp', '/m-swift-2.jpg'],
  v1020: ['/m-ertiga.jpg', '/m-ertiga-2.webp'],
  v1016: ['/m-baleno.avif', '/m-baleno-2.jpeg', '/m-baleno-3.jpg'],

  // Honda
  v1029: ['/hoda-ameze.avif', '/hoda-ameze-2.jpg', '/hoda-ameze-3.webp'],
  v1003: ['/hoda-ameze.avif', '/hoda-ameze-2.jpg', '/hoda-ameze-3.webp'],
  v1040: ['/honda-city-2.webp', '/honda-city-3.avif'],
  v1014: ['/honda-city-2.webp', '/honda-city-3.avif'],

  // Kia
  v1026: ['/kia-sonet.avif', '/kia-sonet-2.jpeg', '/kia-sonet-3.jpeg'],
  v1011: ['/kia-seltos.avif', '/kia-seltos-2.avif', '/kia-seltos-3.jpeg', '/kia-seltos-4.png'],
  v1037: ['/kia-seltos.avif', '/kia-seltos-2.avif', '/kia-seltos-3.jpeg', '/kia-seltos-4.png'],

  // Tata
  v1006: ['/Tata-Harrier.webp', '/Tata-Harrier-2.avif', '/Tata-Harrier-3.webp'],
  v1032: ['/Tata-Harrier.webp', '/Tata-Harrier-2.avif', '/Tata-Harrier-3.webp'],
  v1002: ['/tata-nexon.jpg', '/tata-nexon-2.avif'],
  v1028: ['/tata-nexon.jpg', '/tata-nexon-2.avif'],
  v1017: ['/tata-punch.jpg', '/tata-punch-2.avif', '/tata-punch-3.jpg'],

  // Toyota
  v1033: ['/toyota-fortuner.webp', '/toyota-fortuner-2.avif', '/toyota-fortuner-3.webp'],
  v1007: ['/toyota-fortuner.webp', '/toyota-fortuner-2.avif', '/toyota-fortuner-3.webp'],
  v1022: ['/toyota-glanza.webp'],

  // MG
  v1030: ['/mg-ev-zs.avif', '/mg-ev-2.jpg', '/mg-ev.jpg'],
  v1004: ['/mg-ev-zs.avif', '/mg-ev-2.jpg', '/mg-ev.jpg'],
  v1015: ['/luxury-car.webp'],

  // Volkswagen
  v1008: ['/volswagen.webp', '/volswagen-2.jpeg', '/volswagen-3.webp'],
  v1034: ['/volswagen.webp', '/volswagen-2.jpeg', '/volswagen-3.webp'],

  // BMW
  v1023: ['/BMW-3-series.jpg', '/BMW-3-series-2.webp', '/BMW-3-gran.jpg'],

  // Mercedes-Benz
  v1038: ['/mercedes-c.avif', '/mercedes-c-2.jpg', '/mercedes-c-3.webp'],
  v1012: ['/mercedes-c.avif', '/mercedes-c-2.jpg', '/mercedes-c-3.webp'],

  // Hyundai
  v1035: ['/i-20.avif', '/i-20-2.jpeg'],
  v1100: ['/i-20.avif', '/i-20-2.jpeg'],
  v1013: ['/verna-1.avif', '/verna-2.jpg'],
  v1039: ['/verna-1.avif', '/verna-2.jpg'],

  // Skoda
  v1019: ['/skoda-salvia.png'],

  // Mahindra
  v1025: ['/thar.webp', '/thar-2.jpg', '/thar-3.jpg'],
  v1010: ['/scropio-n.jpg', '/scropio-n-2.jpg'],
};


function shade(hex, amt) {
  const h = (hex || '#888888').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 255) + amt);
  const b = clamp((n & 255) + amt);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const SHAPES = {
  Sedan: {
    body: 'M28,141 L28,121 Q30,107 50,103 L112,97 Q138,70 168,64 L244,62 Q270,64 296,92 L346,99 Q372,105 377,121 L379,141 Z',
    glass: 'M124,97 Q146,75 170,70 L240,68 Q258,71 281,95 Z',
    pillar: 'M203,69 L200,97',
    wheels: [96, 302],
    r: 27,
    y: 141,
    belt: 104,
  },
  Hatchback: {
    body: 'M44,141 L42,113 Q44,82 72,74 L104,64 Q122,59 150,59 L214,59 Q240,62 268,90 L330,99 Q356,104 360,122 L362,141 Z',
    glass: 'M80,92 Q86,74 108,68 L150,64 L208,64 Q228,67 252,92 Z',
    pillar: 'M160,64 L157,92',
    wheels: [108, 292],
    r: 27,
    y: 141,
    belt: 99,
  },
  SUV: {
    body: 'M26,146 L26,104 Q28,76 52,70 L78,55 Q88,50 118,50 L250,50 Q270,52 298,85 L350,95 Q373,100 377,118 L379,146 Z',
    glass: 'M62,86 L84,60 L172,57 L172,86 Z M182,86 L182,57 L246,57 Q262,59 284,86 Z',
    pillar: '',
    wheels: [100, 302],
    r: 30,
    y: 146,
    belt: 94,
  },
  MUV: {
    body: 'M24,144 L24,104 Q26,80 46,74 L66,58 Q76,52 104,52 L248,52 Q272,55 302,88 L352,97 Q374,102 377,120 L379,144 Z',
    glass: 'M50,88 L72,62 L150,59 L150,88 Z M160,88 L160,59 L236,59 Q258,62 286,88 Z',
    pillar: 'M105,61 L103,88',
    wheels: [98, 304],
    r: 29,
    y: 144,
    belt: 96,
  },
};

function Wheel({ cx, cy, r }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#15181D" />
      <circle cx={cx} cy={cy} r={r * 0.66} fill="#9AA3AF" />
      <circle cx={cx} cy={cy} r={r * 0.6} fill="#C9CED6" />
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={cx - 2.2} y={cy - r * 0.56} width="4.4" height={r * 0.5} rx="2" fill="#7D8693" transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.16} fill="#5D6672" />
    </g>
  );
}

function Exterior({ body = 'Sedan', color = '#2C5AA3', dark = false, uid }) {
  const s = SHAPES[body] || SHAPES.Sedan;
  const front = s.body.match(/L(\d+),\d+ Z$/)?.[1] || 378;
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`p${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={shade(color, 38)} />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor={shade(color, -46)} />
        </linearGradient>
        <linearGradient id={`g${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3A4D66" />
          <stop offset="0.55" stopColor="#1B2533" />
          <stop offset="1" stopColor="#0E141C" />
        </linearGradient>
        <linearGradient id={`h${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`s${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity={dark ? 0.6 : 0.32} />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <mask id={`m${uid}`}>
          <rect width="400" height="200" fill="#fff" />
          {s.wheels.map((x) => (
            <circle key={x} cx={x} cy={s.y} r={s.r + 4} fill="#000" />
          ))}
        </mask>
      </defs>
      <ellipse cx="202" cy={s.y + s.r - 2} rx="190" ry="14" fill={`url(#s${uid})`} />
      <g mask={`url(#m${uid})`}>
        <path d={s.body} fill={`url(#p${uid})`} />
        <path d={s.body} fill={`url(#h${uid})`} clipPath="none" opacity="0.9" transform={`translate(0 0)`} style={{ mixBlendMode: 'screen' }} />
        {/* sill + bumpers */}
        <rect x="30" y={s.y - 9} width="346" height="9" fill={shade(color, -70)} opacity="0.55" />
        {/* shoulder line */}
        <path d={`M40,${s.belt + 8} L366,${s.belt + 12}`} stroke={shade(color, 60)} strokeOpacity="0.55" strokeWidth="1.4" fill="none" />
      </g>
      <path d={s.glass} fill={`url(#g${uid})`} />
      <path d={s.glass} fill="#fff" opacity="0.08" transform="translate(6 -2) scale(0.98)" />
      {s.pillar && <path d={s.pillar} stroke={shade(color, -60)} strokeWidth="5" />}
      {/* door seams + handles */}
      <path d={`M${s.wheels[0] + 54},${s.belt - 4} L${s.wheels[0] + 52},${s.y - 10}`} stroke={shade(color, -55)} strokeWidth="1.2" opacity="0.7" />
      <path d={`M${s.wheels[1] - 66},${s.belt - 6} L${s.wheels[1] - 64},${s.y - 10}`} stroke={shade(color, -55)} strokeWidth="1.2" opacity="0.7" />
      <rect x={s.wheels[0] + 64} y={s.belt + 12} width="16" height="3.5" rx="1.75" fill={shade(color, -70)} />
      <rect x={s.wheels[1] - 54} y={s.belt + 13} width="16" height="3.5" rx="1.75" fill={shade(color, -70)} />
      {/* mirror */}
      <path d={`M${s.wheels[1] - 26},${s.belt - 4} l10,-6 l6,0 l0,8 z`} fill={shade(color, -30)} />
      {/* lights */}
      <path d={`M${front - 18},${s.belt + 2} l16,3 l2,8 l-18,-2 z`} fill="#F4F7FB" opacity="0.95" />
      <path d={`M30,${s.belt + 4} l12,-1 l0,9 l-12,1 z`} fill="#D73A3A" />
      {s.wheels.map((x) => (
        <Wheel key={x} cx={x} cy={s.y} r={s.r} />
      ))}
    </svg>
  );
}

function Interior({ color, uid }) {
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`i${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#9FB3CC" />
          <stop offset="1" stopColor="#E9EEF4" />
        </linearGradient>
      </defs>
      <rect width="400" height="110" fill={`url(#i${uid})`} />
      <path d="M0,96 Q200,70 400,96 L400,200 L0,200 Z" fill="#20252D" />
      <path d="M0,104 Q200,80 400,104 L400,118 Q200,96 0,118 Z" fill={shade(color, -40)} opacity="0.8" />
      <rect x="236" y="112" width="88" height="52" rx="8" fill="#0F1318" stroke="#3A414C" />
      <rect x="244" y="120" width="72" height="36" rx="4" fill="#1F3B66" />
      <path d="M252,146 l12,-12 l10,8 l14,-16 l18,14" stroke="#7FB2FF" strokeWidth="2" fill="none" />
      <circle cx="140" cy="160" r="58" fill="none" stroke="#0E1116" strokeWidth="14" />
      <path d="M86,160 L194,160 M140,160 L140,214" stroke="#0E1116" strokeWidth="12" />
      <circle cx="140" cy="160" r="15" fill="#2C323C" />
      <rect x="350" y="128" width="34" height="18" rx="4" fill="#2B313A" />
    </svg>
  );
}

function Cluster({ mileage = 0, fuel }) {
  const digits = String(Math.round(mileage)).padStart(6, '0');
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" aria-hidden="true">
      <rect width="400" height="200" fill="#0C1016" />
      {[110, 290].map((cx, k) => (
        <g key={cx}>
          <circle cx={cx} cy="98" r="66" fill="#121822" stroke="#26303D" strokeWidth="2" />
          {Array.from({ length: 11 }, (_, i) => {
            const a = (-210 + i * 24) * (Math.PI / 180);
            return <line key={i} x1={cx + Math.cos(a) * 56} y1={98 + Math.sin(a) * 56} x2={cx + Math.cos(a) * 48} y2={98 + Math.sin(a) * 48} stroke="#8FA3BD" strokeWidth="2" />;
          })}
          <line x1={cx} y1="98" x2={cx + Math.cos((k ? -40 : -120) * (Math.PI / 180)) * 50} y2={98 + Math.sin((k ? -40 : -120) * (Math.PI / 180)) * 50} stroke="#FF6B3D" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy="98" r="6" fill="#26303D" />
          <text x={cx} y="138" textAnchor="middle" fill="#6E7F96" fontSize="10" fontFamily="JetBrains Mono, monospace">
            {k ? (fuel === 'Electric' ? 'kWh' : 'rpm ×1000') : 'km/h'}
          </text>
        </g>
      ))}
      <rect x="148" y="150" width="104" height="26" rx="4" fill="#05080C" stroke="#2A3442" />
      <text x="200" y="168" textAnchor="middle" fill="#E7F0FF" fontSize="15" letterSpacing="3" fontFamily="JetBrains Mono, monospace">
        {digits}
      </text>
      <text x="262" y="168" fill="#6E7F96" fontSize="10" fontFamily="JetBrains Mono, monospace">
        km
      </text>
    </svg>
  );
}

export function CarArt({ vehicle, view = 'side', className, bare }) {
  const id = useId().replace(/:/g, '');
  const color = vehicle?.colorHex || '#2C5AA3';
  const body = vehicle?.bodyType || 'Sedan';
  const bg = {
    side: 'studio',
    rear: 'bg-gradient-to-b from-[#1B2738] to-[#0D141F]',
    interior: 'bg-[#E9EEF4]',
    cluster: 'bg-[#0C1016]',
  }[view];
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden', !bare && bg, className)}>
      {view === 'interior' ? (
        <Interior color={color} uid={id} />
      ) : view === 'cluster' ? (
        <Cluster mileage={vehicle?.mileage} fuel={vehicle?.fuel} />
      ) : (
        <div className={cn('h-full w-full px-[6%] pt-[4%]', view === 'rear' && '-scale-x-100')}>
          <Exterior body={body} color={color} dark={view === 'rear'} uid={id} />
        </div>
      )}
    </div>
  );
}

export const GALLERY_VIEWS = [
  { view: 'side', label: 'Side profile' },
  { view: 'rear', label: 'Exterior, evening' },
  { view: 'interior', label: 'Cabin & dashboard' },
  { view: 'cluster', label: 'Odometer' },
];

// change for manual upload
/** Shows an uploaded photo when present; otherwise the studio render. */
// export function CarImage({ vehicle, index = 0, className, view }) {
//   const [broken, setBroken] = useState(false);
//   const src = vehicle?.photos?.[index];
//   if (src && !broken) {
//     return <img src={src} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} onError={() => setBroken(true)} className={cn('object-cover', className)} />;
//   }
//   return <CarArt vehicle={vehicle} view={view || GALLERY_VIEWS[index % GALLERY_VIEWS.length].view} className={className} />;
// }

export function CarImage({ vehicle, index = 0, className, view }) {
  const [broken, setBroken] = useState(false);

  const uploadedPhoto = vehicle?.photos?.[index];
  const images = recentVehicleImages[vehicle?.id] || [];

  const src = uploadedPhoto || images[index] || images[0];

  if (src && !broken) {
    return (
      <img
        key={`${vehicle?.id}-${src}`}
        src={src}
        alt={`${vehicle?.make || ''} ${vehicle?.model || 'Car'}`}
        loading="lazy"
        onError={() => setBroken(true)}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <CarArt
      vehicle={vehicle}
      view={view || GALLERY_VIEWS[index % GALLERY_VIEWS.length].view}
      className={className}
    />
  );
}

export function OdometerText({ value }) {
  return <span className="font-mono num">{num(value)}</span>;
}
