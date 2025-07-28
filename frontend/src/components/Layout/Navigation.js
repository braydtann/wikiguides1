import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  GitBranch, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search
} from 'lucide-react';

const Navigation = () => {
  const { user, logout, hasPermission } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      permission: null, // Available to all authenticated users
    },
    {
      name: 'Wiki',
      href: '/wiki',
      icon: BookOpen,
      permission: 'wiki:read',
    },
    {
      name: 'Guided Flows',
      href: '/flows',
      icon: GitBranch,
      permission: 'flow:read',
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      permission: 'user:manage',
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: Settings,
      permission: 'admin:access',
    },
  ];

  const filteredNavigationItems = navigationItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const isCurrentPath = (href) => {
    if (href === '/dashboard' && location.pathname === '/') return true;
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WG</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-secondary-900">
                WikiGuides OCP
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isCurrentPath(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-primary-500 text-secondary-900'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Search */}
            <button className="p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-secondary-700">
                  {user?.full_name}
                </div>
                <div className="text-xs text-secondary-500 capitalize">
                  {user?.role}
                </div>
              </div>
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user?.full_name?.charAt(0)}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </a>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-secondary-200">
            <div className="flex items-center px-4">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.full_name?.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-secondary-800">
                  {user?.full_name}
                </div>
                <div className="text-sm font-medium text-secondary-500 capitalize">
                  {user?.role}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;