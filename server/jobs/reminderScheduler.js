const cron = require('node-cron');
const User = require('../models/User');
const Availability = require('../models/Availability');
const ShiftAssignment = require('../models/ShiftAssignment');
const emailService = require('../services/emailService');

class ReminderScheduler {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('Reminder scheduler is already running');
      return;
    }

    // Run every Sunday at 9:00 AM
    this.job = cron.schedule('0 9 * * 0', async () => {
      console.log('Running weekly schedule summary...');
      await this.sendWeeklySummaries();
    }, {
      scheduled: false,
      timezone: "America/New_York"
    });

    this.job.start();
    this.isRunning = true;
    console.log('Weekly summary scheduler started - will run every Sunday at 9:00 AM');
  }

  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      console.log('Reminder scheduler stopped');
    }
  }

  async sendWeeklySummaries() {
    try {
      console.log('Sending weekly schedule summaries...');
      
      // Get all users with email notifications enabled
      const users = await User.find({
        'emailNotifications.shiftReminders': true
      });

      for (const user of users) {
        await this.sendUserWeeklySummary(user);
      }

      console.log('Weekly summaries sent completed');
    } catch (error) {
      console.error('Error in weekly summary scheduler:', error);
    }
  }

  async sendUserWeeklySummary(user) {
    try {
      // Get user's availability data for this week
      const availability = await Availability.findOne({ userId: user._id });
      if (!availability || !availability.shiftAvailability) {
        // Send summary with no shifts
        await this.sendWeeklySummaryEmail(user, []);
        return;
      }

      // Get this week's shifts
      const weeklyShifts = await this.getWeeklyShifts(availability.shiftAvailability);
      
      // Send weekly summary email
      await this.sendWeeklySummaryEmail(user, weeklyShifts);
    } catch (error) {
      console.error(`Error sending weekly summary for user ${user.email}:`, error);
    }
  }

  async getWeeklyShifts(userShiftIds) {
    // Get start and end of current week (Sunday to Saturday)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // This is a simplified version - adapt based on your shift data structure
    // For now, creating sample shifts based on availability
    const weeklyShifts = [];
    
    if (userShiftIds && userShiftIds.length > 0) {
      // Sample shifts - replace with actual shift data from your system
      const sampleShifts = [
        { shiftName: 'Morning Shift', startTime: '8:00 AM', endTime: '12:00 PM' },
        { shiftName: 'Afternoon Shift', startTime: '1:00 PM', endTime: '5:00 PM' },
        { shiftName: 'Evening Shift', startTime: '6:00 PM', endTime: '10:00 PM' }
      ];
      
      // Generate shifts for this week based on user availability
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        
        // Randomly assign shifts (replace with your actual logic)
        if (Math.random() > 0.6 && userShiftIds.length > 0) {
          const randomShift = sampleShifts[Math.floor(Math.random() * sampleShifts.length)];
          weeklyShifts.push({
            ...randomShift,
            date: currentDate
          });
        }
      }
    }
    
    return weeklyShifts;
  }

  async sendWeeklySummaryEmail(user, weeklyShifts) {
    try {
      const result = await emailService.sendWeeklySummary(
        user.email,
        `${user.firstName} ${user.lastName}`,
        weeklyShifts
      );

      if (result.success) {
        console.log(`Weekly summary sent to ${user.email} (${weeklyShifts.length} shifts)`);
      } else {
        console.error(`Failed to send weekly summary to ${user.email}:`, result.error);
      }
    } catch (error) {
      console.error(`Error sending weekly summary to ${user.email}:`, error);
    }
  }

  // Manual trigger for testing
  async runNow() {
    console.log('Manually triggering weekly summary...');
    await this.sendWeeklySummaries();
  }
}

module.exports = new ReminderScheduler();
