const { Configuration, OpenAIApi } = require('openai');
const Affirmation = require('../models/Affirmation');
const MoodEntry = require('../models/MoodEntry');
const StressEntry = require('../models/StressEntry');
const SleepEntry = require('../models/SleepEntry');

// Initialize OpenAI with API key from environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Generate a personalized healing roadmap based on user data
 * @param {String} userId - The ID of the user
 * @returns {Object} Generated roadmap with personalized recommendations
 */
const generateHealingRoadmap = async (userId) => {
  try {
    // Fetch user data
    const [moodEntries, stressEntries, sleepEntries, affirmations] = await Promise.all([
      MoodEntry.find({ user: userId }).sort({ createdAt: -1 }).limit(30).lean(),
      StressEntry.find({ user: userId }).sort({ createdAt: -1 }).limit(30).lean(),
      SleepEntry.find({ user: userId }).sort({ sleepTime: -1 }).limit(14).lean(),
      Affirmation.find({ favorites: userId }).limit(10).lean()
    ]);

    // Calculate basic statistics
    const moodStats = calculateMoodStats(moodEntries);
    const stressStats = calculateStressStats(stressEntries);
    const sleepStats = calculateSleepStats(sleepEntries);

    // Prepare prompt for OpenAI
    const prompt = createPrompt(moodStats, stressStats, sleepStats, affirmations);

    // Generate roadmap using OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a compassionate mental health assistant that creates personalized healing roadmaps. Provide specific, actionable advice based on the user's data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the response
    const roadmap = parseRoadmapResponse(response.data.choices[0].message.content);

    return {
      success: true,
      data: {
        ...roadmap,
        generatedAt: new Date(),
        stats: { moodStats, stressStats, sleepStats }
      }
    };
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return {
      success: false,
      message: 'Failed to generate roadmap',
      error: error.message
    };
  }
};

/**
 * Calculate mood statistics from entries
 */
const calculateMoodStats = (entries) => {
  if (!entries || entries.length === 0) return null;
  
  const moodCounts = {};
  let totalScore = 0;
  
  entries.forEach(entry => {
    // Count mood occurrences
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    totalScore += entry.moodScore || 5; // Default to 5 if not provided
  });
  
  // Find most common mood
  let mostCommonMood = '';
  let maxCount = 0;
  
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      mostCommonMood = mood;
      maxCount = count;
    }
  });
  
  return {
    totalEntries: entries.length,
    averageMoodScore: (totalScore / entries.length).toFixed(1),
    mostCommonMood,
    moodDistribution: moodCounts,
    recentMoods: entries.slice(0, 5).map(e => ({
      date: e.createdAt,
      mood: e.mood,
      score: e.moodScore,
      note: e.note?.substring(0, 100) // Truncate long notes
    }))
  };
};

/**
 * Calculate stress statistics from entries
 */
const calculateStressStats = (entries) => {
  if (!entries || entries.length === 0) return null;
  
  const stressorCounts = {};
  let totalStress = 0;
  let totalInterruptions = 0;
  
  entries.forEach(entry => {
    // Count stressors
    if (entry.stressors && Array.isArray(entry.stressors)) {
      entry.stressors.forEach(stressor => {
        stressorCounts[stressor] = (stressorCounts[stressor] || 0) + 1;
      });
    }
    
    totalStress += entry.stressLevel || 5; // Default to 5 if not provided
    totalInterruptions += entry.interruptions || 0;
  });
  
  // Sort stressors by frequency
  const sortedStressors = Object.entries(stressorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([stressor, count]) => ({ stressor, count }));
  
  return {
    totalEntries: entries.length,
    averageStressLevel: (totalStress / entries.length).toFixed(1),
    averageInterruptions: (totalInterruptions / entries.length).toFixed(1),
    topStressors: sortedStressors.slice(0, 5),
    recentStressors: entries.slice(0, 5).map(e => ({
      date: e.createdAt,
      stressLevel: e.stressLevel,
      mainStressor: e.stressors?.[0] || 'Unknown',
      copingMethods: e.copingMethods || []
    }))
  };
};

/**
 * Calculate sleep statistics from entries
 */
