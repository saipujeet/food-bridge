import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Utensils,
  LayoutDashboard,
  Building2,
  Truck,
  ShieldAlert,
  UserCheck,
  LogOut,
  Home,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'DONOR': return 'success';
      case 'NGO': return 'info';
      case 'VOLUNTEER': return 'warning';
      case 'ADMIN': return 'danger';
      default: return 'neutral';
    }
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'DONOR':
        return [
          { label: 'Overview & Donations', href: '/dashboard/donor', icon: LayoutDashboard },
          { label: 'Profile Settings', href: '/profile/setup', icon: UserCheck },
        ];
      case 'NGO':
        return [
          { label: 'Available Surplus', href: '/dashboard/ngo', icon: Building2 },
          { label: 'Profile Settings', href: '/profile/setup', icon: UserCheck },
        ];
      case 'VOLUNTEER':
        return [
          { label: 'Delivery Pickups', href: '/dashboard/volunteer', icon: Truck },
          { label: 'Profile Settings', href: '/profile/setup', icon: UserCheck },
        ];
      case 'ADMIN':
        return [
          { label: 'System Overview', href: '/dashboard/admin', icon: ShieldAlert },
          { label: 'Profile Settings', href: '/profile/setup', icon: UserCheck },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top SaaS Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">FoodBridge</span>
            </Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Workspace:</span>
              <Badge variant={getRoleBadgeVariant(user?.role)} size="md">
                {user?.role} PORTAL
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-slate-500 hover:text-slate-700 text-xs font-medium flex items-center space-x-1">
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Site</span>
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            {/* User Details & Logout */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user?.organizationName || user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Sign Out">
                <LogOut className="w-4 h-4 text-slate-600 hover:text-rose-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {getNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <p className="text-[11px] font-semibold text-slate-700">REST API Mode</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Connected to Spring Boot Service layer.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Dashboard Viewport */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
