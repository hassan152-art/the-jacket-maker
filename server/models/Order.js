import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  slug: { type: String },
  image: { type: String, required: true },
  pricePKR: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  size: { type: String, default: 'M' },
  color: { type: String },
  isCustom: { type: Boolean, default: false },
  customDetails: {
    measurements: {
      chest: Number,
      shoulders: Number,
      sleeves: Number,
      waist: Number,
      length: Number
    },
    silhouette: String,
    leatherType: String,
    hardware: String,
    lining: String,
    monogram: String
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'Pakistan' },
    notes: { type: String, default: '' }
  },
  orderItems: [orderItemSchema],
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'BankTransfer', 'JazzCash/EasyPaisa', 'Card'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'In Crafting', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  subtotalPKR: { type: Number, required: true },
  shippingFeePKR: { type: Number, default: 0 },
  discountPKR: { type: Number, default: 0 },
  totalPKR: { type: Number, required: true },
  trackingCode: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
