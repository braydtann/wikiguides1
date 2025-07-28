import React, { useState, useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { X, Upload, Palette } from 'lucide-react';

const CreateWikiModal = ({ isOpen, onClose, onSuccess, editingWiki = null }) => {
  const { createWiki, updateWiki } = useWiki();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: '#3b82f6',
    is_public: false,
    allowed_roles: ['admin', 'manager', 'agent']
  });
  const [loading, setLoading] = useState(false);
  const [iconType, setIconType] = useState('emoji'); // emoji, upload, lucide

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
  ];

  const popularEmojis = [
    '📚', '📖', '📋', '📝', '💼', '🏢', '🔧', '💡', 
    '🚀', '⚡', '🎯', '📊', '🔍', '💻', '🌟', '🎨'
  ];

  const roleOptions = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'contributor', label: 'Contributor' },
    { value: 'agent', label: 'Agent' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' }
  ];

  useEffect(() => {
    if (editingWiki) {
      setFormData({
        name: editingWiki.name,
        description: editingWiki.description || '',
        icon: editingWiki.icon || '📚',
        color: editingWiki.color || '#3b82f6',
        is_public: editingWiki.is_public || false,
        allowed_roles: editingWiki.allowed_roles || ['admin', 'manager', 'agent']
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: '📚',
        color: '#3b82f6',
        is_public: false,
        allowed_roles: ['admin', 'manager', 'agent']
      });
    }
  }, [editingWiki, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      let result;
      if (editingWiki) {
        result = await updateWiki(editingWiki.id, formData);
      } else {
        result = await createWiki(formData);
      }
      
      if (result.success) {
        onSuccess && onSuccess(result.data);
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          icon: '📚',
          color: '#3b82f6',
          is_public: false,
          allowed_roles: ['admin', 'manager', 'agent']
        });
      }
    } catch (error) {
      console.error('Error saving wiki:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      allowed_roles: prev.allowed_roles.includes(role)
        ? prev.allowed_roles.filter(r => r !== role)
        : [...prev.allowed_roles, role]
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, icon: event.target.result }));
        setIconType('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingWiki ? 'Edit Knowledge Base' : 'Create New Knowledge Base'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Knowledge Base Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Technical Documentation, HR Policies"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of what this knowledge base contains"
              />
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Icon
            </label>
            
            <div className="flex items-center space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setIconType('emoji')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  iconType === 'emoji'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Emoji
              </button>
              <button
                type="button"
                onClick={() => setIconType('upload')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  iconType === 'upload'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Upload
              </button>
            </div>

            {iconType === 'emoji' ? (
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

          {/* Access Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Access Control
            </label>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Public Access - Anyone can view this knowledge base
                </span>
              </label>

              {!formData.is_public && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Roles
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {roleOptions.map((role) => (
                      <label key={role.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.allowed_roles.includes(role.value)}
                          onChange={() => handleRoleChange(role.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {role.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                  {formData.name || 'Knowledge Base Name'}
                </h5>
                <p className="text-sm text-gray-600">
                  {formData.description || 'Description will appear here'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
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
              {loading ? 'Saving...' : (editingWiki ? 'Update' : 'Create')} Knowledge Base
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWikiModal;