import React, { useState, useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import FilesManager from './FilesManager';
import UsersManager from './UsersManager';
import ActivitiesPanel from './ActivitiesPanel';
import AnalyticsPanel from './AnalyticsPanel';
import { 
  Home,
  BookOpen,
  Users,
  Activity,
  BarChart3,
  Folder,
  Settings,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  FileText,
  Calendar,
  User
} from 'lucide-react';

const HelpjuiceAdminDashboard = () => {
  const { 
    wikis,
    categories,
    articles,
    selectedWiki,
    setSelectedWiki,
    fetchWikis,
    fetchCategories,
    fetchArticles,
    loading
  } = useWiki();
  
  const { user, hasPermission } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFilter, setSelectedFilter] = useState('everything');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('');

  useEffect(() => {
    if (hasPermission('admin:access')) {
      fetchWikis();
      if (selectedWiki) {
        fetchCategories(selectedWiki.id);
        fetchArticles({ wiki_id: selectedWiki.id });
      }
    }
  }, [selectedWiki]);

  const filterOptions = [
    { id: 'everything', name: 'Everything', count: categories.length + articles.length },
    { id: 'published', name: 'Published', count: articles.filter(a => a.visibility === 'public').length },
    { id: 'draft', name: 'Draft & Unpublished', count: articles.filter(a => a.visibility === 'private').length },
    { id: 'to_review', name: 'To Review', count: 0 },
    { id: 'followed', name: 'Followed', count: 0 },
    { id: 'archived', name: 'Archived', count: 0 }
  ];

  const sidebarNavigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'activities', name: 'Activities', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'files', name: 'Files Manager', icon: Folder },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const handleCreateNew = (type) => {
    setCreateType(type);
    setShowCreateModal(true);
  };

  const renderDashboard = () => (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Dashboard</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleCreateNew('category')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Category
              </button>
              <button
                onClick={() => handleCreateNew('article')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Article
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Sidebar Filters */}
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">ARTICLES</h3>
            <div className="space-y-1">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{filter.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">CATEGORIES</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center px-3 py-2 text-sm text-gray-600">
                    <Folder className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search for Articles or Categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value="position"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="position">Position</option>
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                </select>

                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content List */}
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Categories */}
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 group">
                  <div className="flex items-center">
                    <Folder className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        Updated {new Date(category.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Articles */}
              {articles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 group">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
                        <span>by {article.updated_by}</span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {article.visibility}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}

              {categories.length === 0 && articles.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-500 mb-6">Create your first category or article to get started</p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handleCreateNew('category')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      New Category
                    </button>
                    <button
                      onClick={() => handleCreateNew('article')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      New Article
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!hasPermission('admin:access')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="p-4">
          <div className="space-y-1">
            {sidebarNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'activities' && <ActivitiesPanel />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'files' && <FilesManager />}
        {activeTab === 'settings' && (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">System settings and configuration options.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpjuiceAdminDashboard;