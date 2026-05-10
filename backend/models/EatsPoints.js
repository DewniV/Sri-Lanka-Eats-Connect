const mongoose = require('mongoose');

// Each document represents one points transaction for a user.
// Points expire 12 months after they were earned (earnedAt + 12 months).
const eatsPointsSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points:      { type: Number, required: true },          // positive = earned, negative = redeemed
  reason:      { type: String, required: true },           // e.g. 'reservation', 'review', 'redemption'
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
  earnedAt:    { type: Date, default: Date.now },          // when the points were earned
  expiresAt:   { type: Date },                             // earnedAt + 12 months (set in pre-save hook)
  expired:     { type: Boolean, default: false },          // true once the points have expired
}, { timestamps: true });

// Automatically set expiresAt to 12 months after earnedAt
eatsPointsSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const expiry = new Date(this.earnedAt || Date.now());
    expiry.setMonth(expiry.getMonth() + 12);
    this.expiresAt = expiry;
  }
  next();
});

// Index for fast expiry queries
eatsPointsSchema.index({ user: 1, expiresAt: 1 });
eatsPointsSchema.index({ expiresAt: 1, expired: 1 });

module.exports = mongoose.model('EatsPoints', eatsPointsSchema);
