import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from './models/Product.js';
import User from './models/User.js';
import Review from './models/Review.js';
import { sampleProducts } from './data/productsData.js';

dotenv.config();

async function seedDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/the-jacket-maker';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding.');

    await Product.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    // Seed Admin and Demo Customer
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const custPass = await bcrypt.hash('customer123', salt);

    const admin = await User.create({
      name: 'Atelier Master (Admin)',
      email: 'admin@thejacketmaker.pk',
      password: adminPass,
      phone: '+92 300 1234567',
      city: 'Lahore',
      address: 'Artisan Workshop, Gulberg III',
      role: 'admin'
    });

    const customer = await User.create({
      name: 'Umar Farooq',
      email: 'umar@thejacketmaker.pk',
      password: custPass,
      phone: '+92 321 9876543',
      city: 'Karachi',
      address: 'Defence Phase 6, Khayaban-e-Shahbaz',
      role: 'customer'
    });

    // Seed Products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${createdProducts.length} authentic leather products!`);

    // Seed Reviews for first product
    await Review.create({
      product: createdProducts[0]._id,
      user: customer._id,
      name: 'Hamza Tariq',
      rating: 5,
      title: 'Finest leather jacket in Pakistan without a doubt!',
      comment: 'The sheepskin feels butter-soft and the YKK brass hardware is top-tier. Tailoring is precision-cut. Delivery was swift to Islamabad.',
      fitFeedback: 'True to Size',
      verifiedPurchase: true
    });

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
