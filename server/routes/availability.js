const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Availability = require('../models/Availability');

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

// GET current user's availability
router.get('/', authMiddleware, async (req, res) => {
  try {
    const record = await Availability.findOne({ userId: req.user.userId });
    res.json(record || { availability: { shiftAvailability: [] } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create or update current user's availability
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('POST /availability - req.body:', req.body);
    console.log('POST /availability - userId:', req.user.userId);
    
    // Ensure we have valid availability data
    const availability = req.body || {};
    console.log('Processed availability:', availability);
    
    let currentAvailability = await Availability.findOne({ userId: req.user.userId });
    if (currentAvailability) {
      console.log('Updating existing availability');
      currentAvailability.availability = availability;
      await currentAvailability.save();
    } else {
      console.log('Creating new availability record');
      currentAvailability = new Availability({ 
        userId: req.user.userId, 
        availability: availability 
      });
      await currentAvailability.save();
    }
    console.log('Saved availability:', currentAvailability);
    res.json(currentAvailability);
  } catch (err) {
    console.error('POST /availability error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//GET all user availability
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const allAvailabilities = await Availability.find({}).populate('userId', 'firstName lastName role');
    res.json(allAvailabilities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;