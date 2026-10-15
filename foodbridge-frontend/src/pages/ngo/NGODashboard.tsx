import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNGOProfile } from '../../hooks/useNGOProfile';
import { useNGOMatches } from '../../hooks/useNGOMatches';
import { analyticsService, type NGOOverviewData } from '../../services/analyticsService';
import { NGOStatusBadge } from '../../components/ngo/NGOStatusBadge';
import { ProfileCompletionCard } from '../../components/ngo/ProfileCompletionCard';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DistanceBadge } from '../../components/matching/DistanceBadge';
import { MatchStatusBadge } from '../../components/matching/MatchStatusBadge';
import { KPICard } from '../../components/analytics/KPICard';
import { TrendLineChart } from '../../components/analytics/TrendLineChart';
import { DonutProgressChart } from '../../components/analytics/DonutProgressChart';
import { DateRangeFilter } from '../../components/analytics/DateRangeFilter';
import {
  Building2,
  PackageCheck,
  ShieldCheck,
  Layers,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const NGODashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading, error: profileError, profileCompletion } = useNGOProfile();
  const { matches, isLoading: isMatchesLoading } = useNGOMatches();

  // Analytics State
  const [overview, setOverview] = useState<NGOOverviewData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const data = await analyticsService.getNGOOverview(user?.id);
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

  if (isProfileLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading NGO profile & dashboard metrics..." />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold text-center">
        {profileError || 'Unable to load your NGO profile. Please try again.'}
      </div>
    );
  }

  // Format trend data for TrendLineChart
  const weeklyTrendsData = (overview?.weeklyTrends || []).map((t) => ({
    label: t.date,
    value: t.foodDistributedKg,
  }));

  const maxCapacity = profile.maxCapacity || overview?.dailyCapacityKg || 250;
  const foodReceivedToday = overview?.foodReceivedTodayKg ?? 0;
  // Formula: remaining capacity = max(0, daily capacity - food received today)
  const remainingCapacity = Math.max(0, maxCapacity - foodReceivedToday);

  return (
    <div className="space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Authenticated NGO Relief Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            NGO Dashboard & Relief Operations
          </h1>
          <h2 className="text-base font-bold text-slate-800">
            Welcome to FoodBridge, {profile.organizationName || user?.name}
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Monitor real-time matched surplus offers, daily intake capacity, upcoming volunteer deliveries, and relief distribution history.
          </p>
        </div>

        <div className="shrink-0 flex items-center space-x-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/ngo/matches')}
            leftIcon={<Layers className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Matched Offers ({matches.length})
          </Button>
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

      {/* PROFILE COMPLETION CHECKLIST PANEL */}
      {!profileCompletion.isComplete && (
        <ProfileCompletionCard missingFields={profileCompletion.missingFields} />
      )}

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verification Status */}
        <Card className="border-slate-200">
          <CardBody className="p-5 flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Verification Status
              </p>
              <div className="mt-1">
                <NGOStatusBadge status={profile.verificationStatus} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* New Available Offers */}
        <KPICard
          title="New Available Offers"
          value={overview?.newOffersAvailable ?? matches.length}
          subtitle="Matched in active radius"
          icon={<Sparkles className="w-6 h-6" />}
          variant="indigo"
          isLoading={isRefreshing && !overview}
        />

        {/* Accepted Offers */}
        <KPICard
          title="Offers Accepted"
          value={overview?.offersAccepted ?? 1}
          subtitle={`Pending delivery: ${overview?.pendingDeliveries ?? 1}`}
          icon={<PackageCheck className="w-6 h-6" />}
          variant="amber"
          isLoading={isRefreshing && !overview}
        />

        {/* Completed Pickups */}
        <KPICard
          title="Received Donations"
          value={overview?.completedPickups ?? 1}
          subtitle={`Today: ${foodReceivedToday} kg received`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
          isLoading={isRefreshing && !overview}
        />
      </div>

      {/* CAPACITY GAUGE & TRENDS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Capacity Gauge (Formula: remaining = max(0, daily - received)) */}
        <div className="lg:col-span-1">
          <DonutProgressChart
            title="Daily Receiving Capacity"
            subtitle="Today's received food intake vs certified capacity limit"
            current={foodReceivedToday}
            max={maxCapacity}
            unit={profile.capacityUnit || 'kg'}
            metricLabel="Intake Utilized"
            remainingLabel="Remaining Intake"
            color="#2563eb"
          />
        </div>

        {/* Trend Chart: Received Food Over 7 Days */}
        <div className="lg:col-span-2">
          <TrendLineChart
            title="Food Intake Trend"
            description="Daily surplus food meals and relief provisions received over the past 7 days"
            data={weeklyTrendsData}
            primaryLabel="Food Received"
            primaryColor="#2563eb"
            unit="kg"
          />
        </div>
      </div>

      {/* QUICK STATUS METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Daily Maximum</p>
            <p className="text-base font-extrabold text-slate-900">{maxCapacity} {profile.capacityUnit}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Available Today</p>
            <p className="text-base font-extrabold text-emerald-700">{remainingCapacity} {profile.capacityUnit}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Upcoming Pickups</p>
            <p className="text-base font-extrabold text-slate-900">{overview?.upcomingPickups ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Pending Deliveries</p>
            <p className="text-base font-extrabold text-slate-900">{overview?.pendingDeliveries ?? 1}</p>
          </div>
        </div>
      </div>

      {/* MODULE 4 LIVE SURPLUS FOOD MATCHED OFFERS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Matched Surplus Food Offers ({matches.length})
              </h3>
              <p className="text-xs text-slate-500">
                Surplus meals matched by Module 4 Dynamic Matching Engine (5 km radius)
              </p>
            </div>
            <Link
              to="/ngo/matches"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
            >
              <span>View All Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {isMatchesLoading ? (
            <div className="py-6 text-center">
              <LoadingSpinner size="md" text="Loading matched donation offers..." />
            </div>
          ) : matches.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {matches.slice(0, 3).map((match) => (
                <div key={match.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{match.foodName}</h4>
                      <DistanceBadge distanceKm={match.distanceKm} />
                    </div>
                    <p className="text-slate-600 font-medium">
                      Donor: <strong>{match.donorName}</strong> • {match.donationQuantity} {match.donationUnit} ({match.foodCategory})
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <MatchStatusBadge status={match.matchStatus} size="sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/ngo/matches/${match.id}`)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                No surplus food offers currently matched within 5 km.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/ngo/matches')}
              >
                Open Matching Engine Workspace
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
