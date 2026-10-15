import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Utensils, HeartHandshake, ShieldCheck, Truck, Building2 } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Branding Panel */}
      <div className="lg:w-5/12 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
        <div>
          {/* Brand Logo */}
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105">
              <Utensils className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">FoodBridge</span>
              <p className="text-[11px] text-emerald-400 font-extrabold tracking-wide uppercase">
                Good Food • Less Waste • Stronger Communities
              </p>
            </div>
          </Link>

          {/* Clean Hero Visual Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 my-6 shadow-xl">
            <div className="flex items-center space-x-3 text-emerald-400 font-bold text-xs">
              <HeartHandshake className="w-4 h-4" />
              <span>COMMUNITY SURPLUS REDISTRIBUTION</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white leading-snug">
              Bridging the gap between surplus food and local shelter networks.
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Empowering commercial kitchens, verified NGOs, and volunteer couriers with location-aware matching and delivery logistics.
            </p>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-[10px] font-bold">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <Utensils className="w-4 h-4 mx-auto text-emerald-400" />
                <span className="block text-slate-200">Surplus Food</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <Building2 className="w-4 h-4 mx-auto text-blue-400" />
                <span className="block text-slate-200">Verified NGOs</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <Truck className="w-4 h-4 mx-auto text-amber-400" />
                <span className="block text-slate-200">Volunteers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Authentication</span>
          </div>
          <span className="font-mono text-[10px]">v2.0 Production</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
