import React from 'react';
import { Button } from '../common/Button';
import { Card, CardBody } from '../common/Card';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionCardProps {
  missingFields: string[];
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ missingFields }) => {
  const navigate = useNavigate();

  if (missingFields.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/60 shadow-xs">
      <CardBody className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Complete Your NGO Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Your organization profile is incomplete. Complete your profile information to prepare your organization for food matching.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/ngo/profile/edit')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white shrink-0"
          >
            Complete Profile
          </Button>
        </div>

        {/* Missing Required Items List */}
        <div className="pt-2 border-t border-amber-200/60">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 block mb-2">
            Required Information Pending Setup:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {['Location', 'Food preferences', 'Capacity', 'Availability'].map((field) => {
              const isMissing = missingFields.includes(field);
              return (
                <div
                  key={field}
                  className={`p-2 rounded-lg border font-semibold flex items-center space-x-1.5 ${
                    isMissing
                      ? 'bg-amber-100/80 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {isMissing ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span>{field}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
