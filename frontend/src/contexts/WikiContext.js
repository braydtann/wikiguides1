import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WikiContext = createContext();

export const useWiki = () => {
  const context = useContext(WikiContext);
  if (!context) {
    throw new Error('useWiki must be used within a WikiProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const WikiProvider = ({ children }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/wiki/categories`, { headers });
      setCategories(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (categoryData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wiki/categories`, categoryData, { headers });
      setCategories(prev => [...prev, response.data]);
      toast.success('Category created successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create category';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update category
  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/wiki/categories/${categoryId}`, categoryData, { headers });
      setCategories(prev => prev.map(cat => cat.id === categoryId ? response.data : cat));
      toast.success('Category updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update category';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete category
  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/wiki/categories/${categoryId}`, { headers });
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete category';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async (categoryId = null) => {
    try {
      setLoading(true);
      const url = categoryId 
        ? `${API_BASE_URL}/api/wiki/subcategories?category_id=${categoryId}`
        : `${API_BASE_URL}/api/wiki/subcategories`;
      const response = await axios.get(url, { headers });
      setSubcategories(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch subcategories');
      console.error('Error fetching subcategories:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create subcategory
  const createSubcategory = async (subcategoryData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wiki/subcategories`, subcategoryData, { headers });
      setSubcategories(prev => [...prev, response.data]);
      toast.success('Subcategory created successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create subcategory';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete subcategory
  const deleteSubcategory = async (subcategoryId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/wiki/subcategories/${subcategoryId}`, { headers });
      setSubcategories(prev => prev.filter(sub => sub.id !== subcategoryId));
      toast.success('Subcategory deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete subcategory';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch articles
  const fetchArticles = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.visibility) params.append('visibility', filters.visibility);

      const response = await axios.get(`${API_BASE_URL}/api/wiki/articles?${params}`, { headers });
      setArticles(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch articles');
      console.error('Error fetching articles:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get single article
  const getArticle = async (articleId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wiki/articles/${articleId}`, { headers });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to fetch article';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Create article
  const createArticle = async (articleData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wiki/articles`, articleData, { headers });
      setArticles(prev => [...prev, response.data]);
      toast.success('Article created successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create article';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update article
  const updateArticle = async (articleId, articleData, changeNotes = '') => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/wiki/articles/${articleId}?change_notes=${encodeURIComponent(changeNotes)}`,
        articleData,
        { headers }
      );
      setArticles(prev => prev.map(article => article.id === articleId ? response.data : article));
      toast.success('Article updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update article';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete article
  const deleteArticle = async (articleId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/wiki/articles/${articleId}`, { headers });
      setArticles(prev => prev.filter(article => article.id !== articleId));
      toast.success('Article deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete article';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get article versions
  const getArticleVersions = async (articleId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wiki/articles/${articleId}/versions`, { headers });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to fetch article versions';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Search wiki
  const searchWiki = async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wiki/search?q=${encodeURIComponent(query)}`, { headers });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Search failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Load initial data
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

    // Setters
    setSelectedCategory,
    setSelectedSubcategory,

    // Category methods
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Subcategory methods
    fetchSubcategories,
    createSubcategory,
    deleteSubcategory,

    // Article methods
    fetchArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleVersions,

    // Search
    searchWiki,
  };

  return (
    <WikiContext.Provider value={value}>
      {children}
    </WikiContext.Provider>
  );
};