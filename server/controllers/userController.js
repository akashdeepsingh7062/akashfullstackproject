const User = require('../models/User');
const Task = require('../models/Task');

// GET /api/users  (admin, manager)
exports.getUsers = async (req, res, next) => {
  try {
    res.json(await User.find().sort('name'));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/role  (admin)
exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Task.updateMany({ assignedTo: user._id }, { $unset: { assignedTo: '' } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
