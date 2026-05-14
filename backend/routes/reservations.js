const express = require('express');
const router  = express.Router();
const nodemailer = require('nodemailer');
const Reservation = require('../models/Reservation');
const Restaurant  = require('../models/Restaurant');
const User = require('../models/User');
const EatsPoints = require('../models/EatsPoints');
const { protect } = require('../middleware/auth');

// Email transporter (only created if SMTP env vars are set)
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });
};

// Send notification email to vendor
async function sendVendorNotification(reservation, restaurant) {
  const transporter = createTransporter();
  if (!transporter) return;
  try {
    const vendor = await User.findById(restaurant.owner).lean();
    if (!vendor || !vendor.email) return;
    const dateStr = new Date(reservation.reservationDate).toLocaleString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    await transporter.sendMail({
      from: `"SL Eats Connect" <${process.env.SMTP_USER}>`,
      to: vendor.email,
      subject: `New Reservation at ${restaurant.name} — ${dateStr}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #c0392b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Reservation 🎉</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            <h2>You have a new table booking!</h2>
            <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Restaurant</td><td style="padding:10px;">${restaurant.name}</td></tr>
              <tr><td style="padding:10px; font-weight:bold;">Customer</td><td style="padding:10px;">${reservation.customerName}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Date & Time</td><td style="padding:10px;">${dateStr}</td></tr>
              <tr><td style="padding:10px; font-weight:bold;">Party Size</td><td style="padding:10px;">${reservation.partySize} people</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Email</td><td style="padding:10px;">${reservation.customerEmail || 'Not provided'}</td></tr>
              <tr><td style="padding:10px; font-weight:bold;">Phone</td><td style="padding:10px;">${reservation.customerPhone || 'Not provided'}</td></tr>
              ${reservation.specialRequests ? `<tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Special Requests</td><td style="padding:10px;">${reservation.specialRequests}</td></tr>` : ''}
            </table>
            <p>Please log in to your <strong>Vendor Dashboard</strong> to confirm or manage this reservation.</p>
            <p style="color:#999; font-size:12px;">Booked via SL Eats Connect</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Vendor notification email error:', err.message);
  }
}

// Send confirmation email to customer
async function sendCustomerConfirmation(reservation, restaurantName) {
  const transporter = createTransporter();
  if (!transporter || !reservation.customerEmail) return;

  try {
    const dateStr = new Date(reservation.reservationDate).toLocaleString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    await transporter.sendMail({
      from: `"SL Eats Connect" <${process.env.SMTP_USER}>`,
      to: reservation.customerEmail,
      subject: `Reservation Confirmed — ${restaurantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #c0392b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Reservation Confirmed 🎉</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            <p>Hi <strong>${reservation.customerName}</strong>,</p>
            <p>Your table has been reserved! Here are your booking details:</p>
            <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Restaurant</td><td style="padding:10px;">${restaurantName}</td></tr>
              <tr><td style="padding:10px; font-weight:bold;">Date & Time</td><td style="padding:10px;">${dateStr}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Party Size</td><td style="padding:10px;">${reservation.partySize} ${reservation.partySize === 1 ? 'person' : 'people'}</td></tr>
              ${reservation.specialRequests ? `<tr><td style="padding:10px; font-weight:bold;">Special Requests</td><td style="padding:10px;">${reservation.specialRequests}</td></tr>` : ''}
            </table>
            <p style="color: #666;">The restaurant will be in touch to confirm your booking. If you need to make changes, please contact the restaurant directly.</p>
            <p style="color: #c0392b; font-weight: bold;">Enjoy your meal! 🍛</p>
            <p style="color:#999; font-size:12px;">Booked via SL Eats Connect — Sri Lanka's restaurant discovery platform</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    // Email failure should never break the reservation flow
    console.error('Customer confirmation email error:', err.message);
  }
}

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

// @route POST /api/reservations — Create reservation
router.post('/', protect, async (req, res) => {
  try {
    const reservation = await Reservation.create({ ...req.body, customer: req.user.id });

    // Auto-award 100 Eats Points
    await awardPoints(req.user.id, reservation._id);

    // Send confirmation emails in background — don't block response
    const restaurant = await Restaurant.findById(reservation.restaurant).lean();
    const restaurantName = restaurant ? restaurant.name : 'the restaurant';
    sendCustomerConfirmation(reservation, restaurantName);
    if (restaurant) sendVendorNotification(reservation, restaurant);

    res.status(201).json({ message: 'Reservation created successfully!', reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reservations/restaurant/:id — Get reservations for a restaurant (vendor)
router.get('/restaurant/:id', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ restaurant: req.params.id }).sort({ reservationDate: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reservations/customer/:id — Get reservations for a customer
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

// @route PUT /api/reservations/:id — Update reservation status
router.put('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
