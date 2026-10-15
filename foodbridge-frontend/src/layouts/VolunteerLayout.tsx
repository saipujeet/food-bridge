import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { NotificationToast } from '../components/notifications/NotificationToast';
import { Utensils, HeartHandshake, LogOut, Truck, Clock, UserCheck, LayoutDashboard } from 'lucide-react';

export const VolunteerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
    { label: 'Available Deliveries', path: '/volunteer/deliveries', icon: Truck },
    { label: 'Delivery History', path: '/volunteer/history', icon: Clock },
    { label: 'Volunteer Profile', path: '/volunteer/profile', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/volunteer/dashboard" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                <div className="relative">
                  <Utensils className="w-4 h-4 text-emerald-300" />
                  <HeartHandshake className="w-2.5 h-2.5 text-white absolute -bottom-1 -right-1" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">Food</span>
                <span className="text-lg font-bold text-emerald-700 tracking-tight">Bridge</span>
                <span className="ml-2 text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  VOLUNTEER PORTAL
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <NotificationBell />
              <span className="hidden sm:inline-block text-xs text-gray-600 font-medium">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Real-time Notification Toast Alert */}
      <NotificationToast />
    </div>
  );
};
