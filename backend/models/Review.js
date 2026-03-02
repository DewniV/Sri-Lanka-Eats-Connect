const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  restaurant:   { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  rating:       { type: Number, required: true, min: 1, max: 5 },
  comment:      String
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
