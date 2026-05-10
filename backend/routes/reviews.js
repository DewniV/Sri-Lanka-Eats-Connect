const express    = require('express');
const router     = express.Router();
const Review     = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const { protect } = require('../middleware/auth');

// @route POST /api/reviews — Add a review (protected)
router.post('/', protect, async (req, res) => {
  try {
    // Prevent duplicate reviews from the same customer for the same restaurant
    const existing = await Review.findOne({
      restaurant: req.body.restaurant,
      customer:   req.user.id,
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this restaurant.' });
    }

    const review = await Review.create({ ...req.body, customer: req.user.id });

    // Recalculate restaurant average rating
    const reviews = await Review.find({ restaurant: req.body.restaurant });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Restaurant.findByIdAndUpdate(req.body.restaurant, {
      averageRating: avg.toFixed(1),
      totalReviews:  reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reviews/:restaurantId — Get reviews for a restaurant (with customer name)
router.get('/:restaurantId', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/reviews/:id/reply — Vendor replies to a review (protected)
router.patch('/:id/reply', protect, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || reply.trim() === '') {
      return res.status(400).json({ message: 'Reply text is required.' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    // Verify the requesting user owns the restaurant this review belongs to
    const restaurant = await Restaurant.findById(review.restaurant);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    if (
      restaurant.owner &&
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'You are not authorised to reply to this review.' });
    }

    review.vendorReply = reply.trim();
    review.vendorReplyAt = new Date();
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
