import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { getMoodEntries, getSleepEntries, getStressEntries } from '../services/api';
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

  const stats = [
    { name: 'Current Streak', value: '7 days', change: '+2', changeType: 'positive' },
    { name: 'Mood Average', value: '4.2/5', change: '+0.5', changeType: 'positive' },
    { name: 'Stress Level', value: 'Moderate', change: '-10%', changeType: 'positive' },
    { name: 'Sleep Quality', value: '6.8/10', change: '+0.3', changeType: 'positive' },
  ];

  const routeMap = {
    overview: '/dashboard',
    mood: '/mood',
    stress: '/stress',
    sleep: '/sleep',
    analytics: '/analytics'
  };

  const handleExportData = async () => {
    try {
      const [moodRes, sleepRes, stressRes] = await Promise.all([
        getMoodEntries({ limit: 1000 }),
        getSleepEntries({ limit: 1000 }),
        getStressEntries({ limit: 1000 })
      ]);
      const payload = {
        exportedAt: new Date().toISOString(),
        mood: moodRes.data?.data || [],
        sleep: sleepRes.data?.data || [],
        stress: stressRes.data?.data || []
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindcare_export_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    }
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
            onClick={handleExportData}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Export Data
          </button>
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
                  setActiveTab(item.path);
                  navigate(routeMap[item.path] || '/dashboard');
                }}
                className={`${
                  activeTab === item.path
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
