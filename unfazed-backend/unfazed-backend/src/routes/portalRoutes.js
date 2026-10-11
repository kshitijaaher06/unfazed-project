const router = require('express').Router();
const notes = require('../controllers/noteController');
const intake = require('../controllers/intakeController');
router.get('/:token/notes', notes.portalNotes);   // only ever returns shared notes
router.get('/:token/intake', intake.getIntake);
router.post('/:token/intake', intake.submitIntake);
module.exports = router;
