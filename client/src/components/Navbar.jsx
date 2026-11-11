import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Scissors,
  ShieldCheck,
  Truck,
  LogOut,
  Package,
  Phone,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBodyLock, useEscape, imgFallback } from './ui';
import api from '../services/api';

const MEGA = {
  Men: {
    to: '/shop?category=Men',
    links: [
      ['All men’s jackets', '/shop?category=Men'],
      ['Biker jackets', '/shop?category=Men&subCategory=Biker'],
      ['Cafe racer jackets', '/shop?category=Men&subCategory=Cafe Racer'],
      ['Shearling & aviator', '/shop?category=Men&subCategory=Shearling'],
      ['Trench coats', '/shop?category=Men&subCategory=Trench Coats'],
      ['Varsity jackets', '/shop?category=Men&subCategory=Varsity'],
    ],
  },
  Women: {
    to: '/shop?category=Women',
    links: [
      ['All women’s jackets', '/shop?category=Women'],
      ['Biker jackets', '/shop?category=Women&subCategory=Biker'],
      ['Leather blazers', '/shop?category=Women&subCategory=Blazers'],
      ['Shearling coats', '/shop?category=Women&subCategory=Shearling'],
      ['Trench coats', '/shop?category=Women&subCategory=Trench Coats'],
    ],
  },
};

