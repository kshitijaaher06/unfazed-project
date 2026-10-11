const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'no_show', 'cancelled'], default: 'scheduled' },
  amount: { type: Number, default: 0 }
}, { timestamps: true });
// DB-level double-booking guard: one scheduled session per therapist per start time
schema.index({ therapist_id: 1, start: 1 }, { unique: true, partialFilterExpression: { status: 'scheduled' } });
module.exports = mongoose.model('Session', schema);
