import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Ruler,
  Scissors,
  Truck,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  ChevronDown,
  CheckCircle2,
  Check,
  Clock,
  Compass,
  Star,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { Reveal, RevealStagger, RevealItem, CountUp } from '../components/Reveal';
import { Stars, imgFallback } from '../components/ui';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';

const TABS = [
  { key: 'All', label: 'All Atelier Pieces', test: () => true },
  { key: 'Men', label: "Men's Jackets", test: (p) => p.category === 'Men' },
  { key: 'Women', label: "Women's Jackets", test: (p) => p.category === 'Women' },
  { key: 'Shearling', label: 'Shearling & Aviator', test: (p) => p.subCategory === 'Shearling' },
  { key: 'Bags', label: 'Leather Bags & Duffels', test: (p) => p.category === 'Bags' },
  { key: 'Accessories', label: 'Artisan Accessories', test: (p) => p.category === 'Accessories' },
];

const CATEGORY_TILES = [
  {
    label: "Men's Leather Jackets",
    subtitle: 'Biker, Cafe Racer, Shearling & Trench',
    to: '/shop?category=Men',
    img: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80',
    count: '12+ Styles',
    badge: 'Popular'
  },
  {
    label: "Women's Outerwear",
    subtitle: 'Moto Jackets, Blazers & Merino Coats',
    to: '/shop?category=Women',
    img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80',
    count: '8+ Styles',
    badge: 'Trending'
  },
  {
    label: 'Merino Wool Shearling',
    subtitle: 'WW2 B3 Flight Bombers & Winter Armor',
    to: '/shop?subCategory=Shearling',
    img: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80',
    count: 'Plush 22mm Fur',
    badge: 'Luxury'
  },
  {
    label: 'Overland Leather Bags',
    subtitle: 'Full-Grain Duffels, Briefcases & Backpacks',
    to: '/shop?category=Bags',
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    count: 'Lifetime Carry',
    badge: 'Handcrafted'
  },
];

const CRAFT_PILLARS = [
  {
    icon: Award,
    title: '100% Certified Full-Grain Leather',
    desc: 'We never use split, bonded, or faux PVC leather. Sourced exclusively from top-tier tanneries, our hides retain the natural grain, breathability, and develop an irreplaceable vintage patina over decades.',
  },
  {
    icon: Scissors,
    title: 'Sialkot Artisan Heritage',
    desc: 'Crafted in the historical leather epicentre of Pakistan by master pattern drafters and leather smiths who have perfected tailoring outerwear for international luxury brands for over three generations.',
  },
  {
    icon: Ruler,
    title: 'Zero-Cost Bespoke Custom Sizing',
    desc: 'Off-the-rack sizing rarely fits every physique. Provide your chest, shoulders, sleeve length, and waist measurements for any design, and our tailors will cut a unique paper pattern just for you for free.',
  },
  {
    icon: Truck,
    title: 'Nationwide Courier & COD Service',
    desc: 'Fast doorstep express delivery to Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Peshawar, Sialkot, Quetta, and every district across Pakistan, with Cash on Delivery and direct bank transfer.',
  },
];

