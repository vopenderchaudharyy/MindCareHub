// Load environment variables
require('dotenv').config({ path: './config/config.env' });

// Import mongoose
const mongoose = require('mongoose');

// Function to test the database connection
async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  
  // Connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  };

  try {
    // Attempt to connect
    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    // Connection successful
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   - Host: ${conn.connection.host}`);
    console.log(`   - Database: ${conn.connection.name}`);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n📋 Available Collections:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed. Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error details:', error.message);
    
    // Provide helpful troubleshooting tips
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Verify your MONGO_URI in .env file');
    console.log('3. If using MongoDB Atlas, ensure your IP is whitelisted');
    console.log('4. Check your internet connection');
    
    process.exit(1);
  }
}

// Run the test
testConnection();
