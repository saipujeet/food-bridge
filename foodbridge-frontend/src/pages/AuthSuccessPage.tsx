import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { UserRole } from '../types';

export const AuthSuccessPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role: UserRole = location.state?.role || user?.role || 'DONOR';

  const getTargetDashboard = (r: UserRole): string => {
    switch (r) {
      case 'DONOR': return '/dashboard/donor';
      case 'NGO': return '/dashboard/ngo';
      case 'VOLUNTEER': return '/dashboard/volunteer';
      case 'ADMIN': return '/dashboard/admin';
      default: return '/dashboard/donor';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(getTargetDashboard(role), { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate, role]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center animate-bounce shadow-xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h2 className="text-3xl font-extrabold text-slate-900">You're all set!</h2>
      <p className="text-base font-semibold text-emerald-800">Welcome to FoodBridge.</p>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
        Redirecting to your <strong className="text-slate-800">{role} Workspace</strong> dashboard...
      </p>

      <div className="pt-4 flex items-center space-x-2 text-xs font-semibold text-emerald-700">
        <span>Loading workspace</span>
        <ArrowRight className="w-4 h-4 animate-pulse" />
      </div>
    </div>
  );
};
