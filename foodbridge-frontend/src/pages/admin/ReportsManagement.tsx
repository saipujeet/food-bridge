import React, { useState, useEffect } from 'react';
import { adminService, type AdminIssueRecord } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  AlertTriangle,
  X,
  FileCheck,
} from 'lucide-react';

export const ReportsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [issues, setIssues] = useState<AdminIssueRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedIssue, setSelectedIssue] = useState<AdminIssueRecord | null>(null);
  const [newStatus, setNewStatus] = useState<'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadIssues = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getIssues(statusFilter, categoryFilter);
      setIssues(data);
    } catch {
      showToast('Error', 'Unable to fetch system issues and reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [statusFilter, categoryFilter]);

  const handleUpdateSubmit = async () => {
    if (!selectedIssue) return;
    setIsUpdating(true);
    try {
      await adminService.updateIssueStatus(selectedIssue.id, newStatus, resolutionNotes.trim());
      showToast('Issue Updated', `Issue #${selectedIssue.id} updated to ${newStatus}`, 'success');
      setSelectedIssue(null);
      setResolutionNotes('');
      loadIssues();
    } catch (err: unknown) {
      showToast('Error', (err as Error).message || 'Unable to update issue', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge variant="success">RESOLVED</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="warning">UNDER REVIEW</Badge>;
      case 'OPEN':
        return <Badge variant="danger">OPEN</Badge>;
      case 'DISMISSED':
        return <Badge variant="neutral">DISMISSED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <AlertTriangle className="w-5 h-5 text-rose-600 mr-2" />
            Operational Issue & Exception Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resolve delivery transit delays, verification inquiries, and donation dispute tickets.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="DELIVERY">Delivery</option>
            <option value="VERIFICATION">Verification</option>
            <option value="QUALITY_DISPUTE">Quality</option>
          </select>
          <div className="flex items-center space-x-1">
            {['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Category & Subject</th>
                  <th className="p-4">Related Entity</th>
                  <th className="p-4">Reported By</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading operational tickets...</td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No open issue tickets found.</td>
                  </tr>
                ) : (
                  issues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        ISSUE-{iss.id}
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm">{iss.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{iss.description}</div>
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                          {iss.category}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {iss.relatedEntityType}: <span className="font-mono font-bold text-slate-900">{iss.relatedEntityId}</span>
                      </td>
                      <td className="p-4 text-slate-600">
                        <div>{iss.reportedBy || 'System Alert'}</div>
                        <span className="text-[10px] text-slate-400">{new Date(iss.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(iss.status)}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(iss);
                            setNewStatus(iss.status);
                            setResolutionNotes(iss.resolutionNotes || '');
                          }}
                        >
                          Resolve
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Resolution Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                <FileCheck className="w-5 h-5 text-emerald-600 mr-2" />
                <span>Issue Resolution: ISSUE-{selectedIssue.id}</span>
              </h3>
              <button onClick={() => setSelectedIssue(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 text-sm">{selectedIssue.title}</span>
                <p className="text-slate-600">{selectedIssue.description}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Update Ticket Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Administrative Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document the resolution, action taken, or explanation..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white h-24"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIssue(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleUpdateSubmit} isLoading={isUpdating}>
                  Save Resolution
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