const REVIEWS = [
  {
    title: 'Surpasses leather jackets I bought in London & Milan',
    body: 'Ordered the Cafe Racer with custom sleeve and shoulder adjustments. The sheepskin is butter-soft and the YKK brass hardware is top tier. Arrived in Lahore within 4 days in a premium garment dust bag. Absolutely phenomenal craftsmanship.',
    name: 'Hamza Tariq Qureshi',
    meta: 'Gulberg, Lahore · Verified Custom Fit',
    rating: 5,
    jacket: 'Ionic Cafe Racer (Full Grain Sheepskin)'
  },
  {
    title: 'Bespoke Studio tailored my Aviator Shearling to perfection',
    body: 'I submitted my custom chest and sleeve measurements for the Merino Shearling bomber. The wool fleece is dense and plush, keeping me completely warm during winter travels. Customer care on WhatsApp was swift and attentive.',
    name: 'Dr. Ayesha Siddiqui',
    meta: 'F-7, Islamabad · Bespoke Studio Client',
    rating: 5,
    jacket: 'Highlander Aviator Shearling'
  },
  {
    title: 'Unmatched leather quality at half the international retail cost',
    body: 'The distressed cowhide patina on the Biker jacket is authentic and heavy. You can smell the real vegetable-tanned leather straight out of the box. Delivery to Clifton Karachi was seamless with Cash on Delivery.',
    name: 'Umar Farooq',
    meta: 'DHA Phase 6, Karachi · Verified Buyer',
    rating: 5,
    jacket: 'Inferno Distressed Biker'
  },
  {
    title: 'The Overland Duffel Bag is an heirloom piece',
    body: 'Bought the weekender bag for domestic and Dubai flights. The brass rivets, heavy stitching, and dedicated shoe tunnel make it one of the most functional and handsome travel bags I own.',
    name: 'Shahzaib Khan',
    meta: 'Rawalpindi · Verified Buyer',
    rating: 5,
    jacket: 'The Overland Weekender'
  }
];

const FAQS = [
  {
    q: 'How does your Free Made-to-Measure custom sizing work?',
    a: 'On every jacket product page or inside our interactive Bespoke Studio, you can toggle between standard sizes (XS–3XL) and "Custom Sizing". Simply input your chest, shoulder width, sleeve length, and waist in inches or centimeters. Our pattern makers draft a 1-of-1 bespoke blueprint specifically tailored to your body dimensions at zero additional cost.'
  },
  {
    q: 'Is your leather 100% genuine full-grain leather?',
    a: 'Yes, unconditionally. Every single jacket and bag is crafted from 100% authentic full-grain or top-grain lambskin, cowhide, goatskin suede, or merino sheepskin shearling. We never use PU, bonded leather, or artificial grain embossing. Our leather matures and develops a rich pull-up patina over years of wear.'
  },
  {
    q: 'How long does delivery take across Pakistan?',
    a: 'Ready-to-wear jackets and accessories are dispatched within 24 to 48 hours via TCS or Leopards Express and delivered within 2–4 business days. Custom made-to-measure orders undergo hand pattern drafting, cutting, and stitching in our Sialkot atelier, shipping out within 8–12 business days.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery (COD) across all cities in Pakistan, Direct Online Bank Transfer (Meezan Bank, HBL, Bank Alfalah), JazzCash, EasyPaisa, and Visa/Mastercard.'
  },
  {
    q: 'What if the jacket does not fit me properly?',
    a: 'We offer a 100% Fit Guarantee. If a ready-to-wear jacket does not fit as expected, you can exchange it within 30 days for another size. For made-to-measure jackets, if any adjustment is needed, our workshop provides complimentary pattern alterations until it fits like a glove.'
  }
];

const SILHOUETTE_SHOWCASE = [
  {
    name: 'Cafe Racer',
    desc: 'Clean minimalist racing collar with snap closure, quilt shoulder panels, and streamlined athletic profile.',
    img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    popularIn: 'Obsidian Black & Vintage Cognac'
  },
  {
    name: 'Double Rider Biker',
    desc: 'Asymmetric diagonal brass zipper, notched lapels, coin pocket, and belted waist for timeless rebel style.',
    img: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=700&q=80',
    popularIn: 'Distressed Cowhide & Oxblood'
  },
  {
    name: 'Aviator Shearling',
    desc: 'Cold-weather armor with 100% dense merino wool fleece lining, buckled throat latch, and storm wind flaps.',
    img: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80',
    popularIn: 'Raw Umber & Dark Chocolate'
  },
  {
    name: 'Varsity Bomber',
    desc: '24oz heavy Melton wool torso paired with hand-rubbed cowhide leather sleeves and retro ribbed knit collars.',
    img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    popularIn: 'Forest Green & Jet Black'
  }
];

