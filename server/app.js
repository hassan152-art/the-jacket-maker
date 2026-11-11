import dns from 'dns';
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (_) {}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customRoutes from './routes/customRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { initStorage } from './data/dataStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize JSON store once
let storageInitialized = false;
export async function ensureStorage() {
  if (!storageInitialized) {
    try {
      await initStorage();
      storageInitialized = true;
    } catch (e) {
      console.warn('Storage initialization note:', e.message);
    }
  }
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to ensure storage is ready for incoming requests
app.use(async (req, res, next) => {
  await ensureStorage();
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-studio', customRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    atelier: 'The Jacket Maker (Pakistan Edition)',
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'Resilient High-Speed JSON Store Active',
    platform: process.env.VERCEL ? 'Vercel Serverless' : 'Node.js Express Standalone',
    timestamp: new Date().toISOString()
  });
});

// 404 Route handler for unknown API calls
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found on atelier server` });
});

// Serve frontend client dist if built
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'The Jacket Maker MERN API is running in luxury mode.',
      clientDevUrl: 'http://localhost:5173',
      docs: '/api/health',
      version: '2.0.0'
    });
  });
}

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err.message);
  res.status(500).json({
    message: err.message || 'Internal Server Error in Jacket Maker API'
  });
});

export default app;
