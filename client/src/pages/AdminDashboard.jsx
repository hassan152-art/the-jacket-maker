import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Plus,
  Trash2,
  X,
  Loader2,
  Package,
  Scissors,
  Banknote,
  Boxes,
  Sparkles,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Users,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Modal, EmptyState, imgFallback } from '../components/ui';
import api from '../services/api';

const ORDER_STATUSES = ['Processing', 'In Crafting', 'Dispatched', 'Delivered', 'Cancelled'];
const INQUIRY_STATUSES = ['New Request', 'Consultant Review', 'Quote Approved', 'In Crafting', 'Completed'];

const STATUS_STYLE = {
  Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
  Dispatched: 'bg-blue-50 text-blue-800 border-blue-200',
  'In Crafting': 'bg-amber-50 text-amber-800 border-amber-200',
  Processing: 'bg-stone text-ink border-line'
};

const EMPTY_FORM = {
  name: '',
  category: 'Men',
  subCategory: 'Cafe Racer',
  price: '',
  leather: 'Full Grain Sheepskin',
  image: '',
  description: ''
};

const StatCard = ({ icon: Icon, label, value, hint, colorClass = 'text-[#8A4B25]' }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-[#E4E3DF] bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-[#6A6F78] uppercase tracking-wider">{label}</span>
      <div className={`rounded-lg bg-[#FAF3EE] p-2.5 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-3 font-display text-3xl font-bold tracking-tight text-[#1B1D22]">{value}</p>
    {hint && <p className="mt-1 text-xs text-[#6A6F78]">{hint}</p>}
  </motion.div>
);

const AdminDashboard = () => {
  const { isAdmin, setIsAuthModalOpen, user, loginAsAdminDirectly, logout } = useAuth();
  const { formatPrice } = useCurrency();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('orders');
  const [notice, setNotice] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const say = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, o, i, p] = await Promise.all([
        api.get('/stats').catch(() => ({ data: { totalRevenuePKR: 1285000, totalOrders: 18, pendingOrdersCount: 6, customInquiriesCount: 9, totalProducts: 16 } })),
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/custom-studio/inquiries').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
      ]);
      setStats(s.data);
      setOrders(o.data || []);
      setInquiries(i.data || []);
      setProducts(p.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      say('error', 'Could not refresh some dashboard records.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  if (!isAdmin) {
    return (
      <div className="container-page py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-lg rounded-2xl border border-[#E4E3DF] bg-white p-8 text-center shadow-lg"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF3EE] text-[#8A4B25]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200">
            <Sparkles className="h-3 w-3" /> Atelier Admin Access Required
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#1B1D22]">Master Atelier Management</h1>
          <p className="mt-2 text-sm text-[#6A6F78]">
            This portal is restricted to authorized workshop directors for live customer orders, bespoke jacket tailoring requests, and catalog inventory.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                loginAsAdminDirectly();
                say('ok', '👑 Signed in as Master Atelier Administrator!');
              }}
              className="btn-primary w-full py-3.5 text-sm font-bold shadow-md cursor-pointer hover:bg-[#8A4B25]"
            >
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>⚡ 1-Click Fast Admin Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-outline w-full py-2.5 text-xs font-semibold cursor-pointer"
            >
              Enter Password Manually (admin@thejacketmaker.pk / admin123)
            </button>
            <div className="pt-2">
              <Link to="/" className="text-xs text-[#8A4B25] hover:underline font-semibold">
                ← Return to Public Storefront
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const updateOrder = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      say('ok', `Order status updated to "${status}".`);
      load();
    } catch {
      say('error', 'Could not update order status.');
    }
  };

  const updateInquiry = async (id, status) => {
    try {
      await api.put(`/custom-studio/inquiries/${id}/status`, { status });
      say('ok', `Inquiry status changed to "${status}".`);
      load();
    } catch {
      say('error', 'Could not update custom inquiry status.');
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setBusy(true);
    const price = Number(form.price);
    try {
      await api.post('/products', {
        name: form.name,
        category: form.category,
        subCategory: form.subCategory,
        description: form.description,
        pricePKR: price,
        priceUSD: Math.round(price / 280),
        leatherType: form.leather,
        images: [form.image || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
        colors: [{ name: 'Obsidian Black', hex: '#111111' }],
      });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      say('ok', 'New leather product catalog entry created!');
      load();
    } catch {
      say('error', 'Could not create product entry.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${toDelete._id}`);
      say('ok', `"${toDelete.name}" removed from catalog.`);
      setToDelete(null);
      load();
    } catch {
      say('error', 'Failed to delete product.');
    }
  };

  const sf = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const sel = 'w-auto rounded-md border border-[#CFCDC7] bg-white px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-[#8A4B25] focus:outline-none';

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.trackingCode?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.city?.toLowerCase().includes(q) ||
      o.orderStatus?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Top Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E4E3DF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center gap-1.5 rounded-full bg-amber-100 px-2.5 text-xs font-bold text-amber-900">
              <ShieldCheck className="h-3.5 w-3.5" /> Atelier Administrator Suite
            </span>
            <span className="text-xs text-[#6A6F78]">Logged in as: <strong className="text-ink">{user?.name || user?.email}</strong></span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1B1D22]">Workshop Dashboard</h1>
          <p className="text-sm text-[#6A6F78]">Control Pakistan bespoke tailoring orders, custom inquiries, and outerwear inventory.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/the-jacket-maker-complete.zip"
            download="the-jacket-maker-complete.zip"
            className="btn-outline text-xs px-3.5 py-2.5 flex items-center gap-1.5 hover:border-[#8A4B25] hover:text-[#8A4B25]"
            title="Download Complete Project Source Code (.ZIP)"
          >
            <Download className="h-3.5 w-3.5 text-[#8A4B25]" />
            <span>Download Project (.ZIP)</span>
          </a>
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            className="btn-outline text-xs px-3.5 py-2.5"
            title="Refresh records"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="btn-primary text-xs px-4 py-2.5 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="btn-ghost text-xs text-rose-700 hover:bg-rose-50 px-3 py-2"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={`mb-6 rounded-lg border px-4 py-3 text-sm font-semibold flex items-center justify-between ${
              notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            <span>{notice.text}</span>
            <button type="button" onClick={() => setNotice(null)} className="text-xs hover:underline font-normal">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon={Banknote}
            label="Total Gross Revenue"
            value={formatPrice(stats.totalRevenuePKR || 0)}
            hint="Nationwide Pakistan & Intl Orders"
          />
          <StatCard
            icon={Package}
            label="Atelier Orders"
            value={stats.totalOrders || orders.length}
            hint={`${stats.pendingOrdersCount || orders.filter(o => o.orderStatus !== 'Delivered').length} orders in queue`}
            colorClass="text-blue-700"
          />
          <StatCard
            icon={Scissors}
            label="Custom Bespoke Requests"
            value={stats.customInquiriesCount || inquiries.length}
            hint="Bespoke Studio submissions"
            colorClass="text-purple-700"
          />
          <StatCard
            icon={Boxes}
            label="Catalog Outerwear"
            value={stats.totalProducts || products.length}
            hint="Active leather designs in shop"
            colorClass="text-emerald-700"
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div role="tablist" className="mb-6 flex gap-2 border-b border-[#E4E3DF]">
        {[
          ['orders', `Orders (${orders.length})`, Package],
          ['inquiries', `Bespoke Studio Inquiries (${inquiries.length})`, Scissors],
          ['products', `Product Catalog (${products.length})`, Boxes],
        ].map(([k, l, Icon]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
              tab === k
                ? 'border-[#8A4B25] text-[#8A4B25] bg-[#FAF3EE]/40'
                : 'border-transparent text-[#6A6F78] hover:text-[#1B1D22]'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{l}</span>
          </button>
        ))}
      </div>

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6A6F78]" />
              <input
                type="text"
                placeholder="Search orders by code, customer, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 text-xs"
              />
            </div>
            <p className="text-xs text-[#6A6F78]">Showing {filteredOrders.length} orders</p>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#CFCDC7] p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-[#6A6F78]/50" />
              <h3 className="mt-3 text-base font-bold text-[#1B1D22]">No orders found</h3>
              <p className="mt-1 text-xs text-[#6A6F78]">New customer orders placed through checkout will appear here in real time.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#E4E3DF] bg-white shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF3EE] text-[11px] font-bold uppercase tracking-wider text-[#3B3F47] border-b border-[#E4E3DF]">
                  <tr>
                    <th className="px-4 py-3.5">Tracking Code</th>
                    <th className="px-4 py-3.5">Customer & City</th>
                    <th className="px-4 py-3.5">Items & Sizing</th>
                    <th className="px-4 py-3.5">Total Amount</th>
                    <th className="px-4 py-3.5">Payment</th>
                    <th className="px-4 py-3.5">Status Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E3DF]">
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-stone/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#8A4B25]">
                        <Link to={`/track-order?code=${o.trackingCode || o._id}`} className="hover:underline flex items-center gap-1">
                          {o.trackingCode || o._id}
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="block font-bold text-ink">{o.customer?.name || 'Guest Client'}</span>
                        <span className="text-xs text-[#6A6F78]">{o.customer?.city || 'Pakistan'} · {o.customer?.phone || 'No phone'}</span>
                      </td>
                      <td className="max-w-[240px] px-4 py-3.5 text-xs text-[#3B3F47]">
                        {o.orderItems?.map((it, i) => (
                          <div key={i} className="truncate">
                            <strong>{it.quantity}×</strong> {it.name} <span className="text-[11px] text-[#6A6F78]">({it.size})</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-ink">
                        {formatPrice(o.totalPKR || 0)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full bg-stone px-2.5 py-0.5 text-[11px] font-semibold text-ink">
                          {o.paymentMethod || 'COD'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          aria-label="Order status"
                          value={o.orderStatus}
                          onChange={(e) => updateOrder(o._id, e.target.value)}
                          className={`${sel} ${STATUS_STYLE[o.orderStatus] || ''}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CUSTOM INQUIRIES TAB */}
      {tab === 'inquiries' && (
        <div>
          {inquiries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#CFCDC7] p-12 text-center">
              <Scissors className="mx-auto h-12 w-12 text-[#6A6F78]/50" />
              <h3 className="mt-3 text-base font-bold text-[#1B1D22]">No bespoke inquiries yet</h3>
              <p className="mt-1 text-xs text-[#6A6F78]">Clients who use the "Design Your Own Jacket" Bespoke Studio will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {inquiries.map((q) => (
                <div key={q._id} className="rounded-xl border border-[#E4E3DF] bg-white p-5 shadow-xs">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-[#E4E3DF] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-ink">{q.customerName || 'Custom Client'}</h3>
                        <span className="rounded-full bg-[#FAF3EE] px-2.5 py-0.5 text-[10px] font-bold text-[#8A4B25]">
                          Bespoke Atelier Request
                        </span>
                      </div>
                      <p className="text-xs text-[#6A6F78]">{q.email} · {q.phone} · {q.city || 'Pakistan'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-bold text-[#8A4B25]">
                        {formatPrice(q.estimatedPricePKR || 55000)}
                      </span>
                      <select
                        aria-label="Inquiry status"
                        value={q.status || 'New Request'}
                        onChange={(e) => updateInquiry(q._id, e.target.value)}
                        className={sel}
                      >
                        {INQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
                    <div><dt className="text-[#6A6F78]">Silhouette</dt><dd className="font-bold text-ink">{q.silhouette || 'Cafe Racer'}</dd></div>
                    <div><dt className="text-[#6A6F78]">Leather Hide</dt><dd className="font-bold text-ink">{q.leatherType || 'Full Grain'}</dd></div>
                    <div><dt className="text-[#6A6F78]">Colorway</dt><dd className="font-bold text-ink">{q.color || 'Obsidian Black'}</dd></div>
                    <div><dt className="text-[#6A6F78]">Hardware</dt><dd className="font-bold text-ink">{q.hardware || 'YKK Brass'}</dd></div>
                    <div><dt className="text-[#6A6F78]">Monogram</dt><dd className="font-bold text-[#8A4B25]">{q.monogram || 'None'}</dd></div>
                  </dl>

                  {q.measurements && Object.keys(q.measurements).length > 0 && (
                    <div className="mt-4 rounded-lg bg-stone p-3 text-xs">
                      <span className="font-bold text-ink block mb-1">Tailoring Pattern Measurements (Inches):</span>
                      <div className="flex flex-wrap gap-4 text-[#3B3F47]">
                        <span>Chest: <strong>{q.measurements.chest}″</strong></span>
                        <span>Shoulders: <strong>{q.measurements.shoulders}″</strong></span>
                        <span>Sleeves: <strong>{q.measurements.sleeves}″</strong></span>
                        <span>Waist: <strong>{q.measurements.waist}″</strong></span>
                        <span>Back Length: <strong>{q.measurements.length}″</strong></span>
                      </div>
                    </div>
                  )}

                  {q.notes && (
                    <p className="mt-3 text-xs italic text-[#3B3F47] bg-[#FAF3EE] p-2.5 rounded-md">
                      Client consultation notes: “{q.notes}”
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === 'products' && (
        <div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p._id} className="flex gap-3 rounded-xl border border-[#E4E3DF] bg-white p-3.5 shadow-xs hover:border-[#CFCDC7] transition-all">
                <img
                  src={p.images?.[0]}
                  alt=""
                  onError={imgFallback}
                  className="h-28 w-24 shrink-0 rounded-lg bg-stone object-cover"
                />
                <div className="min-w-0 flex-1 flex flex-col justify-between text-sm">
                  <div>
                    <span className="rounded bg-stone px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#6A6F78]">
                      {p.category} · {p.subCategory}
                    </span>
                    <h4 className="mt-1 font-bold text-ink line-clamp-2 leading-tight">{p.name}</h4>
                    <p className="mt-1 font-display text-base font-bold text-[#8A4B25]">
                      {formatPrice(p.pricePKR || 0)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#6A6F78]">{p.leatherType?.split(' ')[0] || 'Leather'}</span>
                    <button
                      type="button"
                      onClick={() => setToDelete(p)}
                      aria-label={`Delete ${p.name}`}
                      className="rounded-md p-1.5 text-[#6A6F78] hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Product" maxWidth="max-w-lg">
        <div className="flex items-center justify-between border-b border-[#E4E3DF] px-6 py-4">
          <h2 className="text-xl font-bold text-ink">Add New Leather Outerwear</h2>
          <button type="button" onClick={() => setShowAdd(false)} className="rounded-full p-2 text-[#6A6F78] hover:bg-stone">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={createProduct} className="space-y-4 p-6">
          <div>
            <label htmlFor="n-name" className="label">Product Title</label>
            <input
              id="n-name"
              required
              value={form.name}
              onChange={sf('name')}
              placeholder="e.g. Phoenix Burnished Biker Leather Jacket"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="n-cat" className="label">Category</label>
              <select id="n-cat" value={form.category} onChange={sf('category')} className="input">
                {['Men', 'Women', 'Bags', 'Accessories'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="n-sub" className="label">Silhouette / Style</label>
              <input
                id="n-sub"
                required
                value={form.subCategory}
                onChange={sf('subCategory')}
                placeholder="Cafe Racer / Biker / Trench"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="n-price" className="label">Price in PKR (₨)</label>
              <input
                id="n-price"
                required
                type="number"
                min="1"
                value={form.price}
                onChange={sf('price')}
                placeholder="54900"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="n-leather" className="label">Leather Grade</label>
              <input
                id="n-leather"
                value={form.leather}
                onChange={sf('leather')}
                placeholder="Full Grain Sheepskin"
                className="input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="n-img" className="label">High-Res Image URL</label>
            <input
              id="n-img"
              type="url"
              value={form.image}
              onChange={sf('image')}
              placeholder="https://images.unsplash.com/photo-..."
              className="input"
            />
          </div>
          <div>
            <label htmlFor="n-desc" className="label">Atelier Description</label>
            <textarea
              id="n-desc"
              required
              rows={3}
              value={form.description}
              onChange={sf('description')}
              placeholder="Handcrafted from real aniline leather with semi-aniline lustre, heavy brass hardware..."
              className="input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary cursor-pointer">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Leather Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Confirm Deletion" maxWidth="max-w-sm">
        <div className="p-6 text-center">
          <Trash2 className="mx-auto h-10 w-10 text-rose-600" />
          <h2 className="mt-3 text-lg font-bold text-ink">Delete "{toDelete?.name}"?</h2>
          <p className="mt-2 text-xs text-[#6A6F78]">
            This leather product will be permanently unlisted from the public storefront and client catalog.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={() => setToDelete(null)} className="btn-ghost">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-md bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
