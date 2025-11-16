// ============================================
// backend/server.js
// ============================================
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { errorHandler } = require('./middleware/errorHandler');
const connectDB = require('./config/db');

// Load env vars (try Backend/config/config.env, then project-root/.env, then CWD .env)
(() => {
  const candidates = [
    path.join(__dirname, 'config', 'config.env'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      break;
    }
  }
})();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/mood', require('./routes/moodRoutes'));
app.use('/api/stress', require('./routes/stressRoutes'));
app.use('/api/sleep', require('./routes/sleepRoutes'));
app.use('/api/affirmations', require('./routes/affirmationRoutes'));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MindCare Hub API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      mood: '/api/mood',
      stress: '/api/stress',
      sleep: '/api/sleep',
      affirmations: '/api/affirmations'
    }
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});