const SleepEntry = require('../models/SleepEntry');
const asyncHandler = require('express-async-handler');

// @desc    Create a new sleep entry
// @route   POST /api/sleep
// @access  Private
exports.createSleepEntry = asyncHandler(async (req, res) => {
  const { 
    sleepTime, 
    wakeTime, 
    quality, 
    interruptions, 
    note, 
    sleepEnvironment, 
    activitiesBeforeBed,
    sleepAids,
    wakeUpMood
  } = req.body;
  
  const sleepEntry = await SleepEntry.create({
    user: req.user.id,
    sleepTime: new Date(sleepTime),
    wakeTime: new Date(wakeTime),
    quality,
    interruptions: interruptions || 0,
    note,
    sleepEnvironment,
    activitiesBeforeBed: activitiesBeforeBed || [],
    sleepAids: sleepAids || [],
    wakeUpMood
  });

  res.status(201).json({
    success: true,
    data: sleepEntry
  });
});

// @desc    Get all sleep entries for logged in user
// @route   GET /api/sleep
// @access  Private
exports.getSleepEntries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Build query
  const query = { user: req.user.id };
  
  // Filter by date range if provided
  if (req.query.startDate || req.query.endDate) {
    query.sleepTime = {};
    if (req.query.startDate) {
      query.sleepTime.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.sleepTime.$lte = new Date(req.query.endDate);
    }
  }
  
  // Filter by quality if provided
  if (req.query.quality) {
    query.quality = parseInt(req.query.quality);
  }

  const total = await SleepEntry.countDocuments(query);
  const entries = await SleepEntry.find(query)
    .sort({ sleepTime: -1 })
    .limit(limit)
    .skip(startIndex);

  // Calculate pagination
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

