import React, { useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Settings, 
  Users, 
  Clock,
  FileText,
  Search,
  Grid,
  List
} from 'lucide-react';

const WikiSelection = ({ onWikiSelect }) => {
  const { wikis, fetchWikis, loading } = useWiki();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchWikis();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading wikis...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Knowledge Base</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select a knowledge base to explore articles, guides, and documentation
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search knowledge bases..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Wikis Grid */}
      {wikis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wikis.map((wiki) => (
            <div
              key={wiki.id}
              onClick={() => onWikiSelect(wiki)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md cursor-pointer transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-lg shadow-sm"
                  style={{ backgroundColor: `${wiki.color}15` }}
                >
                  {wiki.icon ? (
                    wiki.icon.startsWith('data:') || wiki.icon.startsWith('http') ? (
                      <img src={wiki.icon} alt={wiki.name} className="h-8 w-8 rounded" />
                    ) : (
                      <span className="text-2xl">{wiki.icon}</span>
                    )
                  ) : (
                    <BookOpen className="h-8 w-8" style={{ color: wiki.color }} />
                  )}
                </div>
                {hasPermission('wiki:write') && (
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                    <Settings className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {wiki.name}
              </h3>
              
              {wiki.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {wiki.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Grid className="h-4 w-4 mr-1" />
                    {wiki.categories_count} categories
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {wiki.articles_count} articles
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(wiki.updated_at).toLocaleDateString()}
                </div>
              </div>

              {/* Visibility Indicator */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {wiki.is_public ? (
                      <div className="flex items-center text-green-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-orange-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Restricted</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {wiki.allowed_roles?.length} roles
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Wiki Card */}
          {hasPermission('wiki:write') && (
            <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-blue-300 cursor-pointer transition-colors group">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Wiki</h3>
                <p className="text-gray-600 text-sm">
                  Start a new knowledge base for your team
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No knowledge bases available</h3>
          <p className="text-gray-500 mb-6">
            {hasPermission('wiki:write') 
              ? 'Create your first knowledge base to get started organizing your content.'
              : 'No knowledge bases have been shared with you yet.'
            }
          </p>
          {hasPermission('wiki:write') && (
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5 mr-2" />
              Create First Wiki
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WikiSelection;