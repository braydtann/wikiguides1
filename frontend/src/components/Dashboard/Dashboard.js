import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, GitBranch, Users, BarChart3, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();

  const quickActions = [
    {
      name: 'Browse Wiki',
      description: 'Explore knowledge articles and documentation',
      icon: BookOpen,
      href: '/wiki',
      permission: 'wiki:read',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Create Article',
      description: 'Write a new wiki article',
      icon: BookOpen,
      href: '/wiki/new',
      permission: 'wiki:write',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Guided Flows',
      description: 'Access or create guided flows',
      icon: GitBranch,
      href: '/flows',
      permission: 'flow:read',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      name: 'Manage Users',
      description: 'User and role management',
      icon: Users,
      href: '/users',
      permission: 'user:manage',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const filteredActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  // Mock stats data - will be replaced with real data later
  const stats = [
    {
      name: 'Wiki Articles',
      value: '24',
      change: '+3 this week',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Active Flows',
      value: '8',
      change: '+2 this month',
      icon: GitBranch,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      name: 'Team Members',
      value: '12',
      change: '+1 this week',
      icon: Users,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Flow Executions',
      value: '156',
      change: '+24 today',
      icon: BarChart3,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  // Mock recent activity - will be replaced with real data later
  const recentActivity = [
    {
      id: 1,
      type: 'wiki',
      title: 'Updated "Getting Started" article',
      user: 'John Doe',
      time: '2 hours ago',
      icon: BookOpen,
    },
    {
      id: 2,
      type: 'flow',
      title: 'Created new onboarding flow',
      user: 'Jane Smith',
      time: '4 hours ago',
      icon: GitBranch,
    },
    {
      id: 3,
      type: 'user',
      title: 'New user registered: Mike Johnson',
      user: 'System',
      time: '6 hours ago',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-secondary-600 mt-1">
              Here's what's happening in your WikiGuides workspace today.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-secondary-500">Your Role</div>
            <div className="text-lg font-semibold text-primary-600 capitalize">
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-500">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-secondary-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-secondary-400 mt-1">
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.name}
                  className="flex items-center p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
                >
                  <div className={`p-2 rounded-lg text-white ${action.color} transition-colors`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-secondary-900 group-hover:text-primary-700">
                      {action.name}
                    </h3>
                    <p className="text-sm text-secondary-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="p-2 bg-secondary-100 rounded-lg">
                    <Icon className="h-4 w-4 text-secondary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-secondary-500">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all activity →
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              System Status
            </h2>
            <p className="text-secondary-600 text-sm mt-1">
              All systems operational and running smoothly
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;