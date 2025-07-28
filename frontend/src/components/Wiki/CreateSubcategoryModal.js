import React, { useState, useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { X } from 'lucide-react';

const CreateSubcategoryModal = ({ isOpen, onClose, onSuccess, categoryId, parentSubcategoryId = null }) => {
  const { createSubcategory } = useWiki();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: categoryId || '',
    parent_subcategory_id: parentSubcategoryId || null,
    order_index: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) return;

    setLoading(true);
    try {
      const result = await createSubcategory(formData);
      if (result.success) {
        setFormData({ 
          name: '', 
          description: '', 
          category_id: categoryId || '', 
          parent_subcategory_id: parentSubcategoryId || null,
          order_index: 0
        });
        onSuccess && onSuccess(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Update form data when props change
  useEffect(() => {
    if (categoryId !== formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: categoryId || '' }));
    }
    if (parentSubcategoryId !== formData.parent_subcategory_id) {
      setFormData(prev => ({ ...prev, parent_subcategory_id: parentSubcategoryId || null }));
    }
  }, [categoryId, parentSubcategoryId, formData.category_id, formData.parent_subcategory_id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Create New {parentSubcategoryId ? 'Nested ' : ''}Subcategory
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter subcategory name"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter subcategory description"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first. Leave as 0 for automatic ordering.
              </p>
            </div>

            {parentSubcategoryId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will be created as a nested subcategory. 
                  It can contain articles and additional nested subcategories.
                </p>
              </div>
            )}
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
              disabled={loading || !formData.name.trim() || !formData.category_id}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Subcategory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubcategoryModal;