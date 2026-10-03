const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  bio: { type: String, default: '' },
  specializations: [String],
  languages: [String],
  tier: { type: String, default: 'free' } // only the Entitlement Service reads this
}, { timestamps: true });
module.exports = mongoose.model('Therapist', schema);
