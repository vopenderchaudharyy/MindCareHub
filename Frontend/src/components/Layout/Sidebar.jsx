import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, Moon, Activity, MessageSquare, Settings, User } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
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
            <h1 className="text-xl font-bold text-indigo-600">MindCare Hub</h1>
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
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 group block">
            <div className="flex items-center">
              <div>
                <div className="inline-block h-9 w-9 rounded-full bg-indigo-100 items-center justify-center">
                  <User className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">User Name</p>
                <Link
                  to="/profile"
                  className="text-xs font-medium text-indigo-600 group-hover:text-indigo-500"
                >
                  View profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
