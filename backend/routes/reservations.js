const express = require('express');
const router  = express.Router();
const Reservation = require('../models/Reservation');
const { EatsPoints, PointsTransaction } = require('../models/EatsPoints');
const { protect } = require('../middleware/auth');

// Helper: award 100 Eats Points to a customer for a reservation
async function awardPoints(customerId, reservationId) {
  try {
    const POINTS_PER_RESERVATION = 100;

    // Upsert the balance document
    await EatsPoints.findOneAndUpdate(
      { customer: customerId },
      { $inc: { balance: POINTS_PER_RESERVATION } },
      { upsert: true, new: true }
    );

    // Record the transaction
    await PointsTransaction.create({
      customer:    customerId,
      type:        'earn',
      points:      POINTS_PER_RESERVATION,
      description: 'Reservation reward',
      reservation: reservationId,
    });
  } catch (err) {
    // Points failure should not break the reservation flow
    console.error('Points award error:', err.message);
  }
}

// @route POST /api/reservations – Create reservation
router.post('/', protect, async (req, res) => {
  try {
    const reservation = await Reservation.create({ ...req.body, customer: req.user.id });
    // Auto-award 100 Eats Points
    await awardPoints(req.user.id, reservation._id);
    res.status(201).json({ message: 'Reservation created successfully!', reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reservations/restaurant/:id – Get reservations for a restaurant (vendor)
router.get('/restaurant/:id', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ restaurant: req.params.id }).sort({ reservationDate: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reservations/customer/:id – Get reservations for a customer
router.get('/customer/:id', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.params.id })
      .populate('restaurant', 'name city')
      .sort({ reservationDate: -1 });

    const formatted = reservations.map((r) => ({
      _id:             r._id,
      restaurantId:    r.restaurant,
      date:            r.reservationDate,
      time:            r.reservationDate
        ? new Date(r.reservationDate).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
        : '',
      partySize:       r.partySize,
      status:          r.status,
      specialRequests: r.specialRequests,
      createdAt:       r.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/reservations/:id – Update reservation status
router.put('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
