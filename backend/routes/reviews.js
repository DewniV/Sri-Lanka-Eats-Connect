const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const { protect } = require('../middleware/auth');

// @route POST /api/reviews - Add a review
router.post('/', protect, async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, customer: req.user.id });
    // Update restaurant average rating
    const reviews = await Review.find({ restaurant: req.body.restaurant });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Restaurant.findByIdAndUpdate(req.body.restaurant, { averageRating: avg.toFixed(1), totalReviews: reviews.length });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reviews/:restaurantId - Get reviews for a restaurant
router.get('/:restaurantId', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
