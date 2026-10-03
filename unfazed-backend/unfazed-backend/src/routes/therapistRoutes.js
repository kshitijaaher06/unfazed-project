const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireFeature = require('../middleware/entitlementMiddleware');
const c = require('../controllers/therapistController');
router.put('/me', auth, c.updateMe);
// demo of a gated route (Module 7)
router.get('/me/analytics-demo', auth, requireFeature('features.advancedAnalytics'), (req, res) => res.json({ ok: true }));
router.get('/:slug', c.getPublicProfile);
module.exports = router;
