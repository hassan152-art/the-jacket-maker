import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';

/** Fractional star rating (e.g. 4.6 fills 92% of the row). */
export const Stars = ({ value = 0, size = 14, className = '' }) => {
  const pct = Math.max(0, Math.min(100, (Number(value) / 5) * 100));
  const row = (cls) =>
    [1, 2, 3, 4, 5].map((i) => (
      <Star key={i} width={size} height={size} className={`shrink-0 fill-current ${cls}`} strokeWidth={0} />
    ));
  return (
    <span
      className={`relative inline-flex ${className}`}
      role="img"
      aria-label={`Rated ${Number(value).toFixed(1)} out of 5`}
    >
      <span className="flex text-line-strong">{row('')}</span>
      <span className="absolute inset-y-0 left-0 flex overflow-hidden text-star" style={{ width: `${pct}%` }}>
        {row('')}
      </span>
    </span>
  );
};

export const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-5 text-xs text-ink-muted">
    <ol className="flex flex-wrap items-center gap-1">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <li key={i} className="flex min-w-0 items-center gap-1">
            {item.to && !last ? (
              <Link to={item.to} className="hover:text-ink hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={`truncate ${last ? 'font-medium text-ink' : ''}`} aria-current={last ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!last && <ChevronRight className="h-3 w-3 shrink-0" />}
          </li>
        );
      })}
    </ol>
  </nav>
);

export const EmptyState = ({ icon: Icon, title, text, children }) => (
  <div className="rounded-lg border border-dashed border-line-strong bg-stone/60 px-6 py-14 text-center">
    {Icon && (
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <h3 className="text-xl font-semibold">{title}</h3>
    {text && <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">{text}</p>}
    {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
  </div>
);

export const Spinner = ({ className = 'h-5 w-5' }) => (
  <span className={`inline-block animate-spin rounded-full border-2 border-line-strong border-t-ink ${className}`} />
);

/** Lock page scroll while an overlay is open. */
export const useBodyLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    return () => {
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [locked]);
};

/** Call handler when Escape is pressed (only while active). */
export const useEscape = (active, handler) => {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === 'Escape' && handler();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, handler]);
};

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'><rect width='400' height='500' fill='%23EAE8E3'/><path d='M270 150l-50-25-20 28-20-28-50 25-20 55 35 12 12 150h86l12-150 35-12z' fill='%23CFCDC7'/></svg>";

export const imgFallback = (e) => {
  if (e.currentTarget.dataset.fallback) return;
  e.currentTarget.dataset.fallback = '1';
  e.currentTarget.src = PLACEHOLDER_IMG;
};

/** Modal shell: centered dialog on desktop, bottom sheet feel on mobile. */
export const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useBodyLock(open);
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-ink/60" onClick={onClose} />
      <div className={`relative z-10 flex max-h-[92dvh] w-full ${maxWidth} animate-slide-up flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-xl`}>
        {children}
      </div>
    </div>
  );
};
