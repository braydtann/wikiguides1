import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Search,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Activity
} from 'lucide-react';

const AnalyticsPanel = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  const [analyticsFilter, setAnalyticsFilter] = useState('both-public-internal');

  // Mock analytics data based on Helpjuice Analytics screenshot
  const analyticsData = {
    overview: {
      totalSearches: 9,
      foundAnswers: 9,
      contactedSupport: 0,
      solutionQualityIndex: 100
    },
    supportCasesAvoided: {
      data: [
        { day: 'Wed', searches: 2, answers: 2, support: 0 },
        { day: 'Thu', searches: 4, answers: 4, support: 0 },
        { day: 'Fri', searches: 3, answers: 3, support: 0 },
        { day: 'Sat', searches: 0, answers: 0, support: 0 },
        { day: 'Sun', searches: 0, answers: 0, support: 0 },
        { day: 'Mon', searches: 0, answers: 0, support: 0 },
        { day: 'Tue', searches: 0, answers: 0, support: 0 }
      ]
    },
    teamUsage: {
      data: [
        { day: 'Wed', views: 45, reads: 12 },
        { day: 'Thu', views: 85, reads: 28 },
        { day: 'Fri', views: 68, reads: 22 },
        { day: 'Sat', views: 25, reads: 8 },
        { day: 'Sun', views: 15, reads: 5 },
        { day: 'Mon', views: 35, reads: 15 },
        { day: 'Tue', views: 55, reads: 18 }
      ]
    },
    employeeStats: [
      { name: 'Naomi Ramirez', views: 143, reads: 38 },
      { name: 'Bryce Lyman', views: 1, reads: 1 },
      { name: 'sherwin kapuno', views: 0, reads: 0 },
      { name: 'Nicholas Curtis', views: 0, reads: 0 }
    ]
  };

  const periodOptions = [
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'all-time', label: 'All Time' }
  ];

  const CircularProgress = ({ percentage, size = 120 }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            stroke="#3b82f6"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    );
  };

  const SimpleBarChart = ({ data, dataKey, color = '#3b82f6', height = 100 }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    
    return (
      <div className="flex items-end space-x-2" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="bg-blue-500 rounded-t-sm min-w-[20px]"
              style={{
                height: `${(item[dataKey] / maxValue) * (height - 20)}px`,
                backgroundColor: color
              }}
            />
            <span className="text-xs text-gray-600 mt-1">{item.day}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Insights
          </h3>
          <div className="text-sm text-gray-600 mb-4">
            07/22/2025 - 07/29/2025
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav>
          <div className="space-y-1">
            <button className="w-full flex items-center px-3 py-2 text-left text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
              Overview
            </button>
            <button className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Searches
            </button>
            <button className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Articles
            </button>
            <button className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Categories
            </button>
            <button className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Users / Groups
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedPeriod('last-7-days')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedPeriod === 'last-7-days'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setSelectedPeriod('last-30-days')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedPeriod === 'last-30-days'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setSelectedPeriod('all-time')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedPeriod === 'all-time'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Filter */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="text-sm text-gray-600">
            Filtering Analytics Data For:
            <select
              value={analyticsFilter}
              onChange={(e) => setAnalyticsFilter(e.target.value)}
              className="ml-2 px-2 py-1 border border-gray-300 rounded text-blue-600 font-medium"
            >
              <option value="both-public-internal">Both Public & Internal</option>
              <option value="public-only">Public Only</option>
              <option value="internal-only">Internal Only</option>
            </select>
          </div>
        </div>

        {/* Main Analytics Content */}
        <div className="flex-1 p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Support Cases Avoided */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support cases avoided</h3>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{analyticsData.overview.totalSearches} Total Searches</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{analyticsData.overview.foundAnswers} Found Answers</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{analyticsData.overview.contactedSupport} Contacted Support</span>
                </div>
              </div>

              <div className="h-40">
                <SimpleBarChart
                  data={analyticsData.supportCasesAvoided.data}
                  dataKey="searches"
                  color="#3b82f6"
                  height={160}
                />
              </div>
            </div>

            {/* Solution Quality Index */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Solution Quality Index</h3>
              
              <div className="flex items-center justify-center mb-4">
                <CircularProgress percentage={analyticsData.overview.solutionQualityIndex} />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">of searches were successful</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalSearches}</div>
                    <div className="text-sm text-gray-500">Total Searches</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.foundAnswers}</div>
                    <div className="text-sm text-gray-500">Total Found Answers</div>
                  </div>
                </div>
                <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mx-auto">
                  View More Data
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Team Usage */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Usage</h3>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Views</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Reads</span>
                </div>
              </div>

              <div className="h-40">
                <div className="flex items-end space-x-2 h-full">
                  {analyticsData.teamUsage.data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="flex flex-col items-center justify-end h-32 space-y-1">
                        <div
                          className="bg-blue-500 rounded-t-sm w-4"
                          style={{ height: `${(item.views / 100) * 80}px` }}
                        />
                        <div
                          className="bg-green-500 rounded-t-sm w-4"
                          style={{ height: `${(item.reads / 30) * 40}px` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 mt-2">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Employee Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                  <span>User</span>
                  <div className="flex space-x-8">
                    <span>Views</span>
                    <span>Reads</span>
                  </div>
                </div>
                
                {analyticsData.employeeStats.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2">
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900">{employee.name}</span>
                    </div>
                    <div className="flex space-x-12 text-sm text-gray-600">
                      <span className="w-8 text-right">{employee.views}</span>
                      <span className="w-8 text-right">{employee.reads}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;