const router = require('express').Router();
const c = require('../controllers/noteController');
router.get('/:token/notes', c.portalNotes);   // only ever returns shared notes
module.exports = router;
