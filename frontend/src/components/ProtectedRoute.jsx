import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg text-accentBlue">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Clinical Pulse Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-accentBlue animate-spin"></div>
          </div>
          <p className="text-xs font-semibold tracking-widest text-cyan-400 animate-pulse uppercase">
            Synchronizing Secure Core...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