export const Logo = ({ light = false }) => (
  <Link to="/" className="flex items-center gap-2" aria-label="The Jacket Maker – home">
    <span className={`hidden min-[400px]:flex h-8 w-8 items-center justify-center rounded ${light ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
      <Scissors className="h-4 w-4" />
    </span>
    <span className={`whitespace-nowrap font-display text-[17px] font-bold leading-none tracking-wide min-[400px]:text-xl sm:text-[22px] lg:text-xl 2xl:text-[22px] ${light ? 'text-white' : 'text-ink'}`}>
      THE JACKET MAKER
    </span>
  </Link>
);

const CurrencyToggle = ({ dark = false }) => {
  const { currency, setCurrency } = useCurrency();
  const base = dark ? 'text-white/70 hover:text-white' : 'text-ink-muted hover:text-ink';
  const active = dark ? 'bg-white text-ink' : 'bg-ink text-white';
  return (
    <div className="inline-flex items-center rounded border border-current/20 p-0.5 text-[11px] font-semibold" role="group" aria-label="Currency">
      {['PKR', 'USD'].map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`rounded-sm px-2 py-0.5 transition-colors ${currency === c ? active : base}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
};

const IconButton = ({ children, label, badge, ...props }) => (
  <button
    type="button"
    aria-label={label}
    className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-stone"
    {...props}
  >
    {children}
    {badge > 0 && (
      <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-saddle-600 px-1 text-[10px] font-bold text-white">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);

const Navbar = ({ onOpenSearch }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const userRef = useRef(null);
  const location = useLocation();

  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout, setIsAuthModalOpen, isAdmin } = useAuth();

  useBodyLock(mobileOpen);
  useEscape(mobileOpen, () => setMobileOpen(false));
  useEscape(userOpen, () => setUserOpen(false));

  // Close everything on navigation
  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [location.pathname, location.search]);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userOpen) return undefined;
    const onDown = (e) => userRef.current && !userRef.current.contains(e.target) && setUserOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [userOpen]);

  // Close the mobile menu if the viewport grows to desktop size
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => e.matches && setMobileOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const category = new URLSearchParams(location.search).get('category');
  const isShop = location.pathname === '/shop';

  // Desktop search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Search input click outside listener
  useEffect(() => {
    const handleSearchClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleSearchClickOutside);
    return () => document.removeEventListener('mousedown', handleSearchClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get('/products', { params: { search: q } });
        if (!cancelled && res.data) {
          setSearchResults(res.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      setIsSearchActive(false);
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectProduct = (slug) => {
    setIsSearchActive(false);
    setSearchTerm('');
    navigate(`/product/${slug}`);
  };

  const handleSelectTag = (tag) => {
    setIsSearchActive(false);
    setSearchTerm('');
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
  };
  const topLink = 'relative flex h-16 whitespace-nowrap items-center gap-1 px-2.5 text-sm font-semibold text-ink xl:px-3 transition-colors hover:text-saddle-600';
  const underline =
    'after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:bg-saddle-600 after:content-[""]';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-[0_1px_0_0_#E4E3DF]">
        {/* Animated Utility bar */}
        <div className="bg-ink text-white overflow-hidden">
          <div className="container-page flex h-8 sm:h-9 items-center justify-between gap-4 text-[11px] sm:text-xs">
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap font-medium text-white/90">
                <span className="mx-4">🇵🇰 FREE DOORSTEP DELIVERY ACROSS PAKISTAN (LAHORE, KARACHI, ISLAMABAD & NATIONWIDE)</span>
                <span className="text-amber-400">✦</span>
                <span className="mx-4">CASH ON DELIVERY (COD) &amp; ONLINE BANK TRANSFER</span>
                <span className="text-amber-400">✦</span>
                <span className="mx-4">100% CERTIFIED REAL FULL-GRAIN LEATHER</span>
                <span className="text-amber-400">✦</span>
                <span className="mx-4">FREE MADE-TO-MEASURE CUSTOM SIZING</span>
                <span className="text-amber-400">✦</span>
                <span className="mx-4">PROMO CODE: <strong className="text-amber-400">JACKET10</strong> FOR 10% OFF</span>
                <span className="text-amber-400">✦</span>
              </div>
            </div>
            <div className="hidden shrink-0 items-center gap-4 md:flex">
              <Link to="/track-order" className="flex items-center gap-1.5 whitespace-nowrap text-white/80 hover:text-white transition-colors">
                <Truck className="h-3.5 w-3.5" /> Track Order
              </Link>
              <CurrencyToggle dark />
            </div>
          </div>
        </div>

        {/* Main bar */}
        <nav className="container-page relative flex h-16 items-center justify-between gap-3" aria-label="Main">
          {/* Left: burger (mobile) */}
          <div className="flex shrink-0 items-center lg:hidden">
            <IconButton label="Open menu" onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen}>
              <Menu className="h-6 w-6" />
            </IconButton>
          </div>

          {/* Logo: centered on mobile, left on desktop */}
          <div className="flex min-w-0 flex-1 justify-center lg:flex-none lg:justify-start">
            <Logo />
          </div>

          {/* Desktop links */}
          <ul className="hidden items-center lg:flex">
            {Object.entries(MEGA).map(([label, cfg]) => (
              <li key={label} className="group relative">
                <Link to={cfg.to} className={`${topLink} ${isShop && category === label ? underline : ''}`}>
                  {label}
                  <ChevronDown className="h-3.5 w-3.5 text-ink-muted transition-transform group-focus-within:rotate-180 group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 w-60 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="rounded-b-lg border border-line bg-white py-2 shadow-xl">
                    {cfg.links.map(([text, to]) => (
                      <li key={text}>
                        <Link to={to} className="block px-4 py-2 text-sm text-ink-soft hover:bg-stone hover:text-ink">
                          {text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
            <li>
              <Link to="/shop?category=Bags" className={`${topLink} ${isShop && category === 'Bags' ? underline : ''}`}>
                Bags
              </Link>
            </li>
            <li>
              <NavLink to="/custom-studio" className={({ isActive }) => `${topLink} ${isActive ? underline : ''}`}>
                Custom studio
                <span className="hidden rounded bg-saddle-50 px-1.5 py-0.5 text-[10px] font-bold text-saddle-600 2xl:inline">Made to measure</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `${topLink} ${isActive ? underline : ''}`}>
                Our craft
              </NavLink>
            </li>
          </ul>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            {/* Desktop Live Search Bar with Floating Auto-Suggestions */}
            <div className="relative hidden lg:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-[#6A6F78] pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchActive(true)}
                  placeholder="Search jackets, bags, hides..."
                  aria-label="Search leather outerwear"
                  className="h-10 w-48 xl:w-64 2xl:w-72 rounded-full border border-[#CFCDC7] bg-[#F4F3F0]/70 pl-9 pr-8 text-xs font-medium text-[#1B1D22] placeholder:text-[#6A6F78] transition-all duration-200 focus:w-64 xl:focus:w-80 focus:border-[#8A4B25] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A4B25]/20 shadow-2xs"
                />
                {searchLoading ? (
                  <Loader2 className="absolute right-3 h-3.5 w-3.5 animate-spin text-[#8A4B25]" />
                ) : searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                    className="absolute right-2.5 rounded-full p-1 text-[#6A6F78] hover:text-[#1B1D22] cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-3 hidden xl:inline-block rounded bg-white px-1.5 py-0.5 text-[9px] font-mono text-[#6A6F78] border border-[#CFCDC7]/70 shadow-2xs">
                    /
                  </kbd>
                )}
              </form>

              {/* Floating Live Search Dropdown */}
              {isSearchActive && (
                <div className="absolute right-0 top-full mt-2 w-80 xl:w-96 rounded-2xl border border-[#E4E3DF] bg-white p-3 shadow-2xl z-50 animate-fade-in">
                  {searchTerm.trim().length < 2 ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A4B25] mb-2 px-1">
                        <Sparkles className="h-3 w-3" />
                        <span>Trending Atelier Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pb-1">
                        {['Biker', 'Cafe Racer', 'Shearling', 'Leather Bags', 'Trench Coat', 'Varsity'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleSelectTag(tag)}
                            className="rounded-full bg-[#FAF3EE] border border-[#E4C8B0] px-3 py-1 text-xs font-semibold text-[#8A4B25] hover:bg-[#8A4B25] hover:text-white transition-all cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#6A6F78] uppercase tracking-wider mb-2 px-1">
                        <span>Matching Pieces</span>
                        <span>{searchResults.length} found</span>
                      </div>
                      <ul className="divide-y divide-[#E4E3DF]/70">
                        {searchResults.map((item) => (
                          <li key={item._id}>
                            <button
                              type="button"
                              onClick={() => handleSelectProduct(item.slug)}
                              className="flex w-full items-center gap-3 p-2 text-left rounded-xl hover:bg-[#FAF3EE]/60 transition-colors cursor-pointer group"
                            >
                              <img
                                src={item.images?.[0]}
                                alt=""
                                onError={imgFallback}
                                className="h-12 w-10 shrink-0 rounded-lg object-cover bg-stone shadow-2xs"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#1B1D22] truncate group-hover:text-[#8A4B25] transition-colors">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-[#6A6F78] uppercase">
                                  {item.category} · {item.subCategory}
                                </p>
                              </div>
                              <span className="font-display text-xs font-bold text-[#8A4B25] shrink-0">
                                {formatPrice(item.pricePKR)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E4E3DF] bg-[#FAF3EE] py-2 text-xs font-bold text-[#8A4B25] hover:bg-[#8A4B25] hover:text-white transition-all cursor-pointer"
                      >
                        <span>See All Results for "{searchTerm}"</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#6A6F78]">
                      <p className="font-semibold text-[#1B1D22]">No leather outerwear found</p>
                      <p className="mt-1">Try searching "biker", "aviator", or "shearling".</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile / Tablet search icon button */}
            <span className="lg:hidden">
              <IconButton label="Search" onClick={onOpenSearch}>
                <Search className="h-5 w-5" />
              </IconButton>
            </span>

            <Link
              to="/wishlist"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ''}`}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-stone sm:flex"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-saddle-600 px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="mr-2 flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span className="hidden sm:inline">Admin Suite</span>
              </Link>
            )}

            {/* Account (desktop) */}
            <div className="relative hidden lg:block" ref={userRef}>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setUserOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userOpen}
                    className="flex h-10 items-center gap-2 whitespace-nowrap rounded-full pl-1.5 pr-2.5 text-sm font-semibold hover:bg-stone"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-saddle-600 text-xs font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
                  </button>
                  {userOpen && (
                    <div role="menu" className="absolute right-0 top-full mt-2 w-60 animate-fade-in overflow-hidden rounded-lg border border-line bg-white shadow-xl">
                      <div className="border-b border-line px-4 py-3">
                        <p className="text-xs text-ink-muted">Signed in as</p>
                        <p className="truncate text-sm font-semibold">{user.email}</p>
                        {isAdmin && <span className="badge mt-1.5 bg-saddle-50 text-saddle-700">Admin</span>}
                      </div>
                      <Link role="menuitem" to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-stone">
                        <Package className="h-4 w-4 text-ink-muted" /> My orders & profile
                      </Link>
                      {isAdmin && (
                        <Link role="menuitem" to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-stone">
                          <ShieldCheck className="h-4 w-4 text-ink-muted" /> Admin dashboard
                        </Link>
                      )}
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          logout();
                          setUserOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm text-sale hover:bg-stone"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  aria-label="Sign in"
                  className="flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-semibold hover:bg-stone"
                >
                  <User className="h-5 w-5" /> <span className="hidden 2xl:inline">Sign in</span>
                </button>
              )}
            </div>

            <IconButton label={`Open bag, ${totalItemsCount} items`} badge={totalItemsCount} onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
            </IconButton>
          </div>
        </nav>
      </header>

      {/* Mobile drawer – rendered OUTSIDE <header> so `fixed` is relative to the viewport */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[55] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 animate-fade-in bg-ink/60" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-[88%] max-w-sm animate-slide-in-left flex-col bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <Logo />
              <IconButton label="Close menu" onClick={() => setMobileOpen(false)}>
                <X className="h-6 w-6" />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="divide-y divide-line">
                {isAdmin && (
                  <li>
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 bg-amber-50 px-5 py-4 text-base font-bold text-amber-900 border-l-4 border-amber-500"
                    >
                      <ShieldCheck className="h-5 w-5 text-amber-600" />
                      <span>👑 Atelier Admin Dashboard</span>
                    </Link>
                  </li>
                )}
                {Object.entries(MEGA).map(([label, cfg]) => {
                  const open = mobileSection === label;
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => setMobileSection(open ? null : label)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-semibold"
                      >
                        {label}
                        <ChevronDown className={`h-5 w-5 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                      </button>
                      {open && (
                        <ul className="bg-stone/60 pb-2">
                          {cfg.links.map(([text, to]) => (
                            <li key={text}>
                              <Link to={to} className="block px-8 py-3 text-sm text-ink-soft">
                                {text}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
                <li><Link to="/shop?category=Bags" className="block px-5 py-4 text-base font-semibold">Bags</Link></li>
                <li>
                  <Link to="/custom-studio" className="flex items-center justify-between px-5 py-4 text-base font-semibold">
                    Custom studio
                    <span className="rounded bg-saddle-50 px-2 py-0.5 text-[11px] font-bold text-saddle-600">Made to measure</span>
                  </Link>
                </li>
                <li><Link to="/about" className="block px-5 py-4 text-base font-semibold">Our craft</Link></li>
                <li><Link to="/track-order" className="flex items-center gap-2 px-5 py-4 text-base font-semibold"><Truck className="h-5 w-5 text-ink-muted" /> Track order</Link></li>
                <li>
                  <Link to="/wishlist" className="flex items-center gap-2 px-5 py-4 text-base font-semibold">
                    <Heart className="h-5 w-5 text-ink-muted" /> Wishlist {wishlistCount > 0 && <span className="text-sm text-ink-muted">({wishlistCount})</span>}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="shrink-0 space-y-3 border-t border-line bg-white p-4 pb-safe">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Currency</span>
                <CurrencyToggle />
              </div>
              {user ? (
                <div className="space-y-2">
                  <p className="truncate text-sm">
                    Signed in as <strong>{user.name}</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/dashboard" className="btn-outline btn-sm">My account</Link>
                    {isAdmin ? (
                      <Link to="/admin" className="btn-outline btn-sm">Admin</Link>
                    ) : (
                      <button type="button" onClick={logout} className="btn-outline btn-sm">Sign out</button>
                    )}
                  </div>
                  {isAdmin && (
                    <button type="button" onClick={logout} className="btn-ghost btn-sm w-full text-sale">Sign out</button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="btn-primary w-full"
                >
                  <User className="h-4 w-4" /> Sign in / Create account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
