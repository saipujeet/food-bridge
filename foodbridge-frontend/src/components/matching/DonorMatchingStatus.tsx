import React from 'react';
import { useEscalation } from '../../hooks/useEscalation';
import { useMatching } from '../../hooks/useMatching';
import { RadiusProgressStepper } from './RadiusProgressStepper';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { MapPin, Building2, RefreshCw, Layers, ArrowRight } from 'lucide-react';

interface DonorMatchingStatusProps {
  donationId: string;
}

export const DonorMatchingStatus: React.FC<DonorMatchingStatusProps> = ({ donationId }) => {
  const { matchingState, remainingMinutes, isExpanding, expandRadius, refetchState } = useEscalation(donationId);
  const currentRadius = matchingState?.currentRadiusKm || 5;
  const { matches, isLoading, runMatching } = useMatching(donationId, true);

  const handleManualExpansion = async () => {
    await expandRadius();
    await runMatching();
  };

  const nextRadius = currentRadius < 10 ? 10 : currentRadius < 15 ? 15 : currentRadius < 20 ? 20 : null;

  return (
    <Card className="border-slate-200 shadow-xs space-y-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Time-Aware Dynamic Matching & Radius Escalation
            </h3>
            <p className="text-xs text-slate-500">
              Prioritizing nearby relief NGOs first with staged geographic expansion
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {nextRadius && matchingState?.status === 'ACTIVE' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualExpansion}
              isLoading={isExpanding}
              leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Expand Radius to {nextRadius} KM
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchState();
              runMatching();
            }}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh State
          </Button>
        </div>
      </CardHeader>

      <CardBody className="space-y-5">
        {/* MODULE 5 VISUAL PROGRESS STEPPER */}
        <RadiusProgressStepper
          currentRadiusKm={currentRadius}
          status={matchingState?.status || 'ACTIVE'}
          remainingMinutes={remainingMinutes}
          nextExpansionAt={matchingState?.nextExpansionAt}
        />

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Matching Engine Status
            </span>
            <div className="flex items-center space-x-1.5 font-black text-slate-900 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>{matchingState?.status || 'ACTIVE'}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Matched Verified NGOs
            </span>
            <p className="text-xl font-black text-emerald-950">
              {matches.length} <span className="text-xs font-semibold text-emerald-800">NGO Offers</span>
            </p>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
              Active Radius Limit
            </span>
            <p className="text-xl font-black text-blue-950">
              {currentRadius} <span className="text-xs font-semibold text-blue-800">KM Search Area</span>
            </p>
          </div>
        </div>

        {/* MATCHED NGOS LIST SUMMARY */}
        {matches.length > 0 ? (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Matched Relief Organizations Within {currentRadius} KM
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {matches.map((match) => (
                <div key={match.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">{match.organizationName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Capacity: {match.availableCapacity} {match.capacityUnit} available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{match.distanceKm} km</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-extrabold">
                      OFFERED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block">No verified NGOs found within {currentRadius} km.</span>
            <p className="text-[11px]">
              The system will expand search radius automatically (5 km → 10 km → 15 km → 20 km) as donation time advances.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
