import React, { useState, useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateWikiModal from './CreateWikiModal';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Users,
  FileText,
  Grid,
  List,
  Lock,
  Globe,
  ChevronRight
} from 'lucide-react';

const WikiSelection = ({ onWikiSelect }) => {
  const { 
    wikis, 
    loading, 
    fetchWikis, 
    deleteWiki,
    viewMode,
    setViewMode
  } = useWiki();
  const { hasPermission } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingWiki, setEditingWiki] = useState(null);

  useEffect(() => {
    fetchWikis();
  }, []);

  const handleCreateSuccess = () => {
    fetchWikis();
  };

  const handleDeleteWiki = async (wikiId, wikiName) => {
    if (window.confirm(`Are you sure you want to delete wiki "${wikiName}"? This action cannot be undone and will delete all categories, subcategories, and articles within this wiki.`)) {
      const result = await deleteWiki(wikiId);
      if (result.success) {
        fetchWikis();
      }
    }
  };

  const filteredWikis = wikis.filter(wiki => 
    wiki.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (wiki.description && wiki.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getWikiIcon = (wiki) => {
    if (wiki.icon) {
      // If custom icon is uploaded, it would be a URL or base64
      if (wiki.icon.startsWith('data:') || wiki.icon.startsWith('http')) {
        return <img src={wiki.icon} alt={wiki.name} className="h-8 w-8 rounded" />;
      }
      // If it's an emoji
      return <span className="text-2xl">{wiki.icon}</span>;
    }
    return <BookOpen className="h-8 w-8" style={{ color: wiki.color }} />;
  };

  if (loading && wikis.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <BookOpen className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Knowledge Base Hub
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select a knowledge base to explore, or create a new one to organize your team's expertise.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search knowledge bases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Create Wiki Button */}
            {hasPermission('wiki:write') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Wiki
              </button>
            )}
          </div>
        </div>

        {/* Wiki Grid/List */}
        {filteredWikis.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'No wikis found' : 'No knowledge bases yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery 
                ? `No wikis match "${searchQuery}". Try a different search term.`
                : 'Get started by creating your first knowledge base.'
              }
            </p>
            {hasPermission('wiki:write') && !searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Wiki
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-3'
          }>
            {filteredWikis.map((wiki) => (
              <div
                key={wiki.id}
                className={`
                  group relative bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer
                  ${viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center'}
                `}
                onClick={() => onWikiSelect(wiki)}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View */}
                    <div className="text-center">
                      <div 
                        className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 shadow-sm"
                        style={{ backgroundColor: `${wiki.color}15`, borderColor: wiki.color }}
                      >
                        {getWikiIcon(wiki)}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {wiki.name}
                      </h3>
                      
                      {wiki.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {wiki.description}
                        </p>
                      )}

                      <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 mb-4">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {wiki.categories_count} categories
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {wiki.articles_count} articles
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        {wiki.is_public ? (
                          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {hasPermission('wiki:write') && (
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWiki(wiki);
                              setShowCreateModal(true);
                            }}
                            className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50"
                            title="Edit Wiki"
                          >
                            <Edit className="h-3 w-3 text-slate-600" />
                          </button>
                          {hasPermission('wiki:delete') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWiki(wiki.id, wiki.name);
                              }}
                              className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-red-50 text-red-600"
                              title="Delete Wiki"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex items-center flex-1">
                      <div 
                        className="flex items-center justify-center w-12 h-12 rounded-lg mr-4 shadow-sm"
                        style={{ backgroundColor: `${wiki.color}15`, borderColor: wiki.color }}
                      >
                        {getWikiIcon(wiki)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {wiki.name}
                          </h3>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-500 ml-4">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {wiki.categories_count}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {wiki.articles_count}
                            </div>
                            {wiki.is_public ? (
                              <div className="flex items-center text-green-600">
                                <Globe className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="flex items-center text-amber-600">
                                <Lock className="h-4 w-4" />
                              </div>
                            )}
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                        
                        {wiki.description && (
                          <p className="text-sm text-slate-600 mt-1 truncate">
                            {wiki.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for List View */}
                    {hasPermission('wiki:write') && (
                      <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWiki(wiki);
                            setShowCreateModal(true);
                          }}
                          className="p-2 hover:bg-slate-50 rounded-lg"
                          title="Edit Wiki"
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </button>
                        {hasPermission('wiki:delete') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWiki(wiki.id, wiki.name);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                            title="Delete Wiki"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Wiki Modal */}
        <CreateWikiModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingWiki(null);
          }}
          onSuccess={handleCreateSuccess}
          editingWiki={editingWiki}
        />
      </div>
    </div>
  );
};

export default WikiSelection;