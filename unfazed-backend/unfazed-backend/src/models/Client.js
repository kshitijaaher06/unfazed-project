const mongoose = require('mongoose');
const crypto = require('crypto');
const schema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  tags: [String],
  // portal link token (stand-in for client login)
  access_token: { type: String, default: () => crypto.randomBytes(16).toString('hex'), unique: true },
  // intake form (static template) - stored as a sub-document
  intake: {
    age: Number, gender: String, occupation: String, emergency_contact: String,
    presenting_concern: String, history: String, submitted_at: Date
  },
  intake_completed: { type: Boolean, default: false },
  // consent: append-only audit trail (never edited or deleted by the app)
  consents: [{ version: String, accepted_at: Date, ip: String, user_agent: String }]
}, { timestamps: true });
module.exports = mongoose.model('Client', schema);
