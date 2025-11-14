const express = require('express');
const { check } = require('express-validator');
const {
  getAffirmations,
  getAffirmation,
  createAffirmation,
  updateAffirmation,
  deleteAffirmation,
  getRandomAffirmation,
  favoriteAffirmation,
  unfavoriteAffirmation,
  getUserFavorites,
  rateAffirmation
} = require('../controllers/affirmationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAffirmations);
router.get('/random', getRandomAffirmation);
router.get('/:id', getAffirmation);

// Protected routes (require authentication)
router.use(protect);

// User-specific routes
router.get('/favorites/mine', getUserFavorites);
router.post('/:id/favorite', favoriteAffirmation);
router.delete('/:id/favorite', unfavoriteAffirmation);
router.post('/:id/rate', 
  [
    check('rating', 'Please provide a rating between 1-5').isInt({ min: 1, max: 5 })
  ],
  rateAffirmation
);

// Admin-only routes
router.use(authorize('admin'));

router.post(
  '/',
  [
    check('text', 'Please provide affirmation text').not().isEmpty(),
    check('category', 'Please provide a valid category').isIn([
      'self_love',
      'confidence',
      'motivation',
      'gratitude',
      'anxiety',
      'stress',
      'positivity',
      'general',
      'other'
    ])
  ],
  createAffirmation
);

router.put(
  '/:id',
  [
    check('text', 'Please provide affirmation text').optional().not().isEmpty(),
    check('category')
      .optional()
      .isIn([
        'self_love',
        'confidence',
        'motivation',
        'gratitude',
        'anxiety',
        'stress',
        'positivity',
        'general',
        'other'
      ])
  ],
  updateAffirmation
);

router.delete('/:id', deleteAffirmation);

module.exports = router;
