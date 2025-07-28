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

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState({
    total_articles: 0,
    total_flows: 0,
    total_users: 0,
    total_executions: 0,
    recent_activity: []
  });
  const [systemSettings, setSystemSettings] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch system settings
  const fetchSystemSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSystemSettings(data);
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  // Update system settings
  const updateSystemSettings = async (settings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        const updatedSettings = await response.json();
        setSystemSettings(updatedSettings);
        return { success: true, data: updatedSettings };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating system settings:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setAllUsers(prev => 
          prev.map(user => user.id === userId ? updatedUser : user)
        );
        return { success: true, data: updatedUser };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setAllUsers(prev => prev.filter(user => user.id !== userId));
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async (limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/recent-activity?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  };

  // Auto-fetch data on mount
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

    // Functions
    fetchAnalytics,
    fetchSystemSettings,
    updateSystemSettings,
    fetchAllUsers,
    updateUser,
    deleteUser,
    fetchRecentActivity
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};