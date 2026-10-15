import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Truck,
  Users,
  Package,
  Compass,
  Navigation,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'NGO Verification', href: '/admin/ngos', icon: Building2 },
    { label: 'Volunteer Management', href: '/admin/volunteers', icon: Truck },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Donation Monitoring', href: '/admin/donations', icon: Package },
    { label: 'Matching & Radius', href: '/admin/matches', icon: Compass },
    { label: 'Delivery Monitoring', href: '/admin/deliveries', icon: Navigation },
    { label: 'Reports & Issues', href: '/admin/reports', icon: AlertTriangle },
    { label: 'Analytics & Impact', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Audit Trail Logs', href: '/admin/audit-logs', icon: FileText },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Dark Charcoal / Navy Administrative Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight block">FoodBridge</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                ADMIN CONSOLE
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Platform Governance
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px]">
            <p className="text-emerald-400 font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              REST API Online
            </p>
            <p className="text-slate-400 text-[10px] mt-0.5">Spring Boot • Port 8080</p>
          </div>

          <Link
            to="/login"
            className="flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1 px-1"
          >
            <span>Public FoodBridge Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Administrative Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-bold text-slate-800 capitalize">
              {location.pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-500">{user?.email || 'admin@foodbridge.org'}</p>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center space-x-1.5 text-xs font-semibold"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
