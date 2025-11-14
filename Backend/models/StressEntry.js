const mongoose = require('mongoose');

const stressEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    stressLevel: {
      type: Number,
      required: [true, 'Please rate your stress level from 1-10'],
      min: 1,
      max: 10
    },
    stressors: {
      type: [String],
      required: [true, 'Please select at least one stressor'],
      enum: [
        'work',
        'relationships',
        'health',
        'financial',
        'academic',
        'family',
        'social',
        'time_management',
        'uncertainty',
        'other'
      ]
    },
    physicalSymptoms: {
      type: [String],
      enum: [
        'headache',
        'fatigue',
        'muscle_tension',
        'stomach_issues',
        'chest_pain',
        'sleep_problems',
        'appetite_changes',
        'dizziness',
        'rapid_heartbeat',
        'sweating',
        'none'
      ]
    },
    copingMethods: {
      type: [String],
      enum: [
        'exercise',
        'meditation',
        'talking',
        'hobbies',
        'rest',
        'professional_help',
        'time_management',
        'relaxation_techniques',
        'other'
      ]
    },
    note: {
      type: String,
      maxlength: [1000, 'Note cannot be more than 1000 characters']
    },
    location: String,
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days']
      }
    },
    isRecurring: {
      type: Boolean,
      default: false
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

// Indexes for faster querying
stressEntrySchema.index({ user: 1, createdAt: -1 });
stressEntrySchema.index({ stressLevel: 1 });
stressEntrySchema.index({ 'stressors': 1 });

// Virtual for formatted date
stressEntrySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to get stress stats
stressEntrySchema.statics.getStressStats = async function(userId) {
  return this.aggregate([
    {
      $match: { user: mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        avgStressLevel: { $avg: '$stressLevel' },
        maxStressLevel: { $max: '$stressLevel' },
        minStressLevel: { $min: '$stressLevel' },
        commonStressors: { $addToSet: '$stressors' }
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
};

module.exports = mongoose.model('StressEntry', stressEntrySchema);
