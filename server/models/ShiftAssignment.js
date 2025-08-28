const mongoose = require('mongoose');

const shiftAssignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shiftId: { type: String, required: true },
  date: { type: Date, required: true },
  shiftName: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
shiftAssignmentSchema.index({ userId: 1, date: 1 });
shiftAssignmentSchema.index({ date: 1, reminderSent: 1 });

module.exports = mongoose.model('ShiftAssignment', shiftAssignmentSchema);
