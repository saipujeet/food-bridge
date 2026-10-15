import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { ShieldAlert, Users, CheckCircle, Clock, MapPin, Server, Activity, XCircle, ShieldCheck } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER';
  email: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  city: string;
}

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [radiusKm, setRadiusKm] = useState(15);
  const [expansionRateMinutes, setExpansionRateMinutes] = useState(30);

  const [usersList, setUsersList] = useState<UserItem[]>([
    { id: 'u1', name: 'Grand Hyatt Canteen', role: 'DONOR', email: 'donor@foodbridge.org', status: 'VERIFIED', city: 'Ongole' },
    { id: 'u2', name: 'Hope Harvest Foundation', role: 'NGO', email: 'ngo@foodbridge.org', status: 'VERIFIED', city: 'Ongole' },
    { id: 'u3', name: 'David Miller', role: 'VOLUNTEER', email: 'volunteer@foodbridge.org', status: 'VERIFIED', city: 'Ongole' },
    { id: 'u4', name: 'Green Leaf Bakery', role: 'DONOR', email: 'bakery@foodbridge.org', status: 'PENDING', city: 'Vijayawada' },
    { id: 'u5', name: 'Helping Hands Shelter', role: 'NGO', email: 'helping@foodbridge.org', status: 'PENDING', city: 'Hyderabad' },
  ]);

  const [logs, setLogs] = useState([
    { time: '22:45 Today', action: 'DONATION_MATCHED', detail: 'Donation #DON-1001 matched with Hope Harvest NGO (3.8km)' },
    { time: '21:30 Today', action: 'VOLUNTEER_ASSIGNED', detail: 'David Miller assigned to transport #DON-1002' },
    { time: '19:15 Today', action: 'USER_REGISTERED', detail: 'New NGO organization Hope Harvest registered' },
  ]);

  const verifiedCount = usersList.filter((u) => u.status === 'VERIFIED').length;

  const handleUpdateStatus = (id: string, newStatus: 'VERIFIED' | 'REJECTED' | 'SUSPENDED') => {
    const updatedList = usersList.map((u) => (u.id === id ? { ...u, status: newStatus } : u));
    setUsersList(updatedList);
    const user = usersList.find((u) => u.id === id);
    showToast('Verification Status Updated', `${user?.name} set to ${newStatus}`, 'success');

    const newLog = {
      time: 'Just now',
      action: 'ADMIN_USER_VERIFICATION',
      detail: `Admin set status of ${user?.name} (${user?.role}) to ${newStatus}`,
    };
    setLogs([newLog, ...logs]);
  };

  const handleSaveAlgorithmParams = () => {
    showToast('Algorithm Config Saved', `Max radius: ${radiusKm}km | Step: ${expansionRateMinutes}m`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>FoodBridge System Administration & Audit Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor platform health, verify credentials, and adjust time-aware radius expansion algorithms.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 shrink-0">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Restricted Admin Mode</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4 flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Verified Accounts</p>
              <h3 className="text-lg font-bold text-slate-900">{verifiedCount}</h3>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">System Matching Rate</p>
              <h3 className="text-lg font-bold text-slate-900">98.4%</h3>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 flex items-center space-x-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg. Pickup Time</p>
              <h3 className="text-lg font-bold text-slate-900">38 mins</h3>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 flex items-center space-x-3">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Spring Boot Service</p>
              <h3 className="text-lg font-bold text-emerald-700">ONLINE</h3>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Config & Audit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Time-Aware Radius Settings */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Radius Expansion Algorithm Settings</span>
              </h3>
            </CardHeader>
            <CardBody className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Max Expansion Distance Radius (km)</label>
                <input
                  type="number"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Time Step Radius Expansion Interval (mins)</label>
                <input
                  type="number"
                  value={expansionRateMinutes}
                  onChange={(e) => setExpansionRateMinutes(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 leading-relaxed">
                The radius expansion algorithm increases match radius dynamically as surplus food approaches expiry windows.
              </div>

              <Button variant="primary" size="sm" className="w-full" onClick={handleSaveAlgorithmParams}>
                Save Algorithm Parameters
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* User Account Oversight */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-900">User Credentials & Verification Oversight</h3>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="p-3">User / Org</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{usr.name}</div>
                          <div className="text-[10px] text-slate-500">{usr.email} • {usr.city}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant={usr.role === 'DONOR' ? 'success' : usr.role === 'NGO' ? 'info' : 'warning'}>
                            {usr.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {usr.status === 'VERIFIED' ? (
                            <span className="text-emerald-700 font-semibold flex items-center">
                              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Verified
                            </span>
                          ) : usr.status === 'PENDING' ? (
                            <span className="text-amber-700 font-semibold">Pending Review</span>
                          ) : usr.status === 'REJECTED' ? (
                            <span className="text-rose-700 font-semibold flex items-center">
                              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                              Rejected
                            </span>
                          ) : (
                            <span className="text-slate-600 font-semibold">Suspended</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {usr.status !== 'VERIFIED' && (
                              <button
                                onClick={() => handleUpdateStatus(usr.id, 'VERIFIED')}
                                className="px-2 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold rounded text-[10px]"
                              >
                                Approve
                              </button>
                            )}
                            {usr.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleUpdateStatus(usr.id, 'REJECTED')}
                                className="px-2 py-1 bg-rose-100 text-rose-800 hover:bg-rose-200 font-semibold rounded text-[10px]"
                              >
                                Reject
                              </button>
                            )}
                            {usr.status !== 'SUSPENDED' && (
                              <button
                                onClick={() => handleUpdateStatus(usr.id, 'SUSPENDED')}
                                className="px-2 py-1 bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold rounded text-[10px]"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold text-slate-900">System Audit Trail</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100 text-xs">
            {logs.map((log, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between">
                <div className="space-x-2">
                  <span className="font-mono text-slate-400">{log.time}</span>
                  <span className="font-bold text-slate-800">[{log.action}]</span>
                  <span className="text-slate-600">{log.detail}</span>
                </div>
                <Badge variant="neutral">Logged</Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

