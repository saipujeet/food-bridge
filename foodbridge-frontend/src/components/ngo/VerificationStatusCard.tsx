import React from 'react';
import type { NGOVerificationStatus } from '../../types';
import { NGOStatusBadge } from './NGOStatusBadge';
import { Card, CardBody } from '../common/Card';
import { ShieldCheck, Clock, AlertTriangle, XCircle, Info } from 'lucide-react';

interface VerificationStatusCardProps {
  status: NGOVerificationStatus;
  notes?: string;
}

export const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({ status, notes }) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'VERIFIED':
        return {
          icon: <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />,
          title: 'Organization Verified',
          message: 'Your organization is verified and can participate in FoodBridge matching when eligible.',
          bgColor: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
        };
      case 'PENDING':
        return {
          icon: <Clock className="w-8 h-8 text-amber-600 shrink-0" />,
          title: 'Awaiting Verification',
          message: 'Your organization profile is awaiting verification.',
          bgColor: 'bg-amber-50/70 border-amber-200 text-amber-950',
        };
      case 'UNDER_REVIEW':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-blue-600 shrink-0" />,
          title: 'Under Administrative Review',
          message: 'Your organization documents are currently under review by system administrators.',
          bgColor: 'bg-blue-50/70 border-blue-200 text-blue-950',
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="w-8 h-8 text-rose-600 shrink-0" />,
          title: 'Verification Requires Attention',
          message: 'Your verification status requires attention. Please review the information provided by the administrator.',
          bgColor: 'bg-rose-50/70 border-rose-200 text-rose-950',
        };
      case 'SUSPENDED':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-slate-600 shrink-0" />,
          title: 'Account Suspended',
          message: 'Your NGO matching participation is suspended. Contact system support for assistance.',
          bgColor: 'bg-slate-100 border-slate-300 text-slate-900',
        };
      default:
        return {
          icon: null,
          title: status,
          message: '',
          bgColor: 'bg-slate-50 border-slate-200 text-slate-900',
        };
    }
  };

  const config = getStatusMessage();

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardBody className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900">NGO Verification Overview</h3>
          <NGOStatusBadge status={status} size="md" />
        </div>

        <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${config.bgColor}`}>
          {config.icon}
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-sm">{config.title}</h4>
            <p className="leading-relaxed font-medium">{config.message}</p>
          </div>
        </div>

        {notes && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
              Administrative Verification Notes
            </span>
            <p className="text-slate-600 leading-relaxed italic">{notes}</p>
          </div>
        )}

        <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Verification status is managed securely by the Spring Boot administrator service. NGOs cannot self-assign verification.
          </span>
        </div>
      </CardBody>
    </Card>
  );
};
