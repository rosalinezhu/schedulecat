require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors());
app.use(express.json());

// Test route first
app.get('/', (req, res) => {
  res.json({ message: 'ScheduleCat Server Running', timestamp: new Date().toISOString() });
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Availability routes
const availabilityRoutes = require('./routes/availability');
app.use('/api/availability', availabilityRoutes);

// Settings routes
const settingsRoutes = require('./routes/settings');
app.use('/api/settings', settingsRoutes);

// Notification routes
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

// Start server first, then connect to database
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ All routes restored - CORS issue resolved`);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));
