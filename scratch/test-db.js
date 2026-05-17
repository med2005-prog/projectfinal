const mongoose = require('mongoose');

async function testConnection() {
  const uri = "mongodb+srv://zikomed2005_db_user:PAvNnXI00PBztnpJ@cluster0.22socpq.mongodb.net/recoverit?retryWrites=true&w=majority";
  console.log('Testing connection to:', uri.split('@')[1]); 
  try {
    await mongoose.connect(uri);
    console.log('SUCCESS: Connected to MongoDB Atlas');
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Could not connect to MongoDB Atlas');
    console.error(err);
    process.exit(1);
  }
}

testConnection();
