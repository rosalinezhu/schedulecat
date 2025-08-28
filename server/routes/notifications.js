const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get user's notification preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('emailNotifications');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      emailNotifications: user.emailNotifications || {
        weeklySummary: true
      }
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's notification preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { weeklySummary } = req.body;

    const updateData = {};
    if (typeof weeklySummary === 'boolean') {
      updateData['emailNotifications.weeklySummary'] = weeklySummary;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('emailNotifications');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Notification preferences updated successfully',
      emailNotifications: user.emailNotifications
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send test reminder email
router.post('/test-reminder', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Lazy load email service to avoid startup issues
    try {
      const emailService = require('../services/emailService');
      const result = await emailService.sendTestEmail(
        user.email,
        `${user.firstName} ${user.lastName}`
      );

      if (result.success) {
        res.json({ 
          message: 'Test email sent successfully',
          messageId: result.messageId
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to send test email',
          error: result.error
        });
      }
    } catch (emailError) {
      res.status(500).json({ 
        message: 'Email service not available',
        error: 'Email service not configured'
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoint to manually trigger reminder check
router.post('/trigger-reminders', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    try {
      const reminderScheduler = require('../jobs/reminderScheduler');
      await reminderScheduler.runNow();
      res.json({ message: 'Reminder check triggered successfully' });
    } catch (schedulerError) {
      res.status(500).json({ message: 'Reminder scheduler not available' });
    }
  } catch (error) {
    console.error('Error triggering reminders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get email service status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    let emailConnected = false;
    let schedulerRunning = false;

    try {
      const emailService = require('../services/emailService');
      emailConnected = await emailService.verifyConnection();
    } catch (emailError) {
      // Email service not available
    }

    try {
      const reminderScheduler = require('../jobs/reminderScheduler');
      schedulerRunning = reminderScheduler.isRunning;
    } catch (schedulerError) {
      // Scheduler not available
    }

    res.json({ 
      emailService: emailConnected ? 'connected' : 'disconnected',
      schedulerRunning: schedulerRunning
    });
  } catch (error) {
    console.error('Error checking service status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
