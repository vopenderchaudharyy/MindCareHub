import { useState, useEffect } from 'react';
import { getMoodEntries, getStressEntries, getSleepEntries } from '../../services';
import AnalyticsChart from './AnalyticsChart';
import { Activity, Brain, Moon, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    mood: [],
    stress: [],
    sleep: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moodRes, stressRes, sleepRes] = await Promise.all([
        getMoodEntries({ limit: 7 }),
        getStressEntries({ limit: 7 }),
        getSleepEntries({ limit: 7 })
      ]);

      setStats({
        mood: moodRes.data,
        stress: stressRes.data,
        sleep: sleepRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (data, key) => {
    if (!data.length) return 0;
    const sum = data.reduce((acc, item) => acc + item[key], 0);
    return (sum / data.length).toFixed(1);
  };

  const statCards = [
    {
      title: 'Average Mood',
      value: calculateAverage(stats.mood, 'moodScore'),
      max: 10,
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Stress Level',
      value: calculateAverage(stats.stress, 'stressLevel'),
      max: 10,
      icon: Brain,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      title: 'Sleep Hours',
      value: calculateAverage(stats.sleep, 'sleepDuration'),
      max: 8,
      icon: Moon,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                    <span className="text-lg text-gray-500">/{stat.max}</span>
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${stat.color}-600 h-2 rounded-full`}
                    style={{ width: `${(stat.value / stat.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trend</h3>
          <AnalyticsChart data={stats.mood} dataKey="moodScore" color="#667eea" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Pattern</h3>
          <AnalyticsChart data={stats.stress} dataKey="stressLevel" color="#ef4444" />
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-start space-x-4">
          <TrendingUp className="h-8 w-8 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Wellness Insights</h3>
            <ul className="space-y-2 text-sm">
              <li>• Track your mood daily to identify patterns</li>
              <li>• Aim for 7-8 hours of sleep each night</li>
              <li>• Practice stress management techniques regularly</li>
              <li>• Stay consistent with your self-care routine</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
