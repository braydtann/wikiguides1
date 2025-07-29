import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WikiProvider } from './contexts/WikiContext';
import { FlowProvider } from './contexts/FlowContext';
import { AdminProvider } from './contexts/AdminContext';
import Navigation from './components/Layout/Navigation';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import EnhancedWikiBrowser from './components/Wiki/EnhancedWikiBrowser';
import PublicWikiView from './components/Wiki/PublicWikiView';
import WikiCustomizer from './components/Wiki/WikiCustomizer';
import FlowBrowser from './components/Flow/FlowBrowser';
import FlowExecutor from './components/Flow/FlowExecutor';
import AdminDashboard from './components/Admin/AdminDashboard';
import HelpjuiceAdminDashboard from './components/Admin/HelpjuiceAdminDashboard';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Main App component that handles routing and authentication
const AppContent = () => {
  const { loading, isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
        {showRegister ? (
          <RegisterForm onToggleForm={() => setShowRegister(false)} />
        ) : (
          <LoginForm onToggleForm={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  return (
    <WikiProvider>
      <FlowProvider>
        <AdminProvider>
          <div className="min-h-screen bg-secondary-50">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wiki" element={<EnhancedWikiBrowser />} />
                <Route path="/wiki/*" element={<EnhancedWikiBrowser />} />
                <Route path="/wiki/public" element={<PublicWikiView />} />
                <Route path="/wiki/customize" element={<WikiCustomizer />} />
                <Route path="/flows" element={<FlowBrowser />} />
                <Route path="/flows/:flowId/execute" element={<FlowExecutor />} />
                <Route path="/flows/:flowId/execute/:sessionId" element={<FlowExecutor />} />
                <Route path="/admin" element={<HelpjuiceAdminDashboard />} />
                <Route path="/admin/classic" element={<AdminDashboard />} />
              </Routes>
            </main>
          </div>
        </AdminProvider>
      </FlowProvider>
    </WikiProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;