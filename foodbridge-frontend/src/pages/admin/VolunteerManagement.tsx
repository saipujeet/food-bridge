import React, { useState, useEffect } from 'react';
import { adminService, type AdminUserRecord } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Truck,
  Search,
  Mail,
  Phone,
  Eye,
  X,
  MapPin,
  Bike,
} from 'lucide-react';

export const VolunteerManagement: React.FC = () => {
  const { showToast } = useToast();
  const [volunteers, setVolunteers] = useState<AdminUserRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedVol, setSelectedVol] = useState<AdminUserRecord | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | 'SUSPEND' | 'VIEW' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadVolunteers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getVolunteers(statusFilter, search);
      setVolunteers(data);
    } catch {
      showToast('Error', 'Unable to fetch volunteer records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();
  }, [statusFilter, search]);

  const handleActionConfirm = async () => {
    if (!selectedVol || !actionType) return;
    setIsSubmitting(true);
    try {
      if (actionType === 'VERIFY') {
        await adminService.verifyVolunteer(selectedVol.id);
        showToast('Volunteer Verified', `${selectedVol.name} is now approved to accept delivery tasks.`, 'success');
      } else if (actionType === 'REJECT') {
        if (!actionReason.trim()) {
          showToast('Validation Error', 'A rejection reason is required.', 'error');
          setIsSubmitting(false);
          return;
        }
        await adminService.rejectVolunteer(selectedVol.id, actionReason.trim());
        showToast('Volunteer Rejected', 'Application rejected with documented reason.', 'info');
      } else if (actionType === 'SUSPEND') {
        if (!actionReason.trim()) {
          showToast('Validation Error', 'A suspension reason is required.', 'error');
          setIsSubmitting(false);
          return;
        }
        await adminService.suspendVolunteer(selectedVol.id, actionReason.trim());
        showToast('Volunteer Suspended', 'Volunteer suspended from accepting new deliveries.', 'warning');
      }
      setActionType(null);
      setSelectedVol(null);
      setActionReason('');
      loadVolunteers();
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
            <Truck className="w-5 h-5 text-amber-600 mr-2" />
            Volunteer Transport & Delivery Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validate volunteer credentials, driver licenses, vehicle types, and review delivery task fulfillment history.
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
            placeholder="Search volunteer name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Showing {volunteers.length} volunteer{volunteers.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Volunteer Name</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Vehicle & Area</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading volunteers...</td>
                  </tr>
                ) : volunteers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No volunteers match the specified filters.</td>
                  </tr>
                ) : (
                  volunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm">{vol.name}</div>
                        <div className="text-[11px] text-slate-500">ID: vol_{vol.id}</div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center text-slate-600">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span>{vol.email}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span>{vol.phone || '+91 98480 54321'}</span>
                        </div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center font-semibold text-slate-800">
                          <Bike className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                          <span>{vol.vehicleType || 'Motorcycle / Scooter'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>{vol.city || 'Ongole'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                          AVAILABLE
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(vol.verificationStatus)}
                        {vol.verificationReason && (
                          <div className="text-[10px] text-rose-600 mt-1 max-w-[150px] truncate" title={vol.verificationReason}>
                            Reason: {vol.verificationReason}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedVol(vol); setActionType('VIEW'); }}
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>

                        {vol.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => { setSelectedVol(vol); setActionType('VERIFY'); }}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-xs"
                          >
                            Verify
                          </button>
                        )}

                        {vol.verificationStatus !== 'REJECTED' && vol.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => { setSelectedVol(vol); setActionType('REJECT'); }}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-xs"
                          >
                            Reject
                          </button>
                        )}

                        {vol.verificationStatus === 'VERIFIED' && (
                          <button
                            onClick={() => { setSelectedVol(vol); setActionType('SUSPEND'); }}
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

      {/* Action Modal */}
      {actionType && selectedVol && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {actionType === 'VIEW' && `Volunteer Profile: ${selectedVol.name}`}
                {actionType === 'VERIFY' && `Verify Volunteer: ${selectedVol.name}`}
                {actionType === 'REJECT' && `Reject Application: ${selectedVol.name}`}
                {actionType === 'SUSPEND' && `Suspend Volunteer: ${selectedVol.name}`}
              </h3>
              <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionType === 'VIEW' ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Volunteer Name</span>
                    <span className="font-bold text-slate-900">{selectedVol.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email Address</span>
                    <span className="font-bold text-slate-900">{selectedVol.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone</span>
                    <span className="font-bold text-slate-900">{selectedVol.phone || '+91 98480 54321'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Vehicle Transport</span>
                    <span className="font-bold text-slate-900">{selectedVol.vehicleType || 'Motorcycle / Scooter'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Operating City</span>
                    <span className="font-bold text-slate-900">{selectedVol.city || 'Ongole'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Verification Status</span>
                    <span>{getStatusBadge(selectedVol.verificationStatus)}</span>
                  </div>
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
                  {actionType === 'VERIFY' && 'Verifying this volunteer authorizes them to accept and fulfill pending delivery tasks across the platform.'}
                  {actionType === 'REJECT' && 'Rejecting this application prevents the volunteer from accepting deliveries. Document the audit reason below.'}
                  {actionType === 'SUSPEND' && 'Suspending this volunteer revokes task acceptance privileges immediately.'}
                </p>

                {(actionType === 'REJECT' || actionType === 'SUSPEND') && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Audit Reason (Required)
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Specify reasons for rejection or suspension..."
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
