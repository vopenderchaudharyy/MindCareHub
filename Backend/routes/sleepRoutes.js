const express = require('express');
const { check } = require('express-validator');
const {
  createSleepEntry,
  getSleepEntries,
  getSleepEntry,
  updateSleepEntry,
  deleteSleepEntry,
  getSleepStats,
  getSleepInsights
} = require('../controllers/sleepController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Route for creating a new sleep entry
router.post(
  '/',
  [
    check('sleepTime', 'Please provide a valid sleep time').isISO8601(),
    check('wakeTime', 'Please provide a valid wake time').isISO8601(),
    check('quality', 'Please provide a sleep quality rating between 1-5')
      .isInt({ min: 1, max: 5 }),
    check('interruptions', 'Interruptions must be a number')
      .optional()
      .isInt({ min: 0 })
  ],
  createSleepEntry
);

// Route for getting all sleep entries with optional query params
router.get('/', getSleepEntries);

// Route for getting sleep statistics
router.get('/stats', getSleepStats);

// Route for getting sleep insights
router.get('/insights', getSleepInsights);

// Route for getting a single sleep entry by ID
router.get('/:id', getSleepEntry);

// Route for updating a sleep entry
router.put(
  '/:id',
  [
    check('sleepTime')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid sleep time'),
    check('wakeTime')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid wake time'),
    check('quality')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Sleep quality must be between 1-5'),
    check('interruptions')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Interruptions must be a positive number')
  ],
  updateSleepEntry
);

// Route for deleting a sleep entry
router.delete('/:id', deleteSleepEntry);

module.exports = router;
