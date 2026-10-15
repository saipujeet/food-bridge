export type UserRole = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  organizationName?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  profileCompleted: boolean;
  
  // Role specific extra fields
  ngoCategory?: string[];
  foodCapacityKg?: number;
  operatingHours?: string;
  preferredArea?: string;
  isAvailable?: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type DonationStatus =
  | 'AVAILABLE'
  | 'MATCHING'
  | 'MATCHED'
  | 'ACCEPTED'
  | 'PICKUP_PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED';

export type FoodCategory =
  | 'Cooked Meals'
  | 'Rice'
  | 'Biryani'
  | 'Vegetables'
  | 'Fruits'
  | 'Bakery'
  | 'Dairy'
  | 'Packaged Food'
  | 'Other';

export type FoodType = 'Vegetarian' | 'Non-Vegetarian' | 'Other';

export type QuantityUnit = 'kg' | 'litres' | 'packets' | 'meals' | 'boxes' | 'pieces';

export interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorCity: string;
  donorPhone: string;
  donorAddress: string;
  latitude?: number;
  longitude?: number;
  
  // Module 2 Detailed Food Info
  foodName: string;
  foodCategory: FoodCategory;
  foodType: FoodType;
  quantity: number;
  unit: QuantityUnit;
  description?: string;
  
  // Time Information
  preparationDate: string;
  preparationTime: string;
  availableFrom: string;
  availableUntil: string;
  
  // Image & Special Instructions
  imageUrl?: string;
  specialInstructions?: string;
  
  // Status & Timeline
  status: DonationStatus;
  
  // Future Match/Logistics Fields
  matchedNgoId?: string;
  matchedNgoName?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  assignedVolunteerPhone?: string;
  
  createdAt: string;
  updatedAt?: string;
  distanceKm?: number;
  
  // Legacy backward compatibility helpers
  foodTypeLegacy?: string;
  quantityKg?: number;
  servingsCount?: number;
  expiryHours?: number;
  cookedTime?: string;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
}

