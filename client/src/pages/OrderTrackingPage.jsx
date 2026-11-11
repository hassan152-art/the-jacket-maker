import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Truck, Search, CheckCircle2, Scissors, Package, MapPin, ShieldCheck, Loader2, XCircle } from 'lucide-react';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { imgFallback } from '../components/ui';

const STAGES = [
  { title: 'Order confirmed', desc: 'We received your order and checked the details.', icon: CheckCircle2 },
  { title: 'Being crafted', desc: 'Leather cut by our pattern makers and hand-stitched.', icon: Scissors },
  { title: 'Quality check', desc: 'Hardware tested and leather conditioned.', icon: ShieldCheck },
  { title: 'Dispatched', desc: 'Handed over to the courier for delivery.', icon: Truck },
  { title: 'Delivered', desc: 'Delivered to your doorstep.', icon: Package },
];

const stageOf = (status) => ({ Processing: 0, 'In Crafting': 1, Dispatched: 3, Delivered: 4 }[status] ?? 0);

const OrderTrackingPage = () => {
  const [params] = useSearchParams();
  const initial = params.get('code') || '';
  const [code, setCode] = useState(initial);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { formatPrice } = useCurrency();

  const track = async (value) => {
    const c = (value ?? code).trim();
    if (!c) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/${encodeURIComponent(c)}`);
      setOrder(res.data);
    } catch {
      setOrder(null);
      setError('We couldn’t find an order with that code. Please check it and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial) track(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const cancelled = order?.orderStatus === 'Cancelled';
  const current = order ? stageOf(order.orderStatus) : 0;

  return (
    <div className="container-page max-w-3xl py-8 sm:py-14">
      <div className="text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Track your order</h1>
        <p className="mt-2 text-ink-muted">Enter the tracking code from your confirmation, for example <span className="font-mono">TJM-PK-123456</span>.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          track();
        }}
        className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Tracking code"
          aria-label="Tracking code"
          className="input font-mono"
        />
        <button type="submit" disabled={loading || !code.trim()} className="btn-primary shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track
        </button>
      </form>

      {error && <p role="alert" className="mx-auto mt-6 max-w-xl rounded-md bg-sale/5 px-4 py-3 text-center text-sm text-sale">{error}</p>}

      {order && (
        <div className="mt-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-stone p-5">
            <div>
              <p className="text-xs text-ink-muted">Tracking code</p>
              <p className="font-mono text-lg font-semibold">{order.trackingCode || order._id}</p>
              <p className="mt-1 text-xs text-ink-muted">
                Placed {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.customer?.name}
              </p>
            </div>
            <div className="text-right">
              <span className={`badge px-3 py-1 text-xs ${cancelled ? 'bg-sale/10 text-sale' : order.orderStatus === 'Delivered' ? 'bg-ok/10 text-ok' : 'bg-saddle-50 text-saddle-700'}`}>
                {order.orderStatus}
              </span>
              <p className="mt-2 text-sm font-semibold">{formatPrice(order.totalPKR)}</p>
              <p className="text-xs text-ink-muted">{order.paymentMethod}</p>
            </div>
          </div>

          {cancelled ? (
            <div className="flex items-start gap-3 rounded-lg border border-sale/30 bg-sale/5 p-5">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-sale" />
              <div className="text-sm">
                <p className="font-semibold text-sale">This order was cancelled</p>
                <p className="mt-1 text-ink-soft">If you didn’t expect this, please contact us on WhatsApp +92 300 8472911.</p>
              </div>
            </div>
          ) : (
            <ol className="space-y-0">
              {STAGES.map((s, i) => {
                const done = i <= current;
                const Icon = s.icon;
                return (
                  <li key={s.title} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < STAGES.length - 1 && (
                      <span className={`absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 -translate-x-1/2 ${i < current ? 'bg-ok' : 'bg-line'}`} aria-hidden="true" />
                    )}
                    <span className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? 'bg-ok text-white' : 'bg-stone text-ink-muted'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="pt-1.5">
                      <p className={`font-semibold ${done ? '' : 'text-ink-muted'}`}>
                        {s.title} {i === current && <span className="ml-1 badge bg-ok/10 text-ok">Current</span>}
                      </p>
                      <p className="text-sm text-ink-muted">{s.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-lg border border-line p-5">
              <h2 className="mb-3 font-sans text-base font-semibold">Items ({order.orderItems?.length || 0})</h2>
              <ul className="space-y-3">
                {order.orderItems?.map((it, i) => (
                  <li key={i} className="flex gap-3">
                    <img src={it.image} alt="" onError={imgFallback} className="h-16 w-12 rounded bg-stone object-cover" />
                    <div className="min-w-0 text-sm">
                      <p className="line-clamp-2 font-semibold">{it.name}</p>
                      <p className="text-xs text-ink-muted">{it.quantity} × · {it.size}{it.color ? ` · ${it.color}` : ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-line p-5">
              <h2 className="mb-3 flex items-center gap-2 font-sans text-base font-semibold"><MapPin className="h-4 w-4 text-saddle-600" /> Delivery address</h2>
              <p className="text-sm text-ink-soft">{order.customer?.address}, {order.customer?.city}, Pakistan</p>
              <p className="mt-2 text-xs text-ink-muted">Contact: {order.customer?.phone}</p>
            </section>
          </div>
        </div>
      )}

      {!order && !error && !loading && (
        <p className="mt-10 text-center text-sm text-ink-muted">
          Signed in? You can also see all your orders in <Link to="/dashboard" className="link">your account</Link>.
        </p>
      )}
    </div>
  );
};

export default OrderTrackingPage;
