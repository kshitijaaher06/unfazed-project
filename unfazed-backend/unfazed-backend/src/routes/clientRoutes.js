const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/clientController');
router.use(auth);
router.get('/', c.listClients);
router.post('/', c.createClient);
module.exports = router;
