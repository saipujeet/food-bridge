import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert, Lock } from 'lucide-react';

export const AdminAccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Administrator Access</h2>
        <p className="text-sm font-semibold text-amber-800 mt-1">
          Restricted Administrative Portal
        </p>
      </div>

      {/* Required Administrative Security Explanation */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-left space-y-3 text-xs text-slate-700 leading-relaxed">
        <div className="flex items-start space-x-2 text-slate-900 font-semibold">
          <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>Security Protocol Notice:</span>
        </div>
        <p>
          Administrator accounts are created and managed securely by the system administrator. Public self-service administrator registration is disabled to maintain system integrity, verify NGO credentials, and safeguard audit logs.
        </p>
      </div>

      <div className="pt-2 space-y-3">
        <Button
          variant="secondary"
          className="w-full py-3"
          onClick={() => navigate('/login')}
          leftIcon={<Lock className="w-4 h-4 text-amber-400" />}
        >
          Sign In with Admin Credentials
        </Button>

        <Link
          to="/register"
          className="block text-xs text-emerald-700 font-bold hover:underline"
        >
          Back to Public Role Selection
        </Link>
      </div>
    </div>
  );
};
