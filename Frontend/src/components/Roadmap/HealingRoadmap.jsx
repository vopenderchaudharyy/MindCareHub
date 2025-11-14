import React, { useState } from 'react';

const HealingRoadmap = () => {
  const [activeTab, setActiveTab] = useState('current');
  
  // Sample roadmap data
  const roadmapData = {
    current: [
      { id: 1, title: 'Daily Meditation', progress: 75, daysLeft: 3 },
      { id: 2, title: 'Journaling', progress: 50, daysLeft: 5 },
    ],
    upcoming: [
      { id: 3, title: 'Breathing Exercises', progress: 0, startsIn: 2 },
      { id: 4, title: 'Gratitude Practice', progress: 0, startsIn: 4 },
    ],
    completed: [
      { id: 5, title: 'Morning Stretching', progress: 100, completedOn: '2023-10-28' },
      { id: 6, title: 'Sleep Schedule', progress: 100, completedOn: '2023-10-25' },
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Healing Journey</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          {['current', 'upcoming', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Roadmap Items */}
      <div className="space-y-4">
        {roadmapData[activeTab].map((item) => (
          <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <span className="text-sm text-gray-500">
                {activeTab === 'current' && `${item.daysLeft} days left`}
                {activeTab === 'upcoming' && `Starts in ${item.startsIn} days`}
                {activeTab === 'completed' && `Completed on ${item.completedOn}`}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
            
            {activeTab === 'current' && (
              <div className="mt-3 flex justify-end">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Update Progress
                </button>
              </div>
            )}
          </div>
        ))}
        
        {roadmapData[activeTab].length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No {activeTab} activities. Check back later!
          </p>
        )}
      </div>
    </div>
  );
};

export default HealingRoadmap;
