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

// @route GET /api/reservations/customer/:id - Get reservations for a customer
router.get('/customer/:id', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.params.id })
      .populate('restaurant', 'name city')
      .sort({ reservationDate: -1 });
    // Normalise field names for the frontend
    const formatted = reservations.map((r) => ({
      _id: r._id,
      restaurantId: r.restaurant,
      date: r.reservationDate,
      time: r.reservationDate
        ? new Date(r.reservationDate).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
        : '',
      partySize: r.partySize,
      status: r.status,
      specialRequests: r.specialRequests,
      createdAt: r.createdAt,
    }));
    res.json(formatted);
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
