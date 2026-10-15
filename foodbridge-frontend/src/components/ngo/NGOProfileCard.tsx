import React from 'react';
import type { NGOProfileData } from '../../types';
import { NGOStatusBadge } from './NGOStatusBadge';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Building2, User, Mail, Phone, MapPin, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NGOProfileCardProps {
  profile: NGOProfileData;
}

export const NGOProfileCard: React.FC<NGOProfileCardProps> = ({ profile }) => {
  const navigate = useNavigate();

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{profile.organizationName}</h3>
            <p className="text-xs text-slate-500 font-mono">Reg #: {profile.registrationNumber || 'Pending'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <NGOStatusBadge status={profile.verificationStatus} size="md" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ngo/profile/edit')}
            leftIcon={<Edit3 className="w-4 h-4 text-emerald-700" />}
          >
            Edit Profile
          </Button>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Contact & Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
              Contact Information
            </span>
            <div className="space-y-1.5 font-medium text-slate-800">
              <p className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Contact Person: <strong>{profile.contactPerson}</strong></span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{profile.email}</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{profile.phone}</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
              Location Summary
            </span>
            <div className="space-y-1.5 font-medium text-slate-800">
              <p className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{profile.address}, {profile.city}</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono pl-5">
                GPS: {profile.latitude}, {profile.longitude}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Organization Description
            </span>
            <p className="text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
              {profile.description}
            </p>
          </div>
        )}

        {/* Summaries Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">Capacity Summary</span>
            <p className="font-extrabold text-slate-900">{profile.maxCapacity} {profile.capacityUnit} Max</p>
            <p className="text-[11px] text-emerald-700 font-bold">{profile.maxCapacity - profile.currentCapacity} {profile.capacityUnit} Available</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">Food Categories</span>
            <p className="font-bold text-slate-900 truncate">
              {profile.acceptedCategories?.join(', ') || 'None selected'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">Availability Status</span>
            <p className="font-bold text-slate-900">
              {profile.isCurrentlyAvailable ? (
                <span className="text-emerald-700 font-black">Active (ON)</span>
              ) : (
                <span className="text-slate-500 font-bold">Paused (OFF)</span>
              )}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
