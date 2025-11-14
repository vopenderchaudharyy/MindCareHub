const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mood: {
      type: String,
      required: [true, 'Please select a mood'],
      enum: [
        'happy',
        'sad',
        'angry',
        'anxious',
        'stressed',
        'calm',
        'tired',
        'energetic',
        'neutral',
        'excited',
        'grateful',
        'overwhelmed',
        'frustrated',
        'content',
        'proud',
        'hopeful',
        'lonely',
        'motivated',
        'bored',
        'other'
      ]
    },
    moodScore: {
      type: Number,
      required: [true, 'Please rate your mood from 1-10'],
      min: 1,
      max: 10
    },
    note: {
      type: String,
      maxlength: [1000, 'Note cannot be more than 1000 characters']
    },
    activities: {
      type: [String],
      enum: [
        'exercise',
        'work',
        'social',
        'family',
        'hobby',
        'rest',
        'meditation',
        'reading',
        'watching_tv',
        'gaming',
        'cooking',
        'cleaning',
        'shopping',
        'commuting',
        'learning',
        'other'
      ]
    },
    triggers: {
      type: [String],
      enum: [
        'work',
        'relationships',
        'health',
        'finances',
        'news',
        'social_media',
        'lack_of_sleep',
        'diet',
        'weather',
        'no_specific_trigger',
        'other'
      ]
    },
    location: {
      type: String
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    tags: [String]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster querying
moodEntrySchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted date
moodEntrySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to get mood stats
moodEntrySchema.statics.getMoodStats = async function(userId) {
  return this.aggregate([
    {
      $match: { user: mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: '$mood',
        count: { $sum: 1 },
        avgMoodScore: { $avg: '$moodScore' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
