import React, { useState } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { X, Upload, Palette } from 'lucide-react';

const CreateCategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const { createCategory } = useWiki();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    icon_type: 'emoji',
    color: '#3b82f6',
    order_index: 0
  });
  const [loading, setLoading] = useState(false);

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
  ];

  const popularEmojis = [
    '📚', '📖', '📋', '📝', '💼', '🏢', '🔧', '💡', 
    '🚀', '⚡', '🎯', '📊', '🔍', '💻', '🌟', '🎨'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const result = await createCategory(formData);
      if (result.success) {
        setFormData({
          name: '',
          description: '',
          icon: '📚',
          icon_type: 'emoji',
          color: '#3b82f6',
          order_index: 0
        });
        onSuccess && onSuccess(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ 
          ...prev, 
          icon: event.target.result,
          icon_type: 'upload'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Category</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category description"
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category Icon
              </label>
              
              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon_type: 'emoji' }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.icon_type === 'emoji'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon_type: 'upload' }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.icon_type === 'upload'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Upload
                </button>
              </div>

              {formData.icon_type === 'emoji' ? (
                <div className="grid grid-cols-8 gap-2">
                  {popularEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                      className={`p-3 text-2xl rounded-lg border transition-colors ${
                        formData.icon === emoji
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {formData.icon && formData.icon.startsWith('data:') ? (
                      <img 
                        src={formData.icon} 
                        alt="Custom icon" 
                        className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center bg-gray-50">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Choose Image
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Palette className="inline w-4 h-4 mr-1" />
                Theme Color
              </label>
              <div className="flex flex-wrap gap-3">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-800 scale-110 shadow-lg'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>

            <div>
              <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-1">
                Order Index
              </label>
              <input
                type="number"
                id="order_index"
                name="order_index"
                value={formData.order_index}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first. Leave as 0 for automatic ordering.
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${formData.color}15`, borderColor: formData.color }}
                >
                  {formData.icon && formData.icon.startsWith('data:') ? (
                    <img src={formData.icon} alt="Preview" className="w-8 h-8 rounded" />
                  ) : (
                    <span className="text-2xl">{formData.icon}</span>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">
                    {formData.name || 'Category Name'}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {formData.description || 'Description will appear here'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;