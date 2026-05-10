const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');

// Auth middleware
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Vendor-only middleware
const vendorOnly = (req, res, next) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Vendor access required' });
  }
  next();
};

// @route GET /api/restaurants
// Public — list all active restaurants with optional filters
router.get('/', async (req, res) => {
  try {
    const { city, cuisineType, priceRange, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (city) query.city = new RegExp(city, 'i');
    if (cuisineType) query.cuisineType = new RegExp(cuisineType, 'i');
    if (priceRange) query.priceRange = priceRange;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { cuisineType: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).skip(skip).limit(parseInt(limit)).lean(),
      Restaurant.countDocuments(query),
    ]);

    res.json({ restaurants, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/restaurants/:id
// Public — get a single restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/restaurants/vendor/mine
// Vendor — get the restaurant(s) owned by the logged-in vendor
router.get('/vendor/mine', protect, vendorOnly, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user.id }).lean();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/restaurants/:id
// Vendor — update restaurant details (name, description, address, etc.)
router.put('/:id', protect, vendorOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to edit this restaurant' });
    }

    const allowedFields = [
      'name', 'description', 'address', 'city', 'phone', 'email',
      'cuisineType', 'priceRange', 'openingHours', 'coverImage',
      'totalTables', 'isActive',
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) restaurant[field] = req.body[field];
    });

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/restaurants/:id/availability
// Vendor — update table availability (availableTables, availabilityNote)
// This is the real-time availability update endpoint used by the vendor dashboard
router.patch('/:id/availability', protect, vendorOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to update this restaurant' });
    }

    const { availableTables, availabilityNote, totalTables } = req.body;

    if (totalTables !== undefined) {
      const newTotal = parseInt(totalTables);
      if (isNaN(newTotal) || newTotal < 0) {
        return res.status(400).json({ message: 'totalTables must be a non-negative number' });
      }
      restaurant.totalTables = newTotal;
    }

    if (availableTables !== undefined) {
      const newAvail = parseInt(availableTables);
      if (isNaN(newAvail) || newAvail < 0) {
        return res.status(400).json({ message: 'availableTables must be a non-negative number' });
      }
      if (newAvail > restaurant.totalTables) {
        return res.status(400).json({ message: `availableTables (${newAvail}) cannot exceed totalTables (${restaurant.totalTables})` });
      }
      restaurant.availableTables = newAvail;
    }

    if (availabilityNote !== undefined) {
      restaurant.availabilityNote = availabilityNote.trim();
    }

    restaurant.lastAvailabilityUpdate = new Date();
    await restaurant.save();

    res.json({
      success: true,
      restaurantId: restaurant._id,
      totalTables: restaurant.totalTables,
      availableTables: restaurant.availableTables,
      availabilityNote: restaurant.availabilityNote,
      lastAvailabilityUpdate: restaurant.lastAvailabilityUpdate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