// MODULE 3 — NGO TYPES
export type NGOVerificationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type CapacityUnit = 'meals' | 'kg' | 'litres' | 'boxes' | 'packets';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface DaySchedule {
  day: DayOfWeek;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface NGOProfileData {
  id: string;
  organizationName: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  description?: string;
  
  // Location
  latitude: number;
  longitude: number;
  
  // Food Preferences
  acceptedCategories: FoodCategory[];
  acceptedFoodTypes: FoodType[];
  
  // Capacity
  maxCapacity: number;
  currentCapacity: number;
  capacityUnit: CapacityUnit;
  
  // Availability
  isCurrentlyAvailable: boolean;
  operatingSchedule: DaySchedule[];
  
  // Verification
  verificationStatus: NGOVerificationStatus;
  verificationNotes?: string;
  
  updatedAt?: string;
}

// MODULE 4 — DYNAMIC MATCHING TYPES
export type MatchStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface DonationMatch {
  id: string;
  donationId: string;
  ngoId: string;
  organizationName: string;
  ngoContactPerson?: string;
  ngoPhone?: string;
  ngoAddress?: string;
  ngoCity?: string;
  
  // Distance & Capacity
  distanceKm: number;
  availableCapacity: number;
  capacityUnit: CapacityUnit;
  maxCapacity: number;
  currentCapacity: number;
  
  // Food Info Snapshot
  donationQuantity: number;
  donationUnit: QuantityUnit;
  foodCategory: FoodCategory;
  foodType: FoodType;
  foodName: string;
  donorName: string;
  pickupAddress: string;
  pickupCity?: string;
  availableUntil: string;
  specialInstructions?: string;
  
  // Match Status
  matchStatus: MatchStatus;
  matchedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MatchingResult {
  donationId: string;
  matchesCount: number;
  radiusKm: number;
  matches: DonationMatch[];
}

// MODULE 5 — TIME-AWARE RADIUS EXPANSION TYPES
export type RadiusStage =
  | 'INITIAL' // 5 km
  | 'EXPANDED_10KM'
  | 'EXPANDED_15KM'
  | 'EXPANDED_20KM'
  | 'COMPLETED'
  | 'STOPPED';

export type MatchingStateStatus =
  | 'ACTIVE'
  | 'WAITING'
  | 'EXPANDING'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'MAX_RADIUS_REACHED'
  | 'STOPPED';

export interface DonationMatchingState {
  id: string;
  donationId: string;
  currentRadiusKm: number;
  radiusStage: RadiusStage;
  status: MatchingStateStatus;
  lastExpansionAt: string;
  nextExpansionAt: string | null;
  matchingStartedAt: string;
  matchingCompletedAt?: string | null;
  matchesFoundCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchingHistoryRecord {
  id: string;
  donationId: string;
  radiusKm: number;
  stage: RadiusStage;
  expandedAt: string;
  newMatchesFound: number;
  totalMatchesCount: number;
  notes?: string;
}

// MODULE 6 — NGO DONATION ACCEPTANCE & CONCURRENCY TYPES
export type AcceptanceStatus = 'CONFIRMED' | 'CANCELLED';

export interface DonationAcceptanceRecord {
  id: string;
  donationId: string;
  ngoId: string;
  matchId: string;
  deliveryId?: string;
  organizationName: string;
  contactPerson: string;
  phone: string;
  email: string;
  acceptedQuantity: number;
  capacityUnit: CapacityUnit;
  foodName: string;
  acceptedAt: string;
  status: AcceptanceStatus;
  notes?: string;
  createdAt: string;
}

export interface AcceptDonationRequest {
  notes?: string;
}

export interface RejectDonationRequest {
  reason?: string;
}

export interface AcceptanceResponse {
  success: boolean;
  message: string;
  donationId: string;
  matchId: string;
  ngoId: string;
  organizationName: string;
  status: DonationStatus;
  acceptedAt: string;
  acceptanceRecord?: DonationAcceptanceRecord;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

// MODULE 7 — VOLUNTEER & DELIVERY MANAGEMENT TYPES
export type VehicleType = 'WALK' | 'BIKE' | 'SCOOTER' | 'CAR' | 'VAN' | 'OTHER';

export type VolunteerAvailability = 'AVAILABLE' | 'UNAVAILABLE' | 'BUSY';

export type VolunteerVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface VolunteerProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  profileImageUrl?: string;
  vehicleType: VehicleType;
  availabilityStatus: VolunteerAvailability;
  verificationStatus: VolunteerVerificationStatus;
  serviceArea: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt?: string;
}

export type DeliveryStatus =
  | 'PENDING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKUP_PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export interface DeliveryTask {
  id: string;
  donationId: string;
  donorId: string;
  ngoId: string;
  volunteerId?: string | null;
  volunteerName?: string | null;
  volunteerPhone?: string | null;
  donorName: string;
  donorPhone: string;
  ngoName: string;
  ngoPhone: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropAddress: string;
  dropLatitude: number;
  dropLongitude: number;
  foodName: string;
  foodCategory: FoodCategory;
  quantity: number;
  unit: QuantityUnit;
  specialInstructions?: string;
  status: DeliveryStatus;
  distanceKm: number;
  availableUntil: string;
  createdAt: string;
  assignedAt?: string | null;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  inTransitAt?: string | null;
  deliveredAt?: string | null;
  updatedAt?: string;
  version: number;
}

export interface PickupConfirmation {
  id: string;
  deliveryId: string;
  volunteerId: string;
  confirmedAt: string;
  notes?: string;
  proofImageUrl?: string;
}

export interface DeliveryProof {
  id: string;
  deliveryId: string;
  volunteerId: string;
  confirmedAt: string;
  notes?: string;
  proofImageUrl?: string;
}

export interface AcceptDeliveryRequest {
  notes?: string;
}

export interface ConfirmPickupRequest {
  notes?: string;
  proofImageUrl?: string;
}

export interface StartDeliveryRequest {
  notes?: string;
}

export interface CompleteDeliveryRequest {
  notes?: string;
  proofImageUrl?: string;
}

export interface UpdateVolunteerProfileRequest {
  fullName?: string;
  phone?: string;
  vehicleType?: VehicleType;
  serviceArea?: string;
  latitude?: number;
  longitude?: number;
  profileImageUrl?: string;
}

export interface UpdateVolunteerAvailabilityRequest {
  availabilityStatus: VolunteerAvailability;
}

// MODULE 8 — NOTIFICATIONS & REAL-TIME COMMUNICATION TYPES
export type NotificationType =
  | 'DONATION_CREATED'
  | 'MATCH_FOUND'
  | 'MATCH_RADIUS_EXPANDED'
  | 'DONATION_ACCEPTED'
  | 'DONATION_REJECTED'
  | 'VOLUNTEER_ASSIGNED'
  | 'DELIVERY_ACCEPTED'
  | 'PICKUP_PENDING'
  | 'FOOD_PICKED_UP'
  | 'DELIVERY_STARTED'
  | 'DELIVERY_COMPLETED'
  | 'DONATION_EXPIRED'
  | 'DONATION_CANCELLED'
  | 'NGO_VERIFICATION'
  | 'VOLUNTEER_VERIFICATION'
  | 'SYSTEM_ALERT';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type NotificationCategory = 'DONATION' | 'MATCH' | 'DELIVERY' | 'SYSTEM' | 'VERIFICATION';

export type NotificationReferenceType = 'DONATION' | 'MATCH' | 'DELIVERY' | 'VOLUNTEER' | 'NGO' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  priority: NotificationPriority;
  referenceType?: NotificationReferenceType;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  browserEnabled?: boolean;
  donationUpdates?: boolean;
  matchingUpdates?: boolean;
  deliveryUpdates?: boolean;
  systemUpdates?: boolean;
  categories: {
    DONATION: boolean;
    MATCH: boolean;
    DELIVERY: boolean;
    SYSTEM: boolean;
    VERIFICATION: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  category?: NotificationCategory;
  title: string;
  message: string;
  priority?: NotificationPriority;
  referenceType?: NotificationReferenceType;
  referenceId?: string;
}

export interface NotificationFilterOptions {
  status?: 'ALL' | 'UNREAD' | 'READ';
  category?: 'ALL' | 'DONATION' | 'MATCHING' | 'MATCH' | 'DELIVERY' | 'SYSTEM' | 'VERIFICATION';
}

// MODULE 9 — MAPS, LOCATION & DELIVERY TRACKING TYPES
export interface LocationPoint {
  latitude: number;
  longitude: number;
  address?: string;
  label?: string;
  updatedAt?: string;
}

export interface MapMarkerData {
  id: string;
  type: 'PICKUP' | 'NGO' | 'VOLUNTEER';
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  address?: string;
  popupText?: string;
}

export interface DeliveryMapData {
  deliveryId: string;
  donationId: string;
  status: DeliveryStatus;
  pickup: LocationPoint;
  destination: LocationPoint;
  volunteer?: LocationPoint | null;
  distanceKm: number;
  estimatedTravelTimeMinutes?: number;
  donorName: string;
  ngoName: string;
  volunteerName?: string | null;
  foodName: string;
  quantity: number;
  unit: string;
  matchingRadiusKm?: number;
  lastUpdatedAt: string;
}

export interface VolunteerLocationUpdateInput {
  latitude: number;
  longitude: number;
}

export interface LocationHistoryRecord {
  id: string;
  volunteerId: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
}

// ==========================================
// Module 12: Audit, History & System Logs Types
// ==========================================

export type HistoryActorRole = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN' | 'SYSTEM';

export interface DonationHistoryEvent {
  id: string | number;
  donationId: string | number;
  donationCode: string;
  donorId?: string | number;
  matchedNgoId?: string | number;
  actorId?: string | number;
  actorEmail?: string;
  actorRole?: HistoryActorRole;
  eventType: string;
  previousStatus?: string | null;
  newStatus: string;
  description?: string;
  correlationId?: string;
  createdAt: string;
}

export interface DeliveryHistoryEvent {
  id: string | number;
  deliveryId: string | number;
  deliveryCode: string;
  donationId?: string | number;
  donationCode?: string;
  volunteerId?: string | number;
  ngoId?: string | number;
  actorId?: string | number;
  actorEmail?: string;
  actorRole?: HistoryActorRole;
  eventType: string;
  previousStatus?: string | null;
  newStatus: string;
  description?: string;
  correlationId?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string | number;
  actorId?: string | number;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousState?: string | null;
  newState?: string | null;
  reason?: string;
  correlationId?: string;
  createdAt: string;
}

export interface HistoryFilterParams {
  donationId?: string | number;
  donationCode?: string;
  deliveryId?: string | number;
  deliveryCode?: string;
  eventType?: string;
  entityType?: string;
  status?: string;
  actorRole?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}


