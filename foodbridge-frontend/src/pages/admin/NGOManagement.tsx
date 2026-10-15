import React, { useState, useEffect } from 'react';
import { adminService, type AdminUserRecord } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Building2,
  Search,
  MapPin,
  Mail,
  Phone,
  Eye,
  X,
} from 'lucide-react';

export const NGOManagement: React.FC = () => {
  const { showToast } = useToast();
  const [ngos, setNgos] = useState<AdminUserRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Selected NGO for details or modal action
  const [selectedNgo, setSelectedNgo] = useState<AdminUserRecord | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | 'SUSPEND' | 'VIEW' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNGOs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getNgos(statusFilter, search);
      setNgos(data);
    } catch {
      showToast('Error', 'Unable to fetch NGO records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNGOs();
  }, [statusFilter, search]);

  const handleActionConfirm = async () => {
    if (!selectedNgo || !actionType) return;
    setIsSubmitting(true);
    try {
      if (actionType === 'VERIFY') {
        await adminService.verifyNgo(selectedNgo.id);
        showToast('NGO Verified', `${selectedNgo.organizationName || selectedNgo.name} is now approved to receive food matches.`, 'success');
      } else if (actionType === 'REJECT') {
        if (!actionReason.trim()) {
          showToast('Validation Error', 'A rejection reason is required for audit documentation.', 'error');
          setIsSubmitting(false);
          return;
        }
        await adminService.rejectNgo(selectedNgo.id, actionReason.trim());
        showToast('NGO Rejected', `Application rejected with documented reason.`, 'info');
      } else if (actionType === 'SUSPEND') {
        if (!actionReason.trim()) {
          showToast('Validation Error', 'A suspension reason is required for audit documentation.', 'error');
          setIsSubmitting(false);
          return;
        }
        await adminService.suspendNgo(selectedNgo.id, actionReason.trim());
        showToast('NGO Suspended', `Organization suspended from active matching.`, 'warning');
      }
      setActionType(null);
      setSelectedNgo(null);
      setActionReason('');
      loadNGOs();
    } catch (err: unknown) {
      showToast('Action Failed', (err as Error).message || 'Unable to update status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="success">VERIFIED</Badge>;
      case 'PENDING':
      case 'UNDER_REVIEW':
        return <Badge variant="warning">{status}</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger">SUSPENDED</Badge>;
      default:
        return <Badge variant="neutral">{status || 'UNKNOWN'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Building2 className="w-5 h-5 text-emerald-600 mr-2" />
            NGO Verification & Shelter Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted registration documentation, verify authorized receiving shelters, and track daily capacity quotas.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED'].map((st) => (
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search NGO name, contact, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Showing {ngos.length} NGO organization{ngos.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* NGO Data Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-4">NGO Organization</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Receiving Capacity</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading NGO records...</td>
                  </tr>
                ) : ngos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No NGOs match the specified filters.</td>
                  </tr>
                ) : (
                  ngos.map((ngo) => (
                    <tr key={ngo.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm">{ngo.organizationName || ngo.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">Rep: {ngo.name}</div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center text-slate-600">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span>{ngo.email}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span>{ngo.phone || '+91 98480 88888'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start text-slate-600">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800 block">{ngo.city || 'Ongole'}</span>
                            <span className="text-[11px] text-slate-500 block">{ngo.address || 'Central District'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">
                          {ngo.maxCapacity || 250} kg / day max
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                          Available: {ngo.availableCapacity || 205} kg
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(ngo.verificationStatus)}
                        {ngo.verificationReason && (
                          <div className="text-[10px] text-rose-600 mt-1 max-w-[160px] truncate" title={ngo.verificationReason}>
                            Reason: {ngo.verificationReason}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedNgo(ngo); setActionType('VIEW'); }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>

                        {ngo.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => { setSelectedNgo(ngo); setActionType('VERIFY'); }}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-xs"
                          >
                            Verify
                          </button>
                        )}

                        {ngo.verificationStatus !== 'REJECTED' && ngo.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => { setSelectedNgo(ngo); setActionType('REJECT'); }}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-xs"
                          >
                            Reject
                          </button>
                        )}

                        {ngo.verificationStatus === 'VERIFIED' && (
                          <button
                            onClick={() => { setSelectedNgo(ngo); setActionType('SUSPEND'); }}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg text-xs"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Confirmation / Reason Modal */}
      {actionType && selectedNgo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {actionType === 'VIEW' && 'NGO Shelter Profile & Registration Details'}
                {actionType === 'VERIFY' && `Verify & Approve NGO: ${selectedNgo.organizationName || selectedNgo.name}`}
                {actionType === 'REJECT' && `Reject Application: ${selectedNgo.organizationName || selectedNgo.name}`}
                {actionType === 'SUSPEND' && `Suspend Organization: ${selectedNgo.organizationName || selectedNgo.name}`}
              </h3>
              <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionType === 'VIEW' ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Organization Name</span>
                    <span className="font-bold text-slate-900">{selectedNgo.organizationName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Contact Person</span>
                    <span className="font-bold text-slate-900">{selectedNgo.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email Address</span>
                    <span className="font-bold text-slate-900">{selectedNgo.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone</span>
                    <span className="font-bold text-slate-900">{selectedNgo.phone || '+91 98480 88888'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Daily Food Capacity</span>
                    <span className="font-bold text-slate-900">{selectedNgo.maxCapacity || 250} kg / day</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Verification Status</span>
                    <span>{getStatusBadge(selectedNgo.verificationStatus)}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block">Shelter Address</span>
                  <span className="font-medium text-slate-800">{selectedNgo.address || '108 Compassion Ave'}, {selectedNgo.city || 'Ongole'}</span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActionType(null)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600">
                  {actionType === 'VERIFY' && 'Approving this organization will immediately enable it in the Module 4 Dynamic Matching Engine to receive nearby food donation offers.'}
                  {actionType === 'REJECT' && 'Rejecting this application prevents the organization from participating in food distributions. Please record the rejection reason below.'}
                  {actionType === 'SUSPEND' && 'Suspending this organization halts matching offers immediately. Existing deliveries will require manual review.'}
                </p>

                {(actionType === 'REJECT' || actionType === 'SUSPEND') && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Audit Reason (Required)
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Specify reasons (e.g. Expired NGO registration documentation, shelter inspection failure)..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-emerald-500 h-24"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActionType(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant={actionType === 'VERIFY' ? 'primary' : 'danger'}
                    size="sm"
                    onClick={handleActionConfirm}
                    isLoading={isSubmitting}
                  >
                    Confirm {actionType}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
