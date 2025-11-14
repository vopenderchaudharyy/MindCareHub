const express = require('express');
const { check } = require('express-validator');
const {
  createMoodEntry,
  getMoodEntries,
  getMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
  getMoodStats
} = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Route for creating a new mood entry
router.post(
  '/',
  [
    check('mood', 'Please select a mood').not().isEmpty(),
    check('moodScore', 'Please provide a mood score between 1-10')
      .isInt({ min: 1, max: 10 })
  ],
  createMoodEntry
);

// Route for getting all mood entries with optional query params
router.get('/', getMoodEntries);

// Route for getting mood statistics
router.get('/stats', getMoodStats);

// Route for getting a single mood entry by ID
router.get('/:id', getMoodEntry);

// Route for updating a mood entry
router.put(
  '/:id',
  [
    check('moodScore', 'Please provide a valid mood score between 1-10')
      .optional()
      .isInt({ min: 1, max: 10 })
  ],
  updateMoodEntry
);

// Route for deleting a mood entry
router.delete('/:id', deleteMoodEntry);

module.exports = router;
