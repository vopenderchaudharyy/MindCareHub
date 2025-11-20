import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addSleepEntry, getSleepEntries } from '../../services/api';
import { Moon, Plus, Clock, Sunrise, Sunset, ArrowLeft } from 'lucide-react';
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

const SleepTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().slice(0, 10);
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sleepDate: todayStr,
    sleepTime: '',
    wakeTime: '',
    sleepMeridiem: 'PM',
    wakeMeridiem: 'AM',
    quality: 3,
    interruptions: 0,
    note: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (location.state?.openForm) {
      setShowForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    try {
      const autoOpen = localStorage.getItem('mch_auto_open_forms') === 'true';
      if (autoOpen) setShowForm(true);
    } catch {}
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await getSleepEntries({ limit: 7 });
      setEntries(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error('Error fetching sleep entries:', error);
      setEntries([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [sh, sm] = (formData.sleepTime || '').split(':').map(Number);
      const [wh, wm] = (formData.wakeTime || '').split(':').map(Number);
      const base = new Date(formData.sleepDate || todayStr);
      const sleepDT = new Date(base);
      // convert to 24h using meridiem
      const sh24 = (() => {
        if (isNaN(sh)) return 0;
        if (formData.sleepMeridiem === 'AM') return sh === 12 ? 0 : sh;
        return sh === 12 ? 12 : sh + 12;
      })();
      sleepDT.setHours(sh24, isNaN(sm) ? 0 : sm, 0, 0);
      const wakeDT = new Date(base);
      const wh24 = (() => {
        if (isNaN(wh)) return 0;
        if (formData.wakeMeridiem === 'AM') return wh === 12 ? 0 : wh;
        return wh === 12 ? 12 : wh + 12;
      })();
      wakeDT.setHours(wh24, isNaN(wm) ? 0 : wm, 0, 0);
      if (wakeDT <= sleepDT) {
        wakeDT.setDate(wakeDT.getDate() + 1);
      }

      const payload = {
        sleepTime: sleepDT.toISOString(),
        wakeTime: wakeDT.toISOString(),
        quality: formData.quality,
        interruptions: formData.interruptions,
        note: formData.note
      };

      await addSleepEntry(payload);
      setShowForm(false);
      setFormData({
        sleepDate: todayStr,
        sleepTime: '',
        wakeTime: '',
        sleepMeridiem: 'PM',
        wakeMeridiem: 'AM',
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

  const calculateSleepDuration = (sleepTime, wakeTime, dateStr, sleepMeridiem, wakeMeridiem) => {
    if (!sleepTime || !wakeTime) return null;

    if ((typeof sleepTime === 'string' && sleepTime.includes('T')) || (typeof wakeTime === 'string' && wakeTime.includes('T'))){
      try {
        const s = parseISO(sleepTime);
        const w = parseISO(wakeTime);
        let wake = w;
        if (wake <= s) {
          wake = new Date(wake.getTime() + 24 * 60 * 60 * 1000);
        }
        const totalMin = Math.max(0, differenceInMinutes(wake, s));
        return { hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
      } catch (e) {}
    }

    const base = dateStr || todayStr;
    const [sh, sm] = String(sleepTime).split(':').map(Number);
    const [wh, wm] = String(wakeTime).split(':').map(Number);
    const sh24 = sleepMeridiem === 'AM' ? (sh === 12 ? 0 : sh) : (sh === 12 ? 12 : sh + 12);
    const wh24 = wakeMeridiem === 'AM' ? (wh === 12 ? 0 : wh) : (wh === 12 ? 12 : wh + 12);
    const sleep = new Date(`${base}T00:00:00`);
    sleep.setHours(isNaN(sh24) ? 0 : sh24, isNaN(sm) ? 0 : sm, 0, 0);
    const wake = new Date(`${base}T00:00:00`);
    wake.setHours(isNaN(wh24) ? 0 : wh24, isNaN(wm) ? 0 : wm, 0, 0);
    if (wake < sleep) {
      wake.setDate(wake.getDate() + 1);
    }
    const totalMin = Math.max(0, differenceInMinutes(wake, sleep));
    return { hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
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
    const tf = (typeof window !== 'undefined' && localStorage.getItem('mch_time_format')) || '12';
    return tf === '24' ? format(parseISO(dateString), 'HH:mm') : format(parseISO(dateString), 'h:mm a');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Sleep Tracker</h2>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.sleepDate}
                  onChange={(e) => setFormData({ ...formData, sleepDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Time
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={formData.sleepTime}
                    onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={formData.sleepMeridiem}
                    onChange={(e) => setFormData({ ...formData, sleepMeridiem: e.target.value })}
                    className="h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wake Time
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={formData.wakeTime}
                    onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={formData.wakeMeridiem}
                    onChange={(e) => setFormData({ ...formData, wakeMeridiem: e.target.value })}
                    className="h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            {formData.sleepTime && formData.wakeTime && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Sleep Duration: {calculateSleepDuration(formData.sleepTime, formData.wakeTime, formData.sleepDate, formData.sleepMeridiem, formData.wakeMeridiem)?.hours}h 
                  {calculateSleepDuration(formData.sleepTime, formData.wakeTime, formData.sleepDate, formData.sleepMeridiem, formData.wakeMeridiem)?.minutes}m
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
