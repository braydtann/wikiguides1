import React, { useState } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { X, Tag } from 'lucide-react';
import RichTextEditor from '../Common/RichTextEditor';

const CreateArticleModal = ({ isOpen, onClose, onSuccess, subcategoryId }) => {
  const { createArticle } = useWiki();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subcategory_id: subcategoryId || '',
    visibility: 'internal',
    tags: [],
    images: []
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.subcategory_id) return;

    setLoading(true);
    try {
      const result = await createArticle(formData);
      if (result.success) {
        setFormData({
          title: '',
          content: '',
          subcategory_id: subcategoryId || '',
          visibility: 'internal',
          tags: [],
          images: []
        });
        setNewTag('');
        onSuccess && onSuccess(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Update subcategory_id when it changes
  React.useEffect(() => {
    if (subcategoryId && subcategoryId !== formData.subcategory_id) {
      setFormData(prev => ({ ...prev, subcategory_id: subcategoryId }));
    }
  }, [subcategoryId, formData.subcategory_id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Create New Article</h3>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter article title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Content *
              </label>
              <div className="border border-secondary-300 rounded-md">
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your article content here..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-secondary-700 mb-1">
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="internal">Internal - Company members only</option>
                <option value="department">Department - Department members only</option>
                <option value="private">Private - Only you</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary-500 hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="input-field mr-2"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim() || !formData.subcategory_id}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal;