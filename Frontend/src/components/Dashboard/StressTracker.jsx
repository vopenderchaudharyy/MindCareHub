import { useState, useEffect } from 'react';
import { createStressEntry, getStressEntries } from '../../services/api';
import { AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';

const StressTracker = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stressLevel: 5,
    stressors: [],
    physicalSymptoms: [],
    copingMethods: [],
    note: ''
  });
  const [loading, setLoading] = useState(false);

  const stressorOptions = ['work', 'relationships', 'health', 'financial', 'academic', 'family', 'other'];
  const symptomOptions = ['headache', 'fatigue', 'muscle_tension', 'stomach_issues', 'chest_pain', 'sleep_problems', 'none'];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await getStressEntries({ limit: 10 });
      setEntries(data);
    } catch (error) {
      console.error('Error fetching stress entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createStressEntry(formData);
      setShowForm(false);
      setFormData({
        stressLevel: 5,
        stressors: [],
        physicalSymptoms: [],
        copingMethods: [],
        note: ''
      });
      fetchEntries();
    } catch (error) {
      console.error('Error creating stress entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  const getStressColor = (level) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-yellow-500';
    if (level <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Stress Tracker</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
          <span>Log Stress</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stress Level (1-10): {formData.stressLevel}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stressLevel}
                onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stressors (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stressorOptions.map((stressor) => (
                  <button
                    key={stressor}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        stressors: toggleArrayItem(formData.stressors, stressor)
                      })
                    }
                    className={`p-2 rounded-lg border text-sm capitalize ${
                      formData.stressors.includes(stressor)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {stressor}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physical Symptoms
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {symptomOptions.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        physicalSymptoms: toggleArrayItem(formData.physicalSymptoms, symptom)
                      })
                    }
                    className={`p-2 rounded-lg border text-sm capitalize ${
                      formData.physicalSymptoms.includes(symptom)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {symptom.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Additional details..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
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
            <p className="text-gray-500 text-center py-8">No stress entries yet. Start tracking!</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full ${getStressColor(entry.stressLevel)} flex items-center justify-center text-white font-bold`}>
                      {entry.stressLevel}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Stress Level: {entry.stressLevel}/10</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(entry.date), 'PPp')}
                      </p>
                    </div>
                  </div>
                </div>
                {entry.stressors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Stressors:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.stressors.map((s) => (
                        <span key={s} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.note && (
                  <p className="text-sm text-gray-600 mt-2">{entry.note}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StressTracker;
