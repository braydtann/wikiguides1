import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Auto-detect backend URL - in Kubernetes, /api routes are automatically routed to backend
const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  // In Kubernetes environment, use current origin for /api routes
  return window.location.origin;
};

const API_BASE_URL = getBackendUrl();

const WikiContext = createContext();

export const WikiProvider = ({ children }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/categories`, {
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
        body: JSON.stringify(categoryData)
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

  // Fetch subcategories
  const fetchSubcategories = async (categoryId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/wiki/categories/${categoryId}/subcategories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
        setSubcategories(prev => [...prev, newSubcategory]);
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
        setSubcategories(prev => 
          prev.map(sub => sub.id === subcategoryId ? updatedSubcategory : sub)
        );
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
        setSubcategories(prev => prev.filter(sub => sub.id !== subcategoryId));
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

  // Fetch articles
  const fetchArticles = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subcategory_id) {
        queryParams.append('subcategory_id', filters.subcategory_id);
      }
      if (filters.category_id) {
        queryParams.append('category_id', filters.category_id);
      }
      if (filters.search_query) {
        queryParams.append('search_query', filters.search_query);
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

  // Auto-fetch categories on mount
  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const value = {
    // State
    categories,
    subcategories,
    articles,
    selectedCategory,
    selectedSubcategory,
    loading,

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

    // Selection
    setSelectedCategory,
    setSelectedSubcategory
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