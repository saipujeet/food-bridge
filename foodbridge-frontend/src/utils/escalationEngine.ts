import type { DonationStatus, RadiusStage, MatchingStateStatus } from '../types';

export const CONFIGURABLE_RADIUS_STAGES = [5, 10, 15, 20] as const;
export const INITIAL_RADIUS_KM = 5;
export const MAX_RADIUS_LIMIT_KM = 20;

/**
 * Calculates remaining time in minutes until donation availability window expires.
 */
export function calculateRemainingTimeMinutes(availableUntil: string, now: Date = new Date()): number {
  const expiryDate = new Date(availableUntil);
  if (isNaN(expiryDate.getTime())) return 0;
  const diffMs = expiryDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
}

/**
 * Gets the next radius stage given the current search radius in km.
 */
export function getNextRadiusStage(currentRadius: number): {
  nextRadius: number | null;
  nextStage: RadiusStage;
} {
  if (currentRadius < 10) {
    return { nextRadius: 10, nextStage: 'EXPANDED_10KM' };
  }
  if (currentRadius < 15) {
    return { nextRadius: 15, nextStage: 'EXPANDED_15KM' };
  }
  if (currentRadius < 20) {
    return { nextRadius: 20, nextStage: 'EXPANDED_20KM' };
  }
  return { nextRadius: null, nextStage: 'EXPANDED_20KM' };
}

/**
 * Maps radius in km to explicit RadiusStage enum.
 */
export function getRadiusStageForKm(radiusKm: number): RadiusStage {
  if (radiusKm <= 5) return 'INITIAL';
  if (radiusKm <= 10) return 'EXPANDED_10KM';
  if (radiusKm <= 15) return 'EXPANDED_15KM';
  return 'EXPANDED_20KM';
}

export interface StopConditionResult {
  shouldStop: boolean;
  stopReason?: string;
  nextStatus?: MatchingStateStatus;
}

/**
 * Evaluates whether radius expansion must halt based on business stop conditions:
 * 1. NGO Acceptance (Donation status = ACCEPTED)
 * 2. Donation Expiration (current_time >= available_until)
 * 3. Maximum Radius (current_radius >= 20 km)
 */
export function evaluateEscalationStopConditions(
  donationStatus: DonationStatus,
  availableUntil: string,
  currentRadiusKm: number,
  now: Date = new Date()
): StopConditionResult {
  // Stop Condition A: NGO Acceptance
  if (donationStatus === 'ACCEPTED') {
    return {
      shouldStop: true,
      stopReason: 'Donation has been accepted by an NGO.',
      nextStatus: 'ACCEPTED',
    };
  }

  // Stop Condition B: Donation Expiration
  const remainingMinutes = calculateRemainingTimeMinutes(availableUntil, now);
  if (remainingMinutes <= 0 || donationStatus === 'EXPIRED' || donationStatus === 'CANCELLED') {
    return {
      shouldStop: true,
      stopReason: 'Donation availability time has expired or donation was cancelled.',
      nextStatus: 'EXPIRED',
    };
  }

  // Stop Condition C: Maximum Radius Limit (20 km)
  if (currentRadiusKm >= MAX_RADIUS_LIMIT_KM) {
    return {
      shouldStop: true,
      stopReason: `Maximum matching search radius (${MAX_RADIUS_LIMIT_KM} km) reached.`,
      nextStatus: 'MAX_RADIUS_REACHED',
    };
  }

  return { shouldStop: false };
}

/**
 * Calculates the next expansion timestamp dynamically based on remaining donation time.
 * For time-aware escalation:
 * - If remaining time > 120 mins: 15 minutes delay.
 * - If remaining time 30-120 mins: 10 minutes delay.
 * - If remaining time < 30 mins: 5 minutes delay.
 */
export function calculateNextExpansionTime(
  now: Date = new Date(),
  remainingMinutes: number = 180,
  configuredDelayMins: number = 15
): Date {
  let delayMinutes = configuredDelayMins;
  if (remainingMinutes < 30) {
    delayMinutes = Math.min(configuredDelayMins, 5);
  } else if (remainingMinutes < 60) {
    delayMinutes = Math.min(configuredDelayMins, 10);
  }
  return new Date(now.getTime() + delayMinutes * 60 * 1000);
}
