import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('tjm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('tjm_cart', JSON.stringify(cartItems));
    } catch {
      /* storage unavailable */
    }
  }, [cartItems]);

  const addToCart = (product, { size = 'M', color = null, quantity = 1, isCustom = false, customDetails = null, openCart = true } = {}) => {
    setCartItems(prev => {
      const selectedColor = color || (product.colors && product.colors[0]?.name) || 'Black';
      const existingIdx = prev.findIndex(item =>
        item.productId === (product._id || product.slug) &&
        item.size === size &&
        item.color === selectedColor &&
        !item.isCustom
      );

      if (existingIdx > -1 && !isCustom) {
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      const newItem = {
        cartItemId: `${product._id || product.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product._id || product.slug,
        name: product.name,
        slug: product.slug,
        pricePKR: product.pricePKR,
        priceUSD: product.priceUSD,
        image: (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
        size,
        color: selectedColor,
        quantity,
        isCustom: !!isCustom,
        customDetails: customDetails || null,
        leatherType: product.leatherType || 'Full Grain Leather'
      };

      return [newItem, ...prev];
    });

    if (openCart) setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev => prev.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setDiscountPercent(0);
    setPromoMessage(null);
  };

  const applyPromoCode = (code) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'JACKET10' || trimmed === 'WELCOME10') {
      setDiscountPercent(10);
      setPromoCode(trimmed);
      setPromoMessage({ type: 'success', text: '10% discount applied successfully!' });
      return true;
    } else if (trimmed === 'BESPOKE15') {
      setDiscountPercent(15);
      setPromoCode(trimmed);
      setPromoMessage({ type: 'success', text: '15% Bespoke discount applied!' });
      return true;
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Try JACKET10' });
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercent(0);
    setPromoMessage(null);
  };

  // Calculations
  const subtotalPKR = cartItems.reduce((acc, item) => acc + (item.pricePKR * item.quantity), 0);
  const discountAmountPKR = Math.round((subtotalPKR * discountPercent) / 100);
  const shippingFeePKR = 0; // Free delivery all across Pakistan & globally
  const totalPKR = Math.max(0, subtotalPKR - discountAmountPKR + shippingFeePKR);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      promoCode,
      applyPromoCode,
      removePromoCode,
      promoMessage,
      subtotalPKR,
      discountPercent,
      discountAmountPKR,
      shippingFeePKR,
      totalPKR,
      totalItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
