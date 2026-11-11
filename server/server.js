import app, { ensureStorage } from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  await ensureStorage();

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/the-jacket-maker';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log('✅ Connected to MongoDB at:', mongoURI);
  } catch (err) {
    console.warn('⚠️  Local MongoDB not available. Using built-in JSON persistence layer.');
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`✨ THE JACKET MAKER - BACKEND API RUNNING`);
    console.log(`🌐 API URL:    http://localhost:${PORT}`);
    console.log(`🛍️ Health:     http://localhost:${PORT}/api/health`);
    console.log(`👔 Admin:      admin@thejacketmaker.pk | admin123`);
    console.log(`👤 Customer:   umar@thejacketmaker.pk | customer123`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const altPort = PORT + 1;
      console.warn(`\n⚠️  Port ${PORT} busy. Trying port ${altPort}...`);
      setTimeout(() => {
        server.close();
        app.listen(altPort, '0.0.0.0', () => {
          console.log(`✅ Server now running on http://localhost:${altPort}`);
          console.log(`   Update client proxy to port ${altPort} in vite.config.ts if needed.`);
        });
      }, 1000);
    } else {
      console.error('Fatal server error:', err);
      process.exit(1);
    }
  });
}

startServer();
