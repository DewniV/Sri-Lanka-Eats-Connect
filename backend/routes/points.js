const express = require('express');
const router  = express.Router();
const { EatsPoints, PointsTransaction } = require('../models/EatsPoints');
const { protect } = require('../middleware/auth');

// @route GET /api/points/balance – Get the logged-in customer's points balance
router.get('/balance', protect, async (req, res) => {
  try {
    const record = await EatsPoints.findOne({ customer: req.user.id });
    res.json({ balance: record ? record.balance : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/points/history – Get the logged-in customer's transaction history
router.get('/history', protect, async (req, res) => {
  try {
    const transactions = await PointsTransaction.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/points/redeem – Redeem 500 points for a discount
router.post('/redeem', protect, async (req, res) => {
  try {
    const REDEEM_COST = 500;
    const record = await EatsPoints.findOne({ customer: req.user.id });

    if (!record || record.balance < REDEEM_COST) {
      return res.status(400).json({ message: 'Not enough points. You need 500 points to redeem.' });
    }

    // Deduct points
    record.balance -= REDEEM_COST;
    await record.save();

    // Record transaction
    await PointsTransaction.create({
      customer:    req.user.id,
      type:        'redeem',
      points:      REDEEM_COST,
      description: 'Redeemed for dining discount',
    });

    // Generate a simple discount code
    const code = 'EATS' + Math.random().toString(36).substring(2, 8).toUpperCase();

    res.json({
      message:      'Points redeemed successfully!',
      discountCode: code,
      newBalance:   record.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
