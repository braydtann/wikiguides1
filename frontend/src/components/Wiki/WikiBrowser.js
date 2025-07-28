import React, { useState, useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateCategoryModal from './CreateCategoryModal';
import CreateSubcategoryModal from './CreateSubcategoryModal';
import CreateArticleModal from './CreateArticleModal';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  ChevronRight,
  Tag
} from 'lucide-react';

const WikiBrowser = () => {
  const { 
    categories, 
    subcategories, 
    articles, 
    selectedCategory, 
    selectedSubcategory,
    setSelectedCategory,
    setSelectedSubcategory,
    fetchSubcategories,
    fetchArticles,
    loading
  } = useWiki();
  
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState(''); // 'category', 'subcategory', 'article'

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubcategory) {
      fetchArticles({ subcategory_id: selectedSubcategory.id });
    } else if (selectedCategory && !selectedSubcategory) {
      // Show all articles in category's subcategories
      const categorySubcategories = subcategories.filter(sub => sub.category_id === selectedCategory.id);
      if (categorySubcategories.length > 0) {
        // For now, fetch all articles - later we can optimize this
        fetchArticles();
      }
    }
  }, [selectedSubcategory, selectedCategory, subcategories]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For now, use basic article search - later we can use the search API
      await fetchArticles({ search: searchQuery.trim() });
    }
  };

  const openCreateModal = (type) => {
    setCreateType(type);
    setShowCreateModal(true);
  };

  const getCategoryIcon = (iconName) => {
    // You can expand this with more icons
    const icons = {
      'book-open': BookOpen,
      'settings': Settings,
      'search': Search,
    };
    return icons[iconName] || BookOpen;
  };

  const filteredArticles = selectedSubcategory 
    ? articles.filter(article => article.subcategory_id === selectedSubcategory.id)
    : selectedCategory 
    ? articles.filter(article => {
        const articleSubcategory = subcategories.find(sub => sub.id === article.subcategory_id);
        return articleSubcategory && articleSubcategory.category_id === selectedCategory.id;
      })
    : articles;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-secondary-600">Loading wiki...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Wiki</h1>
            <p className="text-secondary-600 mt-1">
              Browse knowledge articles and documentation
            </p>
          </div>
          
          {hasPermission('wiki:write') && (
            <div className="flex space-x-2">
              <button
                onClick={() => openCreateModal('category')}
                className="btn-secondary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Category
              </button>
              {selectedCategory && (
                <button
                  onClick={() => openCreateModal('subcategory')}
                  className="btn-secondary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Subcategory
                </button>
              )}
              {selectedSubcategory && (
                <button
                  onClick={() => openCreateModal('article')}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Article
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, categories..."
              className="input-field pl-10 pr-4"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1 px-3 text-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories and Subcategories */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Categories</h2>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500 mb-4">No categories yet</p>
                {hasPermission('wiki:write') && (
                  <button
                    onClick={() => openCreateModal('category')}
                    className="btn-primary"
                  >
                    Create First Category
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  const isSelected = selectedCategory?.id === category.id;
                  
                  return (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-primary-50 border-primary-200 border text-primary-700' 
                            : 'hover:bg-secondary-50 border border-transparent'
                        }`}
                      >
                        <div 
                          className="p-2 rounded-md mr-3"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-secondary-500 truncate">
                              {category.description}
                            </div>
                          )}
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`} />
                      </button>

                      {/* Subcategories */}
                      {isSelected && (
                        <div className="ml-6 mt-2 space-y-1">
                          {subcategories
                            .filter(sub => sub.category_id === category.id)
                            .map((subcategory) => (
                              <button
                                key={subcategory.id}
                                onClick={() => handleSubcategorySelect(subcategory)}
                                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                  selectedSubcategory?.id === subcategory.id
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'hover:bg-secondary-50 text-secondary-600'
                                }`}
                              >
                                {subcategory.name}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Articles */}
        <div className="lg:col-span-3">
          {/* Breadcrumb */}
          {(selectedCategory || selectedSubcategory) && (
            <nav className="flex items-center text-sm text-secondary-500 mb-4">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className="hover:text-secondary-700"
              >
                All Categories
              </button>
              {selectedCategory && (
                <>
                  <ChevronRight className="h-4 w-4 mx-2" />
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className="hover:text-secondary-700"
                  >
                    {selectedCategory.name}
                  </button>
                </>
              )}
              {selectedSubcategory && (
                <>
                  <ChevronRight className="h-4 w-4 mx-2" />
                  <span className="text-secondary-700">{selectedSubcategory.name}</span>
                </>
              )}
            </nav>
          )}

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                {selectedSubcategory ? 'No articles in this subcategory' : 
                 selectedCategory ? 'No articles in this category' : 
                 'No articles found'}
              </h3>
              <p className="text-secondary-500 mb-6">
                {selectedSubcategory && hasPermission('wiki:write') 
                  ? 'Create the first article in this subcategory'
                  : 'Try selecting a different category or creating content'
                }
              </p>
              {selectedSubcategory && hasPermission('wiki:write') && (
                <button
                  onClick={() => openCreateModal('article')}
                  className="btn-primary"
                >
                  Create First Article
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-secondary-900 line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        article.visibility === 'public' ? 'bg-green-100 text-green-700' :
                        article.visibility === 'internal' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {article.visibility}
                      </span>
                    </div>
                  </div>

                  <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                    {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs bg-secondary-100 text-secondary-600 rounded"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-secondary-500">
                          +{article.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-secondary-500">
                    <span>Version {article.version}</span>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-secondary-100 rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                      {hasPermission('wiki:write') && (
                        <>
                          <button className="p-1 hover:bg-secondary-100 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                          {hasPermission('wiki:delete') && (
                            <button className="p-1 hover:bg-red-100 rounded text-red-600">
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
    </div>
  );
};

export default WikiBrowser;