const calculateSleepStats = (entries) => {
  if (!entries || entries.length === 0) return null;
  
  let totalDuration = 0;
  let totalQuality = 0;
  let totalInterruptions = 0;
  
  entries.forEach(entry => {
    const duration = (new Date(entry.wakeTime) - new Date(entry.sleepTime)) / (1000 * 60 * 60); // in hours
    totalDuration += duration;
    totalQuality += entry.quality || 3; // Default to 3 if not provided
    totalInterruptions += entry.interruptions || 0;
  });
  
  return {
    totalEntries: entries.length,
    averageDuration: (totalDuration / entries.length).toFixed(1),
    averageQuality: (totalQuality / entries.length).toFixed(1),
    averageInterruptions: (totalInterruptions / entries.length).toFixed(1),
    recentSleep: entries.slice(0, 5).map(e => ({
      date: e.sleepTime,
      duration: ((new Date(e.wakeTime) - new Date(e.sleepTime)) / (1000 * 60 * 60)).toFixed(1),
      quality: e.quality,
      note: e.note?.substring(0, 100) // Truncate long notes
    }))
  };
};

/**
 * Create a detailed prompt for OpenAI
 */
const createPrompt = (moodStats, stressStats, sleepStats, affirmations) => {
  let prompt = `Create a personalized 4-week healing roadmap based on the following user data:\n\n`;
  
  // Add mood data
  if (moodStats) {
    prompt += `MOOD DATA (last 30 entries):\n`;
    prompt += `- Average mood score: ${moodStats.averageMoodScore}/10\n`;
    prompt += `- Most common mood: ${moodStats.mostCommonMood}\n`;
    prompt += `- Recent moods: ${moodStats.recentMoods.map(m => `${m.mood} (${m.score})`).join(', ')}\n\n`;
  }
  
  // Add stress data
  if (stressStats) {
    prompt += `STRESS DATA (last 30 entries):\n`;
    prompt += `- Average stress level: ${stressStats.averageStressLevel}/10\n`;
    prompt += `- Top stressors: ${stressStats.topStressors.map(s => `${s.stressor} (${s.count}x)`).join(', ')}\n`;
    prompt += `- Average interruptions: ${stressStats.averageInterruptions} per day\n\n`;
  }
  
  // Add sleep data
  if (sleepStats) {
    prompt += `SLEEP DATA (last 14 nights):\n`;
    prompt += `- Average sleep duration: ${sleepStats.averageDuration} hours\n`;
    prompt += `- Average sleep quality: ${sleepStats.averageQuality}/5\n`;
    prompt += `- Average interruptions: ${sleepStats.averageInterruptions} per night\n\n`;
  }
  
  // Add favorite affirmations if any
  if (affirmations && affirmations.length > 0) {
    prompt += `FAVORITE AFFIRMATIONS (user's top ${affirmations.length}):\n`;
    affirmations.forEach((a, i) => {
      prompt += `${i + 1}. "${a.text}"\n`;
    });
    prompt += '\n';
  }
  
  // Add instructions for the AI
  prompt += `\nBased on this data, create a detailed 4-week healing roadmap that includes:\n`;
  prompt += `1. A brief analysis of the user's current state\n`;
  prompt += `2. Weekly themes focused on improving mood, reducing stress, and enhancing sleep\n`;
  prompt += `3. Specific daily practices or exercises\n`;
  prompt += `4. Recommended resources (books, apps, techniques)\n`;
  prompt += `5. Progress tracking suggestions\n\n`;
  prompt += `Format the response as a JSON object with the following structure:\n`;
  prompt += `{\n    "analysis": "Brief analysis of the user's current state",\n    "weeklyThemes": ["Theme 1", "Theme 2", ...],\n    "weeklyGoals": ["Goal 1", "Goal 2", ...],\n    "dailyPractices": ["Practice 1", "Practice 2", ...],\n    "resources": [{"type": "book", "title": "...", "author": "...", "why": "..."}, ...],\n    "affirmations": ["Custom affirmation 1", "Custom affirmation 2", ...]\n  }`;
  
  return prompt;
};

/**
 * Parse the AI response into a structured format
 */
const parseRoadmapResponse = (response) => {
  try {
    // Try to parse as JSON first
    const startIdx = response.indexOf('{');
    const endIdx = response.lastIndexOf('}') + 1;
    const jsonStr = response.substring(startIdx, endIdx);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing roadmap response:', error);
    // Fallback to returning the raw response
    return {
      analysis: 'Unable to parse AI response',
      weeklyThemes: [],
      weeklyGoals: [],
      dailyPractices: [],
      resources: [],
      affirmations: [],
      rawResponse: response
    };
  }
};

module.exports = {
  generateHealingRoadmap,
  calculateMoodStats,
  calculateStressStats,
  calculateSleepStats
};
