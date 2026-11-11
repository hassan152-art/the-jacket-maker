import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui';

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginAsAdminDirectly, loginAsCustomerDirectly } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const close = () => {
    setIsAuthModalOpen(false);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        setSuccessMsg('Signed in successfully! Welcome to the Atelier.');
      } else {
        await register(form);
        setSuccessMsg('Account created successfully! Welcome to The Jacket Maker.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuick = () => {
    loginAsAdminDirectly();
    setSuccessMsg('👑 Atelier Admin privilege activated! Redirecting...');
  };

  const handleCustomerQuick = () => {
    loginAsCustomerDirectly();
    setSuccessMsg('👤 Signed in as demo customer Umar Farooq.');
  };

  return (
    <Modal open={isAuthModalOpen} onClose={close} title={isLogin ? 'Sign in' : 'Create account'} maxWidth="max-w-md">
      <div className="relative border-b border-[#E4E3DF] bg-stone/40 px-6 pb-5 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#8A4B25]" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A4B25]">The Jacket Maker Atelier</p>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#1B1D22]">
              {isLogin ? 'Sign In to Your Account' : 'Create Atelier Account'}
            </h2>
            <p className="mt-1 text-xs text-[#6A6F78]">
              {isLogin
                ? 'Access your orders, saved tailoring measurements, and Atelier suite.'
                : 'Enjoy complimentary made-to-measure tailoring and rapid tracking.'}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-2 -mt-1 rounded-full p-2 text-[#6A6F78] hover:bg-[#E4E3DF] hover:text-[#1B1D22] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1-Click Fast Login Bar */}
        <div className="mt-4 rounded-lg border border-[#E4C8B0] bg-[#FAF3EE] p-3 text-xs shadow-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#E4C8B0]/60">
            <span className="font-semibold text-[#8A4B25] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> 1-Click Instant Demo Access
            </span>
            <span className="text-[10px] text-[#8A4B25]/80 uppercase tracking-wider font-mono">No typing needed</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAdminQuick}
              className="flex items-center justify-center gap-1.5 rounded-md bg-[#1B1D22] px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8A4B25] transition-all cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Atelier Admin</span>
            </button>
            <button
              type="button"
              onClick={handleCustomerQuick}
              className="flex items-center justify-center gap-1.5 rounded-md border border-[#CFCDC7] bg-white px-3 py-2 text-xs font-semibold text-[#1B1D22] hover:bg-[#F4F3F0] transition-all cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#8A4B25]" />
              <span>Customer Demo</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-5">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="rounded-md border border-[#B3261E]/30 bg-[#B3261E]/5 px-3.5 py-2.5 text-xs text-[#B3261E] font-medium"
            >
              {error}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className="rounded-md border border-[#1E7B4B]/30 bg-[#1E7B4B]/10 px-3.5 py-2.5 text-xs text-[#1E7B4B] font-semibold"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLogin && (
          <div>
            <label htmlFor="a-name" className="label">Full Name</label>
            <input
              id="a-name"
              required
              autoComplete="name"
              placeholder="e.g. Hassan Ahmed"
              value={form.name}
              onChange={set('name')}
              className="input"
            />
          </div>
        )}

        <div>
          <label htmlFor="a-email" className="label">Email Address</label>
          <input
            id="a-email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@thejacketmaker.pk"
            value={form.email}
            onChange={set('email')}
            className="input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="a-pw" className="label mb-0">Password</label>
            {isLogin && (
              <span className="text-[11px] text-[#6A6F78]">Admin: <code className="bg-stone px-1 rounded text-ink font-mono">admin123</code></span>
            )}
          </div>
          <div className="relative">
            <input
              id="a-pw"
              type={showPw ? 'text' : 'password'}
              required
              minLength={isLogin ? undefined : 6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              className="input pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#6A6F78] hover:text-[#1B1D22]"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="a-phone" className="label">Phone / WhatsApp</label>
              <input
                id="a-phone"
                type="tel"
                autoComplete="tel"
                placeholder="0300 1234567"
                value={form.phone}
                onChange={set('phone')}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="a-city" className="label">City in Pakistan</label>
              <input
                id="a-city"
                autoComplete="address-level2"
                placeholder="Lahore / Karachi / Islamabad"
                value={form.city}
                onChange={set('city')}
                className="input"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-sm shadow-md transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <span>{isLogin ? 'Sign In to Atelier' : 'Create Free Account'}</span>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-[#6A6F78]">
          {isLogin ? 'New to The Jacket Maker?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }}
            className="font-bold text-[#8A4B25] hover:underline cursor-pointer"
          >
            {isLogin ? 'Create an account' : 'Sign In'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;
