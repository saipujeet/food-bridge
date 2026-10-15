import React, { useState, useEffect } from 'react';
import { adminService, type AdminUserRecord } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Users,
  Search,
  Mail,
  ShieldCheck,
  Building2,
  Truck,
  Heart,
  Ban,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [actionType, setActionType] = useState<'SUSPEND' | 'REACTIVATE' | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const activeParam = statusFilter === 'ACTIVE' ? true : statusFilter === 'SUSPENDED' ? false : undefined;
      const data = await adminService.getUsers(roleFilter, activeParam, search);
      setUsers(data);
    } catch {
      showToast('Error', 'Unable to load user directory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter, search]);

  const handleActionConfirm = async () => {
    if (!selectedUser || !actionType) return;
    setIsSubmitting(true);
    try {
      if (actionType === 'SUSPEND') {
        if (!reason.trim()) {
          showToast('Validation Error', 'A suspension reason is mandatory for audit records.', 'error');
          setIsSubmitting(false);
          return;
        }
        await adminService.suspendUser(selectedUser.id, reason.trim());
        showToast('Account Suspended', `Access for ${selectedUser.name} (${selectedUser.email}) revoked.`, 'warning');
      } else if (actionType === 'REACTIVATE') {
        await adminService.reactivateUser(selectedUser.id);
        showToast('Account Reactivated', `Access restored for ${selectedUser.name}.`, 'success');
      }
      setActionType(null);
      setSelectedUser(null);
      setReason('');
      loadUsers();
    } catch (err: unknown) {
      showToast('Action Forbidden', (err as Error).message || 'Unable to modify account', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge variant="danger" className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 mr-1" />
            <span>ADMIN</span>
          </Badge>
        );
      case 'NGO':
        return (
          <Badge variant="info" className="flex items-center space-x-1">
            <Building2 className="w-3 h-3 mr-1" />
            <span>NGO</span>
          </Badge>
        );
      case 'VOLUNTEER':
        return (
          <Badge variant="warning" className="flex items-center space-x-1">
            <Truck className="w-3 h-3 mr-1" />
            <span>VOLUNTEER</span>
          </Badge>
        );
      case 'DONOR':
      default:
        return (
          <Badge variant="success" className="flex items-center space-x-1">
            <Heart className="w-3 h-3 mr-1" />
            <span>DONOR</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            User Account Governance & Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable registry of all platform participants. Enforces strict zero-credential-leakage privacy.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {['ALL', 'DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by name, email, or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-slate-500 font-semibold">{users.length} record{users.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-4">User Identity</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading user registry...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No users found matching query.</td>
                  </tr>
                ) : (
                  users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm">{usr.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{usr.email}</span>
                          <span className="mx-1.5 text-slate-300">•</span>
                          <span className="font-mono text-slate-400">ID #{usr.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(usr.role)}
                        {usr.organizationName && (
                          <div className="text-[10px] text-slate-500 mt-1 max-w-[150px] truncate" title={usr.organizationName}>
                            {usr.organizationName}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {usr.active ? (
                          <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            SUSPENDED
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">
                          {usr.verificationStatus || 'VERIFIED'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'Active Member'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        {usr.active ? (
                          <button
                            onClick={() => { setSelectedUser(usr); setActionType('SUSPEND'); }}
                            disabled={usr.email === currentAdmin?.email}
                            className={`px-2.5 py-1 font-bold rounded-lg text-xs flex items-center space-x-1 inline-flex ${
                              usr.email === currentAdmin?.email
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                            title={usr.email === currentAdmin?.email ? 'Cannot suspend yourself' : 'Suspend account'}
                          >
                            <Ban className="w-3.5 h-3.5 mr-1" />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedUser(usr); setActionType('REACTIVATE'); }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-lg text-xs flex items-center space-x-1 inline-flex"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            <span>Reactivate</span>
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

      {/* Suspend / Reactivate Confirmation Modal */}
      {actionType && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                <span>Confirm {actionType === 'SUSPEND' ? 'Account Suspension' : 'Account Reactivation'}</span>
              </h3>
              <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Are you sure you want to {actionType === 'SUSPEND' ? 'suspend' : 'reactivate'} the account for{' '}
                <strong className="text-slate-900">{selectedUser.name} ({selectedUser.email})</strong>?
              </p>

              {actionType === 'SUSPEND' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Documented Reason for Suspension (Required)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide specific reason for suspension (e.g. Terms violation, account compromise inquiry)..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-emerald-500 h-20"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setActionType(null)}>
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'SUSPEND' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={handleActionConfirm}
                  isLoading={isSubmitting}
                >
                  Confirm {actionType === 'SUSPEND' ? 'Suspension' : 'Reactivation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
