const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  startHour: { type: Number, default: 8 },
  endHour: { type: Number, default: 18 },
  availabilityLimit: { type: Number, default: 2 }, // weeks ahead
  regularShifts: [{
    id: String,
    name: String,
    days: [String],
    startTime: String,
    endTime: String
  }],
  specialEvents: [{
    id: String,
    name: String,
    date: String,
    startTime: String,
    endTime: String
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
