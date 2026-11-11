import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

const EXCHANGE_RATE = 280; // 1 USD = 280 PKR

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('tjm_currency') === 'USD' ? 'USD' : 'PKR';
    } catch {
      return 'PKR';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tjm_currency', currency);
    } catch {
      /* storage unavailable */
    }
  }, [currency]);

  const formatPrice = useCallback(
    (pkrAmount) => {
      const n = Number(pkrAmount);
      if (!Number.isFinite(n)) return currency === 'USD' ? '$0' : 'Rs 0';
      if (currency === 'USD') return `$${Math.round(n / EXCHANGE_RATE).toLocaleString('en-US')}`;
      return `Rs ${Math.round(n).toLocaleString('en-US')}`;
    },
    [currency]
  );

  const getNumericPrice = (pkrAmount) =>
    currency === 'USD' ? Math.round(pkrAmount / EXCHANGE_RATE) : Number(pkrAmount);

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatPrice, getNumericPrice, exchangeRate: EXCHANGE_RATE }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
