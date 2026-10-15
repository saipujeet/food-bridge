import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { donationService } from '../../services/donationService';
import type { FoodDonation } from '../../types';
import { formatTimeRemaining } from '../../utils';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Building2, MapPin, Phone, Check, Navigation } from 'lucide-react';

export const NGODashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

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

  const handleClaim = async (donation: FoodDonation) => {
    setClaimingId(donation.id);
    try {
      await donationService.claimDonation(
        donation.id,
        user?.id || 'usr_ngo_1',
        user?.organizationName || user?.name || 'Hope Harvest Foundation'
      );
      showToast('Donation Claimed!', `Claimed ${donation.quantityKg || donation.quantity} ${donation.unit || 'kg'} from ${donation.donorName}`, 'success');
      fetchDonations();
    } catch {
      showToast('Claim Error', 'Unable to claim donation', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  const availableSurplus = donations.filter(d => d.status === 'AVAILABLE');
  const claimedByMe = donations.filter(d => d.matchedNgoId === (user?.id || 'usr_ngo_1') || d.status === 'MATCHED' || d.status === 'IN_TRANSIT' || d.status === 'ACCEPTED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">NGO Relief Reception Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse nearby commercial surplus food listings and claim meals for shelter distribution.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Cap: {user?.foodCapacityKg || 250} kg / day</span>
        </div>
      </div>

      {/* Available Food Listings */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Nearby Available Surplus Listings</h3>
            <p className="text-xs text-slate-500">Filtered by time-aware radius expansion algorithm</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDonations}>
            Refresh
          </Button>
        </CardHeader>
        <CardBody className="p-6">
          {availableSurplus.length === 0 ? (
            <EmptyState
              title="No unclaimed surplus food listings right now"
              description="All nearby surplus food listings have been matched or claimed. Check back shortly as donors post fresh meals."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSurplus.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.donorName}</h4>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {item.donorAddress} ({item.distanceKm || 2.1} km away)
                        </p>
                      </div>
                      <Badge variant="warning">
                        Expires in {formatTimeRemaining(item.expiryHours, item.createdAt)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Category</span>
                        <span className="font-bold text-slate-800">{item.foodType || item.foodCategory}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Quantity</span>
                        <span className="font-bold text-slate-800">{item.quantityKg || item.quantity} {item.unit || 'kg'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Pickup Window: <strong>{item.pickupWindowStart || '10:00 AM'} - {item.pickupWindowEnd || '08:00 PM'}</strong></span>
                      <span className="flex items-center text-slate-600">
                        <Phone className="w-3 h-3 mr-1" />
                        {item.donorPhone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      className="flex-1"
                      isLoading={claimingId === item.id}
                      onClick={() => handleClaim(item)}
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Accept & Claim Donation
                    </Button>
                    <Link to={`/deliveries/${item.id}/map`}>
                      <Button variant="outline" title="View Location Map">
                        <Navigation className="w-4 h-4 text-emerald-600" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Claimed Pickups */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold text-slate-900">Your Accepted / Claimed Pickups</h3>
        </CardHeader>
        <CardBody className="p-0">
          {claimedByMe.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No active claimed donations. Claim a listing above to assign volunteer transport.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {claimedByMe.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.foodName || item.foodType} — {item.quantityKg || item.quantity} {item.unit || 'kg'}</h4>
                    <p className="text-slate-500 mt-0.5">Donor: {item.donorName} ({item.donorPhone})</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {item.assignedVolunteerName ? (
                      <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded font-semibold border border-emerald-200">
                        Volunteer: {item.assignedVolunteerName} ({item.assignedVolunteerPhone})
                      </span>
                    ) : (
                      <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded font-semibold border border-amber-200">
                        Awaiting Volunteer Pickup Assignment
                      </span>
                    )}
                    <Link
                      to={`/deliveries/${item.id}/map`}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1 shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>View Live Map 🗺️</span>
                    </Link>
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
