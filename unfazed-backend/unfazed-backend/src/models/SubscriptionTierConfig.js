const mongoose = require('mongoose');
// All caps / prices live in DB config - nothing hardcoded in code
const schema = new mongoose.Schema({
  tier: { type: String, required: true, unique: true },
  price_monthly: { type: Number, default: 0 },
  caps: { activeClients: { type: Number, default: 5 } },
  features: {
    soapTemplates: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false }
  }
});
module.exports = mongoose.model('SubscriptionTierConfig', schema);
