import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useVolunteer } from '../../hooks/useVolunteer';
import { useDelivery } from '../../hooks/useDelivery';
import { analyticsService, type VolunteerOverviewData } from '../../services/analyticsService';
import { DeliveryStatusBadge } from '../../components/delivery/DeliveryStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { KPICard } from '../../components/analytics/KPICard';
import { TrendLineChart } from '../../components/analytics/TrendLineChart';
import { DateRangeFilter } from '../../components/analytics/DateRangeFilter';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Map,
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading, updateAvailability } = useVolunteer();
  const { myDeliveries, availableDeliveries, isLoading: isDeliveryLoading } = useDelivery();

  // Analytics State
  const [overview, setOverview] = useState<VolunteerOverviewData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const data = await analyticsService.getVolunteerOverview(user?.id);
      setOverview(data);
    } catch {
      /* fallback handled inside analyticsService */
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user?.id, selectedPeriod]);

  if (isProfileLoading || isDeliveryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading volunteer portal & operations..." />
      </div>
    );
  }

  const activeDelivery = myDeliveries.find(
    (d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED' && d.status !== 'FAILED'
  );

  const handleToggleAvailability = async () => {
    if (!profile) return;
    const newStatus = profile.availabilityStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    await updateAvailability(newStatus);
  };

  // 7-day trend chart of completed deliveries
  const weeklyTrendsData = (overview?.weeklyTrends || []).map((t) => ({
    label: t.date,
    value: t.deliveriesCompleted,
  }));

  const assignedCount = overview?.assignedDeliveries ?? myDeliveries.length;
  const awaitingCount = overview?.pickupsAwaitingAction ?? myDeliveries.filter((d) => d.status === 'ACCEPTED' || d.status === 'PICKUP_PENDING').length;
  const inProgressCount = overview?.deliveriesInProgress ?? myDeliveries.filter((d) => d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT').length;
  const completedCount = overview?.completedDeliveries ?? myDeliveries.filter((d) => d.status === 'DELIVERED').length;
  const cancelledCount = overview?.cancelledTasks ?? myDeliveries.filter((d) => d.status === 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={
                  profile?.profileImageUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt="Volunteer"
                className="w-16 h-16 rounded-full border-2 border-white/40 object-cover"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">
                  Welcome Back, {profile?.fullName || user?.name || 'Volunteer'}!
                </h1>
                <p className="text-emerald-100 text-sm mt-1">
                  Vehicle: <span className="font-semibold text-white">{profile?.vehicleType || 'Motorcycle'}</span> • Area:{' '}
                  <span className="font-semibold text-white">{profile?.serviceArea || 'Central District'}</span>
                </p>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center justify-between sm:justify-start space-x-4">
              <div>
                <p className="text-xs text-emerald-100">Status</p>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    profile?.availabilityStatus === 'AVAILABLE'
                      ? 'bg-emerald-400 text-emerald-950'
                      : profile?.availabilityStatus === 'BUSY'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-rose-400 text-rose-950'
                  }`}
                >
                  {profile?.availabilityStatus}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleAvailability}
                  className="px-3 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded-lg hover:bg-emerald-50 transition-all shadow"
                >
                  {profile?.availabilityStatus === 'AVAILABLE'
                    ? 'Go Unavailable'
                    : 'Set as Available'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* REPORTING FILTER & REFRESH */}
        <DateRangeFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onRefresh={loadAnalytics}
          isRefreshing={isRefreshing}
          lastUpdated={overview?.lastUpdated}
        />

        {/* KPI STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Assigned Deliveries"
            value={assignedCount}
            subtitle={`Available in area: ${availableDeliveries.length}`}
            icon={<Package className="w-6 h-6" />}
            variant="emerald"
            isLoading={isRefreshing && !overview}
          />

          <KPICard
            title="Pickups Awaiting Action"
            value={awaitingCount}
            subtitle="Ready for pickup collection"
            icon={<Clock className="w-6 h-6" />}
            variant="amber"
            isLoading={isRefreshing && !overview}
          />

          <KPICard
            title="Deliveries in Progress"
            value={inProgressCount}
            subtitle={activeDelivery ? 'Active transit in progress' : 'No transit active'}
            icon={<Truck className="w-6 h-6" />}
            variant="blue"
            isLoading={isRefreshing && !overview}
          />

          <KPICard
            title="Completed Deliveries"
            value={completedCount}
            subtitle={`Today completed: ${overview?.todayDeliveriesCompleted ?? completedCount}`}
            icon={<CheckCircle2 className="w-6 h-6" />}
            variant="emerald"
            isLoading={isRefreshing && !overview}
          />
        </div>

        {/* QUICK METRIC TAGS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Estimated Distance</p>
              <p className="text-base font-extrabold text-slate-900">{overview?.totalKmEstimated ?? 15.6} km</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Completed Today</p>
              <p className="text-base font-extrabold text-slate-900">{overview?.todayDeliveriesCompleted ?? 1}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Cancelled / Reassigned</p>
              <p className="text-base font-extrabold text-slate-900">{cancelledCount}</p>
            </div>
          </div>
        </div>

        {/* TREND CHART: COMPLETED DELIVERIES */}
        <TrendLineChart
          title="Volunteer Delivery Missions"
          description="Number of completed surplus food deliveries across reporting period"
          data={weeklyTrendsData}
          primaryLabel="Completed Deliveries"
          primaryColor="#059669"
          unit="missions"
        />

        {/* Active Delivery Highlight Card */}
        {activeDelivery ? (
          <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-gray-100 gap-2">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Active Mission in Progress</span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">{activeDelivery.foodName}</h2>
              </div>
              <DeliveryStatusBadge status={activeDelivery.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-sm">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-slate-100">
                <p className="text-xs text-gray-500 font-semibold flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  PICKUP LOCATION
                </p>
                <p className="font-bold text-gray-900 mt-1">{activeDelivery.pickupAddress}</p>
                <p className="text-xs text-gray-600 mt-0.5">Donor: {activeDelivery.donorName} ({activeDelivery.donorPhone})</p>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700 font-semibold flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  DESTINATION LOCATION
                </p>
                <p className="font-bold text-blue-950 mt-1">{activeDelivery.dropAddress}</p>
                <p className="text-xs text-blue-800 mt-0.5">NGO: {activeDelivery.ngoName} ({activeDelivery.ngoPhone})</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Link
                to={`/volunteer/deliveries/${activeDelivery.id}/map`}
                className="px-4 py-2.5 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 text-xs transition-all flex items-center space-x-1.5"
              >
                <Map className="w-4 h-4 text-emerald-600" />
                <span>Open Live 3-Point Map</span>
              </Link>
              <Link
                to={`/volunteer/deliveries/${activeDelivery.id}`}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md text-xs transition-all flex items-center space-x-1.5"
              >
                <span>Manage Active Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center space-y-2">
            <p className="text-gray-500 text-sm">No active delivery mission currently in progress.</p>
            <Link
              to="/volunteer/deliveries"
              className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-xs"
            >
              <Truck className="w-4 h-4 mr-1" />
              <span>Browse Available Deliveries ({availableDeliveries.length})</span>
            </Link>
          </div>
        )}

        {/* RECENT DELIVERIES HISTORY TABLE */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Delivery Tasks</h3>
              <p className="text-xs text-slate-500">Your latest logged pickup and delivery activities</p>
            </div>
            <Link to="/volunteer/history">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Full History
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {myDeliveries.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No delivery assignments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <th className="p-4">Delivery Code</th>
                      <th className="p-4">Food Item</th>
                      <th className="p-4">Route</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myDeliveries.slice(0, 5).map((del) => (
                      <tr key={del.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">{(del as any).deliveryCode || del.id}</td>
                        <td className="p-4 font-bold text-slate-900">{del.foodName}</td>
                        <td className="p-4 text-slate-600">
                          {del.donorName} → {del.ngoName}
                        </td>
                        <td className="p-4">
                          <DeliveryStatusBadge status={del.status} />
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/volunteer/deliveries/${del.id}`}
                            className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                          >
                            Details →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
