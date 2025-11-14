const mongoose = require('mongoose');

const sleepEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sleepTime: {
      type: Date,
      required: [true, 'Please provide sleep time']
    },
    wakeTime: {
      type: Date,
      required: [true, 'Please provide wake time']
    },
    quality: {
      type: Number,
      required: [true, 'Please rate sleep quality from 1-5'],
      min: 1,
      max: 5
    },
    interruptions: {
      type: Number,
      default: 0,
      min: 0
    },
    note: {
      type: String,
      maxlength: [1000, 'Note cannot be more than 1000 characters']
    },
    sleepEnvironment: {
      noiseLevel: {
        type: String,
        enum: ['very_quiet', 'quiet', 'moderate', 'noisy', 'very_noisy']
      },
      lightLevel: {
        type: String,
        enum: ['pitch_black', 'very_dark', 'dim', 'some_light', 'bright']
      },
      temperature: {
        type: String,
        enum: ['very_cold', 'cold', 'comfortable', 'warm', 'hot']
      },
      comfort: {
        type: String,
        enum: ['very_uncomfortable', 'uncomfortable', 'neutral', 'comfortable', 'very_comfortable']
      }
    },
    activitiesBeforeBed: [{
      activity: {
        type: String,
        enum: [
          'screen_time',
          'reading',
          'shower',
          'meditation',
          'exercise',
          'eating',
          'drinking',
          'socializing',
          'working',
          'other'
        ]
      },
      duration: Number, // in minutes
      note: String
    }],
    sleepAids: [{
      type: String,
      enum: [
        'melatonin',
        'prescription_meds',
        'natural_supplements',
        'white_noise',
        'weighted_blanket',
        'eye_mask',
        'ear_plugs',
        'aromatherapy',
        'none',
        'other'
      ]
    }],
    wakeUpMood: {
      type: String,
      enum: [
        'refreshed',
        'tired',
        'groggy',
        'energetic',
        'irritable',
        'anxious',
        'neutral',
        'other'
      ]
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for sleep duration in hours
sleepEntrySchema.virtual('duration').get(function() {
  if (!this.sleepTime || !this.wakeTime) return null;
  
  let durationMs = this.wakeTime - this.sleepTime;
  // Handle overnight sleep (if wake time is next day)
  if (durationMs < 0) {
    durationMs += 24 * 60 * 60 * 1000; // Add 24 hours
  }
  
  return {
    hours: Math.floor(durationMs / (1000 * 60 * 60)),
    minutes: Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  };
});

// Virtual for sleep efficiency (time asleep / time in bed)
sleepEntrySchema.virtual('efficiency').get(function() {
  if (!this.duration || !this.timeInBed) return null;
  return (this.duration / this.timeInBed) * 100;
});

// Indexes for faster querying
sleepEntrySchema.index({ user: 1, sleepTime: -1 });
sleepEntrySchema.index({ user: 1, wakeTime: -1 });

// Static method to get sleep stats
sleepEntrySchema.statics.getSleepStats = async function(userId, days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
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
        avgDuration: { $avg: '$duration' },
        avgQuality: { $avg: '$quality' },
        avgInterruptions: { $avg: '$interruptions' },
        totalSleep: { $sum: '$duration' },
        entries: { $sum: 1 },
        bestNight: { $max: '$quality' },
        worstNight: { $min: '$quality' }
      }
    }
  ]);
};

// Pre-save hook to validate sleep time is before wake time
sleepEntrySchema.pre('save', function(next) {
  if (this.isModified('sleepTime') || this.isModified('wakeTime')) {
    if (this.sleepTime >= this.wakeTime) {
      throw new Error('Sleep time must be before wake time');
    }
  }
  next();
});

module.exports = mongoose.model('SleepEntry', sleepEntrySchema);