// @desc    Get sleep entry by ID
// @route   GET /api/sleep/:id
// @access  Private
exports.getSleepEntry = asyncHandler(async (req, res) => {
  const entry = await SleepEntry.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!entry) {
    res.status(404);
    throw new Error('Sleep entry not found');
  }

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Update sleep entry
// @route   PUT /api/sleep/:id
// @access  Private
exports.updateSleepEntry = asyncHandler(async (req, res) => {
  let entry = await SleepEntry.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Sleep entry not found');
  }

  // Make sure user owns the entry
  if (entry.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update this entry');
  }

  // Convert date strings to Date objects if they exist
  const updateData = { ...req.body };
  if (updateData.sleepTime) updateData.sleepTime = new Date(updateData.sleepTime);
  if (updateData.wakeTime) updateData.wakeTime = new Date(updateData.wakeTime);

  entry = await SleepEntry.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Delete sleep entry
// @route   DELETE /api/sleep/:id
// @access  Private
exports.deleteSleepEntry = asyncHandler(async (req, res) => {
  const entry = await SleepEntry.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Sleep entry not found');
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

// @desc    Get sleep statistics
// @route   GET /api/sleep/stats
// @access  Private
exports.getSleepStats = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const date = new Date();
  date.setDate(date.getDate() - days);

  // Get basic sleep statistics
  const stats = await SleepEntry.aggregate([
    {
      $match: {
        user: req.user._id,
        sleepTime: { $gte: date }
      }
    },
    {
      $addFields: {
        duration: {
          $divide: [
            { $subtract: ['$wakeTime', '$sleepTime'] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        avgQuality: { $avg: '$quality' },
        avgInterruptions: { $avg: '$interruptions' },
        bestNight: { $max: '$quality' },
        worstNight: { $min: '$quality' },
        totalSleep: { $sum: '$duration' }
      }
    }
  ]);

  // Get sleep quality distribution
  const qualityDistribution = await SleepEntry.aggregate([
    {
      $match: {
        user: req.user._id,
        sleepTime: { $gte: date }
      }
    },
    {
      $group: {
        _id: '$quality',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get sleep duration by day of week
  const weeklyPatterns = await SleepEntry.aggregate([
    {
      $match: {
        user: req.user._id,
        sleepTime: { $gte: date }
      }
    },
    {
      $addFields: {
        duration: {
          $divide: [
            { $subtract: ['$wakeTime', '$sleepTime'] },
            1000 * 60 * 60 // Convert to hours
          ]
        },
        dayOfWeek: { $dayOfWeek: '$sleepTime' }
      }
    },
    {
      $group: {
        _id: '$dayOfWeek',
        avgDuration: { $avg: '$duration' },
        avgQuality: { $avg: '$quality' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get recent sleep entries
  const recentEntries = await SleepEntry.find({
    user: req.user._id
  })
    .sort({ sleepTime: -1 })
    .limit(5)
    .select('sleepTime wakeTime quality');

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {},
      qualityDistribution,
      weeklyPatterns,
      recentEntries
    }
  });
});

// @desc    Get sleep insights and recommendations
// @route   GET /api/sleep/insights
// @access  Private
exports.getSleepInsights = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const date = new Date();
  date.setDate(date.getDate() - days);

  // Get sleep environment impact
  const environmentImpact = await SleepEntry.aggregate([
    {
      $match: {
        user: req.user._id,
        sleepTime: { $gte: date },
        'sleepEnvironment.comfort': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$sleepEnvironment.comfort',
        avgQuality: { $avg: '$quality' },
        avgDuration: {
          $avg: {
            $divide: [
              { $subtract: ['$wakeTime', '$sleepTime'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { avgQuality: -1 }
    }
  ]);

  // Get activities before bed impact
  const activitiesImpact = await SleepEntry.aggregate([
    {
      $match: {
        user: req.user._id,
        sleepTime: { $gte: date },
        'activitiesBeforeBed': { $exists: true, $not: { $size: 0 } }
      }
    },
    {
      $unwind: '$activitiesBeforeBed'
    },
    {
      $group: {
        _id: '$activitiesBeforeBed.activity',
        avgQuality: { $avg: '$quality' },
        avgDuration: {
          $avg: {
            $divide: [
              { $subtract: ['$wakeTime', '$sleepTime'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { avgQuality: -1 }
    }
  ]);

  // Get sleep aid effectiveness
  const sleepAidEffectiveness = await SleepEntry.aggregate([
    {
      $match: {
        user: req.user._id,
        sleepTime: { $gte: date },
        'sleepAids': { $exists: true, $not: { $size: 0 } }
      }
    },
    {
      $unwind: '$sleepAids'
    },
    {
      $group: {
        _id: '$sleepAids',
        avgQuality: { $avg: '$quality' },
        avgDuration: {
          $avg: {
            $divide: [
              { $subtract: ['$wakeTime', '$sleepTime'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { avgQuality: -1 }
    }
  ]);

  // Generate recommendations based on data
  const recommendations = [];
  
  // Check for consistent sleep schedule
  const scheduleConsistency = await SleepEntry.aggregate([
    {
      $match: {
        user: req.user._id,
        sleepTime: { $gte: date }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$sleepTime' }
        },
        sleepTime: { $first: '$sleepTime' },
        wakeTime: { $first: '$wakeTime' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  if (scheduleConsistency.length > 0) {
    const bedTimes = scheduleConsistency.map(entry => {
      const time = entry.sleepTime;
      return time.getHours() * 60 + time.getMinutes(); // Convert to minutes since midnight
    });
    
    const wakeTimes = scheduleConsistency.map(entry => {
      const time = entry.wakeTime;
      return time.getHours() * 60 + time.getMinutes();
    });
    
    const avgBedTime = bedTimes.reduce((a, b) => a + b, 0) / bedTimes.length;
    const avgWakeTime = wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length;
    
    const bedTimeVariance = Math.sqrt(
      bedTimes.reduce((a, b) => a + Math.pow(b - avgBedTime, 2), 0) / bedTimes.length
    );
    
    const wakeTimeVariance = Math.sqrt(
      wakeTimes.reduce((a, b) => a + Math.pow(b - avgWakeTime, 2), 0) / wakeTimes.length
    );
    
    if (bedTimeVariance > 60) {
      recommendations.push({
        type: 'schedule_consistency',
        priority: 'high',
        message: 'Your bedtime varies significantly. Try to go to bed at the same time each night to regulate your internal clock.',
        suggestion: 'Set a consistent bedtime and create a relaxing pre-sleep routine.'
      });
    }
    
    if (wakeTimeVariance > 60) {
      recommendations.push({
        type: 'wakeup_consistency',
        priority: 'high',
        message: 'Your wake-up time varies significantly. Waking up at the same time daily helps regulate your sleep cycle.',
        suggestion: 'Set a consistent wake-up time, even on weekends, and use an alarm if necessary.'
      });
    }
  }

  // Check for sufficient sleep duration
  const avgSleepDuration = await SleepEntry.aggregate([
    {
      $match: {
        user: req.user._id,
        sleepTime: { $gte: date }
      }
    },
    {
      $addFields: {
        duration: {
          $divide: [
            { $subtract: ['$wakeTime', '$sleepTime'] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);

  if (avgSleepDuration.length > 0 && avgSleepDuration[0].avgDuration < 7) {
    recommendations.push({
      type: 'sleep_duration',
      priority: 'high',
      message: 'You might not be getting enough sleep. Most adults need 7-9 hours per night.',
      suggestion: 'Aim for at least 7 hours of sleep each night. Consider adjusting your schedule to prioritize sleep.'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      environmentImpact,
      activitiesImpact,
      sleepAidEffectiveness,
      recommendations
    }
  });
});
