import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { getMoodEntries, getSleepEntries, getStressEntries, getMoodStats, getSleepStats } from '../services/api';
import AnalyticsChart from '../components/Dashboard/AnalyticsChart';
import { 
  LayoutDashboard, 
  Brain, 
  HeartPulse, 
  Moon, 
  BarChart2,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeAnalytics, setActiveAnalytics] = useState('all');

  const navigation = [
    { 
      name: 'Overview', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      path: 'overview' 
    },
    { 
      name: 'Mood Tracker', 
      icon: <Brain className="w-5 h-5" />, 
      path: 'mood' 
    },
    { 
      name: 'Stress Tracker', 
      icon: <HeartPulse className="w-5 h-5" />, 
      path: 'stress' 
    },
    { 
      name: 'Sleep Tracker', 
      icon: <Moon className="w-5 h-5" />, 
      path: 'sleep' 
    },
    { 
      name: 'Analytics', 
      icon: <BarChart2 className="w-5 h-5" />, 
      path: 'analytics' 
    },
  ];

  const [statsData, setStatsData] = useState({
    streakDays: 0,
    moodAvg: 0,
    stressAvg: 0,
    sleepQualityAvg: 0,
  });

  const [moodSeries, setMoodSeries] = useState([]);
  const [stressSeries, setStressSeries] = useState([]);
  const [sleepSeries, setSleepSeries] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  useEffect(() => {
    try {
      const pref = localStorage.getItem('mch_dashboard_default') || 'overview';
      setActiveTab(pref);
      if (pref === 'analytics') setActiveAnalytics('all');
    } catch {}
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [moodStatsRes, sleepStatsRes, stressRes, moodEntriesRes] = await Promise.all([
          getMoodStats(),
          getSleepStats({ days: 7 }),
          getStressEntries({ limit: 100 }),
          getMoodEntries({ limit: 30 })
        ]);

        const moodAvg = Number(moodStatsRes?.data?.avgMoodScore || 0);
        const sleepQualityAvg = Number(sleepStatsRes?.data?.data?.stats?.avgQuality || 0);
        const stressList = Array.isArray(stressRes?.data?.data) ? stressRes.data.data : [];
        const stressAvg = stressList.length
          ? stressList.reduce((a, b) => a + (Number(b.stressLevel) || 0), 0) / stressList.length
          : 0;

        const entries = Array.isArray(moodEntriesRes?.data?.data) ? moodEntriesRes.data.data : [];
        const daysSet = new Set(entries.map(e => new Date(e.createdAt || e.date).toDateString()));
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          if (daysSet.has(d.toDateString())) streak += 1; else break;
        }

        setStatsData({
          streakDays: streak,
          moodAvg,
          stressAvg,
          sleepQualityAvg,
        });
      } catch (e) {
        setStatsData({ streakDays: 0, moodAvg: 0, stressAvg: 0, sleepQualityAvg: 0 });
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const [moodRes, stressRes, sleepRes] = await Promise.all([
          getMoodEntries({ limit: 10 }),
          getStressEntries({ limit: 10 }),
          getSleepEntries({ limit: 10 })
        ]);
        const moods = Array.isArray(moodRes.data?.data) ? moodRes.data.data : [];
        const stresses = Array.isArray(stressRes.data?.data) ? stressRes.data.data : [];
        const sleeps = Array.isArray(sleepRes.data?.data) ? sleepRes.data.data : [];

        setMoodSeries(moods.map(m => ({ date: m.createdAt || m.date, moodScore: m.moodScore })));
        setStressSeries(stresses.map(s => ({ date: s.createdAt || s.date, stressLevel: s.stressLevel })));
        setSleepSeries(sleeps.map(s => {
          const start = new Date(s.sleepTime);
          const end = new Date(s.wakeTime);
          const durationHrs = Math.max(0, (end - start) / (1000 * 60 * 60));
          return { date: s.sleepTime || s.createdAt, duration: Number(durationHrs.toFixed(2)) };
        }));
      } catch (err) {
        setAnalyticsError('Failed to load analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stressLabel = statsData.stressAvg <= 3 ? 'Low' : statsData.stressAvg <= 7 ? 'Moderate' : 'High';
  const stats = [
    { name: 'Current Streak', value: `${statsData.streakDays} day${statsData.streakDays === 1 ? '' : 's'}`, change: '', changeType: 'positive' },
    { name: 'Mood Average', value: `${statsData.moodAvg.toFixed(1)}/10`, change: '', changeType: 'positive' },
    { name: 'Stress Level', value: `${stressLabel} (${statsData.stressAvg.toFixed(1)}/10)`, change: '', changeType: 'positive' },
    { name: 'Sleep Quality', value: `${statsData.sleepQualityAvg.toFixed(1)}/5`, change: '', changeType: 'positive' },
  ];

  const routeMap = {
    overview: '/dashboard',
    mood: '/mood',
    stress: '/stress',
    sleep: '/sleep',
    analytics: '/analytics'
  };

  const handleAddEntry = () => {
    navigate('/mood', { state: { openForm: true } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your mental well-being journey.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            onClick={handleAddEntry}
            className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stat.value}
              <span className={`ml-2 text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </dd>
          </div>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Sidebar navigation */}
        <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  if (item.path === 'overview') {
                    setActiveTab('overview');
                  } else if (item.path === 'analytics') {
                    setActiveTab('analytics');
                    setActiveAnalytics('all');
                  } else {
                    setActiveTab('analytics');
                    setActiveAnalytics(item.path);
                  }
                }}
                className={`${
                  (activeTab === item.path) ||
                  (activeTab === 'analytics' && (
                    (item.path === activeAnalytics) ||
                    (item.path === 'analytics' && activeAnalytics === 'all')
                  ))
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                } group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium`}
              >
                <span className="flex items-center">
                  <span className="mr-3 text-gray-400 group-hover:text-gray-500">
                    {item.icon}
                  </span>
                  {item.name}
                </span>
                <ChevronRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          <Outlet />
          
          {/* Default content when no sub-route is active */}
          {!activeTab || activeTab === 'overview' ? (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">Welcome to your dashboard</h3>
              <p className="mt-2 text-sm text-gray-600">
                Select a category from the sidebar to view or add entries.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900">Recent Activity</h4>
                  <p className="mt-2 text-sm text-gray-600">No recent activity to show.</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900">Quick Actions</h4>
                  <div className="mt-2 space-y-2">
                    <button onClick={() => navigate('/mood', { state: { openForm: true } })} className="block w-full text-left text-sm text-indigo-600 hover:text-indigo-800">
                      Add today's mood
                    </button>
                    <button onClick={() => navigate('/stress', { state: { openForm: true } })} className="block w-full text-left text-sm text-indigo-600 hover:text-indigo-800">
                      Log stress level
                    </button>
                    <button onClick={() => navigate('/sleep', { state: { openForm: true } })} className="block w-full text-left text-sm text-indigo-600 hover:text-indigo-800">
                      Record sleep
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'analytics' ? (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="rounded-lg bg-white p-6 shadow">Loading analytics...</div>
              ) : analyticsError ? (
                <div className="rounded-lg bg-red-50 p-6 text-red-700 shadow">{analyticsError}</div>
              ) : (
                <>
                  {(activeAnalytics === 'mood' || activeAnalytics === 'all') && (
                    <div className="rounded-lg bg-white p-6 shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Mood Trend</h3>
                      {moodSeries.length === 0 ? (
                        <p className="text-gray-500">No mood data yet.</p>
                      ) : (
                        <AnalyticsChart data={moodSeries} dataKey="moodScore" color="#8b5cf6" />
                      )}
                    </div>
                  )}

                  {(activeAnalytics === 'stress' || activeAnalytics === 'all') && (
                    <div className="rounded-lg bg-white p-6 shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Stress Trend</h3>
                      {stressSeries.length === 0 ? (
                        <p className="text-gray-500">No stress data yet.</p>
                      ) : (
                        <AnalyticsChart data={stressSeries} dataKey="stressLevel" color="#f59e0b" />
                      )}
                    </div>
                  )}

                  {(activeAnalytics === 'sleep' || activeAnalytics === 'all') && (
                    <div className="rounded-lg bg-white p-6 shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Sleep Duration</h3>
                      {sleepSeries.length === 0 ? (
                        <p className="text-gray-500">No sleep data yet.</p>
                      ) : (
                        <AnalyticsChart data={sleepSeries} dataKey="duration" color="#3b82f6" />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
