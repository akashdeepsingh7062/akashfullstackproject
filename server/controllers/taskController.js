const Task = require('../models/Task');

const populate = (q) => q.populate('createdBy', 'name email').populate('assignedTo', 'name email');

// GET /api/tasks?status=todo
// admin/manager -> all tasks, member -> only tasks assigned to them
exports.getTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'member') filter.assignedTo = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    res.json(await populate(Task.find(filter).sort('-createdAt')));
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks  (admin, manager)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const task = await Task.create({
      title, description, status, priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined,
      createdBy: req.user._id,
    });
    res.status(201).json(await populate(Task.findById(task._id)));
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
// admin/manager -> any field; member -> only "status" of their own tasks
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'member') {
      if (String(task.assignedTo) !== String(req.user._id)) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      if (!req.body.status) return res.status(400).json({ message: 'Members can only update status' });
      task.status = req.body.status;
    } else {
      ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo'].forEach((f) => {
        if (req.body[f] !== undefined) task[f] = req.body[f] || undefined;
      });
    }
    await task.save();
    res.json(await populate(Task.findById(task._id)));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id  (admin, manager)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
