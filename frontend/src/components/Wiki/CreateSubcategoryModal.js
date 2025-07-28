import React, { useState } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { X } from 'lucide-react';

const CreateSubcategoryModal = ({ isOpen, onClose, onSuccess, categoryId }) => {
  const { createSubcategory } = useWiki();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: categoryId || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) return;

    setLoading(true);
    try {
      const result = await createSubcategory(formData);
      if (result.success) {
        setFormData({ name: '', description: '', category_id: categoryId || '' });
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

  // Update category_id when it changes
  React.useEffect(() => {
    if (categoryId && categoryId !== formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: categoryId }));
    }
  }, [categoryId, formData.category_id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Create New Subcategory</h3>
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
                placeholder="Enter subcategory name"
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
                placeholder="Enter subcategory description"
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
              disabled={loading || !formData.name.trim() || !formData.category_id}
              className="btn-primary"
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