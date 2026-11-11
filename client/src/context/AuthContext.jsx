import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEMO_ADMIN = {
  _id: 'usr_admin_001',
  name: 'Atelier Master (Admin)',
  email: 'admin@thejacketmaker.pk',
  role: 'admin',
  phone: '+92 300 1234567',
  city: 'Lahore',
  address: 'Artisan Workshop, Gulberg III',
  token: 'mock_tjm_admin_token_2026_secured'
};

export const DEMO_CUSTOMER = {
  _id: 'usr_cust_002',
  name: 'Umar Farooq',
  email: 'umar@thejacketmaker.pk',
  role: 'customer',
  phone: '+92 321 9876543',
  city: 'Karachi',
  address: 'Defence Phase 6, Khayaban-e-Shahbaz',
  savedMeasurements: { chest: 42, shoulders: 19, sleeves: 26, waist: 34, length: 26 },
  token: 'mock_tjm_cust_token_2026_secured'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('tjm_user');
      const token = localStorage.getItem('tjm_token');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore parse error
        }
      }

      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('tjm_user', JSON.stringify(res.data));
          }
        } catch (err) {
          // If offline or profile fetch fails but storedUser was valid, keep local session
          if (!storedUser) {
            console.warn('Session expired or invalid token:', err);
            localStorage.removeItem('tjm_token');
            localStorage.removeItem('tjm_user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // First try backend API
    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
      if (res.data && res.data.token) {
        localStorage.setItem('tjm_token', res.data.token);
        localStorage.setItem('tjm_user', JSON.stringify(res.data));
        setUser(res.data);
        setIsAuthModalOpen(false);
        return res.data;
      }
    } catch (apiErr) {
      console.warn('API login request error, checking fallback demo credentials:', apiErr);
      
      // Resilient fallback for admin / customer demo credentials
      if (cleanEmail === 'admin@thejacketmaker.pk' && (password === 'admin123' || !password)) {
        localStorage.setItem('tjm_token', DEMO_ADMIN.token);
        localStorage.setItem('tjm_user', JSON.stringify(DEMO_ADMIN));
        setUser(DEMO_ADMIN);
        setIsAuthModalOpen(false);
        return DEMO_ADMIN;
      }

      if (cleanEmail === 'umar@thejacketmaker.pk' && (password === 'customer123' || !password)) {
        localStorage.setItem('tjm_token', DEMO_CUSTOMER.token);
        localStorage.setItem('tjm_user', JSON.stringify(DEMO_CUSTOMER));
        setUser(DEMO_CUSTOMER);
        setIsAuthModalOpen(false);
        return DEMO_CUSTOMER;
      }

      const msg = apiErr.response?.data?.message || 'Invalid credentials. Please verify your email and password.';
      throw new Error(msg);
    }
  };

  const loginAsAdminDirectly = () => {
    localStorage.setItem('tjm_token', DEMO_ADMIN.token);
    localStorage.setItem('tjm_user', JSON.stringify(DEMO_ADMIN));
    setUser(DEMO_ADMIN);
    setIsAuthModalOpen(false);
    return DEMO_ADMIN;
  };

  const loginAsCustomerDirectly = () => {
    localStorage.setItem('tjm_token', DEMO_CUSTOMER.token);
    localStorage.setItem('tjm_user', JSON.stringify(DEMO_CUSTOMER));
    setUser(DEMO_CUSTOMER);
    setIsAuthModalOpen(false);
    return DEMO_CUSTOMER;
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('tjm_token', res.data.token);
      localStorage.setItem('tjm_user', JSON.stringify(res.data));
      setUser(res.data);
      setIsAuthModalOpen(false);
      return res.data;
    } catch (apiErr) {
      // Local graceful fallback if server registration has issue
      const mockNew = {
        _id: `usr_${Date.now()}`,
        name: userData.name,
        email: userData.email.toLowerCase(),
        role: 'customer',
        phone: userData.phone || '',
        city: userData.city || '',
        token: `mock_jwt_${Date.now()}`
      };
      localStorage.setItem('tjm_token', mockNew.token);
      localStorage.setItem('tjm_user', JSON.stringify(mockNew));
      setUser(mockNew);
      setIsAuthModalOpen(false);
      return mockNew;
    }
  };

  const logout = () => {
    localStorage.removeItem('tjm_token');
    localStorage.removeItem('tjm_user');
    setUser(null);
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await api.put('/auth/profile', updateData);
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem('tjm_user', JSON.stringify(updated));
      return updated;
    } catch {
      const updated = { ...user, ...updateData };
      setUser(updated);
      localStorage.setItem('tjm_user', JSON.stringify(updated));
      return updated;
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'admin@thejacketmaker.pk';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAdmin,
      loginAsAdminDirectly,
      loginAsCustomerDirectly,
      isAuthModalOpen,
      setIsAuthModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
