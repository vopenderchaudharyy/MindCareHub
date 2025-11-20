import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, HeartPulse, Moon, TrendingUp, ShieldCheck, CalendarCheck, BarChart3, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-indigo-600" />,
    title: 'Mood Tracking',
    description: 'Track your daily mood patterns and gain insights into your emotional well-being.'
  },
  {
    icon: <HeartPulse className="w-8 h-8 text-pink-600" />,
    title: 'Stress Management',
    description: 'Monitor stress levels and learn effective coping mechanisms.'
  },
  {
    icon: <Moon className="w-8 h-8 text-blue-600" />,
    title: 'Sleep Analysis',
    description: 'Track your sleep patterns and improve your sleep quality.'
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-green-600" />,
    title: 'Progress Reports',
    description: 'View detailed analytics of your mental health journey.'
  }
];

const steps = [
  {
    icon: <CalendarCheck className="w-8 h-8 text-indigo-600" />,
    title: 'Log your day',
    description: 'Record mood, stress and sleep in seconds.'
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
    title: 'See insights',
    description: 'Understand trends with clean charts and stats.'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />,
    title: 'Improve daily',
    description: 'Stay consistent with tips and affirmations.'
  }
];

const highlights = [
  { stat: '10k+', label: 'Entries Tracked' },
  { stat: '92%', label: 'Feel more aware' },
  { stat: 'A+', label: 'Privacy-first' }
];

const testimonials = [
  { name: 'Alex', text: 'Simple and insightful. I finally understand my patterns.' },
  { name: 'Riya', text: 'Fast to log, and the visuals keep me engaged every day.' }
];

const Home = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const authed = isAuthenticated || (typeof window !== 'undefined' && !!localStorage.getItem('token'));
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-sm mb-5">
                <Sparkles className="w-4 h-4" />
                <span>Personalized mental wellness</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Your Journey to Better Mental Health</h1>
              <p className="text-lg md:text-xl/relaxed text-white/90 max-w-2xl">
                Track, understand and improve your well-being with simple daily logs, clean insights and gentle guidance.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {authed ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/about"
                      className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                      Learn More
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl">
                {highlights.map((h, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl md:text-4xl font-extrabold">{h.stat}</div>
                    <div className="text-white/80 text-sm mt-1">{h.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="aspect-[4/3] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8">
                <div className="grid grid-cols-3 gap-6 h-full">
                  <Link
                    to="/mood"
                    aria-label="Open Mood Tracker"
                    className="group flex flex-col items-center justify-center rounded-xl bg-white/10 border border-white/20 p-4 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/60"
                  >
                    <div className="rounded-lg bg-white/10 p-3 transition-transform duration-300 group-hover:scale-110">
                      <BrainCircuit className="w-10 h-10" />
                    </div>
                    <p className="mt-3 font-semibold">Mood</p>
                  </Link>
                  <Link
                    to="/stress"
                    aria-label="Open Stress Tracker"
                    className="group flex flex-col items-center justify-center rounded-xl bg-white/10 border border-white/20 p-4 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/60"
                  >
                    <div className="rounded-lg bg-white/10 p-3 transition-transform duration-300 group-hover:scale-110">
                      <HeartPulse className="w-10 h-10" />
                    </div>
                    <p className="mt-3 font-semibold">Stress</p>
                  </Link>
                  <Link
                    to="/sleep"
                    aria-label="Open Sleep Tracker"
                    className="group flex flex-col items-center justify-center rounded-xl bg-white/10 border border-white/20 p-4 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/60"
                  >
                    <div className="rounded-lg bg-white/10 p-3 transition-transform duration-300 group-hover:scale-110">
                      <Moon className="w-10 h-10" />
                    </div>
                    <p className="mt-3 font-semibold">Sleep</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Features Designed for You
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to take control of your mental well-being.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow mb-4 ring-1 ring-gray-100">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What users say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <p className="text-gray-700 leading-relaxed">“{t.text}”</p>
                <div className="mt-4 font-semibold text-gray-900">— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {authed ? (
        <div className="bg-indigo-700">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Welcome back</span>
              <span className="block text-indigo-200">Continue your mental health journey.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Go to Dashboard
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-indigo-700">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-indigo-200">Start your mental health journey today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Create Account
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
