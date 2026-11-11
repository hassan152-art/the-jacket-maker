import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { EmptyState } from '../components/ui';

const WishlistPage = () => {
  const { wishlist, wishlistCount } = useWishlist();
  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        Wishlist <span className="text-xl font-normal text-ink-muted">({wishlistCount})</span>
      </h1>
      <p className="mt-1 text-sm text-ink-muted">Your saved jackets and accessories.</p>

      <div className="mt-8">
        {wishlist.length === 0 ? (
          <EmptyState icon={Heart} title="Nothing saved yet" text="Tap the heart on any product to save it here for later.">
            <Link to="/shop" className="btn-primary">Browse products</Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((p, i) => (
              <ProductCard key={p._id || p.slug} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
