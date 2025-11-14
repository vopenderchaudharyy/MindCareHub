const mongoose = require('mongoose');

const affirmationSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Please provide affirmation text'],
      maxlength: [500, 'Affirmation cannot be more than 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: [
        'self_love',
        'confidence',
        'motivation',
        'gratitude',
        'anxiety',
        'stress',
        'positivity',
        'general',
        'other'
      ],
      default: 'general'
    },
    isCustom: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return this.isCustom;
      }
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    tags: [String],
    language: {
      type: String,
      default: 'en',
      maxlength: 10
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    favoriteCount: {
      type: Number,
      default: 0
    },
    moodAssociation: {
      type: [String],
      enum: [
        'happy',
        'sad',
        'anxious',
        'stressed',
        'angry',
        'tired',
        'neutral',
        'excited',
        'grateful',
        'overwhelmed',
        'all'
      ],
      default: ['all']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      enum: ['system', 'user', 'community'],
      default: 'system'
    },
    metadata: {
      lastUsed: Date,
      usageCount: {
        type: Number,
        default: 0
      },
      effectiveness: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster querying
affirmationSchema.index({ category: 1, isActive: 1 });
affirmationSchema.index({ text: 'text' });
affirmationSchema.index({ tags: 1 });
affirmationSchema.index({ 'moodAssociation': 1 });

// Static method to get random affirmation
affirmationSchema.statics.getRandomAffirmation = async function(filters = {}) {
  const defaultFilters = {
    isActive: true,
    isPublic: true,
    ...filters
  };

  // If mood is provided, filter by mood association
  if (filters.mood) {
    defaultFilters.$or = [
      { moodAssociation: 'all' },
      { moodAssociation: filters.mood }
    ];
    delete defaultFilters.mood;
  }

  const count = await this.countDocuments(defaultFilters);
  const random = Math.floor(Math.random() * count);
  
  const [affirmation] = await this.find(defaultFilters)
    .skip(random)
    .limit(1);

  return affirmation;
};

// Method to increment usage count
affirmationSchema.methods.incrementUsage = async function() {
  this.metadata.usageCount += 1;
  this.metadata.lastUsed = new Date();
  return this.save();
};

// Method to update effectiveness
affirmationSchema.methods.updateEffectiveness = async function(rating) {
  // Simple moving average for effectiveness
  const currentEffectiveness = this.metadata.effectiveness || 0;
  const totalRatings = this.metadata.ratingCount || 0;
  
  this.metadata.effectiveness = ((currentEffectiveness * totalRatings) + rating) / (totalRatings + 1);
  this.metadata.ratingCount = (this.metadata.ratingCount || 0) + 1;
  
  return this.save();
};

// Pre-save hook to update favorite count
affirmationSchema.pre('save', function(next) {
  if (this.isModified('favorites')) {
    this.favoriteCount = this.favorites.length;
  }
  next();
});

module.exports = mongoose.model('Affirmation', affirmationSchema);
