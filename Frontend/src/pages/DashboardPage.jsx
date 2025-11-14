import { useState } from 'react';
import Dashboard from '../components/Dashboard/Dashboard';
import MoodTracker from '../components/Dashboard/MoodTracker';
import StressTracker from '../components/Dashboard/StressTracker';
import SleepTracker from '../components/Dashboard/SleepTracker';
import DailyAffirmation from '../components/Affirmations/DailyAffirmation';
import { Activity, Brain, Moon, BarChart3 } from 'lucide-react';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'mood', label: 'Mood', icon: Activity },
    { id: 'stress', label: 'Stress', icon: Brain },
    { id: 'sleep', label: 'Sleep', icon: Moon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Daily Affirmation Banner */}
        <DailyAffirmation />

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && <Dashboard />}
          {activeTab === 'mood' && <MoodTracker />}
          {activeTab === 'stress' && <StressTracker />}
          {activeTab === 'sleep' && <SleepTracker />}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
