const mongoose = require('mongoose');
const Availability = require('./models/Availability');

async function clearAvailabilityData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/schedulecat');
    console.log('Connected to MongoDB');
    
    // Delete all availability records
    const result = await Availability.deleteMany({});
    console.log(`Deleted ${result.deletedCount} availability records`);
    
  } catch (error) {
    console.error('Error clearing availability data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearAvailabilityData();
