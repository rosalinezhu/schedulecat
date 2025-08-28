const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('[LOGIN] Attempt for email:', email);
  try {
    const user = await User.findOne({ email });
    console.log('[LOGIN] User found:', !!user, user && user.email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match:', isMatch);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, name: user.firstName + ' ' + user.lastName });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;