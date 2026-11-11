import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, SearchX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Breadcrumbs, EmptyState, useBodyLock, useEscape } from '../components/ui';
import { useCurrency } from '../context/CurrencyContext';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';
import api from '../services/api';

const CATEGORIES = ['All', 'Men', 'Women', 'Bags', 'Accessories'];
const SUBS_BY_CATEGORY = {
  All: ['Biker', 'Cafe Racer', 'Shearling', 'Trench Coats', 'Blazers', 'Varsity', 'Leather Bags'],
  Men: ['Biker', 'Cafe Racer', 'Shearling', 'Trench Coats', 'Varsity'],
  Women: ['Biker', 'Blazers', 'Shearling', 'Trench Coats'],
  Bags: ['Leather Bags'],
  Accessories: [],
};
const TITLES = {
  All: 'All products',
  Men: 'Men’s leather jackets',
  Women: 'Women’s leather jackets',
  Bags: 'Leather bags',
  Accessories: 'Accessories',
};
const PRICE_PRESETS = [
  { label: 'Under Rs 50,000', min: '', max: '50000' },
  { label: 'Rs 50,000 – 70,000', min: '50000', max: '70000' },
  { label: 'Over Rs 70,000', min: '70000', max: '' },
];

const FilterBody = ({ category, sub, min, max, setMin, setMax, update, clearAll, hasFilters }) => {
  const subs = SUBS_BY_CATEGORY[category] || [];
  const radio = (active) =>
    `flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-stone ${active ? 'font-semibold text-ink' : 'text-ink-soft'}`;
  const dot = (active) => (
    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? 'border-ink' : 'border-line-strong'}`}>
      {active && <span className="h-2 w-2 rounded-full bg-ink" />}
    </span>
  );

  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Category</legend>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => update({ category: c === 'All' ? '' : c, subCategory: '' })} className={radio(category === c)}>
            {dot(category === c)} {c}
          </button>
        ))}
      </fieldset>

      {subs.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Style</legend>
          <button type="button" onClick={() => update({ subCategory: '' })} className={radio(!sub)}>
            {dot(!sub)} All styles
          </button>
          {subs.map((s) => (
            <button key={s} type="button" onClick={() => update({ subCategory: s })} className={radio(sub === s)}>
              {dot(sub === s)} {s}
            </button>
          ))}
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Price (PKR)</legend>
        <div className="mb-3 flex items-center gap-2">
          <input type="number" inputMode="numeric" min="0" placeholder="Min" aria-label="Minimum price" value={min} onChange={(e) => setMin(e.target.value)} onBlur={() => update({ minPrice: min })} className="input" />
          <span className="text-ink-muted">–</span>
          <input type="number" inputMode="numeric" min="0" placeholder="Max" aria-label="Maximum price" value={max} onChange={(e) => setMax(e.target.value)} onBlur={() => update({ maxPrice: max })} className="input" />
        </div>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setMin(p.min);
                setMax(p.max);
                update({ minPrice: p.min, maxPrice: p.max });
              }}
              className={`chip ${min === p.min && max === p.max ? 'chip-active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      {hasFilters && (
        <button type="button" onClick={clearAll} className="link text-sm">Clear all filters</button>
      )}
    </div>
  );
};

