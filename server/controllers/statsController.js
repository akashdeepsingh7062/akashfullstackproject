const User = require('../models/User');
const Task = require('../models/Task');

const summarize = (tasks) => {
  const now = new Date();
  const s = { total: tasks.length, done: 0, onTime: 0, late: 0, live: 0, missed: 0, scheduled: 0 };
  tasks.forEach((t) => {
    const overdue = t.dueDate && new Date(t.dueDate) < now;
    if (t.status === 'done') {
      s.done++;
      if (t.dueDate && t.completedAt && new Date(t.completedAt) > new Date(t.dueDate)) s.late++;
      else s.onTime++;
    } else if (overdue) s.missed++;
    else if (t.status === 'in-progress') s.live++;
    else s.scheduled++;
  });
  s.points = Math.max(0, s.onTime * 10 + s.late * 5 - s.missed * 3);
  return s;
};

const ranked = async () => {
  const users = await User.find({ role: { $in: ['member', 'manager'] } });
  const tasks = await Task.find({ assignedTo: { $ne: null } });
  const list = users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    ...summarize(tasks.filter((t) => String(t.assignedTo) === String(u._id))),
  }));
  list.sort((a, b) => b.points - a.points || b.done - a.done);
  list.forEach((u, i) => { u.rank = i + 1; });
  return list;
};

exports.me = async (req, res, next) => {
  try {
    const mine = await Task.find({ assignedTo: req.user._id });
    const list = await ranked();
    const pos = list.find((u) => u.id === String(req.user._id));
    res.json({
      name: req.user.name,
      role: req.user.role,
      rank: pos ? pos.rank : null,
      outOf: list.length,
      ...summarize(mine),
    });
  } catch (e) { next(e); }
};

exports.leaderboard = async (req, res, next) => {
  try {
    const list = await ranked();
    res.json(list.map(({ id, name, role, points, done, rank }) => ({ id, name, role, points, done, rank })));
  } catch (e) { next(e); }
};

exports.performance = async (req, res, next) => {
  try {
    res.json(await ranked());
  } catch (e) { next(e); }
};

exports.monthly = async (req, res, next) => {
  try {
    const own = ['member', 'guest'].includes(req.user.role);
    const tasks = await Task.find(own ? { assignedTo: req.user._id } : {});
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en', { month: 'short' }), created: 0, completed: 0, missed: 0 });
    }
    const find = (date) => months.find((m) => m.key === `${date.getFullYear()}-${date.getMonth()}`);
    tasks.forEach((t) => {
      const c = find(new Date(t.createdAt));
      if (c) c.created++;
      if (t.status === 'done' && t.completedAt) {
        const d = find(new Date(t.completedAt));
        if (d) d.completed++;
      }
      if (t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now) {
        const m = find(new Date(t.dueDate));
        if (m) m.missed++;
      }
    });
    res.json(months.map(({ key, ...rest }) => rest));
  } catch (e) { next(e); }
};

exports.reminders = async (req, res, next) => {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const filter = { status: { $ne: 'done' }, dueDate: { $ne: null, $lte: soon } };
    if (!['admin', 'manager'].includes(req.user.role)) filter.assignedTo = req.user._id;
    const tasks = await Task.find(filter).populate('assignedTo', 'name').sort('dueDate').limit(20);
    res.json(tasks.map((t) => ({
      id: t._id,
      title: t.title,
      dueDate: t.dueDate,
      overdue: new Date(t.dueDate) < now,
      assignedTo: t.assignedTo ? t.assignedTo.name : null,
    })));
  } catch (e) { next(e); }
};
