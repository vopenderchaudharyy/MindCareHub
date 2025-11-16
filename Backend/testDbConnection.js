const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Configure environment variables
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });


const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Using connection string: ${process.env.MONGO_URI?.split('@')[1] || 'connection string not found'}`);
    if (!process.env.MONGO_URI || !process.env.MONGO_URI.trim()) {
      throw new Error('MONGO_URI is not defined');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    
    console.log(`✅ Successfully connected to MongoDB: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    
    // List all collections to verify access
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.error('Full error details:', error);
    process.exit(1);
  }
};

testConnection();
