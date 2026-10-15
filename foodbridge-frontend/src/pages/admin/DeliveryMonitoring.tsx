import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, type AdminDeliveryRecord } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Navigation,
  Truck,
  MapPin,
  Map,
  RefreshCw,
} from 'lucide-react';

export const DeliveryMonitoring: React.FC = () => {
  const { showToast } = useToast();
  const [deliveries, setDeliveries] = useState<AdminDeliveryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const filterOptions = [
    'ALL',
    'PENDING_ASSIGNMENT',
    'ACCEPTED',
    'PICKUP_PENDING',
    'IN_TRANSIT',
    'DELIVERED',
  ];

  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDeliveries(statusFilter);
      setDeliveries(data);
    } catch {
      showToast('Error', 'Unable to fetch delivery monitoring records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'IN_TRANSIT':
      case 'PICKED_UP':
        return <Badge variant="info">IN TRANSIT</Badge>;
      case 'ACCEPTED':
      case 'PICKUP_PENDING':
        return <Badge variant="warning">{status}</Badge>;
      case 'PENDING_ASSIGNMENT':
        return <Badge variant="neutral">PENDING ASSIGNMENT</Badge>;
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
            <Navigation className="w-5 h-5 text-emerald-600 mr-2" />
            Active Delivery & Transit Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time delivery state machine surveillance, volunteer route dispatching, and three-point delivery map oversight.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map((st) => (
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
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delivery Task Operations</h3>
            <p className="text-xs text-slate-500">Connecting Donor → Volunteer Transport → NGO Shelter Destination</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadDeliveries} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Delivery Code</th>
                  <th className="p-4">Donor Pickup Location</th>
                  <th className="p-4">NGO Shelter Destination</th>
                  <th className="p-4">Assigned Volunteer</th>
                  <th className="p-4">Status & Location</th>
                  <th className="p-4 text-right">3-Point Map</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading delivery operations...</td>
                  </tr>
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No deliveries matching current filter.</td>
                  </tr>
                ) : (
                  deliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900 text-sm">{del.deliveryCode}</div>
                        <span className="text-[10px] text-slate-400">Ref: {del.donationCode || 'DON-1001'}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{del.donorName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{del.pickupAddress}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{del.ngoName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{del.destinationAddress}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {del.volunteerName ? (
                          <div className="flex items-center text-slate-800 font-bold">
                            <Truck className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                            <span>{del.volunteerName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Awaiting Volunteer</span>
                        )}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(del.status)}
                        {del.lastVolunteerLat && del.lastVolunteerLng ? (
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            Last known GPS: {del.lastVolunteerLat.toFixed(3)}, {del.lastVolunteerLng.toFixed(3)}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/deliveries/${del.donationCode || del.id}/map`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <Map className="w-3.5 h-3.5" />
                          <span>View Map</span>
                        </Link>
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
