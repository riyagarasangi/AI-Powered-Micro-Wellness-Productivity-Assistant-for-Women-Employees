import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Reports from './pages/Reports';
import CycleMode from './pages/CycleMode';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';

import Sidebar from './components/Common/Sidebar';
import NotificationOverlay from './components/Notifications/NotificationOverlay';

import { WellnessProvider } from './context/WellnessContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-helix-bg">
        <div className="w-10 h-10 border-2 border-helix-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-helix-bg">
        <div className="w-10 h-10 border-2 border-helix-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <WellnessProvider>
      <div className="flex h-screen bg-helix-bg text-helix-text font-body">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/cycle-mode" element={<CycleMode />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <NotificationOverlay />
      </div>
    </WellnessProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
