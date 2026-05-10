const mongoose = require('mongoose');

// Stores each customer's running points balance
const eatsPointsSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance:  { type: Number, default: 0 },
}, { timestamps: true });

// One document per transaction (earn or redeem)
const pointsTransactionSchema = new mongoose.Schema({
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['earn', 'redeem'], required: true },
  points:      { type: Number, required: true },
  description: { type: String },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
}, { timestamps: true });

const EatsPoints        = mongoose.model('EatsPoints', eatsPointsSchema);
const PointsTransaction = mongoose.model('PointsTransaction', pointsTransactionSchema);

module.exports = { EatsPoints, PointsTransaction };
