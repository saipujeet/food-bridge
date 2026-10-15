import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card, CardBody } from '../components/common/Card';
import {
  Utensils,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const valueCards = [
    {
      icon: <Utensils className="w-6 h-6 text-emerald-700" />,
      title: 'Reduce Food Waste',
      description: 'Redirect wholesome commercial surplus food away from landfills directly to people who need it.',
    },
    {
      icon: <Building2 className="w-6 h-6 text-emerald-700" />,
      title: 'Connect Nearby NGOs',
      description: 'Seamlessly match local food donors with verified neighborhood shelters and community canteens.',
    },
    {
      icon: <Clock className="w-6 h-6 text-emerald-700" />,
      title: 'Time-Aware Distribution',
      description: 'Prioritize quick pickup window matching so perishable meals are safely delivered before expiration.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-700" />,
      title: 'Track Every Donation',
      description: 'Maintain end-to-end auditability from initial donation listing to confirmed volunteer drop-off.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Donor lists surplus food',
      description: 'Commercial kitchens and event organizers log available meal types, quantity, and pickup windows.',
    },
    {
      step: '02',
      title: 'Nearby NGOs are notified',
      description: 'Registered NGOs within an expanding radius matching algorithm receive instant notification.',
    },
    {
      step: '03',
      title: 'NGO accepts donation',
      description: 'The NGO reviews capacity and claims the food listing for their distribution center.',
    },
    {
      step: '04',
      title: 'Volunteer picks up & delivers',
      description: 'Nearby volunteers handle vehicle transport and track pickup to delivery in real time.',
    },
    {
      step: '05',
      title: 'Donation is completed',
      description: 'The NGO verifies delivery receipt, closing the log and ensuring zero waste.',
    },
  ];

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Smart Surplus Food Redistribution Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Good Food Should Reach <span className="text-emerald-700">Those Who Need It</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              FoodBridge connects surplus food donors with nearby NGOs and volunteers, helping good food reach communities before it goes to waste.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How It Works
              </Button>
            </div>

            {/* Sub-text summary */}
            <div className="pt-4 flex items-center space-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified NGO Network</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Time-Window Safe</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Spring Boot API Ready</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual (Clean SaaS Card UI, Not AI Illustration) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Live Surplus Log Preview
                  </span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Time-Aware Window
                </span>
              </div>

              {/* Sample Realistic Surplus Item Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Grand Hyatt Metro Canteen</h4>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Sector 4 • 2.4 km away
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Expires in 3.5 hrs
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Food Category</span>
                    <span className="font-semibold text-slate-800">Fresh Cooked Meals</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Quantity</span>
                    <span className="font-semibold text-slate-800">45 kg (~120 servings)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matched with <strong>Hope Harvest NGO</strong></span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">Matched</span>
                </div>
              </div>

              {/* Community Role Access links */}
              <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <Link to="/register/donor" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-semibold text-slate-700">
                  Donors
                </Link>
                <Link to="/register/ngo" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-semibold text-slate-700">
                  NGOs
                </Link>
                <Link to="/register/volunteer" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-semibold text-slate-700">
                  Volunteers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION CARDS */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Built for Practical Social Impact
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              FoodBridge addresses food waste and food insecurity through direct, structured communication between businesses and local relief organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueCards.map((card, idx) => (
              <Card key={idx} hoverable className="h-full">
                <CardBody className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW FOODBRIDGE WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Operational Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">How FoodBridge Works</h2>
          <p className="text-sm text-slate-600 mt-2">
            A clear 5-step redistribution process connecting commercial food providers directly with local distribution points.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((s, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-2xl font-black text-emerald-700 mb-2">{s.step}</div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center text-[10px] font-semibold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>Verified Step</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center space-y-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to Join the Surplus Food Bridge?</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Whether you are a food business with surplus meals, an NGO serving meals daily, or a volunteer with time to assist in transport, sign up today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
              Choose Your Role & Register
            </Button>
            <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800" onClick={() => navigate('/login')}>
              Already Registered? Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
