import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Truck, ShieldCheck, Scissors, RefreshCcw, Check } from 'lucide-react';
import { Logo } from './Navbar';

const TRUST = [
  { icon: Truck, title: 'Free delivery', text: 'Across Pakistan' },
  { icon: ShieldCheck, title: 'Cash on delivery', text: 'Pay when it arrives' },
  { icon: Scissors, title: 'Made to measure', text: 'Cut to your size' },
  { icon: RefreshCcw, title: 'Free alterations', text: 'For 30 days' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // No newsletter endpoint exists yet – wire this to your API / email provider.
    setDone(true);
    setEmail('');
  };

  const col = 'space-y-2.5 text-sm text-white/70';
  const head = 'mb-4 font-sans text-sm font-semibold text-white';
  const lnk = 'hover:text-white hover:underline underline-offset-4';

  return (
    <footer className="mt-20 bg-ink text-white">
      {/* trust strip */}
      <div className="border-b border-white/10">
        <ul className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <Icon className="h-6 w-6 shrink-0 text-saddle-100" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-white/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 [&>*]:min-w-0">
        <div className="space-y-5 sm:col-span-2 lg:col-span-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Handcrafted leather jackets from our ateliers in Lahore and Karachi. Ready to wear, or made to your exact measurements.
          </p>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Gulberg III, Lahore &amp; Clifton, Karachi</li>
            <li><a href="tel:+924235789120" className="flex items-center gap-2.5 hover:text-white"><Phone className="h-4 w-4" /> +92 (042) 3578-9120</a></li>
            <li><a href="https://wa.me/923008472911" className="flex items-center gap-2.5 hover:text-white"><Phone className="h-4 w-4" /> WhatsApp +92 300 8472911</a></li>
            <li><a href="mailto:bespoke@thejacketmaker.pk" className="flex items-center gap-2.5 hover:text-white"><Mail className="h-4 w-4" /> bespoke@thejacketmaker.pk</a></li>
          </ul>
        </div>

        <nav aria-label="Shop" className="lg:col-span-2">
          <h3 className={head}>Shop</h3>
          <ul className={col}>
            <li><Link className={lnk} to="/shop?category=Men">Men</Link></li>
            <li><Link className={lnk} to="/shop?category=Women">Women</Link></li>
            <li><Link className={lnk} to="/shop?category=Bags">Bags</Link></li>
            <li><Link className={lnk} to="/shop?subCategory=Shearling">Shearling</Link></li>
            <li><Link className={lnk} to="/custom-studio">Custom studio</Link></li>
          </ul>
        </nav>

        <nav aria-label="Help" className="lg:col-span-2">
          <h3 className={head}>Help</h3>
          <ul className={col}>
            <li><Link className={lnk} to="/track-order">Track your order</Link></li>
            <li><Link className={lnk} to="/dashboard">My account</Link></li>
            <li><Link className={lnk} to="/wishlist">Wishlist</Link></li>
            <li><Link className={lnk} to="/about">Our craft</Link></li>
          </ul>
        </nav>

        <div className="sm:col-span-2 lg:col-span-4">
          <h3 className={head}>Get 10% off your first order</h3>
          <p className="mb-4 text-sm text-white/70">Join our list for new arrivals and workshop news. Use code <strong className="text-white">JACKET10</strong> at checkout.</p>
          {done ? (
            <p className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-3 text-sm"><Check className="h-4 w-4 text-ok" /> Thanks! You’re on the list.</p>
          ) : (
            <form onSubmit={subscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2.5 text-[16px] text-white placeholder:text-white/50 focus:border-white focus:outline-none sm:text-sm"
              />
              <button type="submit" className="btn shrink-0 bg-white text-ink hover:bg-saddle-100">Subscribe</button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} The Jacket Maker. All rights reserved.</p>
          <p>Cash on delivery · Bank transfer · JazzCash / EasyPaisa</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
