const express = require('express');
const { check } = require('express-validator');
const {
  createStressEntry,
  getStressEntries,
  getStressEntry,
  updateStressEntry,
  deleteStressEntry,
  getStressStats,
  getStressInsights
} = require('../controllers/stressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Route for creating a new stress entry
router.post(
  '/',
  [
    check('stressLevel', 'Please provide a stress level between 1-10')
      .isInt({ min: 1, max: 10 }),
    check('stressors', 'Please provide at least one stressor')
      .isArray({ min: 1 })
  ],
  createStressEntry
);

// Route for getting all stress entries with optional query params
router.get('/', getStressEntries);

// Route for getting stress statistics
router.get('/stats', getStressStats);

// Route for getting stress insights
router.get('/insights', getStressInsights);

// Route for getting a single stress entry by ID
router.get('/:id', getStressEntry);

// Route for updating a stress entry
router.put(
  '/:id',
  [
    check('stressLevel', 'Please provide a valid stress level between 1-10')
      .optional()
      .isInt({ min: 1, max: 10 }),
    check('stressors')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Please provide at least one stressor')
  ],
  updateStressEntry
);

// Route for deleting a stress entry
router.delete('/:id', deleteStressEntry);

module.exports = router;