const HomePage = () => {
  const { formatPrice } = useCurrency();
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 700], [0, 90]);
  const heroImgScale = useTransform(scrollY, [0, 700], [1.05, 1.12]);
    const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeSilhouette, setActiveSilhouette] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .get('/products')
      .then((res) => {
        if (alive && res.data) setProducts(res.data);
      })
      .catch((err) => console.error('Failed to load homepage products:', err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const featured = useMemo(() => {
    const t = TABS.find((item) => item.key === tab) || TABS[0];
    return [...products].filter(t.test).slice(0, 8);
  }, [products, tab]);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#E4E3DF] bg-[#FAF3EE]/60 pt-6 pb-12 sm:pt-10 sm:pb-20 lg:pt-16 lg:pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-[#D9A21B]/15 blur-3xl" />
        <div className="container-page relative grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 xl:col-span-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E4C8B0] bg-white px-3.5 py-1.5 text-xs font-bold text-[#8A4B25] shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SIALKOT BESPOKE ATELIER · PAKISTAN</span>
            </div>

            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#1B1D22] leading-[1.05]">
              Sculpted in <span className="text-[#8A4B25] italic font-serif-luxury font-normal">Full-Grain Leather</span>.<br className="hidden sm:inline" /> Cut to Your Exact Form.
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#3B3F47] max-w-xl font-normal">
              Authentic handcrafted leather outerwear, built by master craftsmen in Sialkot. Choose our acclaimed ready-to-wear silhouettes or have any jacket tailored to your exact measurements at zero cost.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link to="/shop" className="btn-primary py-4 px-8 text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <span>Explore Atelier Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/custom-studio" className="btn-outline py-4 px-7 text-sm font-bold bg-white cursor-pointer hover:border-[#8A4B25] hover:text-[#8A4B25] transition-all">
                <Scissors className="h-4 w-4 text-[#8A4B25]" />
                <span>3D Made-To-Measure Studio</span>
              </Link>
            </div>

            {/* Micro value props */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 border-t border-[#E4E3DF] pt-6 text-xs text-[#3B3F47]">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#8A4B25] shrink-0" />
                <span className="font-semibold">Free Doorstep Delivery (COD)</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[#8A4B25] shrink-0" />
                <span className="font-semibold">100% Free Custom Tailoring</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Award className="h-4 w-4 text-[#8A4B25] shrink-0" />
                <span className="font-semibold">30-Day Fit Guarantee</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Image Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 xl:col-span-6 relative"
          >
            <div className="relative mx-auto aspect-[4/5] max-w-md lg:max-w-none overflow-hidden rounded-3xl bg-stone shadow-2xl border-4 border-white">
              <motion.img
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85"
                alt="Ionic Cafe Racer Leather Jacket"
                onError={imgFallback}
                style={{ y: heroImgY, scale: heroImgScale, willChange: 'transform' }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {/* Floating Badge 1 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute left-4 top-4 rounded-xl bg-white/90 px-3.5 py-2 shadow-lg border border-white/40"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A4B25]">Artisan Piece</p>
                <p className="text-xs font-extrabold text-ink">Burnished Cafe Racer</p>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="absolute right-4 bottom-4 rounded-xl bg-black/80 px-4 py-3 text-white shadow-xl border border-white/20 max-w-[220px]"
              >
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span className="text-xs font-bold">4.95 / 5.0</span>
                </div>
                <p className="mt-1 text-[11px] text-white/90 font-medium">
                  "The finest full-grain lambskin in Pakistan."
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* METRIC STRIP */}
      <section className="border-b border-[#E4E3DF] bg-white py-6">
        <RevealStagger stagger={0.12} className="container-page grid grid-cols-2 gap-4 lg:grid-cols-4 text-center divide-y lg:divide-y-0 lg:divide-x divide-[#E4E3DF]">
          <RevealItem distance={24} className="p-3">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#1B1D22]"><CountUp to={25000} suffix="+" /></p>
            <p className="text-xs font-semibold text-[#6A6F78] uppercase tracking-wider mt-1">Jackets Handcrafted</p>
          </RevealItem>
          <RevealItem distance={24} className="p-3">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#8A4B25]"><CountUp to={100} suffix="%" /></p>
            <p className="text-xs font-semibold text-[#6A6F78] uppercase tracking-wider mt-1">Real Full-Grain Leather</p>
          </RevealItem>
          <RevealItem distance={24} className="p-3">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#1B1D22]">Rs. <CountUp to={0} /></p>
            <p className="text-xs font-semibold text-[#6A6F78] uppercase tracking-wider mt-1">Free Custom Tailoring</p>
          </RevealItem>
          <RevealItem distance={24} className="p-3">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#1B1D22]"><CountUp to={4.9} decimals={1} /> / 5</p>
            <p className="text-xs font-semibold text-[#6A6F78] uppercase tracking-wider mt-1">Verified Client Satisfaction</p>
          </RevealItem>
        </RevealStagger>
      </section>

      {/* CATEGORY EXPLORER */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container-page">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A4B25]">Curated Collections</span>
              <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B1D22]">
                Explore by Leather Category
              </h2>
            </div>
            <Link to="/shop" className="link flex items-center gap-1.5 text-sm font-bold">
              <span>View Full Outerwear Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <RevealStagger stagger={0.12} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORY_TILES.map((cat) => (
              <RevealItem key={cat.label} distance={56} className="h-full">
                <Link
                  to={cat.to}
                  className="group relative flex flex-col h-[28rem] overflow-hidden rounded-[28px] bg-[#1B1D22] shadow-[0_12px_32px_-12px_rgba(27,29,34,0.35)] border border-[#E8E6E1]/50 transition-all duration-700 hover:-translate-y-2 hover:border-[#8A4B25]/80 hover:shadow-[0_32px_64px_-20px_rgba(138,75,37,0.5)]"
                >
                  <img
                    src={cat.img}
                    alt={cat.label}
                    onError={imgFallback}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-110 group-hover:rotate-[0.5deg]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#8A4B25]/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#1B1D22] shadow-md border border-white/60">
                      {cat.badge}
                    </span>
                    <span className="flex h-10 w-10 -translate-y-2 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#1B1D22] opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-[#8A4B25] group-hover:text-white">
                      <ArrowRight className="h-4 w-4 -rotate-45" />
                    </span>
                  </div>

                  <div className="relative mt-auto p-6 z-10 text-white">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 backdrop-blur-md px-3 py-0.5 text-[11px] font-bold text-amber-300">
                      {cat.count}
                    </span>
                    <h3 className="mt-2.5 font-display text-[1.85rem] font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm">
                      {cat.label}
                    </h3>
                    <p className="mt-1.5 text-xs text-white/80 line-clamp-1">{cat.subtitle}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 group-hover:text-white transition-colors">
                      <span>Explore Collection</span>
                      <span className="h-px w-6 bg-amber-400 transition-all duration-500 group-hover:w-14 group-hover:bg-white" />
                    </div>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* FEATURED PRODUCT CATALOG TABS */}
      <section className="py-14 sm:py-20 bg-stone/40 border-y border-[#E4E3DF]">
        <div className="container-page">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A4B25]">Handmade in Sialkot</span>
            <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B1D22]">
              Atelier Flagship Collection
            </h2>
            <p className="mt-2 text-sm text-[#6A6F78]">
              Precision cut from butter-soft lambskin, rugged cowhide, and dense merino wool shearling. Ready to ship nationwide.
            </p>
          </Reveal>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-xl bg-white border border-[#E4E3DF] shadow-2xs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    tab === t.key
                      ? 'bg-[#1B1D22] text-white shadow-xs'
                      : 'text-[#6A6F78] hover:text-[#1B1D22]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-xl border border-line bg-white p-3 space-y-3">
                  <div className="aspect-[4/5] rounded-lg bg-stone animate-pulse" />
                  <div className="h-4 bg-stone rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-stone rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((product, idx) => (
                <ProductCard key={product._id || product.slug} product={product} priority={idx < 2} index={idx} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/shop" className="btn-outline px-8 py-3.5 text-sm font-bold bg-white cursor-pointer shadow-2xs hover:bg-[#1B1D22] hover:text-white">
              <span>View All Outerwear & Bags</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BESPOKE STUDIO INTERACTIVE SHOWCASE */}
      <section className="py-16 sm:py-24 bg-[#1B1D22] text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#8A4B25]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#8A4B25]/15 blur-3xl" />

        <div className="container-page relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column */}
            <Reveal direction="right" distance={60} className="lg:col-span-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 border border-amber-400/20">
                <Scissors className="h-3.5 w-3.5" /> INTERACTIVE 3D BESPOKE STUDIO
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Don't Just Settle for a Standard Fit. <br />
                <span className="text-[#E4C8B0] font-serif italic">Design Your Own.</span>
              </h2>
              <p className="mt-4 text-base text-white/80 leading-relaxed">
                Step inside our digital atelier. Choose your base silhouette, hand-select your leather hide (Sheepskin, Heavy Cowhide, Goatskin Suede, or Merino Shearling), personalize your hardware and inner lining, and add custom hot-stamped monogram initials.
              </p>

              {/* Step indicator preview */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8A4B25] text-white font-bold text-xs">
                    01
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Choose Silhouette & Leather Hide</p>
                    <p className="text-[11px] text-white/60">Biker, Cafe Racer, Shearling, Bomber, Blazer, Trench</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8A4B25] text-white font-bold text-xs">
                    02
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Hardware, Lining & Hot-Stamped Monogram</p>
                    <p className="text-[11px] text-white/60">YKK Brass, Gunmetal, Tartan, Quilted Silk + Custom Initials</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8A4B25] text-white font-bold text-xs">
                    03
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Precision Body Measurements (Free)</p>
                    <p className="text-[11px] text-white/60">Drafted from scratch by our master pattern makers</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/custom-studio" className="btn-accent py-4 px-8 text-sm font-bold shadow-xl inline-flex items-center gap-2 cursor-pointer">
                  <Scissors className="h-4 w-4" />
                  <span>Start Designing in Bespoke Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            {/* Right Interactive Silhouette Selector */}
            <Reveal direction="left" distance={60} delay={0.15} className="lg:col-span-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Atelier Silhouette Selector</p>
                  <span className="text-xs text-white/60">Live Preview</span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                  {SILHOUETTE_SHOWCASE.map((s, idx) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setActiveSilhouette(idx)}
                      className={`rounded-xl p-2.5 text-center text-xs font-bold transition-all cursor-pointer border ${
                        activeSilhouette === idx
                          ? 'border-amber-400 bg-amber-400/20 text-white'
                          : 'border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                {/* Selected silhouette card */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black/40 border border-white/10">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeSilhouette}
                      src={SILHOUETTE_SHOWCASE[activeSilhouette].img}
                      alt={SILHOUETTE_SHOWCASE[activeSilhouette].name}
                      onError={imgFallback}
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="h-full w-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Bespoke Base
                    </span>
                    <h4 className="mt-1 text-xl font-bold text-white font-display">
                      {SILHOUETTE_SHOWCASE[activeSilhouette].name}
                    </h4>
                    <p className="mt-1 text-xs text-white/80 line-clamp-2">
                      {SILHOUETTE_SHOWCASE[activeSilhouette].desc}
                    </p>
                    <p className="mt-2 text-[11px] text-amber-400 font-medium">
                      Popular Finishes: {SILHOUETTE_SHOWCASE[activeSilhouette].popularIn}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CRAFTSMANSHIP & LEATHER GUIDE PILLARS */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-page">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A4B25]">Uncompromising Standards</span>
            <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B1D22]">
              The Anatomy of Our Leather Craft
            </h2>
            <p className="mt-2 text-sm text-[#6A6F78]">
              Every hide is hand-inspected for grain density, tensile strength, and natural temper before cutting.
            </p>
          </Reveal>

          <RevealStagger stagger={0.13} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CRAFT_PILLARS.map((col, i) => (
              <RevealItem key={col.title} distance={50} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-[24px] border border-[#E4E3DF] bg-gradient-to-b from-white to-[#FAF3EE]/70 p-7 transition-all duration-500 hover:-translate-y-2 hover:border-[#8A4B25]/40 hover:shadow-[0_28px_50px_-26px_rgba(138,75,37,0.5)]">
                  <span className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[7rem] font-bold leading-none text-[#8A4B25]/[0.06] transition-all duration-500 group-hover:text-[#8A4B25]/[0.12] group-hover:-translate-y-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8A4B25] text-white shadow-lg shadow-[#8A4B25]/25 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <col.icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative mt-6 text-xl font-bold leading-tight text-[#1B1D22] font-display">{col.title}</h3>
                  <p className="relative mt-3 text-[13px] leading-relaxed text-[#3B3F47]">{col.desc}</p>
                  <span className="absolute inset-x-7 bottom-0 h-[3px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#8A4B25] to-[#D9A21B] transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* VERIFIED CUSTOMER REVIEWS & WALL OF ATELIER */}
      <section className="py-16 sm:py-24 bg-stone/40 border-t border-[#E4E3DF]">
        <div className="container-page">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-ink ml-1">4.92 Out of 5 Stars (2,400+ Reviews)</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B1D22]">
                Word From Our Clients
              </h2>
            </div>
            <Link to="/about" className="link text-sm font-bold flex items-center gap-1">
              <span>Read Our Full Story & Tanning Process</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <RevealStagger stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((rev) => (
              <RevealItem key={rev.name} distance={50} className="h-full">
                <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] border border-[#E8E6E1] bg-white p-6 shadow-[0_4px_20px_-8px_rgba(27,29,34,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-[#8A4B25]/50 hover:shadow-[0_24px_50px_-16px_rgba(138,75,37,0.25)]">
                  <span className="pointer-events-none absolute right-4 top-2 select-none font-display text-8xl leading-none text-[#8A4B25]/10 transition-colors duration-500 group-hover:text-[#8A4B25]/25">”</span>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Stars value={rev.rating} size={14} />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1E7B4B]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#1E7B4B]">
                        <Check className="h-2.5 w-2.5" /> Verified Order
                      </span>
                    </div>
                    <h3 className="text-[16px] font-bold leading-snug text-[#1B1D22] line-clamp-2 font-display group-hover:text-[#8A4B25] transition-colors">{rev.title}</h3>
                    <p className="mt-2.5 text-xs text-[#3B3F47] leading-relaxed line-clamp-4">{rev.body}</p>
                  </div>
                  <div className="relative mt-5 flex items-center gap-3 border-t border-dashed border-[#E4E3DF] pt-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8A4B25] to-[#552B14] text-xs font-extrabold text-white shadow-sm">
                      {rev.name.replace(/^Dr\.\s*/, '').charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1B1D22] truncate">{rev.name}</p>
                      <p className="text-[11px] text-[#6A6F78] truncate">{rev.meta}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-[#8A4B25] truncate">{rev.jacket}</p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 sm:py-24 bg-white border-t border-[#E4E3DF]">
        <div className="container-page max-w-3xl">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A4B25]">Frequently Asked Questions</span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[#1B1D22]">
              Everything You Need to Know
            </h2>
            <p className="mt-2 text-xs text-[#6A6F78]">Have questions about bespoke tailoring or delivery in Pakistan?</p>
          </Reveal>

          <RevealStagger stagger={0.08} className="space-y-3">
            {FAQS.map((faq, i) => (
              <RevealItem key={i} distance={28} className="rounded-xl border border-[#E4E3DF] overflow-hidden bg-white transition-shadow hover:shadow-md">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-ink hover:bg-stone/30 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-[#6A6F78] transition-transform ${activeFaq === i ? 'rotate-180 text-[#8A4B25]' : ''}`} />
                </button>
                {activeFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-[#E4E3DF] bg-[#FAF3EE]/40 p-5 text-xs text-[#3B3F47] leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
