import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl text-gray-500">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {currentUser.name || 'User'}
          </h2>
          <p className="text-gray-600">{currentUser.email}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700">Account Settings</h3>
            <div className="mt-2 space-y-2">
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                Edit Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                Notification Settings
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Preferences</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-gray-600">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
