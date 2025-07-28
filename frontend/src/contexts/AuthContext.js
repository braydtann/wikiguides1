import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Authentication check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      console.log('🔧 DEBUG: Login error:', error);
      console.log('🔧 DEBUG: Error response:', error.response);
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      toast.success('Account created successfully! Please log in.');
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Role-based permissions mapping (client-side)
    const rolePermissions = {
      admin: [
        'wiki:read', 'wiki:write', 'wiki:delete',
        'flow:read', 'flow:write', 'flow:delete', 'flow:execute',
        'user:manage', 'admin:access'
      ],
      manager: [
        'wiki:read', 'wiki:write',
        'flow:read', 'flow:write', 'flow:execute',
        'user:manage'
      ],
      agent: [
        'wiki:read', 'wiki:write',
        'flow:read', 'flow:execute'
      ],
      contributor: [
        'wiki:read', 'wiki:write',
        'flow:read', 'flow:execute'
      ],
      viewer: [
        'wiki:read',
        'flow:read', 'flow:execute'
      ]
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasPermission,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};