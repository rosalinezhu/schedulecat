const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

// Middleware to authenticate user via JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Middleware to check admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// GET current calendar settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update calendar settings (admin only)
router.put('/', authMiddleware, requireAdmin, async (req, res) => {
  const { startHour, endHour, availabilityLimit } = req.body;
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ startHour, endHour, availabilityLimit });
    } else {
      if (startHour !== undefined) settings.startHour = startHour;
      if (endHour !== undefined) settings.endHour = endHour;
      if (availabilityLimit !== undefined) settings.availabilityLimit = availabilityLimit;
      settings.updatedAt = Date.now();
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET shift settings
router.get('/shifts', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({
      regularShifts: settings.regularShifts || [],
      specialEvents: settings.specialEvents || []
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update shift settings (admin only)
router.put('/shifts', authMiddleware, requireAdmin, async (req, res) => {
  const { regularShifts, specialEvents } = req.body;
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ regularShifts, specialEvents });
    } else {
      settings.regularShifts = regularShifts || [];
      settings.specialEvents = specialEvents || [];
      settings.updatedAt = Date.now();
    }
    await settings.save();
    res.json({
      regularShifts: settings.regularShifts,
      specialEvents: settings.specialEvents
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
