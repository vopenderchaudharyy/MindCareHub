import React, { useEffect, useState } from 'react';
import AnalyticsChart from '../components/Dashboard/AnalyticsChart';
import { getMoodEntries, getSleepEntries, getStressEntries } from '../services/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moodSeries, setMoodSeries] = useState([]);
  const [stressSeries, setStressSeries] = useState([]);
  const [sleepSeries, setSleepSeries] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [moodRes, stressRes, sleepRes] = await Promise.all([
          getMoodEntries({ limit: 10 }),
          getStressEntries({ limit: 10 }),
          getSleepEntries({ limit: 10 })
        ]);

        const moods = Array.isArray(moodRes.data?.data) ? moodRes.data.data : [];
        const stresses = Array.isArray(stressRes.data?.data) ? stressRes.data.data : [];
        const sleeps = Array.isArray(sleepRes.data?.data) ? sleepRes.data.data : [];

        setMoodSeries(
          moods.map(m => ({ date: m.createdAt || m.date, moodScore: m.moodScore }))
        );

        setStressSeries(
          stresses.map(s => ({ date: s.createdAt || s.date, stressLevel: s.stressLevel }))
        );

        setSleepSeries(
          sleeps.map(s => {
            const start = new Date(s.sleepTime);
            const end = new Date(s.wakeTime);
            const durationHrs = Math.max(0, (end - start) / (1000 * 60 * 60));
            return { date: s.sleepTime || s.createdAt, duration: Number(durationHrs.toFixed(2)) };
          })
        );
      } catch (err) {
        console.error('Analytics load failed:', err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className="rounded-lg bg-white p-6 shadow">Loading analytics...</div>;
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 p-6 text-red-700 shadow">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trend</h3>
        {moodSeries.length === 0 ? (
          <p className="text-gray-500">No mood data yet.</p>
        ) : (
          <AnalyticsChart data={moodSeries} dataKey="moodScore" color="#8b5cf6" />
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Trend</h3>
        {stressSeries.length === 0 ? (
          <p className="text-gray-500">No stress data yet.</p>
        ) : (
          <AnalyticsChart data={stressSeries} dataKey="stressLevel" color="#f59e0b" />
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Duration</h3>
        {sleepSeries.length === 0 ? (
          <p className="text-gray-500">No sleep data yet.</p>
        ) : (
          <AnalyticsChart data={sleepSeries} dataKey="duration" color="#3b82f6" />
        )}
      </div>
    </div>
  );
};

export default Analytics;
