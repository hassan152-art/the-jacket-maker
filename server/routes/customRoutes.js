import express from 'express';
import {
  calculateCustomQuote,
  submitCustomInquiry,
  getCustomInquiries,
  updateInquiryStatus
} from '../controllers/customController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/quote', calculateCustomQuote);
router.post('/inquiry', submitCustomInquiry);
router.get('/inquiries', protect, adminOnly, getCustomInquiries);
router.put('/inquiries/:id/status', protect, adminOnly, updateInquiryStatus);

export default router;
