const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  restaurant:      { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  customer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName:    { type: String, required: true },
  customerEmail:   String,
  customerPhone:   String,
  partySize:       { type: Number, required: true },
  reservationDate: { type: Date, required: true },
  specialRequests: String,
  status:          { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  language:        { type: String, enum: ['en','si','ta'], default: 'en' },
  source:          { type: String, enum: ['web','chatbot'], default: 'web' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
