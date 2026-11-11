import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Truck, CheckCircle2, ShoppingBag, Lock, Banknote, Landmark, Smartphone, Loader2, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState, imgFallback } from '../components/ui';
import api from '../services/api';

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Sialkot',
  'Gujranwala', 'Quetta', 'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Other (Pakistan)',
];

const PAYMENTS = [
  { id: 'COD', icon: Banknote, title: 'Cash on delivery', text: 'Pay the courier when your order arrives.' },
  { id: 'BankTransfer', icon: Landmark, title: 'Bank transfer', text: 'Meezan Bank, HBL or Bank Alfalah. Account details are shared after you place the order.' },
  { id: 'JazzCash/EasyPaisa', icon: Smartphone, title: 'JazzCash / EasyPaisa', text: 'Send from your mobile wallet. Wallet details are shared after you place the order.' },
];

const PAYMENT_LABEL = Object.fromEntries(PAYMENTS.map((p) => [p.id, p.title]));

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, subtotalPKR, discountAmountPKR, totalPKR, clearCart, promoCode } = useCart();
  const { formatPrice } = useCurrency();

  const [f, setF] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city && CITIES.includes(user.city) ? user.city : 'Lahore',
    postalCode: '',
    notes: '',
  });
  const [payment, setPayment] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  if (done) {
    return (
      <div className="container-page py-12 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ok/10">
            <CheckCircle2 className="h-9 w-9 text-ok" />
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Thank you, {done.customer?.name?.split(' ')[0]}!</h1>
          <p className="mt-3 text-ink-soft">
            Your order is confirmed. We’ll prepare it and send it to <strong>{done.customer?.city}</strong> by courier.
          </p>

          <dl className="mt-8 divide-y divide-line rounded-lg border border-line text-left text-sm">
            <div className="flex justify-between gap-4 p-4"><dt className="text-ink-muted">Tracking code</dt><dd className="font-mono font-semibold">{done.trackingCode}</dd></div>
            <div className="flex justify-between gap-4 p-4"><dt className="text-ink-muted">Payment</dt><dd className="font-semibold">{PAYMENT_LABEL[done.paymentMethod] || done.paymentMethod}</dd></div>
            <div className="flex justify-between gap-4 p-4"><dt className="text-ink-muted">Total</dt><dd className="font-semibold">{formatPrice(done.totalPKR)}</dd></div>
          </dl>

          {done.paymentMethod !== 'COD' && (
            <p className="mt-4 rounded-md bg-saddle-50 p-3 text-sm text-saddle-700">
              We’ll contact you on {done.customer?.phone} with the payment details for your order.
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={`/track-order?code=${done.trackingCode}`} className="btn-primary"><Truck className="h-4 w-4" /> Track your order</Link>
            <Link to="/shop" className="btn-outline">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={ShoppingBag} title="Your bag is empty" text="Add a jacket to your bag to continue to checkout.">
          <Link to="/shop" className="btn-primary">Shop jackets</Link>
        </EmptyState>
      </div>
    );
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');
    if (!f.name.trim() || !f.phone.trim() || !f.address.trim() || !f.city) {
      setError('Please fill in your name, phone, address and city.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        customer: { ...f, name: f.name.trim(), country: 'Pakistan' },
        orderItems: cartItems.map((i) => ({
          product: i.productId,
          name: i.name,
          slug: i.slug,
          image: i.image,
          pricePKR: i.pricePKR,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          isCustom: i.isCustom,
          customDetails: i.customDetails,
        })),
        paymentMethod: payment,
        subtotalPKR,
        shippingFeePKR: 0,
        discountPKR: discountAmountPKR,
        totalPKR,
      });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      setDone(res.data);
      clearCart();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.message || 'We couldn’t place your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-10">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <p className="mt-1 text-sm text-ink-muted">Free delivery across Pakistan. Cash on delivery available.</p>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        <div className="space-y-10">
          <section aria-labelledby="ship-h">
            <h2 id="ship-h" className="mb-4 text-xl font-semibold">Delivery details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="label">Full name *</label>
                <input id="c-name" required autoComplete="name" value={f.name} onChange={set('name')} className="input" />
              </div>
              <div>
                <label htmlFor="c-phone" className="label">Phone / WhatsApp *</label>
                <input id="c-phone" required type="tel" autoComplete="tel" placeholder="03XX XXXXXXX" value={f.phone} onChange={set('phone')} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-email" className="label">Email (for order updates)</label>
                <input id="c-email" type="email" autoComplete="email" value={f.email} onChange={set('email')} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-addr" className="label">Street address *</label>
                <input id="c-addr" required autoComplete="street-address" placeholder="House, street, area" value={f.address} onChange={set('address')} className="input" />
              </div>
              <div>
                <label htmlFor="c-city" className="label">City *</label>
                <select id="c-city" required value={f.city} onChange={set('city')} className="input">
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-zip" className="label">Postal code</label>
                <input id="c-zip" inputMode="numeric" autoComplete="postal-code" value={f.postalCode} onChange={set('postalCode')} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-notes" className="label">Delivery notes (optional)</label>
                <textarea id="c-notes" rows={2} value={f.notes} onChange={set('notes')} className="input" />
              </div>
            </div>
          </section>

          <fieldset>
            <legend className="mb-4 text-xl font-semibold">Payment</legend>
            <div className="space-y-3">
              {PAYMENTS.map(({ id, icon: Icon, title, text }) => (
                <label
                  key={id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${payment === id ? 'border-ink bg-stone/60 ring-1 ring-ink' : 'border-line-strong hover:border-ink'}`}
                >
                  <input type="radio" name="payment" checked={payment === id} onChange={() => setPayment(id)} className="mt-1 h-4 w-4 accent-ink" />
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-saddle-600" />
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-xs text-ink-muted">{text}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <div className="rounded-lg border border-line bg-stone/50 p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <ul className="mt-4 max-h-80 divide-y divide-line overflow-y-auto">
              {cartItems.map((i) => (
                <li key={i.cartItemId} className="flex gap-3 py-3">
                  <div className="relative">
                    <img src={i.image} alt="" onError={imgFallback} className="h-20 w-16 rounded bg-white object-cover" />
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">{i.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">{i.name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{i.color} · {i.size}</p>
                    {i.isCustom && <p className="text-xs text-saddle-600">Made to order</p>}
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(i.pricePKR * i.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatPrice(subtotalPKR)}</dd></div>
              {discountAmountPKR > 0 && (
                <div className="flex justify-between text-ok"><dt>Discount {promoCode && `(${promoCode})`}</dt><dd>− {formatPrice(discountAmountPKR)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-ink-soft">Delivery</dt><dd className="text-ok">Free</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd>{formatPrice(totalPKR)}</dd></div>
            </dl>

            {error && <p role="alert" className="mt-4 rounded-md bg-sale/5 px-3 py-2 text-sm text-sale">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full py-3.5">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {submitting ? 'Placing order…' : `Place order · ${formatPrice(totalPKR)}`}
            </button>
            <p className="mt-3 text-center text-xs text-ink-muted">Made-to-measure orders take 10–14 days to craft.</p>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
