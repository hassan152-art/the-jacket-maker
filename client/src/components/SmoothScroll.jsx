import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Premium butter-smooth inertial scroll engine powered by Lenis
 * Includes scroll physics configuration, event synchronization, and floating luxury back-to-top button.
 */
const SmoothScroll = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    // Advanced Lenis inertial configuration
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5,
      infinite: false,
    });

    window.__lenis = lenis;

    const onScroll = ({ scroll }) => {
      setShowScrollTop(scroll > 450);
    };

    lenis.on('scroll', onScroll);

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  const scrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.94 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-7 right-7 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B1D22]/90 text-[#F4F3F0] backdrop-blur-md border border-white/20 shadow-[0_10px_25px_-5px_rgba(27,29,34,0.4)] transition-colors hover:bg-[#8A4B25] hover:text-white cursor-pointer"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default SmoothScroll;
