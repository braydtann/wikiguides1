import React, { useState, useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateCategoryModal from './CreateCategoryModal';
import CreateSubcategoryModal from './CreateSubcategoryModal';
import CreateArticleModal from './CreateArticleModal';
import WikiSelection from './WikiSelection';
import { 
  ArrowLeft,
  Search, 
  Plus, 
  Grid,
  List,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Edit,
  Trash2,
  Eye,
  Settings,
  Filter,
  X
} from 'lucide-react';

const EnhancedWikiBrowser = () => {
  const { 
    selectedWiki,
    setSelectedWiki,
    categories,
    subcategories,
    articles,
    selectedCategory,
    selectedSubcategory,
    setSelectedCategory,
    setSelectedSubcategory,
    fetchCategories,
    fetchSubcategories,
    fetchArticles,
    deleteCategory,
    deleteSubcategory,
    deleteArticle,
    viewMode,
    setViewMode,
    loading
  } = useWiki();
  
  const { hasPermission } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState(new Set());
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingArticle, setViewingArticle] = useState(null);
  const [filterBy, setFilterBy] = useState('all'); // all, recent, popular

  // Effects - moved outside of conditional render
  useEffect(() => {
    if (selectedWiki) {
      fetchCategories(selectedWiki.id);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }
  }, [selectedWiki]); // Simplified dependencies

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory.id);
      setSelectedSubcategory(null);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubcategory) {
      fetchArticles({ subcategory_id: selectedSubcategory.id });
    } else if (selectedCategory) {
      fetchArticles({ category_id: selectedCategory.id });
    } else if (selectedWiki) {
      fetchArticles({ wiki_id: selectedWiki.id });
    }
  }, [selectedSubcategory, selectedCategory, selectedWiki]);

  // If no wiki is selected, show wiki selection
  if (!selectedWiki) {
    return <WikiSelection onWikiSelect={setSelectedWiki} />;
  }

  const openCreateModal = (type) => {
    setCreateType(type);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateType('');
  };

  const handleCreateSuccess = () => {
    if (createType === 'category') {
      fetchCategories(selectedWiki.id);
    } else if (createType === 'subcategory' && selectedCategory) {
      fetchSubcategories(selectedCategory.id);
    } else if (createType === 'article') {
      if (selectedSubcategory) {
        fetchArticles({ subcategory_id: selectedSubcategory.id });
      } else if (selectedCategory) {
        fetchArticles({ category_id: selectedCategory.id });
      }
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Delete "${categoryName}" and all its content? This cannot be undone.`)) {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        fetchCategories(selectedWiki.id);
        setSelectedCategory(null);
        setSelectedSubcategory(null);
      }
    }
  };

  const handleDeleteSubcategory = async (subcategoryId, subcategoryName) => {
    if (window.confirm(`Delete "${subcategoryName}" and all its content? This cannot be undone.`)) {
      const result = await deleteSubcategory(subcategoryId);
      if (result.success && selectedCategory) {
        fetchSubcategories(selectedCategory.id);
        setSelectedSubcategory(null);
      }
    }
  };

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (window.confirm(`Delete "${articleTitle}"? This cannot be undone.`)) {
      await deleteArticle(articleId);
    }
  };

  const handleViewArticle = (article) => {
    setViewingArticle(article);
    setShowViewModal(true);
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSubcategoryExpansion = (subcategoryId) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (category) => {
    if (category.icon) {
      if (category.icon.startsWith('data:') || category.icon.startsWith('http')) {
        return <img src={category.icon} alt={category.name} className="h-8 w-8 rounded" />;
      }
      return <span className="text-2xl">{category.icon}</span>;
    }
    return <BookOpen className="h-8 w-8" style={{ color: category.color }} />;
  };

  const breadcrumbs = [
    { name: selectedWiki.name, onClick: () => setSelectedWiki(null) },
    ...(selectedCategory ? [{ 
      name: selectedCategory.name, 
      onClick: () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
      }
    }] : []),
    ...(selectedSubcategory ? [{ 
      name: selectedSubcategory.name, 
      onClick: () => setSelectedSubcategory(null)
    }] : [])
  ];

  const renderNestedSubcategories = (subcats, level = 0) => {
    return subcats.map((subcat) => (
      <div key={subcat.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${
            selectedSubcategory?.id === subcat.id
              ? 'bg-blue-50 border-blue-200 border'
              : 'hover:bg-gray-50 border border-transparent'
          }`}
        >
          <div 
            className="flex items-center flex-1"
            onClick={() => setSelectedSubcategory(subcat)}
          >
            {subcat.nested_subcategories && subcat.nested_subcategories.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSubcategoryExpansion(subcat.id);
                }}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {expandedSubcategories.has(subcat.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <FileText className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {subcat.name}
              </h4>
              <p className="text-xs text-gray-500">
                {subcat.articles_count} articles
              </p>
            </div>
          </div>

          {hasPermission('wiki:write') && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory({ id: subcat.category_id });
                  setSelectedSubcategory(subcat);
                  openCreateModal('subcategory');
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Add Nested Subcategory"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSubcategory(subcat.id, subcat.name);
                }}
                className="p-1 hover:bg-red-100 rounded text-red-600"
                title="Delete Subcategory"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Render nested subcategories */}
        {expandedSubcategories.has(subcat.id) && subcat.nested_subcategories && 
         subcat.nested_subcategories.length > 0 && (
          <div className="mt-2">
            {renderNestedSubcategories(subcat.nested_subcategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedWiki(null)}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Wikis
              </button>
              <div className="flex items-center space-x-2 ml-4">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <button
                      onClick={crumb.onClick}
                      className={`text-sm font-medium transition-colors ${
                        index === breadcrumbs.length - 1
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {hasPermission('wiki:write') && (
                <>
                  {!selectedCategory && (
                    <button
                      onClick={() => openCreateModal('category')}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Category
                    </button>
                  )}
                  {selectedCategory && !selectedSubcategory && (
                    <button
                      onClick={() => openCreateModal('subcategory')}
                      className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Subcategory
                    </button>
                  )}
                  {selectedSubcategory && (
                    <button
                      onClick={() => openCreateModal('article')}
                      className="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Article
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search categories, articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Content</option>
              <option value="recent">Recently Updated</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories & Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              </div>
              
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {hasPermission('wiki:write') 
                        ? 'No categories yet. Create your first category to get started.'
                        : 'No categories available.'
                      }
                    </p>
                    {hasPermission('wiki:write') && (
                      <button
                        onClick={() => openCreateModal('category')}
                        className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Create First Category
                      </button>
                    )}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${
                          selectedCategory?.id === category.id
                            ? 'bg-blue-50 border-blue-200 border'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div 
                          className="flex items-center flex-1"
                          onClick={() => {
                            setSelectedCategory(category);
                            toggleCategoryExpansion(category.id);
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategoryExpansion(category.id);
                            }}
                            className="mr-2 p-1 hover:bg-gray-200 rounded"
                          >
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          
                          <div 
                            className="flex items-center justify-center w-8 h-8 rounded-lg mr-3 flex-shrink-0"
                            style={{ backgroundColor: `${category.color}15` }}
                          >
                            {getCategoryIcon(category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {category.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {category.subcategories_count} subcategories
                            </p>
                          </div>
                        </div>

                        {hasPermission('wiki:write') && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id, category.name);
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Subcategories */}
                      {expandedCategories.has(category.id) && selectedCategory?.id === category.id && (
                        <div className="ml-4 space-y-2">
                          {subcategories.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-xs mb-2">No subcategories yet</p>
                              {hasPermission('wiki:write') && (
                                <button
                                  onClick={() => openCreateModal('subcategory')}
                                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                >
                                  Create First Subcategory
                                </button>
                              )}
                            </div>
                          ) : (
                            renderNestedSubcategories(subcategories)
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedSubcategory ? (
              /* Articles View */
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedSubcategory.name}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {filteredArticles.length} articles
                      </p>
                    </div>
                    {hasPermission('wiki:write') && (
                      <button
                        onClick={() => openCreateModal('article')}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Article
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No articles yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {hasPermission('wiki:write')
                          ? 'Create your first article to share knowledge with your team.'
                          : 'No articles available in this subcategory.'
                        }
                      </p>
                      {hasPermission('wiki:write') && (
                        <button
                          onClick={() => openCreateModal('article')}
                          className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create First Article
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredArticles.map((article) => (
                        <div
                          key={article.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {article.title}
                              </h3>
                              <div 
                                className="text-gray-600 text-sm mb-3 line-clamp-3"
                                dangerouslySetInnerHTML={{ 
                                  __html: article.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' 
                                }}
                              />
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Version {article.version}</span>
                                <span>{new Date(article.updated_at).toLocaleDateString()}</span>
                                {article.tags && article.tags.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    {article.tags.slice(0, 2).map((tag, index) => (
                                      <span 
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {article.tags.length > 2 && (
                                      <span className="text-gray-400">
                                        +{article.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleViewArticle(article)}
                                className="p-2 hover:bg-gray-100 rounded"
                                title="View Article"
                              >
                                <Eye className="h-4 w-4 text-gray-600" />
                              </button>
                              {hasPermission('wiki:write') && (
                                <>
                                  <button
                                    className="p-2 hover:bg-gray-100 rounded"
                                    title="Edit Article"
                                  >
                                    <Edit className="h-4 w-4 text-gray-600" />
                                  </button>
                                  {hasPermission('wiki:delete') && (
                                    <button
                                      onClick={() => handleDeleteArticle(article.id, article.title)}
                                      className="p-2 hover:bg-red-100 rounded text-red-600"
                                      title="Delete Article"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : selectedCategory ? (
              /* Subcategories Overview */
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedCategory.name}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedCategory.description || 'Select a subcategory to view articles'}
                      </p>
                    </div>
                    {hasPermission('wiki:write') && (
                      <button
                        onClick={() => openCreateModal('subcategory')}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Subcategory
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-center text-gray-500 py-8">
                    Select a subcategory from the sidebar to view its articles
                  </p>
                </div>
              </div>
            ) : (
              /* Categories Overview */
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedWiki.name}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedWiki.description || 'Select a category to explore its content'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <div className="text-center">
                          <div 
                            className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 shadow-sm"
                            style={{ backgroundColor: `${category.color}15` }}
                          >
                            {getCategoryIcon(category)}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {category.name}
                          </h3>
                          
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-4">
                              {category.description}
                            </p>
                          )}

                          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {category.subcategories_count} subcategories
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {category.articles_count} articles
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredCategories.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No categories yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {hasPermission('wiki:write')
                          ? 'Create your first category to organize your knowledge base.'
                          : 'No categories available in this knowledge base.'
                        }
                      </p>
                      {hasPermission('wiki:write') && (
                        <button
                          onClick={() => openCreateModal('category')}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create First Category
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Modals */}
        <CreateCategoryModal
          isOpen={showCreateModal && createType === 'category'}
          onClose={closeCreateModal}
          onSuccess={handleCreateSuccess}
        />

        <CreateSubcategoryModal
          isOpen={showCreateModal && createType === 'subcategory'}
          onClose={closeCreateModal}
          onSuccess={handleCreateSuccess}
          categoryId={selectedCategory?.id}
          parentSubcategoryId={selectedSubcategory?.id}
        />

        <CreateArticleModal
          isOpen={showCreateModal && createType === 'article'}
          onClose={closeCreateModal}
          onSuccess={handleCreateSuccess}
          subcategoryId={selectedSubcategory?.id}
        />

        {/* Article View Modal */}
        {showViewModal && viewingArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{viewingArticle.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Version {viewingArticle.version} • {viewingArticle.visibility} • 
                    Last updated {new Date(viewingArticle.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: viewingArticle.content }}
                />
                {viewingArticle.tags && viewingArticle.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {viewingArticle.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedWikiBrowser;