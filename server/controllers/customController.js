import { DataStore } from '../data/dataStore.js';

// Base pricing logic for custom leather jackets in PKR
export const calculateCustomQuote = (req, res) => {
  try {
    const { silhouette, leatherType, lining, hardware, monogramText } = req.body;

    let basePrice = 49000; // Base PKR for custom pattern & artisan cut

    if (silhouette === 'Shearling Aviator' || silhouette === 'Aviator Bomber') {
      basePrice += 20000;
    } else if (silhouette === 'Long Trench Coat' || silhouette === 'Duster') {
      basePrice += 16000;
    } else if (silhouette === 'Double Rider Biker') {
      basePrice += 6000;
    }

    if (leatherType?.includes('Merino') || leatherType?.includes('Shearling')) {
      basePrice += 18000;
    } else if (leatherType?.includes('Italian') || leatherType?.includes('Suede')) {
      basePrice += 8000;
    } else if (leatherType?.includes('Cowhide')) {
      basePrice += 5000;
    }

    if (lining?.includes('Merino') || lining?.includes('Sherpa')) {
      basePrice += 9000;
    } else if (lining?.includes('Silk')) {
      basePrice += 3500;
    }

    if (monogramText && monogramText.trim().length > 0) {
      basePrice += 2500; // Custom hot-stamp / laser engraving
    }

    return res.json({
      estimatedPricePKR: basePrice,
      estimatedPriceUSD: Math.round(basePrice / 280),
      currency: 'PKR',
      productionDays: '10 to 14 Business Days',
      includes: [
        '1-on-1 Bespoke Design Consultation',
        'Custom Pattern Drafting to Exact Body Measurements',
        'Laser Precision Cutting & Hand-Stitching',
        'Free Worldwide & Pakistan Doorstep Courier Delivery'
      ]
    });
  } catch (error) {
    return res.status(500).json({ message: 'Quote calculation failed' });
  }
};

// @desc    Submit bespoke design inquiry
// @route   POST /api/custom-studio/inquiry
// @access  Public
export const submitCustomInquiry = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      silhouette,
      gender,
      leatherType,
      color,
      hardware,
      lining,
      monogramText,
      collarStyle,
      fitType,
      measurements,
      notes,
      referenceImage,
      estimatedPricePKR
    } = req.body;

    if (!customerName || !email || !phone || !silhouette) {
      return res.status(400).json({ message: 'Name, email, phone number, and jacket silhouette are required' });
    }

    const inquiry = await DataStore.createCustomInquiry({
      user: req.user ? req.user._id : null,
      customerName,
      email,
      phone,
      silhouette,
      gender: gender || 'Men',
      leatherType: leatherType || 'Full Grain Sheepskin',
      color: color || 'Obsidian Black',
      hardware: hardware || 'Antiqued Brass',
      lining: lining || 'Quilted Thermal Silk-Satin',
      monogramText: monogramText || '',
      collarStyle: collarStyle || 'Band Collar',
      fitType: fitType || 'Regular Fit',
      measurements: measurements || {},
      notes: notes || '',
      referenceImage: referenceImage || '',
      estimatedPricePKR: Number(estimatedPricePKR) || 55000
    });

    return res.status(201).json({
      success: true,
      message: 'Your bespoke design request has been received by our Master Leather Craftsmen.',
      inquiry
    });
  } catch (error) {
    console.error('Custom inquiry submission error:', error);
    return res.status(500).json({ message: 'Failed to submit bespoke jacket inquiry' });
  }
};

// @desc    Get all bespoke inquiries (Admin only)
// @route   GET /api/custom-studio/inquiries
// @access  Private/Admin
export const getCustomInquiries = async (req, res) => {
  try {
    const inquiries = await DataStore.getCustomInquiries();
    return res.json(inquiries);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve custom inquiries' });
  }
};

// @desc    Update inquiry status (Admin only)
// @route   PUT /api/custom-studio/inquiries/:id/status
// @access  Private/Admin
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await DataStore.updateInquiryStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update custom inquiry status' });
  }
};
