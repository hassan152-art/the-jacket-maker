import jwt from 'jsonwebtoken';
import { DataStore } from '../data/dataStore.js';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jacket_maker_jwt_key_2026_luxekey', {
    expiresIn: '30d'
  });
};

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jacket_maker_jwt_key_2026_luxekey');
      const user = await DataStore.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found or authorization revoked' });
      }
      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Atelier Administrator privilege required' });
};
