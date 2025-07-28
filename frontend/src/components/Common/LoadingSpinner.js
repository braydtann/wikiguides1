import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-secondary-600">Loading WikiGuides OCP...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;