import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { NotificationBell } from '../notifications/NotificationBell';
import { Utensils, HeartHandshake, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'DONOR': return '/dashboard/donor';
      case 'NGO': return '/dashboard/ngo';
      case 'VOLUNTEER': return '/dashboard/volunteer';
      case 'ADMIN': return '/dashboard/admin';
      default: return '/dashboard';
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'For Donors', href: '/#for-donors' },
    { label: 'For NGOs', href: '/#for-ngos' },
    { label: 'For Volunteers', href: '/#for-volunteers' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <div className="relative">
                <Utensils className="w-5 h-5 text-emerald-300" />
                <HeartHandshake className="w-3 h-3 text-white absolute -bottom-1 -right-1" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-bold text-slate-900 tracking-tight">Food</span>
                <span className="text-xl font-bold text-emerald-700 tracking-tight">Bridge</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 hidden sm:block tracking-wide">
                Good Food • Less Waste • Stronger Communities
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-4 h-4 text-emerald-700" />}
                  onClick={() => navigate(getDashboardPath())}
                >
                  Dashboard
                </Button>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-600" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-emerald-700 py-1.5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Button variant="primary" onClick={() => { navigate(getDashboardPath()); setMobileMenuOpen(false); }}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={async () => { await logout(); setMobileMenuOpen(false); navigate('/'); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                  Login
                </Button>
                <Button variant="primary" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
