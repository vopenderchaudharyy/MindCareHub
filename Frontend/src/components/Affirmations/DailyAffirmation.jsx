import { useState, useEffect } from 'react';
import { getDailyAffirmation } from '../../services/api';
import { Sparkles, RefreshCw } from 'lucide-react';

const DailyAffirmation = () => {
  const [affirmation, setAffirmation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAffirmation();
  }, []);

  const fetchAffirmation = async () => {
    try {
      setLoading(true);
      const res = await getDailyAffirmation();
      setAffirmation(res.data?.data || null);
    } catch (error) {
      console.error('Error fetching affirmation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg shadow-lg p-6 mb-6 animate-pulse">
        <div className="h-6 bg-white/30 rounded w-3/4 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <h2 className="text-lg font-semibold text-white">Daily Affirmation</h2>
          </div>
          <button
            onClick={fetchAffirmation}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            title="Get new affirmation"
          >
            <RefreshCw className="h-5 w-5 text-white" />
          </button>
        </div>
        
        {affirmation && (
          <p className="text-xl text-white font-medium text-center italic">
            "{affirmation.text}"
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyAffirmation;
