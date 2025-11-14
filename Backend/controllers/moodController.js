const MoodEntry = require('../models/MoodEntry');
const asyncHandler = require('express-async-handler');

// @desc    Create a new mood entry
// @route   POST /api/mood
// @access  Private
exports.createMoodEntry = asyncHandler(async (req, res) => {
  const { mood, moodScore, note, activities, triggers } = req.body;
  
  const moodEntry = await MoodEntry.create({
    user: req.user.id,
    mood,
    moodScore,
    note,
    activities,
    triggers
  });

  res.status(201).json({
    success: true,
    data: moodEntry
  });
});

// @desc    Get all mood entries for logged in user
// @route   GET /api/mood
// @access  Private
exports.getMoodEntries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await MoodEntry.countDocuments({ user: req.user.id });

  const entries = await MoodEntry.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: entries.length,
    pagination,
    data: entries
  });
});

// @desc    Get mood entry by ID
// @route   GET /api/mood/:id
// @access  Private
exports.getMoodEntry = asyncHandler(async (req, res) => {
  const entry = await MoodEntry.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!entry) {
    res.status(404);
    throw new Error('Mood entry not found');
  }

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Update mood entry
// @route   PUT /api/mood/:id
// @access  Private
exports.updateMoodEntry = asyncHandler(async (req, res) => {
  let entry = await MoodEntry.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Mood entry not found');
  }

  // Make sure user owns the entry
  if (entry.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update this entry');
  }

  entry = await MoodEntry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Delete mood entry
// @route   DELETE /api/mood/:id
// @access  Private
exports.deleteMoodEntry = asyncHandler(async (req, res) => {
  const entry = await MoodEntry.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Mood entry not found');
  }

  // Make sure user owns the entry
  if (entry.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this entry');
  }

  await entry.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get mood stats
// @route   GET /api/mood/stats
// @access  Private
exports.getMoodStats = asyncHandler(async (req, res) => {
  const stats = await MoodEntry.aggregate([
    {
      $match: { user: req.user.id }
    },
    {
      $group: {
        _id: '$mood',
        count: { $sum: 1 },
        avgMoodScore: { $avg: '$moodScore' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const totalEntries = await MoodEntry.countDocuments({ user: req.user.id });
  const avgMoodScore = await MoodEntry.aggregate([
    {
      $match: { user: req.user.id }
    },
    {
      $group: {
        _id: null,
        avgMoodScore: { $avg: '$moodScore' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: totalEntries,
    avgMoodScore: avgMoodScore[0]?.avgMoodScore || 0,
    data: stats
  });
});
