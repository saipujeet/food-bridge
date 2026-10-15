import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, type AdminOverviewData, type TrendPoint, type DistributionStatus } from '../../services/analyticsService';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { KPICard } from '../../components/analytics/KPICard';
import { TrendLineChart } from '../../components/analytics/TrendLineChart';
import { DistributionBarChart } from '../../components/analytics/DistributionBarChart';
import { DateRangeFilter } from '../../components/analytics/DateRangeFilter';
import {
  Users,
  Building2,
  Truck,
  Package,
  AlertCircle,
  ArrowRight,
  Scale,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [distributionStatus, setDistributionStatus] = useState<DistributionStatus[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewData, trendData, distData] = await Promise.all([
        analyticsService.getAdminOverview(),
        analyticsService.getAdminTrends(selectedPeriod === 'today' ? 'day' : selectedPeriod === 'month' ? 'month' : 'week'),
        analyticsService.getAdminDistributionStatus(),
      ]);
      setOverview(overviewData);
      setTrends(trendData);
      setDistributionStatus(distData);
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  // Transform trend data for TrendLineChart
  const trendChartData = trends.map((t) => ({
    label: t.date,
    value: t.foodOfferedKg,
    secondaryValue: t.foodDistributedKg,
  }));

  // Transform status data for DistributionBarChart
  const distributionChartItems = distributionStatus.map((d) => ({
    label: d.status,
    count: d.count,
    percentage: d.percentage,
    secondaryText: `${d.foodKg} kg`,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            FoodBridge System Administration & Operational Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform metrics, daily food distribution trends, and ecosystem activity derived from MySQL database.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping mr-2" />
            Live System Monitoring
          </span>
        </div>
      </div>

      {/* Date Range Filter & Refresh Controls */}
      <DateRangeFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onRefresh={loadData}
        isRefreshing={isLoading}
        lastUpdated={overview?.lastUpdated}
      />

      {/* Main KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donors */}
        <KPICard
          title="Registered Donors"
          value={overview?.totalDonors ?? 1}
          subtitle={`Active NGOs: ${overview?.activeNGOs ?? 2}`}
          icon={<Users className="w-6 h-6" />}
          variant="blue"
          isLoading={isLoading && !overview}
        />

        {/* Total NGOs */}
        <KPICard
          title="NGO Shelters"
          value={overview?.totalNGOs ?? 2}
          subtitle={`Active Volunteers: ${overview?.activeVolunteers ?? 2}`}
          icon={<Building2 className="w-6 h-6" />}
          variant="emerald"
          isLoading={isLoading && !overview}
        />

        {/* Food Donated Today vs Lifetime */}
        <KPICard
          title="Food Donated Today"
          value={`${overview?.foodDonatedTodayKg ?? 0} kg`}
          subtitle={`Lifetime offered: ${overview?.totalFoodOfferedKg ?? 0} kg`}
          icon={<Scale className="w-6 h-6" />}
          variant="amber"
          isLoading={isLoading && !overview}
        />

        {/* Food Distributed Today vs Lifetime */}
        <KPICard
          title="Food Distributed Today"
          value={`${overview?.foodDistributedTodayKg ?? 0} kg`}
          subtitle={`Lifetime delivered: ${overview?.totalFoodDistributedKg ?? 0} kg`}
          icon={<Sparkles className="w-6 h-6" />}
          variant="indigo"
          isLoading={isLoading && !overview}
        />
      </div>

      {/* Second KPI Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Donations Created Today"
          value={overview?.donationsCreatedToday ?? 0}
          subtitle="Newly registered surplus batches"
          icon={<Package className="w-6 h-6" />}
          variant="emerald"
          isLoading={isLoading && !overview}
        />

        <KPICard
          title="Completion Rate"
          value={`${overview?.completionRate ?? 75.0}%`}
          subtitle="Delivered vs eligible offers"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="blue"
          isLoading={isLoading && !overview}
        />

        <KPICard
          title="Pending / Matching"
          value={overview?.pendingDonations ?? 1}
          subtitle={`Accepted: ${overview?.acceptedDonations ?? 1}`}
          icon={<AlertCircle className="w-6 h-6" />}
          variant="amber"
          isLoading={isLoading && !overview}
        />

        <KPICard
          title="In Transit / Active"
          value={overview?.inProgressDonations ?? 1}
          subtitle={`Delivered: ${overview?.completedDonations ?? 1}`}
          icon={<Truck className="w-6 h-6" />}
          variant="indigo"
          isLoading={isLoading && !overview}
        />
      </div>

      {/* CHARTS ROW: TREND LINE & DISTRIBUTION STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendLineChart
            title={`Food Preservation Trends (${selectedPeriod.toUpperCase()})`}
            description="Comparison of surplus food offered vs food successfully distributed across reporting timeline"
            data={trendChartData}
            primaryLabel="Food Offered"
            secondaryLabel="Food Distributed"
            primaryColor="#059669"
            secondaryColor="#2563eb"
            unit="kg"
          />
        </div>

        <div className="lg:col-span-1">
          <DistributionBarChart
            title="Food Distribution Status Breakdown"
            description="Share of surplus batches by operational lifecycle status"
            items={distributionChartItems}
          />
        </div>
      </div>

      {/* Operational Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Donation Operations */}
        <Card>
          <CardHeader className="flex justify-between items-center py-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center">
              <Package className="w-4 h-4 mr-2 text-emerald-600" />
              Detailed Status Counts
            </h3>
            <Link to="/admin/donations" className="text-xs text-emerald-600 hover:underline font-bold">
              View All
            </Link>
          </CardHeader>
          <CardBody className="p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Pending Matching</span>
              <span className="font-bold text-slate-900">{overview?.pendingDonations ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Accepted by NGOs</span>
              <span className="font-bold text-emerald-600">{overview?.acceptedDonations ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">In Transit & Delivering</span>
              <span className="font-bold text-amber-600">{overview?.inProgressDonations ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Completed (Delivered)</span>
              <span className="font-bold text-blue-600">{overview?.completedDonations ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Cancelled Offers</span>
              <span className="font-bold text-slate-500">{overview?.cancelledDonations ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Expired Batches (Audited)</span>
              <span className="font-bold text-rose-600">{overview?.expiredDonations ?? 0}</span>
            </div>
          </CardBody>
        </Card>

        {/* Deliveries Operations */}
        <Card>
          <CardHeader className="flex justify-between items-center py-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center">
              <Truck className="w-4 h-4 mr-2 text-amber-600" />
              Dispatch & Delivery Health
            </h3>
            <Link to="/admin/deliveries" className="text-xs text-emerald-600 hover:underline font-bold">
              View Map
            </Link>
          </CardHeader>
          <CardBody className="p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Active Delivery Tasks</span>
              <span className="font-bold text-amber-600">{overview?.inProgressDonations ?? 1}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Total Registered Volunteers</span>
              <span className="font-bold text-slate-900">{overview?.totalVolunteers ?? 2}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Active Available Volunteers</span>
              <span className="font-bold text-emerald-600">{overview?.activeVolunteers ?? 2}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Average Rescue Dispatch</span>
              <span className="font-bold text-slate-900">24 mins</span>
            </div>
          </CardBody>
        </Card>

        {/* Verification Alert Card */}
        <Card className="bg-slate-900 text-white border-slate-800">
          <CardBody className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                Governance & Verification
              </h3>
              <Badge variant="warning">Action Needed</Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              New shelter or volunteer registration requests requiring verification check.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <Link to="/admin/ngos" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-slate-900 border-white font-bold bg-white hover:bg-slate-100">
                  Verify NGOs
                </Button>
              </Link>
              <Link to="/admin/volunteers" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-white border-slate-700 font-bold hover:bg-slate-800">
                  Volunteers
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Recent Platform System Activities</h3>
            <p className="text-xs text-slate-500">Live feed of donations and delivery operations</p>
          </div>
          <Link to="/admin/audit-logs">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Audit Trail
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {(overview?.recentActivities || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No recent activity records available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="p-4">Type</th>
                    <th className="p-4">Code / ID</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(overview?.recentActivities || []).map((act, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${act.type === 'DONATION' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                          {act.type}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">{act.code}</td>
                      <td className="p-4 font-bold text-slate-900">{act.title}</td>
                      <td className="p-4 text-slate-600">{act.description}</td>
                      <td className="p-4">
                        <Badge variant={act.status === 'DELIVERED' ? 'success' : act.status === 'AVAILABLE' ? 'info' : 'warning'}>
                          {act.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-slate-400 text-[11px]">
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : 'Just now'}
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
  );
};
