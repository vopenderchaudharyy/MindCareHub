const Affirmation = require('../models/Affirmation');
const asyncHandler = require('express-async-handler');
const { Error } = require('mongoose');

// @desc    Get all affirmations
// @route   GET /api/affirmations
// @access  Public
exports.getAffirmations = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  // Execute query with pagination
  const [affirmations, total] = await Promise.all([
    Affirmation.find(query)
      .sort({ favoriteCount: -1, 'metadata.usageCount': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(),
    Affirmation.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: affirmations.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: affirmations
  });
});

// @desc    Get random affirmation
// @route   GET /api/affirmations/random
// @access  Public
exports.getRandomAffirmation = asyncHandler(async (req, res) => {
  const { mood, category } = req.query;
  
  const filters = { isActive: true };
  
  if (mood) {
    filters.$or = [
      { moodAssociation: 'all' },
      { moodAssociation: mood }
    ];
  }
  
  if (category) {
    filters.category = category;
  }
  
  const count = await Affirmation.countDocuments(filters);
  
  if (count === 0) {
    return res.status(404).json({
      success: false,
      message: 'No affirmations found with the specified filters'
    });
  }
  
  const random = Math.floor(Math.random() * count);
  const affirmation = await Affirmation.findOne(filters).skip(random);
  
  // Increment usage count
  if (affirmation) {
    await Affirmation.findByIdAndUpdate(affirmation._id, {
      $inc: { 'metadata.usageCount': 1 },
      $set: { 'metadata.lastUsed': new Date() }
    });
  }
  
  res.status(200).json({
    success: true,
    data: affirmation
  });
});

// @desc    Get user's favorite affirmations
// @route   GET /api/affirmations/favorites/mine
// @access  Private
exports.getUserFavorites = asyncHandler(async (req, res) => {
  const favorites = await Affirmation.find({
    favorites: req.user.id,
    isActive: true
  });
  
  res.status(200).json({
    success: true,
    count: favorites.length,
    data: favorites
  });
});

// @desc    Add affirmation to favorites
// @route   POST /api/affirmations/:id/favorite
// @access  Private
exports.favoriteAffirmation = asyncHandler(async (req, res) => {
  const affirmation = await Affirmation.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: { favorites: req.user.id }
    },
    { new: true, runValidators: true }
  );
  
  if (!affirmation) {
    return res.status(404).json({
      success: false,
      message: 'Affirmation not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: affirmation
  });
});

// @desc    Remove affirmation from favorites
// @route   DELETE /api/affirmations/:id/favorite
// @access  Private
exports.unfavoriteAffirmation = asyncHandler(async (req, res) => {
  const affirmation = await Affirmation.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { favorites: req.user.id }
    },
    { new: true }
  );
  
  if (!affirmation) {
    return res.status(404).json({
      success: false,
      message: 'Affirmation not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: affirmation
  });
});

// @desc    Rate an affirmation
// @route   POST /api/affirmations/:id/rate
// @access  Private
exports.rateAffirmation = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  
  const affirmation = await Affirmation.findById(req.params.id);
  
  if (!affirmation) {
    return res.status(404).json({
      success: false,
      message: 'Affirmation not found'
    });
  }
  
  // Check if user already rated
  const existingRating = affirmation.ratings.find(
    r => r.user.toString() === req.user.id
  );
  
  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
  } else {
    // Add new rating
    affirmation.ratings.push({
      user: req.user.id,
      rating
    });
  }
  
  // Calculate new average rating
  const totalRatings = affirmation.ratings.length;
  const sumRatings = affirmation.ratings.reduce((sum, r) => sum + r.rating, 0);
  affirmation.averageRating = sumRatings / totalRatings;
  
  await affirmation.save();
  
  res.status(200).json({
    success: true,
    data: affirmation
  });
});

// @desc    Create new affirmation (Admin only)
// @route   POST /api/affirmations
// @access  Private/Admin
exports.createAffirmation = asyncHandler(async (req, res) => {
  const { text, category, moodAssociation = ['all'], isPublic = true } = req.body;
  
  const affirmation = await Affirmation.create({
    text,
    category,
    moodAssociation,
    isPublic,
    isCustom: false,
    createdBy: req.user.id,
    source: 'admin'
  });
  
  res.status(201).json({
    success: true,
    data: affirmation
  });
});

// @desc    Update affirmation (Admin only)
// @route   PUT /api/affirmations/:id
// @access  Private/Admin
exports.updateAffirmation = asyncHandler(async (req, res) => {
  const { text, category, moodAssociation, isActive, isPublic } = req.body;
  
  const updateData = {};
  if (text) updateData.text = text;
  if (category) updateData.category = category;
  if (moodAssociation) updateData.moodAssociation = moodAssociation;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (isPublic !== undefined) updateData.isPublic = isPublic;
  
  const affirmation = await Affirmation.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!affirmation) {
    return res.status(404).json({
      success: false,
      message: 'Affirmation not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: affirmation
  });
});

// @desc    Delete affirmation (Admin only)
// @route   DELETE /api/affirmations/:id
// @access  Private/Admin
exports.deleteAffirmation = asyncHandler(async (req, res) => {
  const affirmation = await Affirmation.findByIdAndDelete(req.params.id);
  
  if (!affirmation) {
    return res.status(404).json({
      success: false,
      message: 'Affirmation not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get affirmation by ID
// @route   GET /api/affirmations/:id
// @access  Public
exports.getAffirmation = asyncHandler(async (req, res) => {
  const affirmation = await Affirmation.findById(req.params.id);
  
  if (!affirmation || !affirmation.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Affirmation not found'
    });
  }
  
  // Increment view count
  affirmation.metadata.usageCount += 1;
  await affirmation.save();
  
  res.status(200).json({
    success: true,
    data: affirmation
  });
});
