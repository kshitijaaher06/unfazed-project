const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, unique: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  weekly: [{ day: Number, start: String, end: String }],            // recurring weekly template (day 0=Sun)
  overrides: [{ date: String, closed: Boolean, start: String, end: String }], // one-time overrides (YYYY-MM-DD)
  blocked: [{ start: Date, end: Date }],                             // blocked slots
  buffer_min: { type: Number, default: 15 },
  durations: { type: [Number], default: [30, 45, 60, 90] }
}, { timestamps: true });
module.exports = mongoose.model('Availability', schema);
