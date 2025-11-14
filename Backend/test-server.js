require('dotenv').config({ path: './config/config.env' });
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Test server is running. Try /test-db to test the database connection.');
});

// Database test route
app.get('/test-db', async (req, res) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    };
    
    // Attempt to connect
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    // Get database info
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    
    // Prepare response
    const response = {
      status: 'success',
      message: 'Successfully connected to MongoDB!',
      connection: {
        host: conn.connection.host,
        database: conn.connection.name,
        collections: collections.map(c => c.name)
      },
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3001
      }
    };
    
    res.json(response);
    
    // Close the connection after sending the response
    setTimeout(() => {
      mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }, 1000);
    
  } catch (error) {
    console.error('Database connection error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Failed to connect to MongoDB',
      error: error.message,
      details: {
        connectionString: process.env.MONGO_URI 
          ? `${process.env.MONGO_URI.split('@')[0]}@${process.env.MONGO_URI.split('@')[1]?.split('/')[0]}/...`
          : 'MONGO_URI not set',
        nodeVersion: process.version,
        platform: process.platform
      },
      troubleshooting: [
        'Check if MongoDB is running',
        'Verify your MONGO_URI in .env file',
        'If using MongoDB Atlas, ensure your IP is whitelisted',
        'Check your internet connection'
      ]
    };
    
    res.status(500).json(errorResponse);
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`- Test the database connection: http://localhost:${PORT}/test-db`);  
  console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop any other servers using this port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been shut down');
    process.exit(0);
  });
});
