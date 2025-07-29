import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Download, 
  User, 
  Edit, 
  Eye, 
  Plus, 
  FileText, 
  Settings,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  Filter
} from 'lucide-react';

const ActivitiesPanel = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');

  // Mock activities data based on Helpjuice Activities screenshot
  const activities = [
    {
      id: 1,
      user: 'Jordan Dean',
      avatar: 'JD',
      action: 'Signed In',
      timestamp: '9 minutes ago',
      type: 'auth',
      icon: User
    },
    {
      id: 2,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Published',
      target: 'Question "Testing LiveAssist - ER"',
      timestamp: '16 hours ago',
      type: 'publish',
      icon: FileText
    },
    {
      id: 3,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Published',
      target: 'Question "Replacing Faulty Equipment - ER"',
      timestamp: '16 hours ago',
      type: 'publish',
      icon: FileText
    },
    {
      id: 4,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Opened',
      target: 'Question "Equipment Certification - ER"',
      timestamp: '16 hours ago',
      type: 'view',
      icon: Eye
    },
    {
      id: 5,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Opened',
      target: 'Question "Soft Resetting the Cove Panel - ER"',
      timestamp: '16 hours ago',
      type: 'view',
      icon: Eye
    },
    {
      id: 6,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Published',
      target: 'Question "Hard Resetting the Cove Panel - ER"',
      timestamp: '16 hours ago',
      type: 'publish',
      icon: FileText
    },
    {
      id: 7,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Published',
      target: 'Question "Panel Tests: Complete Sensor Signal Test - ER"',
      timestamp: '16 hours ago',
      type: 'publish',
      icon: FileText
    },
    {
      id: 8,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Published',
      target: 'Question "Panel: Adding and Removing Sensors - ER"',
      timestamp: '16 hours ago',
      type: 'publish',
      icon: FileText
    },
    {
      id: 9,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Added keywords to',
      target: 'Question "Testing LiveAssist - ER"',
      timestamp: '16 hours ago',
      type: 'edit',
      icon: Edit
    },
    {
      id: 10,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Added keywords to',
      target: 'Question "Arming and Disarming the Cove Panel - ER"',
      timestamp: '16 hours ago',
      type: 'edit',
      icon: Edit
    },
    {
      id: 11,
      user: 'Nicholas Curtis',
      avatar: 'NC',
      action: 'Opened',
      target: 'Question "Loss of Sensor Supervision"',
      timestamp: '16 hours ago',
      type: 'view',
      icon: Eye
    }
  ];

  const filterOptions = [
    { id: 'all', name: 'Show Activities For All Users', count: activities.length },
    { id: 'auth', name: 'Authentication', count: activities.filter(a => a.type === 'auth').length },
    { id: 'publish', name: 'Published', count: activities.filter(a => a.type === 'publish').length },
    { id: 'edit', name: 'Edits', count: activities.filter(a => a.type === 'edit').length },
    { id: 'view', name: 'Views', count: activities.filter(a => a.type === 'view').length }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'auth':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'publish':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'edit':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'view':
        return <div className="w-2 h-2 bg-purple-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'auth':
        return 'bg-blue-50';
      case 'publish':
        return 'bg-green-50';
      case 'edit':
        return 'bg-yellow-50';
      case 'view':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = selectedFilter === 'all' || activity.type === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.target && activity.target.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Activities</h1>
              <p className="text-gray-600 text-sm mt-1">See what's happening within your account!</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export XLSX
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.count})
                  </option>
                ))}
              </select>
              
              <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Filter
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className={`p-4 hover:${getActivityColor(activity.type)} transition-colors`}>
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {activity.avatar}
                      </div>
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.type)}
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{activity.user}</span>
                          <span className="text-gray-600 ml-1">{activity.action}</span>
                          {activity.target && (
                            <span className="text-blue-600 ml-1 hover:text-blue-700 cursor-pointer">
                              {activity.target}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-sm text-gray-500">
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>

          {/* Load More */}
          {filteredActivities.length > 0 && (
            <div className="mt-6 text-center">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Load More Activities
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPanel;