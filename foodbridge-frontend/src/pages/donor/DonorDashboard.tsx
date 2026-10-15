import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDonations } from '../../hooks/useDonations';
import { analyticsService, type DonorOverviewData } from '../../services/analyticsService';
import { DonationTable } from '../../components/donations/DonationTable';
import { CancelDonationModal } from '../../components/donations/CancelDonationModal';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { KPICard } from '../../components/analytics/KPICard';
import { TrendLineChart } from '../../components/analytics/TrendLineChart';
import { DateRangeFilter } from '../../components/analytics/DateRangeFilter';
import {
  PlusCircle,
  Package,
  Utensils,
  CheckCircle2,
  Clock,
  ArrowRight,
  Scale,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';
import type { FoodDonation } from '../../types';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { donations, isLoading: isDonationsLoading, error, cancelDonation } = useDonations();
  const navigate = useNavigate();

  const [cancelModalItem, setCancelModalItem] = useState<FoodDonation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Analytics State
  const [overview, setOverview] = useState<DonorOverviewData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const data = await analyticsService.getDonorOverview(user?.id);
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

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setIsCancelling(true);
    try {
      await cancelDonation(cancelModalItem.id);
      setCancelModalItem(null);
      await loadAnalytics();
    } finally {
      setIsCancelling(false);
    }
  };

  const recentDonations = donations.slice(0, 5);

  // Format trend data for TrendLineChart
  const trendChartData = (overview?.monthlyTrends || []).map((t) => ({
    label: t.date,
    value: t.foodOfferedKg,
    secondaryValue: t.foodDistributedKg,
  }));

  return (
    <div className="space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Authenticated Donor Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Donor Dashboard & Analytics
          </h1>
          <h2 className="text-base font-bold text-slate-800">
            Welcome back, {user?.organizationName || user?.name}
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Monitor surplus food contributions, real-time rescue status, and measurable hunger-relief impact.
          </p>
        </div>

        {/* QUICK ACTION BUTTON */}
        <Button
          variant="primary"
          size="lg"
          leftIcon={<PlusCircle className="w-5 h-5" />}
          onClick={() => navigate('/donor/donations/create')}
          className="px-6 py-3.5 shadow-md font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white shrink-0"
        >
          Create Food Donation
        </Button>
      </div>

      {/* REPORTING FILTER & REFRESH */}
      <DateRangeFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onRefresh={loadAnalytics}
        isRefreshing={isRefreshing}
        lastUpdated={overview?.lastUpdated}
      />

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Food Offered vs Distributed (Kg) */}
        <KPICard
          title="Total Food Offered"
          value={`${overview?.totalFoodOfferedKg ?? 0} kg`}
          subtitle={`Today: ${overview?.todayFoodOfferedKg ?? 0} kg`}
          icon={<Scale className="w-6 h-6" />}
          variant="emerald"
          isLoading={isRefreshing && !overview}
        />

        <KPICard
          title="Food Distributed"
          value={`${overview?.totalFoodDistributedKg ?? 0} kg`}
          subtitle={`Delivered to shelters: ${overview?.todayFoodDistributedKg ?? 0} kg`}
          icon={<Sparkles className="w-6 h-6" />}
          variant="blue"
          isLoading={isRefreshing && !overview}
        />

        {/* Active & Accepted Offers */}
        <KPICard
          title="Active Offers"
          value={overview?.activeOffers ?? donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHING').length}
          subtitle={`Today created: ${overview?.donationsCreatedToday ?? 0}`}
          icon={<Clock className="w-6 h-6" />}
          variant="amber"
          isLoading={isRefreshing && !overview}
        />

        <KPICard
          title="Completed Rescues"
          value={overview?.completedDistributions ?? donations.filter((d) => d.status === 'DELIVERED').length}
          subtitle={`Cancelled/Expired: ${overview?.cancelledOrExpiredOffers ?? 0}`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
          isLoading={isRefreshing && !overview}
        />
      </div>

      {/* DETAILED STATUS BREAKDOWN METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Donations</p>
            <p className="text-base font-extrabold text-slate-900">{donations.length}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Accepted</p>
            <p className="text-base font-extrabold text-slate-900">{overview?.acceptedOffers ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">In Transit</p>
            <p className="text-base font-extrabold text-slate-900">
              {donations.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'PICKED_UP').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Cancelled / Expired</p>
            <p className="text-base font-extrabold text-slate-900">
              {overview?.cancelledOrExpiredOffers ?? donations.filter((d) => d.status === 'CANCELLED' || d.status === 'EXPIRED').length}
            </p>
          </div>
        </div>
      </div>

      {/* TREND CHART: SURPLUS FOOD OVER TIME */}
      <TrendLineChart
        title="Surplus Food Activity Timeline"
        description="Comparison of total food offered vs successfully distributed food across reporting intervals"
        data={trendChartData}
        primaryLabel="Food Offered"
        secondaryLabel="Food Distributed"
        primaryColor="#059669"
        secondaryColor="#2563eb"
        unit="kg"
      />

      {/* RECENT DONATIONS TABLE */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent Surplus Donations</h3>
            <p className="text-xs text-slate-500">Your latest logged surplus food contributions and recipient matches</p>
          </div>
          <Link to="/donor/donations">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Donations
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {isDonationsLoading ? (
            <LoadingSpinner text="Loading your surplus food donations..." />
          ) : error ? (
            <div className="p-6 text-center text-xs text-rose-600 font-bold">{error}</div>
          ) : recentDonations.length === 0 ? (
            <EmptyState
              title="No donations yet"
              description="Create your first food donation and help connect surplus food with nearby organizations."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/donor/donations/create')}
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Create Food Donation
                </Button>
              }
            />
          ) : (
            <DonationTable donations={recentDonations} onCancelClick={(d) => setCancelModalItem(d)} />
          )}
        </CardBody>
      </Card>

      {/* CANCEL MODAL */}
      <CancelDonationModal
        isOpen={!!cancelModalItem}
        onClose={() => setCancelModalItem(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
};
