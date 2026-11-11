import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useSpring, useReducedMotion, animate } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Scroll-reveal wrapper. Fades + slides its children in when they enter the viewport.
 * direction: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'none'
 */
export const Reveal = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 36,
  duration = 0.8,
  once = true,
  amount = 0.15,
  className = '',
  as = 'div',
  ...rest
}) => {
  const Tag = motion[as] || motion.div;
  const from = { opacity: 0 };
  if (direction === 'up') from.y = distance;
  if (direction === 'down') from.y = -distance;
  if (direction === 'left') from.x = distance;
  if (direction === 'right') from.x = -distance;
  if (direction === 'zoom') from.scale = 0.92;

  return (
    <Tag
      initial={from}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/** Grid/list wrapper that staggers direct <RevealItem> children. */
export const RevealStagger = ({ children, stagger = 0.09, delay = 0, className = '', amount = 0.1, ...rest }) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount }}
    variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

export const RevealItem = ({ children, className = '', distance = 40, ...rest }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: distance, scale: 0.97 },
      show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: EASE } },
    }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

/** Thin brown progress bar pinned to the top that fills as the page scrolls. */
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-[#8A4B25] via-[#D9A21B] to-[#8A4B25]"
    />
  );
};

/** Counts from 0 up to a number when scrolled into view. Pass prefix/suffix for text around it. */
export const CountUp = ({ to, decimals = 0, prefix = '', suffix = '', duration = 1.8, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  const text = val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
};
