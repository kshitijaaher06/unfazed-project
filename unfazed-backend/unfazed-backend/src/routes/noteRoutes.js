const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/noteController');
router.use(auth);
router.get('/', c.listNotes);
router.post('/', c.createNote);
module.exports = router;
