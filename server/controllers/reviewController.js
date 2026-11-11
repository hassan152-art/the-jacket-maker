import { DataStore } from '../data/dataStore.js';

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await DataStore.getReviews(productId);
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve reviews' });
  }
};

export const addReview = async (req, res) => {
  try {
    const { productId, name, rating, comment, title, fitFeedback } = req.body;

    if (!rating || !comment || !name) {
      return res.status(400).json({ message: 'Name, star rating, and review text are required' });
    }

    const review = await DataStore.createReview({
      product: productId,
      user: req.user ? req.user._id : null,
      name,
      rating: Number(rating),
      comment,
      title: title || '',
      fitFeedback: fitFeedback || 'True to Size',
      verifiedPurchase: true
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit review' });
  }
};
