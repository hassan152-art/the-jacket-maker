import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('tjm_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tjm_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item._id === product._id || item.slug === product.slug);
      if (exists) {
        return prev.filter(item => (item._id || item.slug) !== (product._id || product.slug));
      } else {
        return [product, ...prev];
      }
    });
  };

  const isInWishlist = (productIdOrSlug) => {
    return wishlist.some(item => item._id === productIdOrSlug || item.slug === productIdOrSlug);
  };

  const removeFromWishlist = (productIdOrSlug) => {
    setWishlist(prev => prev.filter(item => (item._id || item.slug) !== productIdOrSlug));
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      removeFromWishlist,
      wishlistCount: wishlist.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
