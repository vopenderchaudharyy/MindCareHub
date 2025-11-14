import { useState, useEffect } from 'react';
import { createSleepEntry, getSleepEntries } from '../../services/api';
import { Moon, Plus, Clock, Sunrise, Sunset } from 'lucide-react';
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

const SleepTracker = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sleepTime: '',
    wakeTime: '',
    quality: 3,
    interruptions: 0,
    note: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await getSleepEntries({ limit: 7 });
      setEntries(data);
    } catch (error) {
      console.error('Error fetching sleep entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSleepEntry(formData);
      setShowForm(false);
      setFormData({
        sleepTime: '',
        wakeTime: '',
        quality: 3,
        interruptions: 0,
        note: ''
      });
      fetchEntries();
    } catch (error) {
      console.error('Error creating sleep entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSleepDuration = (sleepTime, wakeTime) => {
    if (!sleepTime || !wakeTime) return null;
    
    const sleep = new Date(sleepTime);
    const wake = new Date(wakeTime);
    
    // Handle overnight sleep (if wake time is next day)
    if (wake < sleep) {
      wake.setDate(wake.getDate() + 1);
    }
    
    const hours = differenceInHours(wake, sleep);
    const minutes = differenceInMinutes(wake, sleep) % 60;
    
    return { hours, minutes };
  };

  const getQualityColor = (quality) => {
    if (quality <= 2) return 'bg-red-500';
    if (quality <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getQualityLabel = (quality) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[quality] || '';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return format(parseISO(dateString), 'h:mm a');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sleep Tracker</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Log Sleep</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.sleepTime}
                  onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wake Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.wakeTime}
                  onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {formData.sleepTime && formData.wakeTime && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Sleep Duration: {calculateSleepDuration(formData.sleepTime, formData.wakeTime)?.hours}h 
                  {calculateSleepDuration(formData.sleepTime, formData.wakeTime)?.minutes}m
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Quality: {getQualityLabel(formData.quality)}
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Poor</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">Excellent</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Interruptions: {formData.interruptions}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.interruptions}
                onChange={(e) => setFormData({ ...formData, interruptions: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about your sleep..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep History</h3>
        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sleep entries yet. Start tracking your sleep!</p>
          ) : (
            entries.map((entry) => {
              const duration = calculateSleepDuration(entry.sleepTime, entry.wakeTime);
              return (
                <div
                  key={entry._id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Moon className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{format(parseISO(entry.sleepTime), 'EEEE, MMM d')}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Sunset className="h-4 w-4 text-orange-500 mr-2" />
                          <span className="text-sm">{format(parseISO(entry.sleepTime), 'h:mm a')}</span>
                        </div>
                        <div className="flex items-center">
                          <Sunrise className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm">{format(parseISO(entry.wakeTime), 'h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityColor(entry.quality)} text-white`}>
                        {getQualityLabel(entry.quality)}
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        {duration?.hours}h {duration?.minutes}m
                      </p>
                    </div>
                  </div>
                  {entry.interruptions > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Interruptions:</span> {entry.interruptions}
                    </div>
                  )}
                  {entry.note && (
                    <p className="text-sm text-gray-600 mt-2">
                      {entry.note.length > 100 ? `${entry.note.substring(0, 100)}...` : entry.note}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;
