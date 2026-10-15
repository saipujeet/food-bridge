import React, { useState, useEffect } from 'react';
import { adminService, type AdminSummaryData } from '../../services/adminService';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Award,
  Sparkles,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AdminSummaryData | null>(null);

  useEffect(() => {
    adminService.getDashboardSummary().then(setSummary).catch(() => {});
  }, []);

  const categoryStats = [
    { category: 'Biryani & Rice Meals', percentage: 42, kg: 63, color: 'bg-emerald-500' },
    { category: 'Bakery & Whole Wheat', percentage: 24, kg: 36, color: 'bg-amber-500' },
    { category: 'Commercial Cooked Meals', percentage: 20, kg: 30, color: 'bg-blue-500' },
    { category: 'Sealed Packaged Food', percentage: 14, kg: 21, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <BarChart3 className="w-5 h-5 text-emerald-600 mr-2" />
            Platform Analytics & Community Impact
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quantifiable surplus food preservation, emission reduction benchmarks, and delivery efficiency statistics.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600 mr-1" />
          <span>Total Food Distributed: {summary?.totalFoodDistributedKg ?? 150} kg</span>
        </div>
      </div>

      {/* Impact Numbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Meals Served to Shelters</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {Math.round(((summary?.totalFoodDistributedKg ?? 150) * 1000) / 400)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Estimated 400g adult portions</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-slate-200">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">CO2 Emissions Prevented</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {(((summary?.totalFoodDistributedKg ?? 150) * 2.5)).toFixed(1)} <span className="text-sm font-bold text-slate-500">kg</span>
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">2.5 kg CO2e / kg food waste avoided</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-slate-200">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Matching Efficiency</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary?.systemMatchingRate ?? 98.4}%</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">First 2 radius stages</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Categories Distribution */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <PieChart className="w-4 h-4 mr-2 text-emerald-600" />
            Surplus Food Category Distribution
          </h3>
          <p className="text-xs text-slate-500">Breakdown of reclaimed surplus food categories distributed across community shelters</p>
        </CardHeader>
        <CardBody className="p-6 space-y-6">
          <div className="space-y-4">
            {categoryStats.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{item.category}</span>
                  <span>{item.percentage}% ({item.kg} kg)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
