import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// In production Kubernetes environment, use relative URLs that will be routed by ingress
const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl.trim() !== 'undefined') {
    return envUrl;
  }
  // Use relative URLs - Kubernetes ingress will route /api to backend service
  return '';
};

const API_BASE_URL = getBackendUrl();

const FlowContext = createContext();

export const FlowProvider = ({ children }) => {
  const { token } = useAuth();
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [flowSteps, setFlowSteps] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all flows
  const fetchFlows = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFlows(data);
      }
    } catch (error) {
      console.error('Error fetching flows:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get single flow by ID
  const getFlow = async (flowId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const flow = await response.json();
        setSelectedFlow(flow);
        return { success: true, data: flow };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get flow');
      }
    } catch (error) {
      console.error('Error getting flow:', error);
      return { success: false, error: error.message };
    }
  };

  // Create flow
  const createFlow = async (flowData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(flowData)
      });
      
      if (response.ok) {
        const newFlow = await response.json();
        setFlows(prev => [...prev, newFlow]);
        return { success: true, data: newFlow };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create flow');
      }
    } catch (error) {
      console.error('Error creating flow:', error);
      return { success: false, error: error.message };
    }
  };

  // Update flow
  const updateFlow = async (flowId, flowData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(flowData)
      });
      
      if (response.ok) {
        const updatedFlow = await response.json();
        setFlows(prev => 
          prev.map(flow => flow.id === flowId ? updatedFlow : flow)
        );
        return { success: true, data: updatedFlow };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update flow');
      }
    } catch (error) {
      console.error('Error updating flow:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete flow
  const deleteFlow = async (flowId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setFlows(prev => prev.filter(flow => flow.id !== flowId));
        const message = 'Flow deleted successfully';
        return { success: true, message };
      } else {
        const error = await response.json();
        const message = error.detail || 'Failed to delete flow';
        throw new Error(message);
      }
    } catch (error) {
      console.error('Error deleting flow:', error);
      const message = error.response?.data?.detail || 'Failed to delete flow';
      return { success: false, error: message };
    }
  };

  // Fetch flow steps
  const fetchFlowSteps = async (flowId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}/steps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFlowSteps(data);
      }
    } catch (error) {
      console.error('Error fetching flow steps:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create flow step
  const createFlowStep = async (flowId, stepData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stepData)
      });
      
      if (response.ok) {
        const newStep = await response.json();
        setFlowSteps(prev => [...prev, newStep]);
        return { success: true, data: newStep };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create step');
      }
    } catch (error) {
      console.error('Error creating step:', error);
      return { success: false, error: error.message };
    }
  };

  // Update flow step
  const updateFlowStep = async (stepId, stepData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flow-steps/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stepData)
      });
      
      if (response.ok) {
        const updatedStep = await response.json();
        setFlowSteps(prev => 
          prev.map(step => step.id === stepId ? updatedStep : step)
        );
        return { success: true, data: updatedStep };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update step');
      }
    } catch (error) {
      console.error('Error updating step:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete flow step
  const deleteFlowStep = async (stepId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flow-steps/${stepId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setFlowSteps(prev => prev.filter(step => step.id !== stepId));
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete step');
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      return { success: false, error: error.message };
    }
  };

  // Flow execution functions
  const startFlowExecution = async (flowId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const session = await response.json();
        setCurrentSession(session);
        return { success: true, data: session };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to start flow execution');
      }
    } catch (error) {
      console.error('Error starting flow execution:', error);
      return { success: false, error: error.message };
    }
  };

  const submitStepResponse = async (sessionId, stepId, response) => {
    try {
      const requestResponse = await fetch(`${API_BASE_URL}/api/flow-sessions/${sessionId}/steps/${stepId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ response })
      });
      
      if (requestResponse.ok) {
        const updatedSession = await requestResponse.json();
        setCurrentSession(updatedSession);
        return { success: true, data: updatedSession };
      } else {
        const error = await requestResponse.json();
        throw new Error(error.detail || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting step response:', error);
      return { success: false, error: error.message };
    }
  };

  const getFlowSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flow-sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const session = await response.json();
        setCurrentSession(session);
        return { success: true, data: session };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get session');
      }
    } catch (error) {
      console.error('Error getting flow session:', error);
      return { success: false, error: error.message };
    }
  };

  const generateFlowSummary = async (sessionId, format = 'text') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flow-sessions/${sessionId}/summary?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const summary = await response.json();
        return { success: true, data: summary };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating flow summary:', error);
      return { success: false, error: error.message };
    }
  };

  // Additional functions that components expect
  const getFlowExecution = async (flowId, sessionId) => {
    return await getFlowSession(sessionId);
  };

  const submitStepAnswer = async (flowId, sessionId, stepId, answer) => {
    return await submitStepResponse(sessionId, stepId, answer);
  };

  const getFlowSummary = async (flowId, sessionId, format = 'text') => {
    return await generateFlowSummary(sessionId, format);
  };

  // Auto-fetch flows on mount
  useEffect(() => {
    if (token) {
      fetchFlows();
    }
  }, [token]);

  const value = {
    // State
    flows,
    selectedFlow,
    flowSteps,
    currentSession,
    loading,

    // Flow functions
    fetchFlows,
    getFlow,
    createFlow,
    updateFlow,
    deleteFlow,
    setSelectedFlow,

    // Step functions
    fetchFlowSteps,
    createFlowStep,
    updateFlowStep,
    deleteFlowStep,

    // Execution functions
    startFlowExecution,
    submitStepResponse,
    getFlowSession,
    generateFlowSummary,
    setCurrentSession
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};