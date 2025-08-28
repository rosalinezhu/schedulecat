const { MongoClient } = require('mongodb');

async function clearAvailabilityData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('schedulecat');
    const collection = db.collection('availabilities');
    
    // Delete all availability records
    const result = await collection.deleteMany({});
    console.log(`Deleted ${result.deletedCount} availability records`);
    
  } catch (error) {
    console.error('Error clearing availability data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

clearAvailabilityData();
