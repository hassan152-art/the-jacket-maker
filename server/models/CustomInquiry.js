import mongoose from 'mongoose';

const customInquirySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  silhouette: { type: String, required: true },
  gender: { type: String, default: 'Men' },
  leatherType: { type: String, required: true },
  color: { type: String, required: true },
  hardware: { type: String, required: true },
  lining: { type: String, required: true },
  monogramText: { type: String, default: '' },
  collarStyle: { type: String, default: 'Band Collar' },
  fitType: { type: String, enum: ['Slim Fit', 'Regular Fit', 'Relaxed Fit'], default: 'Regular Fit' },
  measurements: {
    unit: { type: String, default: 'inches' },
    chest: Number,
    shoulders: Number,
    sleeves: Number,
    waist: Number,
    backLength: Number,
    height: String,
    weight: String
  },
  notes: { type: String, default: '' },
  referenceImage: { type: String, default: '' },
  estimatedPricePKR: { type: Number, required: true },
  status: {
    type: String,
    enum: ['New Request', 'Consultant Review', 'Quote Approved', 'Pattern Drafting', 'In Crafting', 'Completed'],
    default: 'New Request'
  }
}, { timestamps: true });

export default mongoose.models.CustomInquiry || mongoose.model('CustomInquiry', customInquirySchema);
