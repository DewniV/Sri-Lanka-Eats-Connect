const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { protect } = require('../middleware/auth');

// @route POST /api/reservations - Create reservation
router.post('/', async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json({ message: 'Reservation created successfully!', reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reservations/restaurant/:id - Get reservations for a restaurant (vendor)
router.get('/restaurant/:id', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ restaurant: req.params.id }).sort({ reservationDate: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/reservations/:id - Update reservation status
router.put('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
