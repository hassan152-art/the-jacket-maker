import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  title: { type: String, default: '' },
  fitFeedback: { type: String, enum: ['Runs Small', 'True to Size', 'Runs Large'], default: 'True to Size' },
  verifiedPurchase: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
