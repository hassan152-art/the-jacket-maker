import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Ruler, LogOut, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { EmptyState, imgFallback } from '../components/ui';
import api from '../services/api';

const STATUS_STYLE = {
  Processing: 'bg-saddle-50 text-saddle-700',
  'In Crafting': 'bg-saddle-50 text-saddle-700',
  Dispatched: 'bg-blue-50 text-blue-700',
  Delivered: 'bg-ok/10 text-ok',
  Cancelled: 'bg-sale/10 text-sale',
};

const MEASURE_FIELDS = [
  ['chest', 'Chest'],
  ['shoulders', 'Shoulders'],
  ['sleeves', 'Sleeve length'],
  ['waist', 'Waist'],
  ['length', 'Jacket length'],
];

const CustomerDashboard = () => {
  const { user, logout, updateProfile, setIsAuthModalOpen } = useAuth();
  const { formatPrice } = useCurrency();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [m, setM] = useState({ chest: 40, shoulders: 18.5, sleeves: 25.5, waist: 33, length: 26, ...(user?.savedMeasurements || {}) });
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '', address: user?.address || '' });
  const [saving, setSaving] = useState('');
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }
    let alive = true;
    api
      .get('/orders/my-orders')
      .then((r) => alive && setOrders(r.data))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user]);

  const flash = (key) => {
    setSaved(key);
    setTimeout(() => setSaved(''), 2500);
  };

  const saveMeasurements = async (e) => {
    e.preventDefault();
    setSaving('m');
    setError('');
    try {
      await updateProfile({ savedMeasurements: Object.fromEntries(MEASURE_FIELDS.map(([k]) => [k, Number(m[k])])) });
      flash('m');
    } catch {
      setError('Couldn’t save your measurements. Please try again.');
    } finally {
      setSaving('');
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving('p');
    setError('');
    try {
      await updateProfile(profile);
      flash('p');
    } catch {
      setError('Couldn’t update your profile. Please try again.');
    } finally {
      setSaving('');
    }
  };

  if (!user) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={User} title="Sign in to see your account" text="Track orders, save your measurements and manage your details.">
          <button type="button" onClick={() => setIsAuthModalOpen(true)} className="btn-primary">Sign in</button>
          <Link to="/track-order" className="btn-outline">Track an order</Link>
        </EmptyState>
      </div>
    );
  }

  const TABS = [
    ['orders', 'Orders', Package],
    ['measurements', 'Measurements', Ruler],
    ['profile', 'Profile', User],
  ];

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-saddle-600 text-xl font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Hi, {user.name?.split(' ')[0]}</h1>
            <p className="text-sm text-ink-muted">{user.email}{user.city ? ` · ${user.city}` : ''}</p>
          </div>
        </div>
        <button type="button" onClick={logout} className="btn-outline btn-sm self-start sm:self-auto"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>

      <div role="tablist" className="mb-8 flex gap-1 overflow-x-auto border-b border-line no-scrollbar">
        {TABS.map(([key, label, Icon]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => { setTab(key); setError(''); }}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === key ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mb-6 rounded-md bg-sale/5 px-4 py-3 text-sm text-sale">{error}</p>}

      {tab === 'orders' && (
        loading ? (
          <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="skeleton h-32" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" text="When you place an order it will show up here.">
            <Link to="/shop" className="btn-primary">Start shopping</Link>
          </EmptyState>
        ) : (
          <ul className="space-y-5">
            {orders.map((o) => (
              <li key={o._id} className="rounded-lg border border-line">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-stone/60 px-5 py-4">
                  <div>
                    <p className="font-mono text-sm font-semibold">{o.trackingCode || o._id}</p>
                    <p className="text-xs text-ink-muted">{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.paymentMethod}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge px-2.5 py-1 text-xs ${STATUS_STYLE[o.orderStatus] || 'bg-stone text-ink'}`}>{o.orderStatus}</span>
                    <span className="font-semibold">{formatPrice(o.totalPKR)}</span>
                  </div>
                </div>
                <ul className="divide-y divide-line px-5">
                  {o.orderItems?.map((it, i) => (
                    <li key={i} className="flex gap-3 py-3">
                      <img src={it.image} alt="" onError={imgFallback} className="h-20 w-16 rounded bg-stone object-cover" />
                      <div className="min-w-0 text-sm">
                        <p className="line-clamp-2 font-semibold">{it.name}</p>
                        <p className="mt-0.5 text-xs text-ink-muted">Qty {it.quantity} · {it.size}{it.color ? ` · ${it.color}` : ''}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line px-5 py-3 text-right">
                  <Link to={`/track-order?code=${o.trackingCode}`} className="link text-sm">Track this order</Link>
                </div>
              </li>
            ))}
          </ul>
        )
      )}

      {tab === 'measurements' && (
        <form onSubmit={saveMeasurements} className="max-w-xl">
          <p className="mb-5 text-sm text-ink-muted">Save your body measurements (in inches) to use for made-to-measure orders.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {MEASURE_FIELDS.map(([k, label]) => (
              <div key={k}>
                <label htmlFor={`d-${k}`} className="label">{label} (in)</label>
                <input id={`d-${k}`} type="number" inputMode="decimal" step="0.5" min="1" value={m[k]} onChange={(e) => setM((s) => ({ ...s, [k]: e.target.value }))} className="input" />
              </div>
            ))}
          </div>
          <button type="submit" disabled={saving === 'm'} className="btn-primary mt-6">
            {saving === 'm' ? <Loader2 className="h-4 w-4 animate-spin" /> : saved === 'm' ? <Check className="h-4 w-4" /> : null}
            {saved === 'm' ? 'Saved' : 'Save measurements'}
          </button>
        </form>
      )}

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="max-w-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="p-name" className="label">Full name</label>
              <input id="p-name" required value={profile.name} onChange={(e) => setProfile((s) => ({ ...s, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label htmlFor="p-email" className="label">Email</label>
              <input id="p-email" value={user.email} disabled className="input bg-stone text-ink-muted" />
            </div>
            <div>
              <label htmlFor="p-phone" className="label">Phone</label>
              <input id="p-phone" type="tel" value={profile.phone} onChange={(e) => setProfile((s) => ({ ...s, phone: e.target.value }))} className="input" />
            </div>
            <div>
              <label htmlFor="p-city" className="label">City</label>
              <input id="p-city" value={profile.city} onChange={(e) => setProfile((s) => ({ ...s, city: e.target.value }))} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-addr" className="label">Delivery address</label>
              <input id="p-addr" value={profile.address} onChange={(e) => setProfile((s) => ({ ...s, address: e.target.value }))} className="input" />
            </div>
          </div>
          <button type="submit" disabled={saving === 'p'} className="btn-primary mt-6">
            {saving === 'p' ? <Loader2 className="h-4 w-4 animate-spin" /> : saved === 'p' ? <Check className="h-4 w-4" /> : null}
            {saved === 'p' ? 'Saved' : 'Save changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CustomerDashboard;
