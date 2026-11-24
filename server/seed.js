// Creates a default admin: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: 'admin@taskflow.com' });
  if (exists) console.log('Admin already exists');
  else {
    await User.create({ name: 'Admin', email: 'admin@taskflow.com', password: 'admin123', role: 'admin' });
    console.log('Admin created -> admin@taskflow.com / admin123 (change this!)');
  }
  process.exit(0);
})();
