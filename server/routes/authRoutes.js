const router = require('express').Router();
const a = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', a.register);
router.post('/login', a.login);
router.post('/guest', a.guestLogin);
router.post('/forgot-password', a.forgotPassword);
router.post('/reset-password/:token', a.resetPassword);
router.get('/me', protect, a.me);

module.exports = router;
