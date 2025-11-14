import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">About MindCare Hub</h1>
      <div className="space-y-4 text-gray-700">
        <p>
          MindCare Hub is a comprehensive mental wellness platform designed to help you track and improve your mental health journey.
          Our mission is to provide accessible tools and resources for better mental well-being.
        </p>
        <p>
          With features like mood tracking, stress management, sleep monitoring, and personalized affirmations,
          we aim to support you in your mental health journey every step of the way.
        </p>
        <p className="mt-6 font-medium">
          Version: 1.0.0
        </p>
      </div>
    </div>
  );
};

export default About;
