const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Middleware to check admin
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}

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

//Update user role (admin access needed)
router.put('/users/:id/role', authMiddleware, requireAdmin, async (req, res) => {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Role updated', user });
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
})

module.exports = router;