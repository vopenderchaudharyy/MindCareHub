const StressEntry = require('../models/StressEntry');
const asyncHandler = require('express-async-handler');

// @desc    Create a new stress entry
// @route   POST /api/stress
// @access  Private
exports.createStressEntry = asyncHandler(async (req, res) => {
  const { stressLevel, stressors, physicalSymptoms, copingMethods, note, location, duration, isRecurring } = req.body;
  
  const stressEntry = await StressEntry.create({
    user: req.user.id,
    stressLevel,
    stressors,
    physicalSymptoms: physicalSymptoms || [],
    copingMethods: copingMethods || [],
    note,
    location,
    duration,
    isRecurring
  });

  res.status(201).json({
    success: true,
    data: stressEntry
  });
});

// @desc    Get all stress entries for logged in user
// @route   GET /api/stress
// @access  Private
exports.getStressEntries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await StressEntry.countDocuments({ user: req.user.id });

  // Build query
  const query = { user: req.user.id };
  
  // Filter by date range if provided
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }
  
  // Filter by stress level range if provided
  if (req.query.minStressLevel || req.query.maxStressLevel) {
    query.stressLevel = {};
    if (req.query.minStressLevel) {
      query.stressLevel.$gte = parseInt(req.query.minStressLevel);
    }
    if (req.query.maxStressLevel) {
      query.stressLevel.$lte = parseInt(req.query.maxStressLevel);
    }
  }

  const entries = await StressEntry.find(query)
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

// @desc    Get stress entry by ID
// @route   GET /api/stress/:id
// @access  Private
exports.getStressEntry = asyncHandler(async (req, res) => {
  const entry = await StressEntry.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!entry) {
    res.status(404);
    throw new Error('Stress entry not found');
  }

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Update stress entry
// @route   PUT /api/stress/:id
// @access  Private
exports.updateStressEntry = asyncHandler(async (req, res) => {
  let entry = await StressEntry.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Stress entry not found');
  }

  // Make sure user owns the entry
  if (entry.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update this entry');
  }

  entry = await StressEntry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Delete stress entry
// @route   DELETE /api/stress/:id
// @access  Private
exports.deleteStressEntry = asyncHandler(async (req, res) => {
  const entry = await StressEntry.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Stress entry not found');
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

// @desc    Get stress statistics
// @route   GET /api/stress/stats
// @access  Private
exports.getStressStats = asyncHandler(async (req, res) => {
  // Get basic stats
  const stats = await StressEntry.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        avgStressLevel: { $avg: '$stressLevel' },
        maxStressLevel: { $max: '$stressLevel' },
        minStressLevel: { $min: '$stressLevel' },
        commonStressors: { $push: '$stressors' }
      }
    },
    {
      $unwind: '$commonStressors'
    },
    {
      $unwind: '$commonStressors'
    },
    {
      $group: {
        _id: '$commonStressors',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Get stress level distribution
  const distribution = await StressEntry.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: '$stressLevel',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get weekly patterns
  const weeklyPatterns = await StressEntry.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        avgStressLevel: { $avg: '$stressLevel' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get recent entries for timeline
  const recentEntries = await StressEntry.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('stressLevel stressors createdAt');

  res.status(200).json({
    success: true,
    data: {
      stats,
      distribution,
      weeklyPatterns,
      recentEntries
    }
  });
});

// @desc    Get stress triggers and coping mechanisms
// @route   GET /api/stress/insights
// @access  Private
exports.getStressInsights = asyncHandler(async (req, res) => {
  // Get most common stressors
  const commonStressors = await StressEntry.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $unwind: '$stressors'
    },
    {
      $group: {
        _id: '$stressors',
        count: { $sum: 1 },
        avgStressLevel: { $avg: '$stressLevel' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get most effective coping mechanisms
  const copingEffectiveness = await StressEntry.aggregate([
    {
      $match: { 
        user: req.user._id,
        copingMethods: { $exists: true, $not: { $size: 0 } },
        stressLevel: { $exists: true }
      }
    },
    {
      $unwind: '$copingMethods'
    },
    {
      $group: {
        _id: '$copingMethods',
        count: { $sum: 1 },
        avgStressReduction: { 
          $avg: { $subtract: [10, '$stressLevel'] } // Higher is better (assuming 10 is max stress)
        },
        avgStressLevel: { $avg: '$stressLevel' }
      }
    },
    {
      $sort: { avgStressReduction: -1 }
    }
  ]);

  // Get stress patterns by time of day
  const timeOfDayPatterns = await StressEntry.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $project: {
        hour: { $hour: '$createdAt' },
        stressLevel: 1
      }
    },
    {
      $group: {
        _id: '$hour',
        avgStressLevel: { $avg: '$stressLevel' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      commonStressors,
      copingEffectiveness,
      timeOfDayPatterns
    }
  });
});
