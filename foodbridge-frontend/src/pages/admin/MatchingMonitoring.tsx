import React, { useState, useEffect } from 'react';
import { adminService, type AdminMatchRecord } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Compass,
  Building2,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const MatchingMonitoring: React.FC = () => {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<AdminMatchRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getMatches(statusFilter);
      setMatches(data);
    } catch {
      showToast('Error', 'Unable to fetch matching progression records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [statusFilter]);

  const stages = [
    { label: 'Stage 1', radius: '5 km', desc: 'Initial direct matching' },
    { label: 'Stage 2', radius: '10 km', desc: 'First radius expansion' },
    { label: 'Stage 3', radius: '15 km', desc: 'Regional shelter outreach' },
    { label: 'Stage 4', radius: '20 km', desc: 'Max ceiling perimeter' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Compass className="w-5 h-5 text-indigo-600 mr-2" />
            Time-Aware Radius Expansion & Matching Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise Module 4 & 5 matching engine executions, concurrent NGO offer locks, and automated radius increments.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadMatches} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Match Feed
        </Button>
      </div>

      {/* Radius Progression Visualizer Pipeline */}
      <Card className="bg-slate-900 text-white border-slate-800">
        <CardBody className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-amber-400" />
              Dynamic Radius Expansion Pipeline Sequence
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
              Auto-escalates at 30 min intervals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {stages.map((st, idx) => (
              <div
                key={st.radius}
                className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{st.label}</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{st.radius}</span>
                </div>
                <h4 className="text-base font-extrabold text-white">{st.radius} Radius</h4>
                <p className="text-[11px] text-slate-400">{st.desc}</p>
                {idx < 3 && (
                  <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-500">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Matching Offers Feed */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Matching Offers & Concurrency Status</h3>
            <p className="text-xs text-slate-500">Tracking offers generated across registered and verified NGO shelters</p>
          </div>
          <div className="flex items-center space-x-1.5">
            {['ALL', 'OFFERED', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Donation Code</th>
                  <th className="p-4">Candidate NGO Shelter</th>
                  <th className="p-4">Calculated Distance</th>
                  <th className="p-4">Active Radius Stage</th>
                  <th className="p-4">Offer State</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading matching feed...</td>
                  </tr>
                ) : matches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No matching offers found for this filter.</td>
                  </tr>
                ) : (
                  matches.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {m.donationCode}
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 flex items-center">
                          <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span>{m.ngoName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">NGO ID #{m.ngoId}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {m.distanceKm.toFixed(1)} km away
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {m.searchRadiusKm} km Stage
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            m.status === 'ACCEPTED'
                              ? 'success'
                              : m.status === 'OFFERED'
                              ? 'warning'
                              : m.status === 'REJECTED'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {m.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {new Date(m.offeredAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
