import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useBodyLock, useEscape, imgFallback } from './ui';
import api from '../services/api';

const SUGGESTIONS = ['Biker', 'Shearling', 'Trench', 'Blazer', 'Bag', 'Varsity'];

const SearchModal = ({ isOpen, onClose }) => {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useBodyLock(isOpen);
  useEscape(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setTerm('');
    setResults([]);
    setSearched(false);
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return undefined;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/products', { params: { search: q } });
        if (!cancelled) {
          setResults(res.data.slice(0, 6));
          setSearched(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [term]);

  if (!isOpen) return null;

  const go = (path) => {
    onClose();
    navigate(path);
  };
  const submit = (e) => {
    e.preventDefault();
    if (term.trim()) go(`/shop?search=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 animate-fade-in bg-ink/60" onClick={onClose} />
      <div className="relative mx-auto flex max-h-[100dvh] w-full max-w-2xl animate-slide-up flex-col bg-white shadow-2xl sm:mt-16 sm:max-h-[80vh] sm:rounded-xl">
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            type="search"
            enterKeyHint="search"
            placeholder="Search jackets, bags, styles…"
            aria-label="Search products"
            className="h-14 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-muted/70"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />}
          <button type="button" onClick={onClose} aria-label="Close search" className="rounded-full p-2 hover:bg-stone">
            <X className="h-5 w-5" />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {term.trim().length < 2 && (
            <div>
              <p className="mb-3 text-xs font-semibold text-ink-muted">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => go(`/shop?search=${encodeURIComponent(s)}`)} className="chip">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searched && results.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-muted">
              No results for “{term.trim()}”. Try a different word, like “biker” or “shearling”.
            </p>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-line">
              {results.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => go(`/product/${p.slug}`)}
                    className="flex w-full items-center gap-3 py-3 text-left hover:bg-stone/60 sm:px-2"
                  >
                    <img src={p.images?.[0]} alt="" onError={imgFallback} className="h-16 w-14 shrink-0 rounded bg-stone object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block truncate text-xs text-ink-muted">{p.category} · {p.subCategory}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">{formatPrice(p.pricePKR)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {results.length > 0 && (
          <button
            type="button"
            onClick={submit}
            className="flex items-center justify-center gap-2 border-t border-line py-3.5 text-sm font-semibold text-saddle-600 hover:bg-stone/60"
          >
            See all results for “{term.trim()}” <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
