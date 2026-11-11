import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Optional user attachment for guest vs logged-in
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      return protect(req, res, next);
    } catch {
      return next();
    }
  }
  return next();
};

router.route('/')
  .post(optionalAuth, createOrder)
  .get(protect, adminOnly, getAllOrders);

router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
