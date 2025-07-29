import React, { useState, useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Home,
  ChevronRight,
  FileText,
  ArrowRight,
  BookOpen,
  Users,
  Clock,
  Star,
  Filter,
  Grid,
  List,
  Settings2
} from 'lucide-react';

const PublicWikiView = ({ customSettings = null }) => {
  const { 
    selectedWiki,
    categories,
    articles,
    searchContent,
    fetchCategories,
    fetchArticles,
    setSelectedCategory,
    loading
  } = useWiki();
  
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedProductType, setSelectedProductType] = useState(null);

  // Default settings that can be overridden by customSettings
  const settings = {
    theme: {
      primaryColor: '#0891b2', // Teal like Helpjuice
      backgroundColor: '#ffffff',
      headerColor: '#0891b2',
      textColor: '#1f2937',
      accentColor: '#06b6d4'
    },
    layout: {
      showHeader: true,
      showBreadcrumbs: true,
      showSearch: true,
      headerStyle: 'professional', // professional, minimal, branded
      categoryLayout: 'grid', // grid, list, cards
      showIcons: true,
      showDescriptions: true
    },
    branding: {
      logo: null,
      companyName: selectedWiki?.name || 'Knowledge Base',
      headerLinks: [
        { name: 'Home', href: '/' },
        { name: 'Contact Us', href: '/contact' }
      ]
    },
    ...customSettings
  };

  // Mock product types like in Helpjuice screenshots
  const productTypes = [
    {
      id: 'cove-simple',
      name: 'Cove Simple',
      description: 'Basic home security system',
      image: '/api/placeholder/200/150',
      categories: categories.filter(cat => cat.name.includes('Simple') || cat.name.includes('Basic'))
    },
    {
      id: 'cove-connect',
      name: 'Cove Connect',
      description: 'Advanced connected security',
      image: '/api/placeholder/200/150', 
      categories: categories.filter(cat => cat.name.includes('Connect') || cat.name.includes('Advanced'))
    }
  ];

  useEffect(() => {
    if (selectedWiki) {
      fetchCategories(selectedWiki.id);
      fetchArticles({ wiki_id: selectedWiki.id });
    }
  }, [selectedWiki]);

  const handleSearch = async (query) => {
    if (query.trim().length >= 2) {
      const results = await searchContent(query);
      setSearchResults(results);
    } else {
      setSearchResults(null);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const getCategoryIcon = (category) => {
    if (category.icon) {
      if (category.icon.startsWith('data:') || category.icon.startsWith('http')) {
        return <img src={category.icon} alt={category.name} className="h-12 w-12 rounded" />;
      }
      return <span className="text-4xl">{category.icon}</span>;
    }
    return <BookOpen className="h-12 w-12" style={{ color: category.color || settings.theme.primaryColor }} />;
  };

  const renderProductSelector = () => (
    <div className="min-h-screen" style={{ backgroundColor: settings.theme.backgroundColor }}>
      {/* Header */}
      <div 
        className="text-white py-16"
        style={{ 
          background: `linear-gradient(135deg, ${settings.theme.headerColor} 0%, ${settings.theme.accentColor} 100%)`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <nav className="flex justify-center space-x-8 mb-8">
            <button className="text-white hover:text-gray-200 transition-colors">Home</button>
            {settings.branding.headerLinks.map((link, index) => (
              <a 
                key={index} 
                href={link.href} 
                className="text-white hover:text-gray-200 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <h1 className="text-4xl font-bold mb-8">
            Welcome to the Help Center
          </h1>

          <h2 className="text-3xl font-semibold mb-12">
            Which system do you own?
          </h2>

          <div className="relative max-w-md mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-gray-900 text-lg focus:ring-2 focus:ring-white focus:border-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {productTypes.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProductType(product.id)}
                className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="w-32 h-24 mx-auto bg-gray-200 rounded"></div>
                </div>
                <button 
                  className="w-full py-3 px-6 border-2 rounded-lg font-semibold transition-colors"
                  style={{ 
                    borderColor: settings.theme.primaryColor,
                    color: settings.theme.primaryColor
                  }}
                >
                  {product.name}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <button
              onClick={() => setSelectedProductType('employee-resources')}
              className="py-3 px-8 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-colors"
            >
              Employee Resources
            </button>
          </div>

          <div className="mt-8">
            <a href="#" className="text-white hover:text-gray-200 underline">
              How to know what system I have.
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKnowledgeBase = () => (
    <div className="min-h-screen" style={{ backgroundColor: settings.theme.backgroundColor }}>
      {/* Header */}
      <div 
        className="text-white py-8"
        style={{ 
          background: `linear-gradient(135deg, ${settings.theme.headerColor} 0%, ${settings.theme.accentColor} 100%)`
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">{settings.branding.companyName}</h1>
            </div>
            <div className="flex space-x-6">
              {settings.branding.headerLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <span className="text-white">Contact Us</span>
            </div>
          </nav>

          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              {selectedProductType === 'employee-resources' ? 'Employee Resources' : 
               selectedProductType === 'cove-simple' ? 'Cove Simple' :
               selectedProductType === 'cove-connect' ? 'Cove Connect' : 
               selectedWiki?.name}
            </h2>

            <div className="flex justify-center space-x-6 mb-8">
              <button 
                onClick={() => setSelectedProductType('cove-simple')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedProductType === 'cove-simple' 
                    ? 'bg-white text-teal-600' 
                    : 'text-white hover:text-gray-200'
                }`}
              >
                Cove Simple
              </button>
              <button 
                onClick={() => setSelectedProductType('cove-connect')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedProductType === 'cove-connect' 
                    ? 'bg-white text-teal-600' 
                    : 'text-white hover:text-gray-200'
                }`}
              >
                Cove Connect
              </button>
              <button 
                onClick={() => setSelectedProductType('employee-resources')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedProductType === 'employee-resources' 
                    ? 'bg-white text-teal-600' 
                    : 'text-white hover:text-gray-200'
                }`}
              >
                Employee Resources
              </button>
            </div>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="How can we help?"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-4">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-sm text-yellow-800">
              Found {searchResults.articles.length + searchResults.categories.length} results for "{searchQuery}"
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {searchResults ? (
          /* Search Results */
          <div className="space-y-8">
            {searchResults.articles.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Articles</h3>
                <div className="space-y-4">
                  {searchResults.articles.map((article) => (
                    <div key={article.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h4 className="text-lg font-semibold text-blue-600 mb-2">
                        {article.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2" 
                         dangerouslySetInnerHTML={{ 
                           __html: article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                         }}
                      />
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{new Date(article.updated_at).toLocaleDateString()}</span>
                        {article.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {article.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {searchResults.categories.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.categories.map((category) => (
                    <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center mb-3">
                        <div 
                          className="flex items-center justify-center w-12 h-12 rounded-lg mr-4"
                          style={{ backgroundColor: `${category.color}15` }}
                        >
                          {getCategoryIcon(category)}
                        </div>
                        <h4 className="text-lg font-semibold">{category.name}</h4>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                      )}
                      <div className="text-sm text-gray-500">
                        {category.articles_count} articles
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Category Browser */
          <div>
            {/* Category Sections */}
            <div className="space-y-12">
              {categories.map((category) => (
                <section key={category.id} className="group">
                  <div className="flex items-center mb-6">
                    <div 
                      className="flex items-center justify-center w-16 h-16 rounded-full mr-4 shadow-sm"
                      style={{ backgroundColor: settings.theme.primaryColor }}
                    >
                      {React.cloneElement(getCategoryIcon(category), { 
                        className: "h-8 w-8 text-white" 
                      })}
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: settings.theme.textColor }}>
                      {category.name}
                    </h2>
                  </div>

                  {/* Articles in this category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles
                      .filter(article => article.wiki_id === selectedWiki?.id)
                      .slice(0, 6)
                      .map((article) => (
                      <div key={article.id} className="group cursor-pointer">
                        <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <FileText className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-600 group-hover:text-blue-700 mb-1">
                              {article.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Last updated {new Date(article.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {articles.filter(article => article.wiki_id === selectedWiki?.id).length === 0 && (
                    <p className="text-gray-500 italic">No articles available in this category.</p>
                  )}
                </section>
              ))}
            </div>

            {categories.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No categories available
                </h3>
                <p className="text-gray-500">
                  This knowledge base is being set up. Please check back later.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Show product selector if no product type is selected
  if (!selectedProductType) {
    return renderProductSelector();
  }

  // Show the main knowledge base
  return renderKnowledgeBase();
};

export default PublicWikiView;