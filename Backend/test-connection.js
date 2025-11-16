// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config', 'config.env') });

// Import mongoose
const mongoose = require('mongoose');

// Function to test the database connection
async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  
  // Connection options
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  try {
    if (!process.env.MONGO_URI || !process.env.MONGO_URI.trim()) {
      throw new Error('MONGO_URI is not defined');
    }

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
