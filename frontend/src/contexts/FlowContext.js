import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FlowContext = createContext();

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const FlowProvider = ({ children }) => {
  const { token } = useAuth();
  const [flows, setFlows] = useState([]);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [currentExecution, setCurrentExecution] = useState(null);
  const [flowSteps, setFlowSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Fetch flows
  const fetchFlows = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags);

      const response = await axios.get(`${API_BASE_URL}/api/flows?${params}`, { headers });
      setFlows(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch flows');
      console.error('Error fetching flows:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get single flow
  const getFlow = async (flowId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/flows/${flowId}`, { headers });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to fetch flow';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Create flow
  const createFlow = async (flowData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/flows`, flowData, { headers });
      setFlows(prev => [...prev, response.data]);
      toast.success('Flow created successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create flow';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update flow
  const updateFlow = async (flowId, flowData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/flows/${flowId}`, flowData, { headers });
      setFlows(prev => prev.map(flow => flow.id === flowId ? response.data : flow));
      toast.success('Flow updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update flow';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete flow
  const deleteFlow = async (flowId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/flows/${flowId}`, { headers });
      setFlows(prev => prev.filter(flow => flow.id !== flowId));
      toast.success('Flow deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete flow';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch flow steps
  const fetchFlowSteps = async (flowId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/flows/${flowId}/steps`, { headers });
      setFlowSteps(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch flow steps');
      console.error('Error fetching flow steps:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create flow step
  const createFlowStep = async (flowId, stepData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/flows/${flowId}/steps`, stepData, { headers });
      setFlowSteps(prev => [...prev, response.data].sort((a, b) => a.step_order - b.step_order));
      toast.success('Step created successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create step';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update flow step
  const updateFlowStep = async (flowId, stepId, stepData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/flows/${flowId}/steps/${stepId}`, stepData, { headers });
      setFlowSteps(prev => prev.map(step => step.id === stepId ? response.data : step).sort((a, b) => a.step_order - b.step_order));
      toast.success('Step updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update step';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete flow step
  const deleteFlowStep = async (flowId, stepId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/flows/${flowId}/steps/${stepId}`, { headers });
      setFlowSteps(prev => prev.filter(step => step.id !== stepId));
      toast.success('Step deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete step';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Start flow execution
  const startFlowExecution = async (flowId, sessionData = {}) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/flows/${flowId}/execute`, {
        flow_id: flowId,
        session_data: sessionData
      }, { headers });
      setCurrentExecution(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to start flow execution';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get flow execution
  const getFlowExecution = async (flowId, sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/flows/${flowId}/execute/${sessionId}`, { headers });
      setCurrentExecution(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to get flow execution';
      return { success: false, error: message };
    }
  };

  // Submit step answer
  const submitStepAnswer = async (flowId, sessionId, stepId, answer, metadata = {}) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/flows/${flowId}/execute/${sessionId}/answer`, {
        step_id: stepId,
        answer: answer,
        metadata: metadata
      }, { headers });
      
      // Update current execution status
      if (currentExecution) {
        const updatedExecution = { ...currentExecution };
        updatedExecution.answers = updatedExecution.answers || {};
        updatedExecution.answers[stepId] = {
          answer: answer,
          metadata: metadata,
          answered_at: new Date().toISOString()
        };
        updatedExecution.current_step_id = response.data.next_step_id;
        setCurrentExecution(updatedExecution);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to submit answer';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get flow summary
  const getFlowSummary = async (flowId, sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/flows/${flowId}/execute/${sessionId}/summary`, { headers });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to get flow summary';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchFlows();
    }
  }, [token]);

  const value = {
    // State
    flows,
    currentFlow,
    currentExecution,
    flowSteps,
    loading,

    // Setters
    setCurrentFlow,
    setCurrentExecution,

    // Flow methods
    fetchFlows,
    getFlow,
    createFlow,
    updateFlow,
    deleteFlow,

    // Step methods
    fetchFlowSteps,
    createFlowStep,
    updateFlowStep,
    deleteFlowStep,

    // Execution methods
    startFlowExecution,
    getFlowExecution,
    submitStepAnswer,
    getFlowSummary,
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
};