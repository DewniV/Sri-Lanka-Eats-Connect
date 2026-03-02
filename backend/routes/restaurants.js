const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { protect, vendorOnly } = require('../middleware/auth');

// @route GET /api/restaurants - Get all restaurants (with search/filter)
router.get('/', async (req, res) => {
  try {
    const { search, cuisine, city, priceRange } = req.query;
    let query = { isActive: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (cuisine) query.cuisineType = { $regex: cuisine, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (priceRange) query.priceRange = priceRange;

    const restaurants = await Restaurant.find(query).populate('owner', 'name email');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/restaurants/:id - Get single restaurant with menu
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const menu = await MenuItem.find({ restaurant: req.params.id, isAvailable: true });
    res.json({ restaurant, menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/restaurants - Create restaurant (vendor only)
router.post('/', protect, vendorOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.create({ ...req.body, owner: req.user.id });
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/restaurants/:id - Update restaurant
router.put('/:id', protect, vendorOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
