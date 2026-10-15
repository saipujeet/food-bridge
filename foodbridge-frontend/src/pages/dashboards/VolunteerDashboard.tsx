import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { donationService } from '../../services/donationService';
import type { FoodDonation } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Truck, MapPin, Building2, CheckCircle, Navigation } from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [donations, setDonations] = useState<FoodDonation[]>([]);

  const fetchDonations = async () => {
    try {
      const all = await donationService.getAllDonations();
      setDonations(all);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleAcceptPickup = async (d: FoodDonation) => {
    try {
      await donationService.acceptVolunteerPickup(
        d.id,
        user?.id || 'usr_vol_1',
        user?.name || 'David Miller',
        user?.phone || '+1 555-0188'
      );
      showToast('Pickup Accepted!', `Assigned transport for ${d.foodType}`, 'success');
      fetchDonations();
    } catch {
      showToast('Error', 'Unable to accept pickup task', 'error');
    }
  };

  const handleCompleteDelivery = async (d: FoodDonation) => {
    try {
      await donationService.completeDonation(d.id);
      showToast('Delivery Completed!', `Marked donation ${d.id} as delivered to ${d.matchedNgoName}`, 'success');
      fetchDonations();
    } catch {
      showToast('Error', 'Unable to complete delivery', 'error');
    }
  };

  const pendingPickups = donations.filter(d => d.status === 'MATCHED' && !d.assignedVolunteerId);
  const myActiveDeliveries = donations.filter(d => d.assignedVolunteerId === (user?.id || 'usr_vol_1') || (d.status === 'IN_TRANSIT'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Volunteer Logistics Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept food transport requests and guide meals safely from donors to relief shelters.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>Status: Available for Pickups</span>
        </div>
      </div>

      {/* Available Pickup Requests */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pickups Awaiting Volunteer Transport</h3>
            <p className="text-xs text-slate-500">Claimed by NGOs, ready for pickup</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDonations}>
            Refresh
          </Button>
        </CardHeader>
        <CardBody className="p-6">
          {pendingPickups.length === 0 ? (
            <EmptyState
              title="No pending pickup requests"
              description="There are currently no NGO-claimed donations waiting for volunteer pickup."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPickups.map((item) => (
                <div key={item.id} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.foodType}</h4>
                      <p className="text-xs text-slate-500">{item.quantityKg} kg • ~{item.servingsCount} servings</p>
                    </div>
                    <Badge variant="warning">Pickup: {item.pickupWindowStart} - {item.pickupWindowEnd}</Badge>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900">Pickup Donor:</strong> {item.donorName}
                        <div className="text-[11px] text-slate-500">{item.donorAddress} ({item.donorPhone})</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 border-t border-slate-200 pt-2">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900">Destination NGO:</strong> {item.matchedNgoName || 'Verified Shelter'}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleAcceptPickup(item)}
                    leftIcon={<Navigation className="w-4 h-4" />}
                  >
                    Accept Pickup & Route
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Active Volunteer Tasks */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold text-slate-900">Your Active Transport Tasks</h3>
        </CardHeader>
        <CardBody className="p-0">
          {myActiveDeliveries.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              You have no active transport tasks in progress.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {myActiveDeliveries.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.foodType} ({item.quantityKg} kg)</h4>
                    <p className="text-slate-500 mt-0.5">Route: {item.donorName} → {item.matchedNgoName}</p>
                  </div>

                  <div>
                    {item.status === 'DELIVERED' ? (
                      <Badge variant="success">Delivery Completed</Badge>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCompleteDelivery(item)}
                        leftIcon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
                      >
                        Mark Completed (Delivered)
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
