import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Heart, Minus, Plus, Truck, RefreshCcw, ShieldCheck, Ruler, ChevronDown, Check, SearchX } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';
import SizeGuideModal from '../components/SizeGuideModal';
import { Stars, Breadcrumbs, EmptyState, imgFallback } from '../components/ui';
import api from '../services/api';

const Accordion = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold"
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5 text-sm leading-relaxed text-ink-soft">{children}</div>}
    </div>
  );
};

const MEASURES = [
  ['chest', 'Chest'],
  ['shoulders', 'Shoulders'],
  ['sleeves', 'Sleeve length'],
  ['waist', 'Waist'],
  ['length', 'Jacket length'],
];

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ok | notfound | error
  const [img, setImg] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [mtm, setMtm] = useState(false);
  const [measures, setMeasures] = useState({ chest: '', shoulders: '', sleeves: '', waist: '', length: '' });
  const [formError, setFormError] = useState('');
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const ctaRef = useRef(null);

  // review form
  const [rev, setRev] = useState({ name: '', rating: 5, comment: '' });
  const [revBusy, setRevBusy] = useState(false);
  const [revError, setRevError] = useState('');

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setImg(0);
    setQty(1);
    setMtm(false);
    setFormError('');
    (async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (!alive) return;
        setProduct(data);
        setColor(data.colors?.[0]?.name || '');
        setSize('');
        setStatus('ok');
        api
          .get('/products', { params: { category: data.category } })
          .then((r) => alive && setRelated(r.data.filter((p) => p._id !== data._id).slice(0, 4)))
          .catch(() => {});
        api
          .get(`/reviews/${data._id}`)
          .then((r) => alive && setReviews(r.data))
          .catch(() => alive && setReviews([]));
      } catch (err) {
        if (alive) setStatus(err.response?.status === 404 ? 'notfound' : 'error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  // show mobile sticky bar only when the main CTA scrolls out of view
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || status !== 'ok') return undefined;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="container-page grid gap-10 py-10 md:grid-cols-2">
        <div className="skeleton aspect-[4/5]" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-5 w-1/3" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    );
  }

  if (status !== 'ok') {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={SearchX}
          title={status === 'notfound' ? 'Product not found' : 'Couldn’t load this product'}
          text={status === 'notfound' ? 'This jacket may have been retired from the collection.' : 'Please check that the server is running and try again.'}
        >
          <Link to="/shop" className="btn-primary">Browse all products</Link>
        </EmptyState>
      </div>
    );
  }

  const liked = isInWishlist(product._id || product.slug);
  const onSale = product.originalPricePKR > product.pricePKR;
  const images = product.images?.length ? product.images : [''];
  const canMTM = product.madeToMeasureAvailable !== false && product.category !== 'Bags' && product.category !== 'Accessories';
  const needsSize = (product.sizes || []).length > 0;
  const reviewCount = Math.max(product.numReviews || 0, reviews.length);

  const validate = () => {
    if (mtm) {
      const missing = MEASURES.filter(([k]) => !(Number(measures[k]) > 0)).map(([, l]) => l.toLowerCase());
      if (missing.length) {
        setFormError(`Please enter your ${missing.join(', ')} in inches.`);
        return false;
      }
    } else if (needsSize && !size) {
      setFormError('Please select a size.');
      return false;
    }
    setFormError('');
    return true;
  };

  const doAdd = (openCart) => {
    if (!validate()) return false;
    addToCart(product, {
      size: mtm ? 'Custom (Made-to-Measure)' : size || 'One Size',
      color,
      quantity: qty,
      isCustom: mtm,
      customDetails: mtm
        ? {
            measurements: Object.fromEntries(MEASURES.map(([k]) => [k, Number(measures[k])])),
            silhouette: product.subCategory,
            leatherType: product.leatherType,
            lining: product.lining,
            hardware: product.hardware,
          }
        : null,
      openCart,
    });
    return true;
  };

  const showProblem = () => ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const handleAdd = () => {
    if (doAdd(true)) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } else {
      showProblem();
    }
  };
  const handleBuyNow = () => {
    if (doAdd(false)) navigate('/checkout');
    else showProblem();
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setRevError('');
    if (!rev.name.trim() || !rev.comment.trim()) return;
    setRevBusy(true);
    try {
      const res = await api.post('/reviews', { productId: product._id, name: rev.name.trim(), rating: rev.rating, comment: rev.comment.trim() });
      setReviews((r) => [res.data, ...r]);
      setRev({ name: '', rating: 5, comment: '' });
    } catch {
      setRevError('Sorry, we couldn’t post your review. Please try again.');
    } finally {
      setRevBusy(false);
    }
  };

  const specRows = product.specs
    ? [
        ['Outer shell', product.specs.outerShell || product.leatherType],
        ['Finish', product.specs.leatherFinish],
        ['Closure', product.specs.closure || product.hardware],
        ['Collar', product.specs.collar],
        ['Cuffs', product.specs.cuffs],
        ['Pockets', product.specs.pockets],
        ['Lining', product.lining],
      ].filter(([, v]) => v)
    : [];

  return (
    <div className="container-page py-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: product.category, to: `/shop?category=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        {/* GALLERY */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-32 lg:h-fit lg:flex-row-reverse">
          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-lg bg-stone">
            <img src={images[img]} alt={product.name} onError={imgFallback} className="h-full w-full object-cover" fetchPriority="high" />
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
              {onSale && product.discountPercent > 0 && <span className="badge bg-sale text-white">−{product.discountPercent}%</span>}
              {product.bestSeller && <span className="badge bg-ink text-white">Best seller</span>}
            </div>
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImg(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === img}
                  className={`aspect-[4/5] w-16 shrink-0 overflow-hidden rounded border-2 bg-stone lg:w-full ${i === img ? 'border-ink' : 'border-transparent hover:border-line-strong'}`}
                >
                  <img src={src} alt="" onError={imgFallback} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <p className="text-sm text-ink-muted">{product.subCategory} · {product.leatherType}</p>
          <h1 className="mt-1 text-3xl font-semibold leading-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <Stars value={product.rating || 0} size={16} />
            <span className="font-semibold">{(product.rating || 0).toFixed(1)}</span>
            <a href="#reviews" className="text-ink-muted underline-offset-4 hover:underline">{reviewCount} reviews</a>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3">
            <span className={`text-3xl font-semibold ${onSale ? 'text-sale' : ''}`}>{formatPrice(product.pricePKR)}</span>
            {onSale && <span className="text-lg text-ink-muted line-through">{formatPrice(product.originalPricePKR)}</span>}
            {onSale && product.discountPercent > 0 && <span className="badge bg-sale/10 text-sale">Save {product.discountPercent}%</span>}
          </div>
          <p className="mt-1 text-xs text-ink-muted">Taxes included. Free delivery across Pakistan.</p>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{product.description}</p>

          {/* colour */}
          {product.colors?.length > 0 && (
            <div className="mt-7">
              <p className="mb-2 text-sm font-semibold">Colour: <span className="font-normal text-ink-soft">{color}</span></p>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Colour">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={color === c.name}
                    title={c.name}
                    aria-label={c.name}
                    onClick={() => setColor(c.name)}
                    className={`h-9 w-9 rounded-full border border-black/15 ring-offset-2 transition ${color === c.name ? 'ring-2 ring-ink' : 'hover:ring-1 hover:ring-ink-muted'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* size */}
          {needsSize && (
            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Size{!mtm && size ? `: ${size}` : ''}</p>
                <button type="button" onClick={() => setGuideOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold text-saddle-600 hover:underline">
                  <Ruler className="h-4 w-4" /> Size guide
                </button>
              </div>
              <div className={`grid grid-cols-4 gap-2 sm:grid-cols-6 ${mtm ? 'pointer-events-none opacity-40' : ''}`} role="radiogroup" aria-label="Size">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={size === s}
                    disabled={mtm}
                    onClick={() => {
                      setSize(s);
                      setFormError('');
                    }}
                    className={`rounded-md border py-3 text-sm font-semibold transition-colors ${size === s ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-ink'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* made to measure */}
          {canMTM && (
            <div className="mt-5 rounded-lg border border-line p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={mtm}
                  onChange={(e) => {
                    setMtm(e.target.checked);
                    setFormError('');
                  }}
                  className="mt-1 h-4 w-4 accent-saddle-600"
                />
                <span>
                  <span className="block text-sm font-semibold">Make it to my measurements <span className="ml-1 text-ok">Free</span></span>
                  <span className="block text-xs text-ink-muted">Ready in 10–14 days. We verify every measurement before cutting.</span>
                </span>
              </label>
              {mtm && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {MEASURES.map(([k, label]) => (
                    <div key={k}>
                      <label htmlFor={`m-${k}`} className="label">{label} (in)</label>
                      <input
                        id={`m-${k}`}
                        type="number"
                        inputMode="decimal"
                        min="1"
                        step="0.5"
                        value={measures[k]}
                        onChange={(e) => setMeasures((m) => ({ ...m, [k]: e.target.value }))}
                        className="input"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {formError && (
            <p role="alert" className="mt-4 rounded-md bg-sale/5 px-3 py-2 text-sm text-sale">{formError}</p>
          )}

          {/* CTA */}
          <div ref={ctaRef} className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center rounded-md border border-line-strong">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-12 w-11 items-center justify-center hover:bg-stone">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(10, q + 1))} className="flex h-12 w-11 items-center justify-center hover:bg-stone">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button type="button" onClick={handleAdd} className="btn-primary h-12 min-w-0 flex-1">
              {added ? <><Check className="h-4 w-4" /> Added</> : 'Add to bag'}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-pressed={liked}
              aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
              className="flex h-12 w-12 items-center justify-center rounded-md border border-line-strong hover:border-ink"
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-sale text-sale' : ''}`} />
            </button>
            <button type="button" onClick={handleBuyNow} className="btn-outline h-12 w-full">Buy it now</button>
          </div>

          <ul className="mt-6 grid gap-3 rounded-lg bg-stone p-4 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 shrink-0 text-saddle-600" /> Free delivery</li>
            <li className="flex items-center gap-2"><RefreshCcw className="h-4 w-4 shrink-0 text-saddle-600" /> 30-day free alterations</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-saddle-600" /> Cash on delivery</li>
          </ul>

          <div className="mt-6 border-t border-line">
            <Accordion title="Materials & construction" defaultOpen>
              {specRows.length > 0 ? (
                <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-[140px_1fr]">
                  {specRows.map(([k, v]) => (
                    <React.Fragment key={k}>
                      <dt className="font-semibold text-ink">{k}</dt>
                      <dd>{v}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              ) : (
                <p>{product.leatherType}. {product.hardware}</p>
              )}
            </Accordion>
            <Accordion title="Delivery & returns">
              <p>Free courier delivery to every city in Pakistan. Ready-to-wear jackets usually arrive in 2–5 working days. Made-to-measure jackets take 10–14 days to craft.</p>
              <p className="mt-2">Pay by cash on delivery, bank transfer, JazzCash or EasyPaisa. If the fit isn’t right, we alter it free of charge within 30 days.</p>
            </Accordion>
            <Accordion title="Leather care">
              <p>Keep away from direct heat and store on a wide hanger. Wipe with a soft, dry cloth and condition once or twice a year. Avoid soaking; if wet, let it dry naturally.</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <section id="reviews" className="mt-16 border-t border-line pt-12">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div>
            <h2 className="text-2xl font-semibold">Customer reviews</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-display text-5xl font-semibold">{(product.rating || 0).toFixed(1)}</span>
              <div>
                <Stars value={product.rating || 0} size={18} />
                <p className="mt-0.5 text-sm text-ink-muted">{reviewCount} reviews</p>
              </div>
            </div>

            <form onSubmit={submitReview} className="mt-8 space-y-4">
              <h3 className="font-sans text-base font-semibold">Write a review</h3>
              <div>
                <p className="label">Your rating</p>
                <div className="flex gap-0.5" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rev.rating === n}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      onClick={() => setRev((r) => ({ ...r, rating: n }))}
                      className="rounded p-1"
                    >
                      <Star className={`h-7 w-7 ${n <= rev.rating ? 'fill-star text-star' : 'text-line-strong'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="rv-name" className="label">Name</label>
                <input id="rv-name" required value={rev.name} onChange={(e) => setRev((r) => ({ ...r, name: e.target.value }))} className="input" />
              </div>
              <div>
                <label htmlFor="rv-comment" className="label">Review</label>
                <textarea id="rv-comment" required rows={4} value={rev.comment} onChange={(e) => setRev((r) => ({ ...r, comment: e.target.value }))} className="input" />
              </div>
              {revError && <p role="alert" className="text-sm text-sale">{revError}</p>}
              <button type="submit" disabled={revBusy} className="btn-primary w-full">{revBusy ? 'Posting…' : 'Post review'}</button>
            </form>
          </div>

          <ul className="divide-y divide-line">
            {reviews.length === 0 && <li className="py-6 text-sm text-ink-muted">No reviews yet. Be the first to share your experience.</li>}
            {reviews.map((r) => (
              <li key={r._id} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={r.rating} size={15} />
                  {r.verifiedPurchase && <span className="badge bg-ok/10 text-ok">Verified purchase</span>}
                </div>
                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{r.comment}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  {r.name}
                  {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  {r.fitFeedback ? ` · Fit: ${r.fitFeedback}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-12">
          <h2 className="mb-8 text-2xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky buy bar */}
      {showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex animate-slide-up items-center gap-3 border-t border-line bg-white px-4 py-3 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,.06)] md:hidden">
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-muted">{product.name}</p>
            <p className="font-semibold">{formatPrice(product.pricePKR)}</p>
          </div>
          <button type="button" onClick={handleAdd} className="btn-primary ml-auto shrink-0 px-6">Add to bag</button>
        </div>
      )}

      <SizeGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

export default ProductDetailPage;
