const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  emailNotifications: {
    weeklySummary: { type: Boolean, default: true }, // weekly schedule summary
    summaryDay: { type: Number, default: 0 } // 0 = Sunday, 1 = Monday, etc.
  }
});

module.exports = mongoose.model('User', userSchema);