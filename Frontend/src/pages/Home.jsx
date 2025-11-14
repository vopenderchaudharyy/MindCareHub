import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, HeartPulse, Moon, TrendingUp } from 'lucide-react';

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

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Your Journey to Better Mental Health</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Track, understand, and improve your mental well-being with our comprehensive tools and resources.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
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
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
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
    </div>
  );
};

export default Home;
