import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFlow } from '../../contexts/FlowContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateFlowModal from './CreateFlowModal';
import { 
  GitBranch, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play,
  Eye,
  Tag,
  Clock,
  Users
} from 'lucide-react';

const FlowBrowser = () => {
  const { 
    flows, 
    fetchFlows,
    deleteFlow,
    loading
  } = useFlow();
  
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchFlows();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await fetchFlows({ search: searchQuery.trim() });
    } else {
      await fetchFlows();
    }
  };

  const handleDeleteFlow = async (flowId, flowTitle) => {
    if (window.confirm(`Are you sure you want to delete "${flowTitle}"?`)) {
      await deleteFlow(flowId);
    }
  };

  const handleCreateSuccess = () => {
    // Refresh flows after successful creation
    fetchFlows();
  };

  const getStepTypeIcon = (stepType) => {
    const icons = {
      'multiple_choice': '🔘',
      'text_input': '📝',
      'information': 'ℹ️',
      'conditional_branch': '🔀',
      'subflow': '🔗'
    };
    return icons[stepType] || '❓';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-secondary-600">Loading flows...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Guided Flows</h1>
            <p className="text-secondary-600 mt-1">
              Create and manage interactive guided workflows
            </p>
          </div>
          
          {hasPermission('flow:write') && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Flow
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flows by title, description, or tags..."
              className="input-field pl-10 pr-4"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1 px-3 text-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Flows Grid */}
      {flows.length === 0 ? (
        <div className="card text-center py-12">
          <GitBranch className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No flows found
          </h3>
          <p className="text-secondary-500 mb-6">
            {searchQuery ? 'Try adjusting your search criteria' : 'Create your first guided flow to get started'}
          </p>
          {!searchQuery && hasPermission('flow:write') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create First Flow
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <div key={flow.id} className="card hover:shadow-md transition-shadow">
              {/* Flow Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-900 line-clamp-2 mb-1">
                    {flow.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-secondary-500">
                    <span className={`px-2 py-1 rounded-full ${
                      flow.visibility === 'public' ? 'bg-green-100 text-green-700' :
                      flow.visibility === 'internal' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {flow.visibility}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      v{flow.version}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  {hasPermission('flow:execute') && (
                    <Link
                      to={`/flows/${flow.id}/execute`}
                      className="p-1 hover:bg-green-100 rounded text-green-600"
                      title="Execute Flow"
                    >
                      <Play className="h-4 w-4" />
                    </Link>
                  )}
                  <button 
                    className="p-1 hover:bg-secondary-100 rounded"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {hasPermission('flow:write') && (
                    <>
                      <Link
                        to={`/flows/${flow.id}/edit`}
                        className="p-1 hover:bg-secondary-100 rounded"
                        title="Edit Flow"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {hasPermission('flow:delete') && (
                        <button 
                          onClick={() => handleDeleteFlow(flow.id, flow.title)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                          title="Delete Flow"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Flow Description */}
              {flow.description && (
                <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                  {flow.description}
                </p>
              )}

              {/* Flow Tags */}
              {flow.tags && flow.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {flow.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs bg-secondary-100 text-secondary-600 rounded"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {flow.tags.length > 3 && (
                    <span className="text-xs text-secondary-500">
                      +{flow.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Flow Stats */}
              <div className="flex items-center justify-between text-sm text-secondary-500 pt-3 border-t border-secondary-100">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Created by {flow.created_by}
                </span>
                <span>
                  {new Date(flow.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Execute Button */}
              {hasPermission('flow:execute') && (
                <div className="mt-4 pt-3 border-t border-secondary-100">
                  <Link
                    to={`/flows/${flow.id}/execute`}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Flow
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center py-6">
          <div className="text-2xl font-bold text-primary-600">{flows.length}</div>
          <div className="text-sm text-secondary-600">Total Flows</div>
        </div>
        <div className="card text-center py-6">
          <div className="text-2xl font-bold text-green-600">
            {flows.filter(f => f.is_active).length}
          </div>
          <div className="text-sm text-secondary-600">Active Flows</div>
        </div>
        <div className="card text-center py-6">
          <div className="text-2xl font-bold text-blue-600">
            {flows.filter(f => f.visibility === 'public').length}
          </div>
          <div className="text-sm text-secondary-600">Public Flows</div>
        </div>
      </div>
    </div>
  );
};

export default FlowBrowser;