const ShopPage = () => {
  const [params, setParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const category = params.get('category') || 'All';
  const sub = params.get('subCategory') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'newest';
  const minParam = params.get('minPrice') || '';
  const maxParam = params.get('maxPrice') || '';

  const [min, setMin] = useState(minParam);
  const [max, setMax] = useState(maxParam);
  useEffect(() => {
    setMin(minParam);
    setMax(maxParam);
  }, [minParam, maxParam]);

  useBodyLock(sheetOpen);
  useEscape(sheetOpen, () => setSheetOpen(false));

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    const q = { sort };
    if (category !== 'All') q.category = category;
    if (sub) q.subCategory = sub;
    if (search) q.search = search;
    if (minParam) q.minPrice = minParam;
    if (maxParam) q.maxPrice = maxParam;
    api
      .get('/products', { params: q })
      .then((res) => {
        if (alive && res.data && res.data.length > 0) {
          setProducts(res.data);
        } else if (alive) {
          // Filter fallback products locally
          let filtered = [...FALLBACK_PRODUCTS];
          if (category !== 'All') filtered = filtered.filter(p => p.category === category);
          if (sub) filtered = filtered.filter(p => p.subCategory === sub);
          if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
          }
          if (minParam) filtered = filtered.filter(p => p.pricePKR >= Number(minParam));
          if (maxParam) filtered = filtered.filter(p => p.pricePKR <= Number(maxParam));
          setProducts(filtered);
        }
      })
      .catch(() => {
        if (alive) {
          let filtered = [...FALLBACK_PRODUCTS];
          if (category !== 'All') filtered = filtered.filter(p => p.category === category);
          if (sub) filtered = filtered.filter(p => p.subCategory === sub);
          if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
          }
          if (minParam) filtered = filtered.filter(p => p.pricePKR >= Number(minParam));
          if (maxParam) filtered = filtered.filter(p => p.pricePKR <= Number(maxParam));
          setProducts(filtered);
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [category, sub, search, sort, minParam, maxParam]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: false });
  };
  const clearAll = () => {
    setMin('');
    setMax('');
    setParams(new URLSearchParams(sort !== 'newest' ? { sort } : {}));
  };

  const hasFilters = category !== 'All' || !!sub || !!search || !!minParam || !!maxParam;
  const activeChips = useMemo(() => {
    const chips = [];
    if (category !== 'All') chips.push({ label: category, clear: { category: '', subCategory: '' } });
    if (sub) chips.push({ label: sub, clear: { subCategory: '' } });
    if (search) chips.push({ label: `“${search}”`, clear: { search: '' } });
    if (minParam) chips.push({ label: `From ${formatPrice(minParam)}`, clear: { minPrice: '' } });
    if (maxParam) chips.push({ label: `Up to ${formatPrice(maxParam)}`, clear: { maxPrice: '' } });
    return chips;
  }, [category, sub, search, minParam, maxParam, formatPrice]);

  const title = search ? `Results for “${search}”` : sub && category === 'All' ? sub : TITLES[category] || category;
  const filterProps = { category, sub, min, max, setMin, setMax, update, clearAll, hasFilters };

  return (
    <div className="container-page py-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: category !== 'All' || sub ? '/shop' : undefined },
          ...(category !== 'All' ? [{ label: category }] : []),
        ]}
      />

      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          {!loading && !error && (
            <p className="mt-1 text-sm text-ink-muted">{products.length} {products.length === 1 ? 'product' : 'products'}</p>
          )}
        </div>
      </div>

      {/* toolbar */}
      <div className="sticky top-[100px] z-20 -mx-4 mb-6 flex items-center justify-between gap-3 border-y border-line bg-white px-4 py-3 sm:mx-0 sm:px-0 lg:static lg:border-t-0 lg:py-0 lg:pb-4">
        <button type="button" onClick={() => setSheetOpen(true)} className="btn-outline btn-sm lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters{activeChips.length ? ` (${activeChips.length})` : ''}
        </button>
        <div className="hidden flex-wrap gap-2 lg:flex">
          {activeChips.map((c) => (
            <button key={c.label} type="button" onClick={() => update(c.clear)} className="chip chip-active" aria-label={`Remove filter ${c.label}`}>
              {c.label} <X className="h-3 w-3" />
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="hidden text-ink-muted sm:inline">Sort by</span>
          <select value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })} className="input w-auto py-2">
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </select>
        </label>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <FilterBody {...filterProps} />
          </div>
        </aside>

        <section aria-live="polite">
          {loading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton aspect-[4/5]" />
                  <div className="skeleton mt-3 h-4 w-3/4" />
                  <div className="skeleton mt-2 h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Couldn’t load products" text="Please check that the server is running and try again.">
              <button type="button" onClick={() => window.location.reload()} className="btn-primary">Reload</button>
            </EmptyState>
          ) : products.length === 0 ? (
            <EmptyState icon={SearchX} title="No products found" text="Try removing a filter or searching for something else.">
              <button type="button" onClick={clearAll} className="btn-primary">Clear filters</button>
              <Link to="/custom-studio" className="btn-outline">Design your own</Link>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} priority={i < 3} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* mobile filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 animate-fade-in bg-ink/60" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] animate-slide-up flex-col rounded-t-2xl bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close filters" className="-mr-2 rounded-full p-2 hover:bg-stone">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <FilterBody {...filterProps} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-line p-4 pb-safe">
              <button type="button" onClick={clearAll} className="btn-outline">Clear</button>
              <button type="button" onClick={() => setSheetOpen(false)} className="btn-primary">
                Show {loading ? '' : products.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
