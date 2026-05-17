
const mongoose = require('mongoose');

async function testMongo() {
  const uri = process.argv[2];
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connection SUCCESS');
    await mongoose.disconnect();
  } catch (err) {
    console.error('MongoDB connection FAILURE:', err.message);
    process.exit(1);
  }
}

testMongo();
