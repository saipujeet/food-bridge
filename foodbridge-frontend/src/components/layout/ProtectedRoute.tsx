import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check profile completion redirect if required
  if (!user.profileCompleted && location.pathname !== '/profile/setup') {
    return <Navigate to="/profile/setup" replace />;
  }

  // Role Protection
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate role dashboard if authorized for something else
    switch (user.role) {
      case 'DONOR': return <Navigate to="/dashboard/donor" replace />;
      case 'NGO': return <Navigate to="/dashboard/ngo" replace />;
      case 'VOLUNTEER': return <Navigate to="/dashboard/volunteer" replace />;
      case 'ADMIN': return <Navigate to="/dashboard/admin" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
