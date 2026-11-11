import React, { useState, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { ScrollProgress } from './components/Reveal';
import SmoothScroll from './components/SmoothScroll';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import AuthModal from './components/AuthModal';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomStudioPage from './pages/CustomStudioPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import WishlistPage from './pages/WishlistPage';

/** Scroll to top on page change */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NotFound = () => (
  <div className="container-page py-24 text-center">
    <p className="font-display text-7xl font-bold text-[#8A4B25]">404</p>
    <h1 className="mt-2 text-3xl font-bold text-[#1B1D22]">Outerwear Not Found</h1>
    <p className="mx-auto mt-2 max-w-md text-sm text-[#6A6F78]">
      The bespoke atelier design or catalog page you are looking for does not exist or has been relocated.
    </p>
    <div className="mt-8 flex justify-center gap-3">
      <Link to="/" className="btn-primary">Back to Atelier</Link>
      <Link to="/shop" className="btn-outline">Shop Outerwear</Link>
    </div>
  </div>
);

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
    <Router>
      <ScrollToTop />
      <ScrollProgress />
      <SmoothScroll />
      <CurrencyProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col bg-white text-[#1B1D22]">
                <a
                  href="#main"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
                >
                  Skip to content
                </a>
                
                <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

                <main id="main" className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/custom-studio" element={<CustomStudioPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/track-order" element={<OrderTrackingPage />} />
                    <Route path="/dashboard" element={<CustomerDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                <Footer />

                <CartDrawer />
                <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                <AuthModal />
              </div>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </CurrencyProvider>
    </Router>
    </MotionConfig>
  );
}
