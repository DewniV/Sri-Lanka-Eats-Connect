const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// @route GET /api/admin/stats — Dashboard summary stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalRestaurants, totalReservations, totalReviews, pendingReservations] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Reservation.countDocuments(),
      Review.countDocuments(),
      Reservation.countDocuments({ status: 'pending' }),
    ]);

    const recentReservations = await Reservation.find()
      .populate('restaurant', 'name city')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      stats: {
        totalUsers,
        totalRestaurants,
        totalReservations,
        totalReviews,
        pendingReservations,
      },
      recentReservations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/users — List all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/admin/users/:id/role — Change user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be customer, vendor, or admin.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/admin/users/:id — Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/restaurants — List all restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 }).lean();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/admin/restaurants/:id — Update restaurant (verify/activate/deactivate)
router.patch('/restaurants/:id', async (req, res) => {
  try {
    const allowed = ['isVerified', 'isActive'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/admin/restaurants/:id — Delete a restaurant
router.delete('/restaurants/:id', async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/reservations — List all reservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('restaurant', 'name city')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/reviews — List all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('restaurant', 'name city')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/admin/reviews/:id — Delete a review
router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
