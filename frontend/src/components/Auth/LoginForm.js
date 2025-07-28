import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const LoginForm = ({ onToggleForm }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setIsLoading(false);
    }
    // If successful, AuthContext will handle the redirect
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <LogIn className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900">Welcome Back</h2>
        <p className="text-secondary-600 mt-1">Sign in to your WikiGuides account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-secondary-600">
          Don't have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Create one now
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;