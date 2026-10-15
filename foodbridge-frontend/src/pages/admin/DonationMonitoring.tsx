import React, { useState, useEffect } from 'react';
import { adminService, type AdminDonationRecord } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Package,
  Search,
  MapPin,
  Eye,
  X,
  Compass,
} from 'lucide-react';

export const DonationMonitoring: React.FC = () => {
  const { showToast } = useToast();
  const [donations, setDonations] = useState<AdminDonationRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<AdminDonationRecord | null>(null);

  const filterOptions = [
    'ALL',
    'MATCHING',
    'AVAILABLE',
    'ACCEPTED',
    'IN_TRANSIT',
    'DELIVERED',
    'EXPIRED',
    'CANCELLED',
  ];

  const loadDonations = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDonations(statusFilter, search);
      setDonations(data);
    } catch {
      showToast('Error', 'Unable to fetch donation records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [statusFilter, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'ACCEPTED':
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return <Badge variant="info">{status}</Badge>;
      case 'MATCHING':
      case 'AVAILABLE':
        return <Badge variant="warning">{status}</Badge>;
      case 'EXPIRED':
        return <Badge variant="danger">EXPIRED</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">CANCELLED</Badge>;
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
            <Package className="w-5 h-5 text-emerald-600 mr-2" />
            Surplus Food Donation Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise food lifecycles, real-time matching progression, and safety expiration deadlines without physical deletion.
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by food title, donation code, donor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Tracking {donations.length} donation item{donations.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Donations Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Donation Code</th>
                  <th className="p-4">Food Item & Category</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Donor Organization</th>
                  <th className="p-4">Matching Radius</th>
                  <th className="p-4">Lifecycle Status</th>
                  <th className="p-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">Loading donation listings...</td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">No donations matching the filter criteria.</td>
                  </tr>
                ) : (
                  donations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {item.donationCode}
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm">{item.foodName}</div>
                        <span className="text-[11px] text-slate-500">{item.foodCategory}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{item.donorName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{item.donorCity || 'Ongole'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <Compass className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-slate-800">{item.searchRadiusKm || 5} km</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{item.matchingStage || 'STAGE_1_5KM'}</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(item.status)}
                        {item.matchedNgoName && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                            NGO: {item.matchedNgoName}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDonation(item)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
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

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                <Package className="w-5 h-5 text-emerald-600 mr-2" />
                <span>Donation Record #{selectedDonation.donationCode}</span>
              </h3>
              <button onClick={() => setSelectedDonation(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Food Item</span>
                  <span className="font-bold text-slate-900">{selectedDonation.foodName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Category</span>
                  <span className="font-bold text-slate-900">{selectedDonation.foodCategory}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Quantity</span>
                  <span className="font-bold text-slate-900">{selectedDonation.quantity} {selectedDonation.unit}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span>{getStatusBadge(selectedDonation.status)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Search Radius</span>
                  <span className="font-bold text-emerald-700">{selectedDonation.searchRadiusKm || 5} km</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Matched NGO</span>
                  <span className="font-bold text-slate-900">{selectedDonation.matchedNgoName || 'None'}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 block">Donor Pickup Address</span>
                <span className="font-medium text-slate-800">{selectedDonation.donorAddress || '742 Evergreen Terrace'}, {selectedDonation.donorCity || 'Ongole'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Available Until:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedDonation.availableUntil ? new Date(selectedDonation.availableUntil).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDonation(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
