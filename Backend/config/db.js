const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Log successful connection
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connection is open');
    });
    
    // Log connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    // Log when the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose connection is disconnected');
    });
    
    // Close the connection when Node process ends
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection is disconnected due to application termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (process.env.MONGO_URI) {
      // Safely log the connection string with credentials masked
      const maskedUri = process.env.MONGO_URI
        .replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)@/, '$1********@');
      console.error('Connection URI:', maskedUri);
    } else {
      console.error('mongodb+srv://vopenderchaudhary:vpchaudhary007@cluster0.nppmprn.mongodb.net/MindCareHUb');
    }
    
    // Exit with failure
    process.exit(1);
  }
};

module.exports = connectDB;
