const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:          { type: String, required: true },
  description:   String,
  address:       String,
  city:          String,
  phone:         String,
  email:         String,
  cuisineType:   String,
  priceRange:    { type: String, enum: ['budget', 'mid', 'upscale', 'fine'], default: 'mid' },
  openingHours:  { type: Object, default: {} },
  coverImage:    String,
  isActive:      { type: Boolean, default: true },
  isVerified:    { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  totalReviews:  { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
