import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, Tag, Truck, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBodyLock, useEscape, imgFallback } from './ui';

const CartDrawer = () => {
  const {
    cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity,
    subtotalPKR, discountAmountPKR, totalPKR, promoCode, applyPromoCode, removePromoCode, promoMessage,
  } = useCart();
  const { formatPrice } = useCurrency();
  const [promo, setPromo] = useState('');
  const navigate = useNavigate();

  const close = () => setIsCartOpen(false);
  useBodyLock(isCartOpen);
  useEscape(isCartOpen, close);

  if (!isCartOpen) return null;

  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[65]" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="absolute inset-0 animate-fade-in bg-ink/60" onClick={close} />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in-right flex-col bg-white shadow-2xl">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-xl font-semibold">
            Your bag <span className="text-base font-normal text-ink-muted">({cartItems.reduce((a, i) => a + i.quantity, 0)})</span>
          </h2>
          <button type="button" onClick={close} aria-label="Close bag" className="-mr-2 rounded-full p-2 hover:bg-stone">
            <X className="h-5 w-5" />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone">
              <ShoppingBag className="h-7 w-7 text-ink-muted" />
            </div>
            <h3 className="text-xl font-semibold">Your bag is empty</h3>
            <p className="mt-1 text-sm text-ink-muted">Add a jacket and it will show up here.</p>
            <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
              <button type="button" onClick={() => go('/shop')} className="btn-primary">Shop all jackets</button>
              <button type="button" onClick={() => go('/custom-studio')} className="btn-outline">Design your own</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-saddle-50 px-5 py-2.5 text-xs font-medium text-saddle-700">
              <Truck className="h-4 w-4" /> Free delivery across Pakistan on every order
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
              {cartItems.map((item) => (
                <li key={item.cartItemId} className="flex gap-4 py-4">
                  <Link to={item.isCustom ? '/custom-studio' : `/product/${item.slug}`} onClick={close} className="shrink-0">
                    <img src={item.image} alt={item.name} onError={imgFallback} className="h-28 w-[88px] rounded bg-stone object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-sans text-sm font-semibold leading-snug">{item.name}</h3>
                      <button type="button" onClick={() => removeFromCart(item.cartItemId)} aria-label={`Remove ${item.name}`} className="-mr-1 -mt-1 rounded p-1.5 text-ink-muted hover:bg-stone hover:text-sale">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {item.color} · {item.size}
                    </p>
                    {item.isCustom && item.customDetails && (
                      <p className="mt-1 text-xs text-saddle-600">
                        Made to order{item.customDetails.monogram ? ` · Monogram ${item.customDetails.monogram}` : ''}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-md border border-line-strong">
                        <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center hover:bg-stone">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center hover:bg-stone">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(item.pricePKR * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="shrink-0 space-y-3 border-t border-line bg-white p-5 pb-safe">
              {promoCode ? (
                <div className="flex items-center justify-between rounded-md bg-saddle-50 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-saddle-700"><Tag className="h-4 w-4" /> {promoCode} applied</span>
                  <button type="button" onClick={removePromoCode} className="text-xs font-semibold underline">Remove</button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (promo.trim()) applyPromoCode(promo) && setPromo('');
                  }}
                  className="flex gap-2"
                >
                  <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" aria-label="Promo code" className="input uppercase" />
                  <button type="submit" className="btn-outline shrink-0">Apply</button>
                </form>
              )}
              {promoMessage && !promoCode && (
                <p className={`text-xs ${promoMessage.type === 'success' ? 'text-ok' : 'text-sale'}`}>{promoMessage.text}</p>
              )}

              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-soft"><dt>Subtotal</dt><dd>{formatPrice(subtotalPKR)}</dd></div>
                {discountAmountPKR > 0 && (
                  <div className="flex justify-between text-ok"><dt>Discount</dt><dd>− {formatPrice(discountAmountPKR)}</dd></div>
                )}
                <div className="flex justify-between text-ink-soft"><dt>Delivery</dt><dd className="text-ok">Free</dd></div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(totalPKR)}</dd></div>
              </dl>

              <button type="button" onClick={() => go('/checkout')} className="btn-primary w-full py-3.5">
                <Lock className="h-4 w-4" /> Checkout
              </button>
              <button type="button" onClick={close} className="w-full text-center text-sm font-semibold text-ink-soft underline-offset-4 hover:underline">
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
