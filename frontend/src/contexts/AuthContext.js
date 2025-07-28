import React, { createContext, useState, useContext, useEffect } from 'react';

// Auto-detect backend URL - in Kubernetes, /api routes are automatically routed to backend
const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  // In Kubernetes environment, use current origin for /api routes
  return window.location.origin;
};

const API_BASE_URL = getBackendUrl();

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('token', data.access_token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error - please check your connection' };
    }
  };

  const register = async (email, password, fullName, role = 'contributor') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName,
          role 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, user: data };
      } else {
        return { success: false, error: data.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error - please check your connection' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Role-based permissions
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      manager: [
        'wiki:read', 'wiki:write', 'wiki:delete',
        'flow:read', 'flow:write', 'flow:delete',
        'user:read', 'analytics:read'
      ],
      agent: [
        'wiki:read', 'wiki:write',
        'flow:read', 'flow:execute',
        'user:read'
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
    
    // Check if user has admin permission (all permissions)
    if (userPermissions.includes('*')) return true;
    
    // Check specific permission
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
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};