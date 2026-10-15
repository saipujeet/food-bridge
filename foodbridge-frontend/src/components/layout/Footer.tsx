import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">FoodBridge</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Time-Aware Surplus Food Distribution & NGO Matching System. Connecting surplus food donors with nearby NGOs and volunteers to reduce hunger and minimize waste.
            </p>
            <div className="text-xs font-semibold text-emerald-400">
              Good Food • Less Waste • Stronger Communities
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How FoodBridge Works</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Role Selection</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Member Sign In</Link></li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Participation</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/register/donor" className="hover:text-emerald-400 transition-colors">For Food Donors</Link></li>
              <li><Link to="/register/ngo" className="hover:text-emerald-400 transition-colors">For NGOs & Shelters</Link></li>
              <li><Link to="/register/volunteer" className="hover:text-emerald-400 transition-colors">For Volunteers</Link></li>
              <li><Link to="/register/admin" className="hover:text-emerald-400 transition-colors">Administrator Access</Link></li>
            </ul>
          </div>

          {/* Contact & Verification Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">System Contact</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Metropolis Central Hub & NGO Network</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@foodbridge.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+1 (800) 555-BRIDGE</span>
              </li>
              <li className="pt-2 flex items-center space-x-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Production Java Spring Boot Architecture Ready</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FoodBridge Project. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for Spring Boot REST API Service Integration</p>
        </div>
      </div>
    </footer>
  );
};
