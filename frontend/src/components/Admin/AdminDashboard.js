import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  BookOpen, 
  GitBranch, 
  Activity,
  Settings,
  TrendingUp,
  Clock,
  Database,
  Shield,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { analytics, systemSettings, allUsers, recentActivity, fetchAnalytics, fetchSystemSettings, updateSystemSettings, loading } = useAdmin();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSettings, setEditingSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (hasPermission('admin:access')) {
      fetchAnalytics();
      fetchSystemSettings();
    }
  }, []);

  useEffect(() => {
    if (systemSettings && !editingSettings) {
      setEditingSettings({ ...systemSettings });
    }
  }, [systemSettings]);

  const handleSettingsChange = (field, value) => {
    setEditingSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!editingSettings) return;
    
    setSavingSettings(true);
    try {
      const result = await updateSystemSettings(editingSettings);
      if (result.success) {
        // Settings updated successfully
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleConfigureGoogleDrive = () => {
    // For now, just show an alert - in a real app you'd open OAuth flow
    alert('Google Drive configuration would open OAuth flow. This is a demo implementation.');
  };

  if (!hasPermission('admin:access')) {
    return (
      <div className="card text-center py-12">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Access Denied</h3>
        <p className="text-secondary-500">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-secondary-600">Loading dashboard...</span>
      </div>
    );
  }

  const StatCard = ({ title, value, change, icon: Icon, color = "primary" }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-500">{title}</p>
          <p className="text-3xl font-bold text-secondary-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${
              change.startsWith('+') ? 'text-green-600' : 'text-secondary-500'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'content', name: 'Content', icon: BookOpen },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600 mt-1">
          Monitor system activity and manage platform settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-secondary-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={analytics.total_users}
              change={`+${analytics.active_users_last_30_days} active (30d)`}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Wiki Articles"
              value={analytics.total_wiki_articles}
              change={`+${analytics.articles_created_last_30_days} new (30d)`}
              icon={BookOpen}
              color="green"
            />
            <StatCard
              title="Guided Flows"
              value={analytics.total_flows}
              change={`+${analytics.flows_created_last_30_days} new (30d)`}
              icon={GitBranch}
              color="purple"
            />
            <StatCard
              title="Flow Executions"
              value={analytics.total_flow_executions}
              change={`+${analytics.executions_last_30_days} recent (30d)`}
              icon={Activity}
              color="orange"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity by Role */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Users by Role</h3>
              <div className="space-y-3">
                {Object.entries(analytics.user_activity_by_role).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        role === 'admin' ? 'bg-red-500' :
                        role === 'manager' ? 'bg-blue-500' :
                        role === 'agent' ? 'bg-green-500' :
                        role === 'contributor' ? 'bg-yellow-500' :
                        'bg-secondary-400'
                      }`}></div>
                      <span className="capitalize text-secondary-700">{role}</span>
                    </div>
                    <span className="font-semibold text-secondary-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage Usage */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Storage Usage
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Articles</span>
                  <span className="text-secondary-900">{analytics.storage_usage.articles_storage_mb} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Images</span>
                  <span className="text-secondary-900">{analytics.storage_usage.images_storage_mb} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Flows</span>
                  <span className="text-secondary-900">{analytics.storage_usage.flows_storage_mb} MB</span>
                </div>
                <div className="pt-2 border-t border-secondary-200">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-secondary-900">Total</span>
                    <span className="text-secondary-900">{analytics.storage_usage.total_storage_mb} MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Popular Articles */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Articles</h3>
              <div className="space-y-3">
                {analytics.most_popular_articles.length > 0 ? (
                  analytics.most_popular_articles.map((article, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <div className="font-medium text-secondary-900">{article.title}</div>
                        <div className="text-sm text-secondary-500">
                          by {article.created_by} • {new Date(article.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary-500 text-center py-4">No articles yet</p>
                )}
              </div>
            </div>

            {/* Most Executed Flows */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Most Executed Flows</h3>
              <div className="space-y-3">
                {analytics.most_executed_flows.length > 0 ? (
                  analytics.most_executed_flows.map((flow, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <div className="font-medium text-secondary-900">{flow.title}</div>
                        <div className="text-sm text-secondary-500">by {flow.created_by}</div>
                      </div>
                      <div className="text-primary-600 font-semibold">
                        {flow.execution_count} runs
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary-500 text-center py-4">No flow executions yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        activity.type === 'article_created' ? 'bg-green-500' :
                        activity.type === 'flow_created' ? 'bg-blue-500' :
                        activity.type === 'flow_executed' ? 'bg-purple-500' :
                        'bg-secondary-400'
                      }`}></div>
                      <div>
                        <div className="text-secondary-900">{activity.title}</div>
                        <div className="text-sm text-secondary-500">
                          {activity.user_id} • {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {activity.status && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                        activity.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">User Management</h3>
            <p className="text-secondary-600 mt-1">Manage user roles and permissions</p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {user.full_name?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-secondary-900">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'agent' ? 'bg-green-100 text-green-800' :
                          user.role === 'contributor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Content Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium">Wiki Articles</span>
                </div>
                <span className="text-blue-600 font-semibold">{analytics.total_wiki_articles}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <GitBranch className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium">Guided Flows</span>
                </div>
                <span className="text-purple-600 font-semibold">{analytics.total_flows}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium">Flow Executions</span>
                </div>
                <span className="text-green-600 font-semibold">{analytics.total_flow_executions}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Content Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Articles updated (30d)</span>
                <span className="text-secondary-900 font-semibold">{analytics.articles_created_last_30_days}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Flows created (30d)</span>
                <span className="text-secondary-900 font-semibold">{analytics.flows_created_last_30_days}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Flow executions (30d)</span>
                <span className="text-secondary-900 font-semibold">{analytics.executions_last_30_days}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-6">System Settings</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Storage Settings */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Storage Configuration
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Storage Provider
                  </label>
                  <select 
                    className="input-field"
                    value={editingSettings?.storage_provider || ''}
                    onChange={(e) => handleSettingsChange('storage_provider', e.target.value)}
                  >
                    <option value="">Local Storage</option>
                    <option value="google_drive">Google Drive</option>
                    <option value="aws_s3">AWS S3</option>
                  </select>
                </div>
                
                {systemSettings?.storage_provider === 'google_drive' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Google Drive Integration</span>
                    </div>
                    <p className="text-blue-700 text-sm mb-3">
                      Configure Google Drive for file storage. You'll need to set up OAuth credentials.
                    </p>
                    <button className="btn-primary text-sm">
                      Configure Google Drive
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* System Settings */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-secondary-900">Analytics</div>
                    <div className="text-sm text-secondary-500">Collect usage analytics</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={systemSettings?.analytics_enabled || false}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    onChange={(e) => {/* Handle change */}}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-secondary-900">Email Notifications</div>
                    <div className="text-sm text-secondary-500">Send system notifications</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={systemSettings?.email_notifications || false}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    onChange={(e) => {/* Handle change */}}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-secondary-900">Automated Backups</div>
                    <div className="text-sm text-secondary-500">Daily system backups</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={systemSettings?.backup_enabled || false}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    onChange={(e) => {/* Handle change */}}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-secondary-200">
            <button className="btn-primary">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;