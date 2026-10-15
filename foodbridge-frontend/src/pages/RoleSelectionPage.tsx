import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Utensils, Building2, Truck, ArrowRight } from 'lucide-react';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const publicRoles = [
    {
      id: 'donor',
      title: 'Food Donor',
      subtitle: 'Restaurants, hotels, canteens, events & food providers',
      description: 'List wholesome surplus food, set safe pickup timeframes, and coordinate direct pickup with local NGO networks.',
      icon: <Utensils className="w-6 h-6 text-emerald-700" />,
      actionPath: '/register/donor',
      badgeText: 'Surplus Listing',
    },
    {
      id: 'ngo',
      title: 'NGO / Relief Shelter',
      subtitle: 'Organizations receiving surplus food for communities',
      description: 'Browse nearby surplus food alerts, accept donations matching your operational capacity, and feed communities.',
      icon: <Building2 className="w-6 h-6 text-blue-700" />,
      actionPath: '/register/ngo',
      badgeText: 'Food Reception',
    },
    {
      id: 'volunteer',
      title: 'Volunteer Transport',
      subtitle: 'Individuals helping with food pickup & local delivery',
      description: 'Assist with local transport logistics, pick up verified donations from donors, and drop them off safely at NGOs.',
      icon: <Truck className="w-6 h-6 text-amber-700" />,
      actionPath: '/register/volunteer',
      badgeText: 'Logistics Partner',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          Registration Step 1 of 2
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
          How will you use FoodBridge?
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Select your organization or user role to customize your onboarding workflow.
        </p>
      </div>

      {/* Role Cards Grid (Donor, NGO, Volunteer) */}
      <div className="grid grid-cols-1 gap-4">
        {publicRoles.map((role) => (
          <Card
            key={role.id}
            hoverable
            onClick={() => navigate(role.actionPath)}
            className="border-slate-200/90 hover:border-emerald-300 transition-all cursor-pointer"
          >
            <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">{role.title}</h3>
                    <p className="text-[11px] font-bold text-emerald-800">{role.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-11">{role.description}</p>
              </div>

              <div className="shrink-0 sm:w-36">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(role.actionPath);
                  }}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Select Role
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-200">
        <div>
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
