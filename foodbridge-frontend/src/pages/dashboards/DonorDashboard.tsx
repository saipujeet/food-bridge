import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { donationService } from '../../services/donationService';
import type { FoodDonation } from '../../types';
import { formatTimeRemaining } from '../../utils';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Plus,
  Utensils,
  CheckCircle,
  Package,
  Clock,
  Calendar,
  Users,
  Scale,
  Hourglass,
  Info,
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [foodType, setFoodType] = useState('Cooked Meals');
  const [quantityKg, setQuantityKg] = useState('35');
  const [servingsCount, setServingsCount] = useState('90');
  const [expiryHours, setExpiryHours] = useState('4');
  const [cookedTime, setCookedTime] = useState('18:00 Today');
  const [pickupStart, setPickupStart] = useState('19:00');
  const [pickupEnd, setPickupEnd] = useState('21:00');
  const [isPosting, setIsPosting] = useState(false);

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

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      await donationService.createDonation({
        donorId: user?.id || 'usr_donor_1',
        donorName: user?.organizationName || user?.name || 'Grand Hyatt Canteen',
        donorCity: user?.city || 'Metropolis',
        donorPhone: user?.phone || '+1 555-0192',
        donorAddress: user?.address || '742 Evergreen Terrace',
        foodName: foodType,
        foodCategory: 'Cooked Meals',
        foodType: 'Vegetarian',
        quantity: Number(quantityKg),
        unit: 'kg',
        quantityKg: Number(quantityKg),
        servingsCount: Number(servingsCount),
        expiryHours: Number(expiryHours),
        cookedTime,
        pickupWindowStart: pickupStart,
        pickupWindowEnd: pickupEnd,
      });

      showToast('Surplus Food Published!', 'Your donation is now visible to nearby verified NGOs', 'success');
      setIsModalOpen(false);
      fetchDonations();
    } catch {
      showToast('Error', 'Failed to publish surplus food listing', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const getStatusBadge = (status: FoodDonation['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="warning">Available for NGO Matching</Badge>;
      case 'MATCHED':
        return <Badge variant="info">NGO Claimed</Badge>;
      case 'IN_TRANSIT':
        return <Badge variant="warning">In Transit with Volunteer</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Completed & Delivered</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Food Donor Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish surplus commercial meals and monitor real-time NGO acceptance.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Post Surplus Food
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Surplus Listings</p>
              <h3 className="text-lg font-bold text-slate-900">
                {donations.filter((d) => d.status === 'AVAILABLE').length}
              </h3>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Claimed / In Transit</p>
              <h3 className="text-lg font-bold text-slate-900">
                {donations.filter((d) => d.status === 'MATCHED' || d.status === 'IN_TRANSIT').length}
              </h3>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Completed Donations</p>
              <h3 className="text-lg font-bold text-slate-900">
                {donations.filter((d) => d.status === 'DELIVERED').length}
              </h3>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Active Listings Table */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Your Surplus Food Listings</h3>
            <p className="text-xs text-slate-500">Real-time status updates from Spring Boot backend</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDonations}>
            Refresh Log
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {donations.length === 0 ? (
            <EmptyState
              title="No surplus food listings posted yet"
              description="Click 'Post Surplus Food' above to create your first time-aware surplus meal listing."
              action={
                <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                  Post Surplus Food
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="p-3.5">Food Type & Quantity</th>
                    <th className="p-3.5">Cooked / Window</th>
                    <th className="p-3.5">Time Remaining</th>
                    <th className="p-3.5">Matched NGO</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {donations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.foodType}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.quantityKg} kg • ~{item.servingsCount} servings
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div>{item.cookedTime}</div>
                        <div className="text-[11px] text-slate-500">
                          Window: {item.pickupWindowStart} - {item.pickupWindowEnd}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-amber-700">
                        {formatTimeRemaining(item.expiryHours, item.createdAt)}
                      </td>
                      <td className="p-3.5">
                        {item.matchedNgoName ? (
                          <span className="font-semibold text-slate-900">{item.matchedNgoName}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Pending NGO match...</span>
                        )}
                      </td>
                      <td className="p-3.5">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* REFINED HIGH-CLARITY POST SURPLUS MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Surplus Food Listing"
        description="Provide accurate surplus meal quantity and time-aware constraints to ensure fast matching with nearby verified NGOs."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDonation} className="space-y-6">
          {/* SECTION 1: FOOD DETAILS */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
              <Utensils className="w-4 h-4 text-emerald-700" />
              <span>1. Food Category & Quantity</span>
            </div>

            <Select
              label="Select Food Category"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              options={[
                { value: 'Cooked Meals', label: 'Fresh Cooked Meals (Rice, Gravies, Bread)' },
                { value: 'Bakery & Bread', label: 'Bakery Goods, Pastries & Breads' },
                { value: 'Packaged Goods', label: 'Unopened Packaged & Sealed Canned Goods' },
                { value: 'Fresh Produce', label: 'Fresh Vegetables & Whole Fruits' },
              ]}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Surplus Quantity (kg)"
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                leftIcon={<Scale className="w-4 h-4 text-slate-600" />}
                helperText="Total weight in kilograms"
                required
              />
              <Input
                label="Estimated Servings"
                type="number"
                value={servingsCount}
                onChange={(e) => setServingsCount(e.target.value)}
                leftIcon={<Users className="w-4 h-4 text-slate-600" />}
                helperText="Approx. number of meals"
                required
              />
            </div>
          </div>

          {/* SECTION 2: TIME & EXPIRY CONSTRAINTS */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>2. Preparation & Expiry Constraints</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Safe Consumption Window (Hours)"
                type="number"
                value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)}
                leftIcon={<Hourglass className="w-4 h-4 text-slate-600" />}
                helperText="Max hours before food expires"
                required
              />
              <Input
                label="Prepared / Cooked Time"
                value={cookedTime}
                onChange={(e) => setCookedTime(e.target.value)}
                leftIcon={<Clock className="w-4 h-4 text-slate-600" />}
                placeholder="e.g. 18:00 Today"
                helperText="When food was cooked"
                required
              />
            </div>
          </div>

          {/* SECTION 3: PICKUP WINDOW */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>3. Pickup Time Window</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pickup Start Time"
                value={pickupStart}
                onChange={(e) => setPickupStart(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4 text-slate-600" />}
                placeholder="e.g. 19:00"
                helperText="Earliest pickup time"
                required
              />
              <Input
                label="Pickup End Time"
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4 text-slate-600" />}
                placeholder="e.g. 21:00"
                helperText="Latest pickup cutoff time"
                required
              />
            </div>
          </div>

          {/* System Note */}
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Time-Aware Radius Expansion:</strong> Once published, nearby NGOs within 5 km are alerted immediately. If unclaimed after 30 minutes, radius expands automatically.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-300 text-slate-800 font-semibold px-5 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isPosting}
              leftIcon={<Plus className="w-4 h-4" />}
              className="px-6 py-2.5 font-extrabold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Publish Surplus Listing
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
