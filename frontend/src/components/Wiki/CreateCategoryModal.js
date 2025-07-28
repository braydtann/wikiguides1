import React, { useState } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { X } from 'lucide-react';

const CreateCategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const { createCategory } = useWiki();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'book-open',
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const result = await createCategory(formData);
      if (result.success) {
        setFormData({ name: '', description: '', icon: 'book-open', color: '#3b82f6' });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Create New Category</h3>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="input-field"
                placeholder="Enter category description"
              />
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-secondary-700 mb-1">
                Icon
              </label>
              <select
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="book-open">📖 Book Open</option>
                <option value="settings">⚙️ Settings</option>
                <option value="search">🔍 Search</option>
                <option value="help">❓ Help</option>
                <option value="users">👥 Users</option>
              </select>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-secondary-700 mb-1">
                Color
              </label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full h-10 rounded border border-secondary-300 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="btn-primary"
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