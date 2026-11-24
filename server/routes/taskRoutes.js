const router = require('express').Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.get('/', getTasks);
router.post('/', authorizeRoles('admin', 'manager'), createTask);
router.put('/:id', updateTask);
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteTask);

module.exports = router;
