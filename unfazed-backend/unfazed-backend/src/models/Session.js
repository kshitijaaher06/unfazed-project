const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'no_show', 'cancelled'], default: 'scheduled' },
  amount: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Session', schema);
