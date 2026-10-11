const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/schedulingController');
router.get('/availability', auth, c.getAvailability);
router.put('/availability', auth, c.saveAvailability);
router.get('/sessions', auth, c.mySessions);
router.get('/:slug/slots', c.publicSlots);   // public
router.post('/:slug/book', c.book);          // public
module.exports = router;
