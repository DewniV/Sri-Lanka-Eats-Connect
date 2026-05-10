const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const EatsPoints = require('../models/EatsPoints');

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

// Helper: mark expired transactions in the database (run lazily on balance fetch)
async function expireOldPoints(userId) {
  const now = new Date();
  await EatsPoints.updateMany(
    { user: userId, expiresAt: { $lte: now }, expired: false },
    { $set: { expired: true } }
  );
}

// @route GET /api/points/balance
// Returns the user's current non-expired points balance and transaction history
router.get('/balance', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Lazily expire any transactions that have passed their expiresAt date
    await expireOldPoints(userId);

    const now = new Date();

    // Active (non-expired) transactions only
    const activeTransactions = await EatsPoints.find({
      user: userId,
      expired: false,
      expiresAt: { $gt: now },
    }).sort({ earnedAt: -1 }).lean();

    // Calculate balance from active transactions
    const balance = activeTransactions.reduce((sum, t) => sum + t.points, 0);

    // Determine tier
    let tier = 'Foodie';
    if (balance >= 1000) tier = 'VIP';
    else if (balance >= 500) tier = 'Regular';

    // All transactions (including expired) for history display
    const allTransactions = await EatsPoints.find({ user: userId })
      .sort({ earnedAt: -1 })
      .limit(50)
      .lean();

    res.json({
      balance: Math.max(0, balance),
      tier,
      transactions: allTransactions.map(t => ({
        _id: t._id,
        points: t.points,
        reason: t.reason,
        earnedAt: t.earnedAt,
        expiresAt: t.expiresAt,
        expired: t.expired || (t.expiresAt && new Date(t.expiresAt) <= now),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/points/award
// Award points to a user (called internally after reservation or review)
router.post('/award', protect, async (req, res) => {
  try {
    const { points, reason, reservationId } = req.body;
    if (!points || !reason) return res.status(400).json({ message: 'points and reason are required' });

    const earnedAt = new Date();
    const expiresAt = new Date(earnedAt);
    expiresAt.setMonth(expiresAt.getMonth() + 12);

    const transaction = await EatsPoints.create({
      user: req.user.id,
      points,
      reason,
      reservation: reservationId || null,
      earnedAt,
      expiresAt,
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/points/redeem
// Redeem points (deduct from balance)
router.post('/redeem', protect, async (req, res) => {
  try {
    const { points, reason } = req.body;
    if (!points || points <= 0) return res.status(400).json({ message: 'Invalid points amount' });

    const userId = req.user.id;
    await expireOldPoints(userId);

    const now = new Date();
    const activeTransactions = await EatsPoints.find({
      user: userId,
      expired: false,
      expiresAt: { $gt: now },
    }).lean();

    const balance = activeTransactions.reduce((sum, t) => sum + t.points, 0);

    if (balance < points) {
      return res.status(400).json({ message: `Insufficient points. You have ${balance} points but tried to redeem ${points}.` });
    }

    // Record redemption as a negative transaction
    const transaction = await EatsPoints.create({
      user: userId,
      points: -points,
      reason: reason || 'redemption',
      earnedAt: now,
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // redemptions don't expire
    });

    res.json({ success: true, transaction, newBalance: balance - points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
