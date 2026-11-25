const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendAuth = (user, res, status = 200) =>
  res.status(status).json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });

// POST /api/auth/register  (always creates a "member"; admin promotes later)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.create({ name, email, password });
    sendAuth(user, res, 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    sendAuth(user, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ user: { id: _id, name, email, role } });
};

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Task = require('../models/Task');

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    const generic = { message: 'If that email exists, a reset link has been sent.' };
    const user = email ? await User.findOne({ email }) : null;
    if (!user || user.role === 'guest') return res.json(generic);

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailer = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await mailer.sendMail({
        from: `TaskFlow <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset your TaskFlow password',
        text: `Open this link to set a new password (valid for 30 minutes):\n${link}`,
      });
    } else {
      console.log('Password reset link (email not configured):', link);
    }
    res.json(generic);
  } catch (e) { next(e); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetToken: hashed, resetExpires: { $gt: new Date() } })
      .select('+resetToken +resetExpires');
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or expired' });
    user.password = password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.json({ message: 'Password updated. You can log in now.' });
  } catch (e) { next(e); }
};

exports.guestLogin = async (req, res, next) => {
  try {
    const id = crypto.randomBytes(4).toString('hex');
    const user = await User.create({
      name: `Guest ${id}`,
      email: `guest-${id}@taskflow.demo`,
      password: crypto.randomBytes(12).toString('hex'),
      role: 'guest',
    });
    const day = 24 * 60 * 60 * 1000;
    const mk = (title, status, priority, offset) => ({
      title, description: 'Demo task', status, priority,
      dueDate: new Date(Date.now() + offset * day),
      createdBy: user._id, assignedTo: user._id,
    });
    await Task.insertMany([
      mk('Explore the dashboard', 'in-progress', 'medium', 2),
      mk('Check your reminders', 'todo', 'high', 5),
      mk('Review the monthly report', 'todo', 'low', -1),
    ]);
    sendAuth(user, res, 201);
  } catch (e) { next(e); }
};
