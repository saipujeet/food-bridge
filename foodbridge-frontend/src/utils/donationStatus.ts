import type { DonationStatus, FoodDonation } from '../types';

export interface StatusConfig {
  label: string;
  variant: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const DONATION_STATUS_CONFIG: Record<DonationStatus, StatusConfig> = {
  AVAILABLE: {
    label: 'AVAILABLE',
    variant: 'success',
    description: 'Donation published and open for NGO matching.',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
  },
  MATCHING: {
    label: 'MATCHING',
    variant: 'info',
    description: 'Matching engine actively scanning nearby verified NGOs.',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
  },
  MATCHED: {
    label: 'MATCHED',
    variant: 'info',
    description: 'Matched with verified NGO shelter.',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
  },
  ACCEPTED: {
    label: 'ACCEPTED',
    variant: 'info',
    description: 'Claimed by a registered NGO shelter.',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
  },
  PICKUP_PENDING: {
    label: 'PICKUP PENDING',
    variant: 'warning',
    description: 'Awaiting volunteer arrival for pickup.',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  PICKED_UP: {
    label: 'PICKED UP',
    variant: 'warning',
    description: 'Food picked up and currently in transit.',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
  },
  IN_TRANSIT: {
    label: 'IN TRANSIT',
    variant: 'warning',
    description: 'Food in transit with volunteer transport.',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
  },
  DELIVERED: {
    label: 'DELIVERED',
    variant: 'success',
    description: 'Successfully delivered to NGO destination.',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300',
  },
  CANCELLED: {
    label: 'CANCELLED',
    variant: 'neutral',
    description: 'Donation cancelled by donor.',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
  },
  EXPIRED: {
    label: 'EXPIRED',
    variant: 'danger',
    description: 'Available-until time elapsed before pickup.',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
  },
};

/**
 * Business Rule: A donation can only be edited when status allows changes (e.g. AVAILABLE).
 * Cancelled, Delivered, Expired, or In-Progress donations cannot be edited.
 */
export const isDonationEditable = (status: DonationStatus): boolean => {
  return status === 'AVAILABLE';
};

/**
 * Business Rule: A donation can be cancelled when it hasn't reached transit or delivery.
 */
export const isDonationCancellable = (status: DonationStatus): boolean => {
  return status === 'AVAILABLE' || status === 'MATCHING' || status === 'ACCEPTED' || status === 'PICKUP_PENDING';
};

export interface TimelineStage {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

/**
 * Generates official status timeline stages based on real backend data.
 * Unreached stages are marked as 'pending'.
 */
export const getTimelineStages = (donation: FoodDonation): TimelineStage[] => {
  const currentStatus = donation.status;

  const stageOrder: { id: DonationStatus | 'CREATED'; name: string; desc: string }[] = [
    { id: 'CREATED', name: 'Donation Created', desc: 'Listing logged in FoodBridge database.' },
    { id: 'AVAILABLE', name: 'Donation Available', desc: 'Open for NGO matching engine.' },
    { id: 'MATCHING', name: 'Matching Engine', desc: 'Scanning nearby shelters within radius.' },
    { id: 'ACCEPTED', name: 'Accepted by NGO', desc: donation.matchedNgoName ? `Claimed by ${donation.matchedNgoName}` : 'Claimed by relief shelter.' },
    { id: 'PICKUP_PENDING', name: 'Pickup Pending', desc: donation.assignedVolunteerName ? `Volunteer ${donation.assignedVolunteerName} assigned.` : 'Awaiting volunteer pickup.' },
    { id: 'PICKED_UP', name: 'Picked Up & In Transit', desc: 'Meals collected and en route.' },
    { id: 'DELIVERED', name: 'Delivered to NGO', desc: 'Delivery verified by receiving organization.' },
  ];

  if (currentStatus === 'CANCELLED') {
    return [
      { id: 'CREATED', name: 'Donation Created', description: 'Listing logged.', status: 'completed', timestamp: donation.createdAt },
      { id: 'CANCELLED', name: 'Donation Cancelled', description: 'Cancelled by donor.', status: 'completed', timestamp: donation.updatedAt || donation.createdAt },
    ];
  }

  if (currentStatus === 'EXPIRED') {
    return [
      { id: 'CREATED', name: 'Donation Created', description: 'Listing logged.', status: 'completed', timestamp: donation.createdAt },
      { id: 'EXPIRED', name: 'Donation Expired', description: 'Available-until time elapsed before matching.', status: 'completed', timestamp: donation.updatedAt || donation.availableUntil },
    ];
  }

  const statusIndexMap: Record<string, number> = {
    CREATED: 0,
    AVAILABLE: 1,
    MATCHING: 2,
    ACCEPTED: 3,
    PICKUP_PENDING: 4,
    PICKED_UP: 5,
    DELIVERED: 6,
  };

  const currentIdx = statusIndexMap[currentStatus] ?? 1;

  return stageOrder.map((st, idx) => {
    let stageStatus: 'completed' | 'current' | 'pending' = 'pending';
    if (idx < currentIdx) stageStatus = 'completed';
    else if (idx === currentIdx) stageStatus = 'current';

    return {
      id: st.id,
      name: st.name,
      description: st.desc,
      status: stageStatus,
      timestamp: idx === 0 ? donation.createdAt : stageStatus === 'current' ? donation.updatedAt : undefined,
    };
  });
};
