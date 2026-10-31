import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Handshake, MessageCircle, Phone, Send, ShieldAlert } from 'lucide-react';
import { useStore, isPublic } from '../../store/AppStore';
import { Alert, Avatar, Button, CopyText, EmptyState, MockNotice, Segmented, Textarea } from '../../components/ui';
import { CarImage } from '../../components/vehicle/CarArt';
import { EnquiryForm } from '../../components/vehicle/EnquiryForm';
import { vehicleTitle } from '../../components/vehicle/VehicleCard';
import { cn, km, tzs, sleep } from '../../utils/format';
import { vehiclePath } from '../../data/vehicleTypes';

const QUICK = ['Is it still available?', 'What is your best price?', 'Can I book a test drive this weekend?', 'Are service records available?'];

function Chat({ vehicle, seller }) {
  const { me, addEnquiry } = useStore();
  const [msgs, setMsgs] = useState([{ from: 'system', text: `You're messaging ${seller?.business || seller?.agency || seller?.name.split(' ')[0]} about the ${vehicleTitle(vehicle)}.` }]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const [failNext, setFailNext] = useState(false);
  const send = async (t = text) => {
    if (t.trim().length < 2) {
      setErr('Type a message first.');
      return;
    }
    setErr('');
    setSending(true);
    const msg = { from: 'me', text: t.trim(), status: 'sending' };
    setMsgs((m) => [...m, msg]);
    setText('');
    await sleep(700);
    if (failNext) {
      setMsgs((m) => m.map((x) => (x === msg ? { ...x, status: 'failed' } : x)));
      setSending(false);
      return;
    }
    setMsgs((m) => m.map((x) => (x === msg ? { ...x, status: 'sent' } : x)));
    if (!msgs.some((x) => x.from === 'me')) {
      addEnquiry({ vehicleId: vehicle.id, channel: 'chat', buyerName: me?.name || 'Guest buyer', buyerPhone: me?.phone || '—', buyerEmail: me?.email || '', message: t.trim() });
      await sleep(900);
      setMsgs((m) => [...m, { from: 'them', text: 'Thanks for your message! I\'ll reply shortly. (Automatic acknowledgement)' }]);
    }
    setSending(false);
  };
  return (
    <div className="flex h-[460px] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-mist-50 p-4">
        {msgs.map((m, i) =>
          m.from === 'system' ? (
            <p key={i} className="text-center text-[12px] text-mist-500">
              {m.text}
            </p>
          ) : (
            <div key={i} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm', m.from === 'me' ? 'rounded-br-md bg-accent-600 text-white' : 'rounded-bl-md bg-white text-ink-900 shadow-card')}>
                {m.text}
                {m.from === 'me' && (
                  <span className={cn('mt-0.5 block text-right text-[10.5px]', m.status === 'failed' ? 'font-semibold text-red-100' : 'text-accent-100')}>
                    {m.status === 'sending' ? 'Sending…' : m.status === 'failed' ? (
                      <button type="button" className="underline" onClick={() => { setMsgs((x) => x.filter((y) => y !== m)); send(m.text); }}>
                        Not sent · tap to retry
                      </button>
                    ) : 'Sent'}
                  </span>
                )}
              </div>
            </div>
          ),
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} disabled={sending} className="rounded-full border border-mist-200 bg-white px-2.5 py-1 text-[12.5px] font-medium text-ink-700 hover:border-accent-300">
            {q}
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" aria-label="Message" className="flex-1" error={err} />
        <Button type="submit" icon={Send} loading={sending} aria-label="Send message">
          Send
        </Button>
      </form>
      {err && <p className="field-error">{err}</p>}
      <MockNotice className="mt-3">
        Simulated chat.{' '}
        <button type="button" onClick={() => setFailNext((x) => !x)} className="font-semibold underline">
          {failNext ? 'Failures on — turn off' : 'Simulate a failed message'}
        </button>
      </MockNotice>
    </div>
  );
}

export default function VehicleContact() {
  const { id } = useParams();
  const { vehicle, user } = useStore();
  const v = vehicle(id);
  const [mode, setMode] = useState('enquiry');
  const [reveal, setReveal] = useState(false);
  if (!v || !isPublic(v)) return <div className="container-page py-16"><EmptyState title="This vehicle isn't available" action={<Button to="/cars">Browse vehicles</Button>} /></div>;
  const seller = user(v.sellerId);
  const isAgent = v.sellerRole === 'agent';

  return (
    <div className="container-page py-6 md:py-8">
      <Link to={`${vehiclePath(v)}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-mist-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to listing
      </Link>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <CarImage vehicle={v} view="side" className="aspect-[16/9] w-full" />
            <div className="p-4">
              <p className="font-bold">{vehicleTitle(v)}</p>
              <p className="text-[13px] text-mist-500">
                {v.variant} · {km(v.mileage)} · {v.city}
              </p>
              <p className="mt-2 font-display text-xl font-bold num">{tzs(v.price)}</p>
            </div>
          </div>
          <div className="card space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={seller?.business || seller?.agency || seller?.name} size={42} />
              <div className="min-w-0">
                <p className="truncate font-bold">{seller?.business || seller?.agency || seller?.name}</p>
                <p className="text-[13px] text-mist-500">{{ dealer: 'Dealer', seller: 'Private owner', agent: 'Agent for the owner' }[v.sellerRole]}</p>
              </div>
            </div>
            {isAgent && (
              <Alert tone="info" icon={Handshake}>
                This car is sold by an agent on the owner's behalf. Contact the agent; they coordinate viewings and the handover.
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="dark" icon={Phone} onClick={() => setReveal(true)}>
                {isAgent ? 'Call agent' : 'Call seller'}
              </Button>
              <Button variant="secondary" icon={MessageCircle} onClick={() => setMode('chat')}>
                Message
              </Button>
            </div>
            {reveal && (
              <div className="flex items-center justify-between rounded-lg bg-mist-50 px-3 py-2.5">
                <a href={`tel:${seller?.phone?.replace(/\s/g, '')}`} className="font-mono font-semibold num">
                  {seller?.phone}
                </a>
                <CopyText text={seller?.phone || ''} />
              </div>
            )}
          </div>
          <Alert tone="warn" icon={ShieldAlert} title="Stay safe">
            Inspect the car and its RC before paying anything. Never share OTPs or pay a "token" to hold a car you haven't seen.
          </Alert>
        </aside>

        <div className="card min-w-0 p-5 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold">Contact the {isAgent ? 'agent' : 'seller'}</h1>
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: 'enquiry', label: 'Send enquiry' },
                { value: 'chat', label: 'Message' },
              ]}
            />
          </div>
          {mode === 'enquiry' ? <EnquiryForm vehicle={v} /> : <Chat vehicle={v} seller={seller} />}
        </div>
      </div>
    </div>
  );
}
