const router = require('express').Router();
const s = require('../controllers/statsController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.get('/me', s.me);
router.get('/leaderboard', s.leaderboard);
router.get('/monthly', s.monthly);
router.get('/reminders', s.reminders);
router.get('/performance', authorizeRoles('admin', 'manager'), s.performance);

module.exports = router;
