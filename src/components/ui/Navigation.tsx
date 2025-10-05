import React from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

interface NavigationProps {
  items: NavigationItem[];
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ items, className = '' }) => {
  const location = useLocation();

  return (
    <nav className={`bg-white shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">
                🧳 TravelPlanner
              </div>
            </Link>

            {/* Navigation items */}
            <div className="hidden md:flex space-x-8">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200
                    ${
                      location.pathname === item.path
                        ? 'border-blue-500 text-gray-900 border-b-2'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  {item.icon && (
                    <Icon icon={item.icon} className="mr-2" width={18} height={18} />
                  )}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
