import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// In production Kubernetes environment, use relative URLs that will be routed by ingress
const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl.trim() !== 'undefined') {
    return envUrl;
  }
  // Use relative URLs - Kubernetes ingress will route /api to backend service
  return '';
};

const API_BASE_URL = getBackendUrl();

const WikiContext = createContext();

export const WikiProvider = ({ children }) => {
  const { token } = useAuth();
  
  // Enhanced state for multi-wiki system
  const [wikis, setWikis] = useState([]);
  const [selectedWiki, setSelectedWiki] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // =============== WIKI MANAGEMENT ===============

  // Fetch all wikis
  const fetchWikis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/wikis`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWikis(data);
      }
    } catch (error) {
      console.error('Error fetching wikis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create wiki
  const createWiki = async (wikiData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wikis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(wikiData)
      });
      
      if (response.ok) {
        const newWiki = await response.json();
        setWikis(prev => [...prev, newWiki]);
        return { success: true, data: newWiki };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create wiki');
      }
    } catch (error) {
      console.error('Error creating wiki:', error);
      return { success: false, error: error.message };
    }
  };

  // Update wiki
  const updateWiki = async (wikiId, wikiData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wikis/${wikiId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(wikiData)
      });
      
      if (response.ok) {
        const updatedWiki = await response.json();
        setWikis(prev => 
          prev.map(wiki => wiki.id === wikiId ? updatedWiki : wiki)
        );
        if (selectedWiki?.id === wikiId) {
          setSelectedWiki(updatedWiki);
        }
        return { success: true, data: updatedWiki };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update wiki');
      }
    } catch (error) {
      console.error('Error updating wiki:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete wiki
  const deleteWiki = async (wikiId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wikis/${wikiId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setWikis(prev => prev.filter(wiki => wiki.id !== wikiId));
        if (selectedWiki?.id === wikiId) {
          setSelectedWiki(null);
          setCategories([]);
          setSubcategories([]);
          setArticles([]);
        }
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete wiki');
      }
    } catch (error) {
      console.error('Error deleting wiki:', error);
      return { success: false, error: error.message };
    }
  };

  // =============== CATEGORY MANAGEMENT ===============

  // Fetch categories
  const fetchCategories = async (wikiId = null) => {
    setLoading(true);
    try {
      const targetWikiId = wikiId || selectedWiki?.id;
      const url = targetWikiId 
        ? `${API_BASE_URL}/api/wiki/categories?wiki_id=${targetWikiId}`
        : `${API_BASE_URL}/api/wiki/categories`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...categoryData,
          wiki_id: selectedWiki?.id
        })
      });
      
      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        return { success: true, data: newCategory };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.message };
    }
  };

  // Update category
  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(prev => 
          prev.map(cat => cat.id === categoryId ? updatedCategory : cat)
        );
        return { success: true, data: updatedCategory };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete category
  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory(null);
          setSubcategories([]);
          setArticles([]);
        }
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: error.message };
    }
  };

  // =============== SUBCATEGORY MANAGEMENT ===============

  // Fetch subcategories
  const fetchSubcategories = async (categoryId, includeNested = true) => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/wiki/categories/${categoryId}/subcategories?include_nested=${includeNested}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create subcategory
  const createSubcategory = async (subcategoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subcategoryData)
      });
      
      if (response.ok) {
        const newSubcategory = await response.json();
        // Refresh subcategories to get proper nested structure
        if (selectedCategory) {
          await fetchSubcategories(selectedCategory.id);
        }
        return { success: true, data: newSubcategory };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create subcategory');
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
      return { success: false, error: error.message };
    }
  };

  // Update subcategory
  const updateSubcategory = async (subcategoryId, subcategoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/subcategories/${subcategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subcategoryData)
      });
      
      if (response.ok) {
        const updatedSubcategory = await response.json();
        // Refresh subcategories to get proper nested structure
        if (selectedCategory) {
          await fetchSubcategories(selectedCategory.id);
        }
        return { success: true, data: updatedSubcategory };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update subcategory');
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete subcategory
  const deleteSubcategory = async (subcategoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Refresh subcategories to get proper nested structure
        if (selectedCategory) {
          await fetchSubcategories(selectedCategory.id);
        }
        if (selectedSubcategory?.id === subcategoryId) {
          setSelectedSubcategory(null);
          setArticles([]);
        }
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      return { success: false, error: error.message };
    }
  };

  // =============== ARTICLE MANAGEMENT ===============

  // Fetch articles
  const fetchArticles = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.wiki_id || selectedWiki?.id) {
        queryParams.append('wiki_id', filters.wiki_id || selectedWiki.id);
      }
      if (filters.subcategory_id) {
        queryParams.append('subcategory_id', filters.subcategory_id);
      }
      if (filters.category_id) {
        queryParams.append('category_id', filters.category_id);
      }
      if (filters.search_query) {
        queryParams.append('search_query', filters.search_query);
      }
      if (filters.visibility) {
        queryParams.append('visibility', filters.visibility);
      }
      if (filters.tags) {
        queryParams.append('tags', filters.tags);
      }

      const response = await fetch(`${API_BASE_URL}/api/wiki/articles?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create article
  const createArticle = async (articleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      });
      
      if (response.ok) {
        const newArticle = await response.json();
        setArticles(prev => [...prev, newArticle]);
        return { success: true, data: newArticle };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create article');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      return { success: false, error: error.message };
    }
  };

  // Update article
  const updateArticle = async (articleId, articleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      });
      
      if (response.ok) {
        const updatedArticle = await response.json();
        setArticles(prev => 
          prev.map(article => article.id === articleId ? updatedArticle : article)
        );
        return { success: true, data: updatedArticle };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update article');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete article
  const deleteArticle = async (articleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setArticles(prev => prev.filter(article => article.id !== articleId));
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      return { success: false, error: error.message };
    }
  };

  // Get article versions
  const getArticleVersions = async (articleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/articles/${articleId}/versions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching article versions:', error);
      return [];
    }
  };

  // =============== SEARCH FUNCTIONALITY ===============

  // Search functionality
  const searchContent = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return { articles: [], categories: [], subcategories: [] };
    } catch (error) {
      console.error('Error searching content:', error);
      return { articles: [], categories: [], subcategories: [] };
    }
  };

  // Auto-fetch wikis on mount
  useEffect(() => {
    if (token) {
      fetchWikis();
    }
  }, [token]);

  const value = {
    // State
    wikis,
    selectedWiki,
    categories,
    subcategories,
    articles,
    selectedCategory,
    selectedSubcategory,
    loading,
    viewMode,

    // Wiki functions
    fetchWikis,
    createWiki,
    updateWiki,
    deleteWiki,
    setSelectedWiki,

    // Category functions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Subcategory functions
    fetchSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,

    // Article functions
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleVersions,

    // Search
    searchContent,

    // Selection and view
    setSelectedCategory,
    setSelectedSubcategory,
    setViewMode
  };

  return (
    <WikiContext.Provider value={value}>
      {children}
    </WikiContext.Provider>
  );
};

export const useWiki = () => {
  const context = useContext(WikiContext);
  if (!context) {
    throw new Error('useWiki must be used within a WikiProvider');
  }
  return context;
};