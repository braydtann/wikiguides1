import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import RichTextEditor from '../Common/RichTextEditor';
import { 
  Save, 
  ArrowLeft, 
  Tag, 
  Eye, 
  Globe, 
  Lock,
  Building,
  Users,
  X
} from 'lucide-react';

const ArticleEditor = ({ mode = 'create', articleId = null }) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { 
    categories, 
    subcategories, 
    getArticle, 
    createArticle, 
    updateArticle,
    fetchSubcategories 
  } = useWiki();

  const [formData, setFormData] = useState({
    title: '  ',
    content: '',
    subcategory_id: '',
    visibility: 'internal',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');

  // Load existing article if editing
  useEffect(() => {
    if (mode === 'edit' && articleId) {
      const loadArticle = async () => {
        setLoading(true);
        const result = await getArticle(articleId);
        if (result.success) {
          setFormData({
            title: result.data.title,
            content: result.data.content,
            subcategory_id: result.data.subcategory_id,
            visibility: result.data.visibility,
            tags: result.data.tags || []
          });
        }
        setLoading(false);
      };
      loadArticle();
    }
  }, [mode, articleId, getArticle]);

  // Load subcategories when component mounts
  useEffect(() => {
    if (categories.length > 0) {
      fetchSubcategories();
    }
  }, [categories, fetchSubcategories]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.subcategory_id) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      let result;
      if (mode === 'create') {
        result = await createArticle(formData);
      } else {
        result = await updateArticle(articleId, formData, changeNotes);
      }

      if (result.success) {
        navigate('/wiki');
      }
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/wiki');
  };

  const getSubcategoryName = (subcategoryId) => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : '';
  };

  const getCategoryName = (subcategoryId) => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return '';
    const category = categories.find(cat => cat.id === subcategory.category_id);
    return category ? category.name : '';
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Visible to everyone' },
    { value: 'internal', label: 'Internal', icon: Building, description: 'Visible to organization members' },
    { value: 'department', label: 'Department', icon: Users, description: 'Visible to department members' },
    { value: 'private', label: 'Private', icon: Lock, description: 'Visible only to you' }
  ];

  if (!hasPermission('wiki:write')) {
    return (
      <div className="card text-center py-12">
        <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Access Denied</h3>
        <p className="text-secondary-500">You don't have permission to {mode} articles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-secondary-600">Loading article...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleCancel}
              className="flex items-center text-secondary-600 hover:text-secondary-800 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wiki
            </button>
            <h1 className="text-3xl font-bold text-secondary-900">
              {mode === 'create' ? 'Create New Article' : 'Edit Article'}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.title.trim() || !formData.content.trim()}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create Article' : 'Update Article'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Article Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter article title..."
              className="input-field text-xl font-semibold"
            />
          </div>

          {/* Content Editor */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-secondary-700 mb-4">
              Article Content *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder="Start writing your article..."
              height="400px"
            />
          </div>

          {/* Change Notes (for editing mode) */}
          {mode === 'edit' && (
            <div className="card p-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Change Notes (Optional)
              </label>
              <textarea
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="Describe what you've changed..."
                className="input-field"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category and Subcategory */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Location</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Subcategory *
                </label>
                <select
                  value={formData.subcategory_id}
                  onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {getCategoryName(subcategory.id)} / {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.subcategory_id && (
                <div className="text-sm text-secondary-600 bg-secondary-50 p-3 rounded-lg">
                  <strong>Category:</strong> {getCategoryName(formData.subcategory_id)}<br />
                  <strong>Subcategory:</strong> {getSubcategoryName(formData.subcategory_id)}
                </div>
              )}
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Visibility
            </h3>
            
            <div className="space-y-3">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.visibility === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={formData.visibility === option.value}
                      onChange={(e) => handleInputChange('visibility', e.target.value)}
                      className="sr-only"
                    />
                    <Icon className={`h-5 w-5 mr-3 mt-0.5 ${
                      formData.visibility === option.value ? 'text-primary-600' : 'text-secondary-400'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        formData.visibility === option.value ? 'text-primary-900' : 'text-secondary-900'
                      }`}>
                        {option.label}
                      </div>
                      <div className={`text-sm ${
                        formData.visibility === option.value ? 'text-primary-700' : 'text-secondary-500'
                      }`}>
                        {option.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Tags
            </h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddTag}
                  disabled={!currentTag.trim()}
                  className="btn-primary px-3 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;