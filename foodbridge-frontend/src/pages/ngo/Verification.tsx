import React from 'react';
import { useNGOProfile } from '../../hooks/useNGOProfile';
import { VerificationStatusCard } from '../../components/ngo/VerificationStatusCard';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ShieldCheck, FileCheck, AlertCircle, Building2 } from 'lucide-react';

export const Verification: React.FC = () => {
  const { profile, isLoading, error } = useNGOProfile();

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading verification status..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold text-center">
        {error || 'Unable to load NGO profile.'}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER BANNER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
        <div className="flex items-center space-x-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Administrative Verification</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          NGO Verification & System Standing
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
          Review your NGO's verification status, administrative review notes, and eligibility for surplus food donation matching.
        </p>
      </div>

      {/* VERIFICATION CARD */}
      <VerificationStatusCard
        status={profile.verificationStatus}
        notes={profile.verificationNotes}
      />

      {/* VERIFICATION GUIDELINES & INFORMATION */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">Verification Criteria</h3>
          </div>
        </CardHeader>
        <CardBody className="p-6 space-y-4 text-xs text-slate-600">
          <p className="leading-relaxed">
            FoodBridge enforces administrative verification to ensure that surplus food donations are routed to legitimate, active, and capacity-ready Non-Governmental Organizations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <h4 className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Registration & Governance</span>
              </h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Valid NGO Registration ID, recognized organizational structure, and official contact information.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <h4 className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Operational Capacity</span>
              </h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Clear maximum meal handling limits, declared storage capabilities, and established operating hours.
              </p>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-blue-900 space-y-1">
            <h4 className="font-extrabold text-xs">Need to Update Verification Information?</h4>
            <p className="text-[11px] leading-relaxed text-blue-800">
              If your organizational status has changed, update your organization profile, food preferences, and availability schedule. System administrators periodically re-verify NGO accounts based on updated submission records.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
