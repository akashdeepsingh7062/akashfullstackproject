require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('CONNECTED OK'); process.exit(0); })
  .catch((e) => { console.log('FAILED:', e.message); process.exit(1); });
