const Therapist = require('../models/Therapist');
const TierConfig = require('../models/SubscriptionTierConfig');
// SINGLE source of truth. featureKey examples: 'features.soapTemplates',
// 'features.advancedAnalytics', 'caps.activeClients'
const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

async function canAccess(therapistId, featureKey, currentUsage = 0) {
  const therapist = await Therapist.findById(therapistId).lean();
  if (!therapist) return { allowed: false, reason: 'THERAPIST_NOT_FOUND' };
  const cfg = await TierConfig.findOne({ tier: therapist.tier }).lean();
  if (!cfg) return { allowed: false, reason: 'TIER_NOT_CONFIGURED' };
  const value = get(cfg, featureKey);
  if (typeof value === 'boolean') return { allowed: value, tier: cfg.tier };
  if (typeof value === 'number') return { allowed: currentUsage < value, limit: value, tier: cfg.tier };
  return { allowed: false, reason: 'UNKNOWN_FEATURE' };
}
module.exports = { canAccess };
