import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const AdminProvider = ({ children }) => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [systemSettings, setSystemSettings] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/analytics`, { headers });
      setAnalytics(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error('Error fetching analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch system settings
  const fetchSystemSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/settings`, { headers });
      setSystemSettings(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch system settings');
      console.error('Error fetching system settings:', error);
      return null;
    }
  };

  // Update system settings
  const updateSystemSettings = async (settingsData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/admin/settings`, settingsData, { headers });
      setSystemSettings(response.data);
      toast.success('System settings updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update system settings';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, { headers });
      setAllUsers(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async (limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/recent-activity?limit=${limit}`, { headers });
      setRecentActivity(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch recent activity');
      console.error('Error fetching recent activity:', error);
      return [];
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/users/${userId}/role`, { role: newRole }, { headers });
      
      // Update local state
      setAllUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success('User role updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update user role';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchSystemSettings();
      fetchAllUsers();
      fetchRecentActivity();
    }
  }, [token]);

  const value = {
    // State
    analytics,
    systemSettings,
    allUsers,
    recentActivity,
    loading,

    // Methods
    fetchAnalytics,
    fetchSystemSettings,
    updateSystemSettings,
    fetchAllUsers,
    fetchRecentActivity,
    updateUserRole,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};