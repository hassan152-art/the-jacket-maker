import express from 'express';
import { getProductReviews, addReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/', addReview);

export default router;
