import axios from 'axios';

// Prefer relative "/api" in dev (proxied by Vite), fallback to env if provided
const rawBaseURL = import.meta.env.VITE_API_URL || '/api';
// Ensure trailing slash so joining paths like "auth/login" works (avoids "apiauth")
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const API = axios.create({
  baseURL, // e.g. "/api/" in dev or "http://localhost:5000/api/"
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const registerUser = (userData) => API.post('auth/register', userData);
export const loginUser = (credentials) => API.post('auth/login', credentials);
export const getProfile = () => API.get('auth/profile');

// Mood API
export const getMoodEntries = () => API.get('mood');
export const addMoodEntry = (entry) => API.post('mood', entry);

// Stress API
export const getStressEntries = () => API.get('stress');
export const addStressEntry = (entry) => API.post('stress', entry);

// Sleep API
export const getSleepEntries = () => API.get('sleep');
export const addSleepEntry = (entry) => API.post('sleep', entry);

// Affirmations API
export const getAffirmations = () => API.get('affirmations');
export const getDailyAffirmation = () => API.get('affirmations/daily');

export default API;
