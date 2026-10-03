const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/authController');
router.post('/register',
  [body('email').isEmail(), body('password').isLength({ min: 6 }), body('name').notEmpty()], c.register);
router.post('/login', c.login);
module.exports = router;
