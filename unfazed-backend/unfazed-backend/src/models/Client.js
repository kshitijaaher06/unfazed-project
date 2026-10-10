const mongoose = require('mongoose');
const crypto = require('crypto');
const schema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  tags: [String],
  // portal link token (stand-in for client login until Module 3)
  access_token: { type: String, default: () => crypto.randomBytes(16).toString('hex'), unique: true }
}, { timestamps: true });
module.exports = mongoose.model('Client', schema);
