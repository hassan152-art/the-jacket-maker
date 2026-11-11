import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { sampleProducts } from './productsData.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import CustomInquiry from '../models/CustomInquiry.js';
import Review from '../models/Review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_STORAGE_DIR = path.join(__dirname, 'storage');
const STORAGE_DIR = process.env.STORAGE_DIR || (process.env.VERCEL ? path.join('/tmp', 'storage') : DEFAULT_STORAGE_DIR);

try {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem handling for Vercel
}

function getFilePath(collectionName) {
  return path.join(STORAGE_DIR, `${collectionName}.json`);
}

function readJSON(collectionName, defaultVal = []) {
  const fp = getFilePath(collectionName);
  const fallbackFp = path.join(DEFAULT_STORAGE_DIR, `${collectionName}.json`);

  if (!fs.existsSync(fp)) {
    if (fs.existsSync(fallbackFp)) {
      try {
        const raw = fs.readFileSync(fallbackFp, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        // proceed to default
      }
    }
    try {
      fs.writeFileSync(fp, JSON.stringify(defaultVal, null, 2), 'utf-8');
    } catch (err) {
      // Ignored if read-only
    }
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(fp, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${collectionName}.json`, err);
    return defaultVal;
  }
}

function writeJSON(collectionName, data) {
  try {
    const fp = getFilePath(collectionName);
    fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Could not persist ${collectionName}.json to disk:`, err.message);
  }
}

export const isMongoConnected = () => mongoose.connection.readyState === 1;

export async function initStorage() {
  const users = readJSON('users', []);
  if (users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const customerPass = await bcrypt.hash('customer123', salt);
    const initialUsers = [
      {
        _id: 'usr_admin_001',
        name: 'Atelier Master (Admin)',
        email: 'admin@thejacketmaker.pk',
        password: adminPass,
        phone: '+92 300 1234567',
        city: 'Lahore',
        address: 'Artisan Workshop, Gulberg III',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'usr_cust_002',
        name: 'Umar Farooq',
        email: 'umar@thejacketmaker.pk',
        password: customerPass,
        phone: '+92 321 9876543',
        city: 'Karachi',
        address: 'Defence Phase 6, Khayaban-e-Shahbaz',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    writeJSON('users', initialUsers);
  }

  const products = readJSON('products', []);
  if (products.length === 0) {
    const initialProducts = sampleProducts.map((p, idx) => ({
      _id: `prod_${(idx + 1).toString().padStart(3, '0')}`,
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    writeJSON('products', initialProducts);
  }

  const reviews = readJSON('reviews', []);
  if (reviews.length === 0) {
    const sampleReviews = [
      {
        _id: 'rev_001',
        product: 'prod_001',
        name: 'Hamza Tariq',
        rating: 5,
        title: 'Finest leather jacket in Pakistan without a doubt!',
        comment: 'The sheepskin feels butter-soft and the YKK brass hardware is top-tier. Tailoring is precision-cut. Delivery was swift to Islamabad.',
        fitFeedback: 'True to Size',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        _id: 'rev_002',
        product: 'prod_001',
        name: 'Ali Raza',
        rating: 5,
        title: 'Custom fit option is a game changer',
        comment: 'I sent my exact measurements (chest 42, sleeve 26) and it fits like a glove. Beautiful packaging too with dust bag.',
        fitFeedback: 'True to Size',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
      },
      {
        _id: 'rev_003',
        product: 'prod_002',
        name: 'Saad Malik',
        rating: 5,
        title: 'The distressed cowhide patina is gorgeous',
        comment: 'Heavyweight, authentic moto jacket. You can smell the real leather straight out of the box. Highly recommended!',
        fitFeedback: 'True to Size',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ];
    writeJSON('reviews', sampleReviews);
  }

  readJSON('orders', []);
  readJSON('inquiries', []);
}

export const DataStore = {
  // PRODUCTS
  async getProducts({ category, subCategory, search, sort, minPrice, maxPrice, featured, bestSeller } = {}) {
    if (isMongoConnected()) {
      let query = {};
      if (category && category !== 'All') query.category = category;
      if (subCategory) query.subCategory = subCategory;
      if (featured === 'true' || featured === true) query.featured = true;
      if (bestSeller === 'true' || bestSeller === true) query.bestSeller = true;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { subCategory: { $regex: search, $options: 'i' } }
        ];
      }
      if (minPrice || maxPrice) {
        query.pricePKR = {};
        if (minPrice) query.pricePKR.$gte = Number(minPrice);
        if (maxPrice) query.pricePKR.$lte = Number(maxPrice);
      }
      let sortOpt = { createdAt: -1 };
      if (sort === 'price-low') sortOpt = { pricePKR: 1 };
      if (sort === 'price-high') sortOpt = { pricePKR: -1 };
      if (sort === 'rating') sortOpt = { rating: -1 };
      return await Product.find(query).sort(sortOpt);
    }

    let items = readJSON('products', []);
    if (category && category !== 'All') {
      items = items.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (subCategory) {
      items = items.filter(p => p.subCategory.toLowerCase() === subCategory.toLowerCase());
    }
    if (featured === 'true' || featured === true) {
      items = items.filter(p => p.featured);
    }
    if (bestSeller === 'true' || bestSeller === true) {
      items = items.filter(p => p.bestSeller);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q))
      );
    }
    if (minPrice) {
      items = items.filter(p => p.pricePKR >= Number(minPrice));
    }
    if (maxPrice) {
      items = items.filter(p => p.pricePKR <= Number(maxPrice));
    }
    if (sort === 'price-low') {
      items.sort((a, b) => a.pricePKR - b.pricePKR);
    } else if (sort === 'price-high') {
      items.sort((a, b) => b.pricePKR - a.pricePKR);
    } else if (sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else {
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return items;
  },

  async getProductById(id) {
    if (isMongoConnected()) {
      return await Product.findById(id);
    }
    const items = readJSON('products', []);
    return items.find(p => p._id === id || p.slug === id) || null;
  },

  async getProductBySlug(slug) {
    if (isMongoConnected()) {
      return await Product.findOne({ slug });
    }
    const items = readJSON('products', []);
    return items.find(p => p.slug === slug || p._id === slug) || null;
  },

  async createProduct(data) {
    if (isMongoConnected()) {
      const p = new Product(data);
      return await p.save();
    }
    const items = readJSON('products', []);
    const newProd = {
      _id: `prod_${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.unshift(newProd);
    writeJSON('products', items);
    return newProd;
  },

  async updateProduct(id, data) {
    if (isMongoConnected()) {
      return await Product.findByIdAndUpdate(id, data, { new: true });
    }
    const items = readJSON('products', []);
    const idx = items.findIndex(p => p._id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
    writeJSON('products', items);
    return items[idx];
  },

  async deleteProduct(id) {
    if (isMongoConnected()) {
      return await Product.findByIdAndDelete(id);
    }
    let items = readJSON('products', []);
    const exists = items.find(p => p._id === id);
    if (!exists) return null;
    items = items.filter(p => p._id !== id);
    writeJSON('products', items);
    return exists;
  },

  // USERS
  async findUserByEmail(email) {
    if (isMongoConnected()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    const users = readJSON('users', []);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (isMongoConnected()) {
      return await User.findById(id).select('-password');
    }
    const users = readJSON('users', []);
    const user = users.find(u => u._id === id);
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  },

  async createUser({ name, email, password, phone = '', city = '', address = '', role = 'customer' }) {
    if (isMongoConnected()) {
      const u = new User({ name, email, password, phone, city, address, role });
      return await u.save();
    }
    const users = readJSON('users', []);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      city,
      address,
      role,
      savedMeasurements: { chest: 0, shoulders: 0, sleeves: 0, waist: 0, length: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    writeJSON('users', users);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  async updateUser(id, updateData) {
    if (isMongoConnected()) {
      return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }
    const users = readJSON('users', []);
    const idx = users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    users[idx] = { ...users[idx], ...updateData, updatedAt: new Date().toISOString() };
    writeJSON('users', users);
    const { password, ...safe } = users[idx];
    return safe;
  },

  // ORDERS
  async createOrder(orderData) {
    if (isMongoConnected()) {
      const o = new Order(orderData);
      return await o.save();
    }
    const orders = readJSON('orders', []);
    const newOrder = {
      _id: `ord_${Date.now()}`,
      trackingCode: `TJM-PK-${Math.floor(100000 + Math.random() * 900000)}`,
      orderStatus: 'Processing',
      paymentStatus: orderData.paymentMethod === 'Card' ? 'Paid' : 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData
    };
    orders.unshift(newOrder);
    writeJSON('orders', orders);
    return newOrder;
  },

  async getOrders(userId = null) {
    if (isMongoConnected()) {
      const q = userId ? { user: userId } : {};
      return await Order.find(q).sort({ createdAt: -1 });
    }
    const orders = readJSON('orders', []);
    if (userId) {
      return orders.filter(o => o.user === userId);
    }
    return orders;
  },

  async getOrderById(id) {
    if (isMongoConnected()) {
      return await Order.findById(id);
    }
    const orders = readJSON('orders', []);
    return orders.find(o => o._id === id || o.trackingCode === id) || null;
  },

  async updateOrderStatus(id, status, trackingCode) {
    if (isMongoConnected()) {
      const update = { orderStatus: status };
      if (trackingCode) update.trackingCode = trackingCode;
      return await Order.findByIdAndUpdate(id, update, { new: true });
    }
    const orders = readJSON('orders', []);
    const idx = orders.findIndex(o => o._id === id);
    if (idx === -1) return null;
    orders[idx].orderStatus = status;
    if (trackingCode) orders[idx].trackingCode = trackingCode;
    orders[idx].updatedAt = new Date().toISOString();
    writeJSON('orders', orders);
    return orders[idx];
  },

  // BESPOKE / CUSTOM STUDIO INQUIRIES
  async createCustomInquiry(data) {
    if (isMongoConnected()) {
      const ci = new CustomInquiry(data);
      return await ci.save();
    }
    const inquiries = readJSON('inquiries', []);
    const newInquiry = {
      _id: `inq_${Date.now()}`,
      status: 'New Request',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    inquiries.unshift(newInquiry);
    writeJSON('inquiries', inquiries);
    return newInquiry;
  },

  async getCustomInquiries() {
    if (isMongoConnected()) {
      return await CustomInquiry.find().sort({ createdAt: -1 });
    }
    return readJSON('inquiries', []);
  },

  async updateInquiryStatus(id, status) {
    if (isMongoConnected()) {
      return await CustomInquiry.findByIdAndUpdate(id, { status }, { new: true });
    }
    const inquiries = readJSON('inquiries', []);
    const idx = inquiries.findIndex(i => i._id === id);
    if (idx === -1) return null;
    inquiries[idx].status = status;
    inquiries[idx].updatedAt = new Date().toISOString();
    writeJSON('inquiries', inquiries);
    return inquiries[idx];
  },

  // REVIEWS
  async getReviews(productId) {
    if (isMongoConnected()) {
      return await Review.find({ product: productId }).sort({ createdAt: -1 });
    }
    const reviews = readJSON('reviews', []);
    return reviews.filter(r => r.product === productId || r.productId === productId);
  },

  async createReview(data) {
    if (isMongoConnected()) {
      const r = new Review(data);
      return await r.save();
    }
    const reviews = readJSON('reviews', []);
    const newReview = {
      _id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data
    };
    reviews.unshift(newReview);
    writeJSON('reviews', reviews);
    return newReview;
  }
};
