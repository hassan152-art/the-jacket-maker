import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Check, Eye, Truck, Ruler, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { Stars, imgFallback } from './ui';

const ProductCard = ({ product, priority = false, index = 0 }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [colorIdx, setColorIdx] = useState(0);
  const [added, setAdded] = useState('');
  const [mobileSizeOpen, setMobileSizeOpen] = useState(false);

  const liked = isInWishlist(product._id || product.slug);
  const colors = product.colors || [];
  const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const onSale = product.originalPricePKR > product.pricePKR;
  const second = product.images?.[1];

  const quickAdd = (size, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    addToCart(product, {
      size,
      color: colors[colorIdx]?.name || 'Obsidian Black',
      quantity: 1
    });
    setAdded(size);
    setTimeout(() => {
      setAdded('');
      setMobileSizeOpen(false);
    }, 1600);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      transition={{ duration: 0.65, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white p-3 sm:p-3.5 border border-[#E8E6E1] shadow-[0_4px_20px_-8px_rgba(27,29,34,0.06)] transition-all duration-500 hover:border-[#8A4B25]/45 hover:shadow-[0_24px_50px_-14px_rgba(138,75,37,0.22),0_8px_20px_-8px_rgba(27,29,34,0.08)]"
    >
      {/* CARD TOP / IMAGE PRESENTATION STAGE */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-[#F7F6F3]">
        <Link
          to={`/product/${product.slug}`}
          className="relative block h-full w-full overflow-hidden"
          aria-label={product.name}
        >
          {/* Primary Image */}
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            onError={imgFallback}
            className={`h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-106 ${
              second ? 'group-hover:opacity-0 transition-opacity duration-500' : ''
            }`}
          />

          {/* Secondary Hover Image */}
          {second && (
            <img
              src={second}
              alt={`${product.name} alternate view`}
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = 'none')}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:scale-106 group-hover:opacity-100"
            />
          )}

          {/* Subtle Ambient Shadow & Lighting Gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          {/* Diagonal Luxury Satin Sheen */}
          <div className="pointer-events-none absolute inset-y-0 -left-2/3 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-[450%] group-hover:opacity-100" />
        </Link>

        {/* Top Badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-20 flex flex-col items-start gap-1.5">
          {onSale && product.discountPercent > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#B3261E] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
              Save {product.discountPercent}%
            </span>
          )}
          {product.bestSeller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1B1D22]/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-md uppercase">
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
              <span>Best Seller</span>
            </span>
          )}
          {product.isNewArrival && (
            <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-[#1B1D22] shadow-md uppercase">
              New In
            </span>
          )}
          {product.madeToMeasureAvailable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3EE]/95 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-extrabold text-[#8A4B25] border border-[#E4C8B0] shadow-xs">
              <Ruler className="h-2.5 w-2.5" />
              <span>Free Custom Sizing</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <motion.button
          whileTap={{ scale: 0.78 }}
          whileHover={{ scale: 1.1 }}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-pressed={liked}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-md ${
            liked
              ? 'bg-[#B3261E] text-white shadow-[#B3261E]/40'
              : 'bg-white/85 text-[#1B1D22] hover:bg-white hover:text-[#8A4B25]'
          }`}
        >
          <Heart className={`h-4 w-4 transition-transform duration-200 ${liked ? 'fill-current scale-110' : ''}`} />
        </motion.button>

        {/* Mobile Quick Add Floating Button */}
        <div className="absolute right-2.5 bottom-2.5 z-20 md:hidden">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileSizeOpen(!mobileSizeOpen);
            }}
            aria-label="Quick select size"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#1B1D22] shadow-lg backdrop-blur-md border border-[#E8E6E1] active:scale-95 transition-all"
          >
            <ShoppingBag className="h-4 w-4 text-[#8A4B25]" />
          </button>
        </div>

        {/* Desktop Interactive Quick-Action Drawer */}
        <div className="absolute inset-x-2 bottom-2 z-20 hidden md:block">
          <div className="translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-2xl bg-white/95 backdrop-blur-md p-2.5 shadow-xl border border-white/70">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A6F78]">
                {added ? (
                  <span className="text-[#1E7B4B] flex items-center gap-1 font-bold animate-pulse">
                    <Check className="h-3 w-3 stroke-[2.5]" /> Size {added} Added!
                  </span>
                ) : (
                  <span>Quick Add Size</span>
                )}
              </span>
              <Link
                to={`/product/${product.slug}`}
                className="text-[10px] font-bold text-[#8A4B25] hover:underline flex items-center gap-1"
              >
                <span>View Details</span>
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {sizes.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => quickAdd(s, e)}
                  className={`rounded-lg py-1.5 text-center text-xs font-bold transition-all cursor-pointer ${
                    added === s
                      ? 'bg-[#1E7B4B] text-white scale-105 shadow-sm'
                      : 'border border-[#CFCDC7] bg-white text-[#1B1D22] hover:border-[#8A4B25] hover:bg-[#8A4B25] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Size Selection Drawer */}
        <AnimatePresence>
          {mobileSizeOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute inset-x-2 bottom-2 z-30 md:hidden rounded-2xl bg-white/95 backdrop-blur-md p-3 shadow-xl border border-white/70"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A6F78]">
                  {added ? (
                    <span className="text-[#1E7B4B] flex items-center gap-1 font-bold">
                      <Check className="h-3.5 w-3.5" /> Added {added}!
                    </span>
                  ) : (
                    <span>Select Size</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileSizeOpen(false)}
                  className="text-xs text-[#6A6F78] hover:text-black font-bold p-0.5"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {sizes.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => quickAdd(s, e)}
                    className="rounded-lg border border-[#CFCDC7] bg-white py-1.5 text-xs font-bold text-[#1B1D22] active:bg-[#8A4B25] active:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CARD BODY / PRODUCT METADATA */}
      <div className="mt-3 flex flex-1 flex-col justify-between px-1">
        <div>
          {/* Eyebrow / Leather Badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6A6F78] truncate">
              {product.category}{product.subCategory ? ` · ${product.subCategory}` : ''}
            </span>
            <span className="shrink-0 rounded-full bg-[#FAF3EE] px-2 py-0.5 text-[10px] font-bold text-[#8A4B25] border border-[#F2E3D7]">
              {product.leatherType?.split(' ')?.[0] || 'Real'} Leather
            </span>
          </div>

          {/* Product Title */}
          <h3 className="mt-2 font-display text-[17px] sm:text-[19px] font-bold text-[#1B1D22] line-clamp-2 leading-[1.2] group-hover:text-[#8A4B25] transition-colors duration-300">
            <Link to={`/product/${product.slug}`} className="bg-gradient-to-r from-[#8A4B25] to-[#8A4B25] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1.5px]">
              {product.name}
            </Link>
          </h3>

          {/* Star Ratings */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#6A6F78]">
            <Stars value={product.rating || 4.9} size={13} />
            <span className="font-extrabold text-[#1B1D22] text-[11px]">{product.rating?.toFixed(1) || '4.9'}</span>
            <span className="text-[11px] text-[#8C9098]">({product.numReviews || 48} reviews)</span>
          </div>
        </div>

        {/* Pricing & Color Swatches */}
        <div className="mt-3.5 border-t border-dashed border-[#E4E3DF] pt-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className={`font-display text-xl sm:text-[22px] font-extrabold tracking-tight ${onSale ? 'text-[#B3261E]' : 'text-[#1B1D22]'}`}>
                {formatPrice(product.pricePKR)}
              </span>
              {onSale && (
                <span className="font-display text-xs text-[#8C9098] line-through">
                  {formatPrice(product.originalPricePKR)}
                </span>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-[#1E7B4B]">
              <Truck className="h-3 w-3" />
              <span>Free Delivery · COD</span>
            </p>
          </div>

          {/* Color Variant Dots */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5 pb-1" role="group" aria-label="Available Colors">
              {colors.slice(0, 4).map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setColorIdx(i);
                  }}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={i === colorIdx}
                  className={`h-4 w-4 rounded-full border border-black/25 ring-offset-2 transition-all duration-300 cursor-pointer ${
                    i === colorIdx ? 'ring-2 ring-[#8A4B25] scale-110' : 'opacity-75 hover:opacity-100 hover:scale-120'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Luxury Bottom Accent Line on Hover */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#8A4B25] via-[#D9A21B] to-[#8A4B25] transition-transform duration-500 ease-out group-hover:scale-x-100" />
    </motion.article>
  );
};

export default ProductCard;
