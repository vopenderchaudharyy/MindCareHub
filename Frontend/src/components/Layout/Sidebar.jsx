import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, Moon, Activity, MessageSquare, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Mood Tracker', path: '/mood', icon: Heart },
    { name: 'Sleep Tracker', path: '/sleep', icon: Moon },
    { name: 'Stress Tracker', path: '/stress', icon: Activity },
    { name: 'Affirmations', path: '/affirmations', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white h-screen">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="sr-only">Sidebar</span>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-6 w-6 ${
                        isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 border-t border-gray-100 p-4">
          <Link to="/profile" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{currentUser?.name || 'Profile'}</div>
              <div className="text-xs text-indigo-600 group-hover:text-indigo-700">View profile</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
