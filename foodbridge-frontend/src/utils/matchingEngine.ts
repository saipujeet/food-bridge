import type { FoodDonation, NGOProfileData, DonationMatch } from '../types';
import { calculateHaversineDistance, isValidCoordinate } from './distanceUtils';
import { calculateAvailableCapacity } from './capacityUtils';

export const INITIAL_MATCHING_RADIUS_KM = 5;

export interface MatchEvaluationDetail {
  isEligible: boolean;
  reason?: string;
  distanceKm?: number;
  availableCapacity?: number;
}

/**
 * Evaluates whether a single NGO is eligible for a specific food donation
 * based on the 7 core FoodBridge deterministic business rules.
 */
export function evaluateNGOMatch(
  donation: FoodDonation,
  ngo: NGOProfileData,
  radiusKm: number = INITIAL_MATCHING_RADIUS_KM
): MatchEvaluationDetail {
  // RULE 1: Donation Eligibility & Expiry
  if (donation.status !== 'AVAILABLE' && donation.status !== 'MATCHING') {
    return { isEligible: false, reason: `Donation status '${donation.status}' is not eligible for matching.` };
  }

  const now = new Date();
  let availableUntilDate = new Date(donation.availableUntil);
  if (isNaN(availableUntilDate.getTime()) && typeof donation.availableUntil === 'string') {
    availableUntilDate = new Date(donation.availableUntil.replace(' ', 'T'));
  }
  if (!isNaN(availableUntilDate.getTime()) && availableUntilDate < now) {
    return { isEligible: false, reason: 'Donation availability window has expired.' };
  }

  // RULE 2: NGO Verification Status
  if (ngo.verificationStatus !== 'VERIFIED') {
    return { isEligible: false, reason: `NGO verification status is '${ngo.verificationStatus}' (requires VERIFIED).` };
  }

  // RULE 3: Food Category Compatibility
  const acceptsCategory = ngo.acceptedCategories && ngo.acceptedCategories.includes(donation.foodCategory);
  if (!acceptsCategory) {
    return { isEligible: false, reason: `NGO does not accept food category '${donation.foodCategory}'.` };
  }

  // RULE 4: Food Type Compatibility
  const acceptsType = ngo.acceptedFoodTypes && ngo.acceptedFoodTypes.includes(donation.foodType);
  if (!acceptsType) {
    return { isEligible: false, reason: `NGO does not accept food type '${donation.foodType}'.` };
  }

  // RULE 5: NGO Capacity
  const availableCap = calculateAvailableCapacity(ngo.maxCapacity, ngo.currentCapacity);
  if (availableCap < donation.quantity) {
    return {
      isEligible: false,
      reason: `Insufficient NGO capacity (${availableCap} available vs ${donation.quantity} required).`,
      availableCapacity: availableCap,
    };
  }

  // RULE 6: NGO Availability Status
  if (!ngo.isCurrentlyAvailable) {
    return { isEligible: false, reason: 'NGO is currently marked as unavailable for receiving donations.' };
  }

  // RULE 7: Distance Calculation & Radius Check
  if (!isValidCoordinate(donation.latitude, donation.longitude)) {
    return { isEligible: false, reason: 'Pickup location coordinates are missing or invalid.' };
  }

  if (!isValidCoordinate(ngo.latitude, ngo.longitude)) {
    return { isEligible: false, reason: 'NGO coordinates are missing or invalid.' };
  }

  const distance = calculateHaversineDistance(
    donation.latitude!,
    donation.longitude!,
    ngo.latitude,
    ngo.longitude
  );

  if (distance > radiusKm) {
    return {
      isEligible: false,
      reason: `Distance of ${distance} km exceeds search radius of ${radiusKm} km.`,
      distanceKm: distance,
      availableCapacity: availableCap,
    };
  }

  return {
    isEligible: true,
    distanceKm: distance,
    availableCapacity: availableCap,
  };
}

/**
 * Runs the dynamic matching engine across a list of NGOs for a given donation.
 * Filters eligible candidates within radiusKm (default 5 km) and returns sorted DonationMatch records.
 */
export function runMatchingEngine(
  donation: FoodDonation,
  ngos: NGOProfileData[],
  existingMatches: DonationMatch[] = [],
  radiusKm: number = INITIAL_MATCHING_RADIUS_KM
): DonationMatch[] {
  const newMatches: DonationMatch[] = [];
  const nowStr = new Date().toISOString();

  // 4 hours default offer expiry
  const expiresAtStr = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

  const eligibleNGOs: { ngo: NGOProfileData; distanceKm: number; availableCapacity: number }[] = [];

  for (const ngo of ngos) {
    const evalResult = evaluateNGOMatch(donation, ngo, radiusKm);
    if (evalResult.isEligible && evalResult.distanceKm !== undefined && evalResult.availableCapacity !== undefined) {
      eligibleNGOs.push({
        ngo,
        distanceKm: evalResult.distanceKm,
        availableCapacity: evalResult.availableCapacity,
      });
    }
  }

  // Priority Sort: Distance ascending
  eligibleNGOs.sort((a, b) => a.distanceKm - b.distanceKm);

  for (const item of eligibleNGOs) {
    const { ngo, distanceKm, availableCapacity } = item;

    // Duplicate match prevention: Check if active offer already exists for this donation + ngo
    const existingActive = existingMatches.find(
      (m) => m.donationId === donation.id && m.ngoId === ngo.id && (m.matchStatus === 'OFFERED' || m.matchStatus === 'ACCEPTED')
    );

    if (existingActive) {
      // Update existing active match with latest recalculated distance & donation details
      existingActive.distanceKm = distanceKm;
      existingActive.availableCapacity = availableCapacity;
      existingActive.donationQuantity = donation.quantity;
      existingActive.donationUnit = donation.unit;
      existingActive.foodCategory = donation.foodCategory;
      existingActive.foodType = donation.foodType;
      existingActive.foodName = donation.foodName;
      existingActive.donorName = donation.donorName;
      existingActive.pickupAddress = donation.donorAddress;
      existingActive.pickupCity = donation.donorCity;
      existingActive.availableUntil = donation.availableUntil;
      existingActive.specialInstructions = donation.specialInstructions;
      existingActive.updatedAt = nowStr;

      newMatches.push(existingActive);
    } else {
      const matchRecord: DonationMatch = {
        id: `match_${donation.id}_${ngo.id}_${Date.now()}`,
        donationId: donation.id,
        ngoId: ngo.id,
        organizationName: ngo.organizationName,
        ngoContactPerson: ngo.contactPerson,
        ngoPhone: ngo.phone,
        ngoAddress: ngo.address,
        ngoCity: ngo.city,

        distanceKm,
        availableCapacity,
        capacityUnit: ngo.capacityUnit,
        maxCapacity: ngo.maxCapacity,
        currentCapacity: ngo.currentCapacity,

        donationQuantity: donation.quantity,
        donationUnit: donation.unit,
        foodCategory: donation.foodCategory,
        foodType: donation.foodType,
        foodName: donation.foodName,
        donorName: donation.donorName,
        pickupAddress: donation.donorAddress,
        pickupCity: donation.donorCity,
        availableUntil: donation.availableUntil,
        specialInstructions: donation.specialInstructions,

        matchStatus: 'OFFERED', // Initial match status for Module 4
        matchedAt: nowStr,
        expiresAt: expiresAtStr,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      newMatches.push(matchRecord);
    }
  }

  return newMatches;
}
