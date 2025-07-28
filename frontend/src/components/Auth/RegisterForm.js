import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

const RegisterForm = ({ onToggleForm }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'viewer',
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

    const result = await register(formData);
    
    if (result.success) {
      onToggleForm(); // Switch to login form
    }
    
    setIsLoading(false);
  };

  const roles = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'contributor', label: 'Contributor' },
    { value: 'agent', label: 'Agent' },
    { value: 'manager', label: 'Manager' },
  ];

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900">Create Account</h2>
        <p className="text-secondary-600 mt-1">Join the WikiGuides platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-secondary-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your full name"
            required
          />
        </div>

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
              placeholder="Create a password"
              required
              minLength={6}
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

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-secondary-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input-field"
            required
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-secondary-600">
          Already have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;