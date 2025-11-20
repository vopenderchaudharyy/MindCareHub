import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState('system');
  const [reminders, setReminders] = useState({ mood: false, sleep: false, stress: false, affirmations: false });
  const [defaultDash, setDefaultDash] = useState('overview');
  const [autoOpenForms, setAutoOpenForms] = useState(false);
  const [timeFormat, setTimeFormat] = useState('12');
  const themeOptions = useMemo(() => ([
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]), []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('mch_theme') || 'system';
      setTheme(savedTheme);
      const rawRem = localStorage.getItem('mch_reminders') || '{}';
      const parsed = JSON.parse(rawRem);
      setReminders({ mood: false, sleep: false, stress: false, affirmations: false, ...parsed });
      const dashPref = localStorage.getItem('mch_dashboard_default') || 'overview';
      setDefaultDash(dashPref);
      const autoOpen = localStorage.getItem('mch_auto_open_forms') === 'true';
      setAutoOpenForms(autoOpen);
      const tf = localStorage.getItem('mch_time_format') || '12';
      setTimeFormat(tf);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('mch_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }, [theme]);

  const toggleReminder = (key) => {
    const updated = { ...reminders, [key]: !reminders[key] };
    setReminders(updated);
    localStorage.setItem('mch_reminders', JSON.stringify(updated));
  };

  const saveDefaultDash = (val) => {
    setDefaultDash(val);
    localStorage.setItem('mch_dashboard_default', val);
  };

  const saveAutoOpen = (checked) => {
    setAutoOpenForms(checked);
    localStorage.setItem('mch_auto_open_forms', String(checked));
  };

  const saveTimeFormat = (val) => {
    setTimeFormat(val);
    localStorage.setItem('mch_time_format', val);
  };

  const resetPreferences = () => {
    try {
      localStorage.removeItem('mch_theme');
      localStorage.removeItem('mch_reminders');
      localStorage.removeItem('mch_dashboard_default');
      localStorage.removeItem('mch_auto_open_forms');
      localStorage.removeItem('mch_time_format');
      setTheme('system');
      setReminders({ mood: false, sleep: false, stress: false, affirmations: false });
      setDefaultDash('overview');
      setAutoOpenForms(false);
      setTimeFormat('12');
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Name</div>
            <div className="text-gray-900 font-medium">{currentUser?.name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="text-gray-900 font-medium">{currentUser?.email || '—'}</div>
          </div>
        </div>
        <div className="mt-4">
          <a href="/profile" className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Edit Profile</a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-md border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
              {themeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Reminders</div>
            <div className="space-y-3">
              {Object.keys(reminders).map((k) => (
                <label key={k} className="flex items-center justify-between p-3 rounded-md border border-gray-200">
                  <span className="capitalize text-gray-700">{k}</span>
                  <input type="checkbox" checked={reminders[k]} onChange={() => toggleReminder(k)} className="h-4 w-4 text-indigo-600" />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900">App Behavior</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Default Dashboard View</label>
            <select value={defaultDash} onChange={(e) => saveDefaultDash(e.target.value)} className="w-full rounded-md border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
              <option value="overview">Overview</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Auto-open Tracker Forms</label>
            <label className="flex items-center justify-between p-3 rounded-md border border-gray-200">
              <span className="text-gray-700">Open form when visiting trackers</span>
              <input type="checkbox" checked={autoOpenForms} onChange={(e) => saveAutoOpen(e.target.checked)} className="h-4 w-4 text-indigo-600" />
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Time Format</label>
            <select value={timeFormat} onChange={(e) => saveTimeFormat(e.target.value)} className="w-full rounded-md border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
              <option value="12">12-hour (AM/PM)</option>
              <option value="24">24-hour</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button onClick={resetPreferences} className="inline-flex items-center px-4 py-2 rounded-md bg-white text-gray-900 shadow ring-1 ring-gray-300 hover:bg-gray-50">Reset Preferences</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
