import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }
}, { _id: false });

const specSchema = new mongoose.Schema({
  outerShell: { type: String, default: '' },
  leatherFinish: { type: String, default: '' },
  closure: { type: String, default: '' },
  collar: { type: String, default: '' },
  cuffs: { type: String, default: '' },
  pockets: { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true, enum: ['Men', 'Women', 'Bags', 'Accessories'] },
  subCategory: { type: String, required: true },
  description: { type: String, required: true },
  pricePKR: { type: Number, required: true },
  originalPricePKR: { type: Number, default: 0 },
  priceUSD: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  leatherType: { type: String, default: 'Full Grain Leather' },
  hardware: { type: String, default: 'Antiqued Brass' },
  lining: { type: String, default: 'Quilted Silk-Satin' },
  rating: { type: Number, default: 5.0 },
  numReviews: { type: Number, default: 0 },
  inStock: { type: Number, default: 10 },
  featured: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  colors: [colorSchema],
  sizes: [{ type: String }],
  madeToMeasureAvailable: { type: Boolean, default: true },
  images: [{ type: String }],
  specs: specSchema
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
