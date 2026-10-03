const { canAccess } = require('../services/entitlementService');
// usage: router.get('/x', auth, requireFeature('features.advancedAnalytics'), handler)
module.exports = (featureKey) => async (req, res, next) => {
  const r = await canAccess(req.user.id, featureKey);
  if (!r.allowed) return res.status(403).json({ message: 'Upgrade required', upgrade: true, feature: featureKey, ...r });
  next();
};
