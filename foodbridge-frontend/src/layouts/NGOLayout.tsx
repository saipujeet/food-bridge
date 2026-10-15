import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { NotificationToast } from '../components/notifications/NotificationToast';
import {
  Utensils,
  LayoutDashboard,
  Layers,
  Building2,
  CheckSquare,
  Scale,
  Clock,
  MapPin,
  ShieldCheck,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  History,
} from 'lucide-react';

export const NGOLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast('Signed Out', 'You have been logged out of FoodBridge', 'info');
    navigate('/login');
  };

  const navItems: Array<{ label: string; href: string; icon: any; badge?: string }> = [
    { label: 'Dashboard', href: '/ngo/dashboard', icon: LayoutDashboard },
    { label: 'Matched Donations', href: '/ngo/matches', icon: Layers },
    { label: 'Intake History', href: '/ngo/history', icon: History },
    { label: 'NGO Profile', href: '/ngo/profile', icon: Building2 },
    { label: 'Food Preferences', href: '/ngo/food-preferences', icon: CheckSquare },
    { label: 'Capacity', href: '/ngo/capacity', icon: Scale },
    { label: 'Availability', href: '/ngo/availability', icon: Clock },
    { label: 'Location', href: '/ngo/location', icon: MapPin },
    { label: 'Verification', href: '/ngo/verification', icon: ShieldCheck },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Settings', href: '/notifications/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/ngo/dashboard' || location.pathname === '/dashboard/ngo') return 'NGO Dashboard';
    if (location.pathname === '/ngo/matches') return 'Matched Surplus Food Offers';
    if (location.pathname.startsWith('/ngo/matches/')) return 'Match Record Specification';
    if (location.pathname === '/ngo/profile') return 'NGO Profile';
    if (location.pathname === '/ngo/profile/edit') return 'Edit NGO Profile';
    if (location.pathname === '/ngo/food-preferences') return 'Food Preferences';
    if (location.pathname === '/ngo/capacity') return 'Food Receiving Capacity';
    if (location.pathname === '/ngo/availability') return 'Availability & Operating Hours';
    if (location.pathname === '/ngo/location') return 'NGO Location Management';
    if (location.pathname === '/ngo/verification') return 'NGO Verification Status';
    return 'NGO Portal';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Utensils className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">FoodBridge</span>
              <p className="text-[10px] font-semibold text-emerald-400 tracking-wide">
                Good Food • Less Waste
              </p>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            NGO Relief Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              (item.href === '/ngo/dashboard' && location.pathname === '/dashboard/ngo');

            return (
              <Link
                key={item.label}
                to={item.href.startsWith('#') ? '#' : item.href}
                onClick={(e) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    showToast(item.label, `${item.label} module available in future release`, 'info');
                  }
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.organizationName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'N'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.organizationName || user?.name}</p>
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Role: NGO</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE NAVBAR DRAWER */}
      <div className="lg:hidden bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">FoodBridge</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Badge variant="info" size="sm">NGO</Badge>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-2 z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href.startsWith('#') ? '#' : item.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    showToast(item.label, `${item.label} module available in future release`, 'info');
                  }
                }}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <Button variant="danger" size="sm" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />

            <span className="text-slate-300">|</span>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user?.organizationName || user?.name}</p>
                <p className="text-[10px] text-slate-500">{user?.email}</p>
              </div>
              <Badge variant="info" size="md">
                NGO Role
              </Badge>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <NotificationToast />
    </div>
  );
};
