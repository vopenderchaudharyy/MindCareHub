import { useState, useEffect } from 'react';
import { addMoodEntry, getMoodEntries } from '../../services/api';
import { Smile, Plus } from 'lucide-react';
import { format } from 'date-fns';

const MoodTracker = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mood: '',
    moodScore: 5,
    note: '',
    activities: [],
    triggers: []
  });
  const [loading, setLoading] = useState(false);

  const moodOptions = [
    { value: 'very_happy', label: '😄 Very Happy', color: 'bg-green-500' },
    { value: 'happy', label: '😊 Happy', color: 'bg-green-400' },
    { value: 'neutral', label: '😐 Neutral', color: 'bg-yellow-400' },
    { value: 'sad', label: '😔 Sad', color: 'bg-orange-400' },
    { value: 'very_sad', label: '😢 Very Sad', color: 'bg-red-400' },
    { value: 'anxious', label: '😰 Anxious', color: 'bg-purple-400' },
    { value: 'angry', label: '😠 Angry', color: 'bg-red-600' }
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await getMoodEntries({ limit: 10 });
      setEntries(data);
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addMoodEntry(formData);
      setShowForm(false);
      setFormData({
        mood: '',
        moodScore: 5,
        note: '',
        activities: [],
        triggers: []
      });
      fetchEntries();
    } catch (error) {
      console.error('Error creating mood entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const option = moodOptions.find(m => m.value === mood);
    return option ? option.label : mood;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mood Tracker</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
          <span>Log Mood</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: option.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.mood === option.value
                        ? `${option.color} border-gray-900 text-white` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood Intensity (1-10): {formData.moodScore}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.moodScore}
                onChange={(e) => setFormData({ ...formData, moodScore: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What's on your mind?"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!formData.mood || loading}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No mood entries yet. Start tracking!</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{getMoodEmoji(entry.mood)}</div>
                  <div>
                    <p className="font-medium text-gray-900">Score: {entry.moodScore}/10</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(entry.date), 'PPp')}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
