import api from './api';
import type {
  DonationAcceptanceRecord,
  AcceptanceResponse,
  ApiResponse,
  DonationMatch,
  FoodDonation,
  NGOProfileData,
  DonationMatchingState,
} from '../types';
import { ngoService } from './ngoService';
import { donationService } from './donationService';
import { matchingService } from './matchingService';
import { deliveryService } from './deliveryService';
import { notificationService } from './notificationService';

const ACCEPTANCES_STORAGE_KEY = 'foodbridge_mock_donation_acceptances';
const MATCHES_STORAGE_KEY = 'foodbridge_mock_donation_matches';
const DONATIONS_STORAGE_KEY = 'foodbridge_mock_donations';
const MATCHING_STATE_STORAGE_KEY = 'foodbridge_mock_donation_matching_states';
const NGO_PROFILE_STORAGE_KEY = 'foodbridge_mock_ngo_profile';

// In-Memory Mutex Lock for Concurrency Simulation
let isAcceptanceLockAcquired = false;

const acquireLock = async (): Promise<boolean> => {
  let attempts = 0;
  while (isAcceptanceLockAcquired && attempts < 20) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    attempts++;
  }
  if (isAcceptanceLockAcquired) return false;
  isAcceptanceLockAcquired = true;
  return true;
};

const releaseLock = () => {
  isAcceptanceLockAcquired = false;
};

const getStoredAcceptances = (): DonationAcceptanceRecord[] => {
  const raw = localStorage.getItem(ACCEPTANCES_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return [];
};

const saveStoredAcceptances = (records: DonationAcceptanceRecord[]) => {
  localStorage.setItem(ACCEPTANCES_STORAGE_KEY, JSON.stringify(records));
};

export const acceptanceService = {
  // POST /api/matches/{matchId}/accept — Perform transactional donation acceptance
  acceptDonation: async (matchId: string, notes?: string): Promise<AcceptanceResponse> => {
    try {
      const res = await api.post<ApiResponse<AcceptanceResponse>>(`/matches/${matchId}/accept`, { notes });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Acceptance failed');
    } catch (err: unknown) {
      // Mock Fallback Execution with Concurrency Lock
      const lockAcquired = await acquireLock();
      if (!lockAcquired) {
        throw new Error('CONFLICT: Simultaneous acceptance request in progress. Please try again.');
      }

      try {
        // Retrieve Authenticated NGO Profile
        const ngoProfile: NGOProfileData = await ngoService.getNGOProfile();
        if (!ngoProfile) {
          throw new Error('NGO profile not found for authenticated user.');
        }

        // Rule 3: NGO Verification Status
        if (ngoProfile.verificationStatus !== 'VERIFIED') {
          throw new Error('UNAUTHORIZED: Only verified NGOs are eligible to accept donations.');
        }

        // Rule 4: NGO Availability
        if (!ngoProfile.isCurrentlyAvailable) {
          throw new Error('UNAVAILABLE: NGO is currently marked as unavailable for receiving food.');
        }

        // Retrieve Match Record
        const matchRecord = await matchingService.getMatchDetails(matchId);
        if (!matchRecord) {
          throw new Error(`Match #${matchId} was not found.`);
        }

        // Rule 2: NGO Ownership
        if (matchRecord.ngoId !== ngoProfile.id) {
          throw new Error('FORBIDDEN: You can only accept matches assigned to your organization.');
        }

        // Rule 6: Match Status OFFERED
        if (matchRecord.matchStatus !== 'OFFERED') {
          if (matchRecord.matchStatus === 'ACCEPTED') {
            throw new Error('CONFLICT: This donation match has already been accepted.');
          }
          throw new Error(`INVALID_STATE: Match status is '${matchRecord.matchStatus}' and cannot be accepted.`);
        }

        // Retrieve Donation Record
        const donation: FoodDonation | null = await donationService.getDonationById(matchRecord.donationId);
        if (!donation) {
          throw new Error(`Donation #${matchRecord.donationId} was not found.`);
        }

        // Rule 7 & Rule 9: Donation Status & Concurrency Check
        if (donation.status === 'ACCEPTED') {
          throw new Error('CONFLICT: This donation has already been accepted by another NGO.');
        }

        if (donation.status !== 'AVAILABLE' && donation.status !== 'MATCHING') {
          throw new Error(`INVALID_STATE: Donation status '${donation.status}' cannot be accepted.`);
        }

        // Rule 8: Expiration Check
        const now = new Date();
        const availableUntilDate = new Date(donation.availableUntil);
        if (!isNaN(availableUntilDate.getTime()) && availableUntilDate < now) {
          throw new Error('EXPIRED: This donation availability window has expired.');
        }

        // Rule 10 & 11: NGO Capacity Check
        const availableCapacity = ngoProfile.maxCapacity - ngoProfile.currentCapacity;
        if (availableCapacity < donation.quantity) {
          throw new Error(
            `INSUFFICIENT_CAPACITY: NGO available capacity (${availableCapacity} ${ngoProfile.capacityUnit}) is insufficient for donation quantity (${donation.quantity} ${donation.unit}).`
          );
        }

        // Double check persistent acceptances table for duplicate claim
        const storedAcceptances = getStoredAcceptances();
        const existingClaim = storedAcceptances.find((a) => a.donationId === donation.id && a.status === 'CONFIRMED');
        if (existingClaim) {
          throw new Error('CONFLICT: This donation has already been accepted by another NGO.');
        }

        // ATOMIC TRANSACTION EXECUTION:
        const nowStr = now.toISOString();

        // 1. Create Acceptance Record
        const acceptanceRecord: DonationAcceptanceRecord = {
          id: `acc_${donation.id}_${ngoProfile.id}_${Date.now()}`,
          donationId: donation.id,
          ngoId: ngoProfile.id,
          matchId,
          organizationName: ngoProfile.organizationName,
          contactPerson: ngoProfile.contactPerson,
          phone: ngoProfile.phone,
          email: ngoProfile.email,
          acceptedQuantity: donation.quantity,
          capacityUnit: ngoProfile.capacityUnit,
          foodName: donation.foodName,
          acceptedAt: nowStr,
          status: 'CONFIRMED',
          notes,
          createdAt: nowStr,
        };
        storedAcceptances.push(acceptanceRecord);
        saveStoredAcceptances(storedAcceptances);

        // 2. Update Donation Status -> ACCEPTED
        const allDonationsRaw = localStorage.getItem(DONATIONS_STORAGE_KEY);
        if (allDonationsRaw) {
          try {
            const donationsList: FoodDonation[] = JSON.parse(allDonationsRaw);
            const donIdx = donationsList.findIndex((d) => d.id === donation.id);
            if (donIdx >= 0) {
              donationsList[donIdx].status = 'ACCEPTED';
              donationsList[donIdx].matchedNgoId = ngoProfile.id;
              donationsList[donIdx].matchedNgoName = ngoProfile.organizationName;
              donationsList[donIdx].updatedAt = nowStr;
              localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(donationsList));
            }
          } catch {
            /* ignore */
          }
        }

        // 3. Update Match Records: Target -> ACCEPTED, Competing -> CANCELLED
        const allMatchesRaw = localStorage.getItem(MATCHES_STORAGE_KEY);
        if (allMatchesRaw) {
          try {
            const matchesList: DonationMatch[] = JSON.parse(allMatchesRaw);
            for (let i = 0; i < matchesList.length; i++) {
              if (matchesList[i].donationId === donation.id) {
                if (matchesList[i].id === matchId) {
                  matchesList[i].matchStatus = 'ACCEPTED';
                  matchesList[i].updatedAt = nowStr;
                } else if (matchesList[i].matchStatus === 'OFFERED') {
                  matchesList[i].matchStatus = 'CANCELLED';
                  matchesList[i].updatedAt = nowStr;
                }
              }
            }
            localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matchesList));
          } catch {
            /* ignore */
          }
        }

        // 4. Update NGO Capacity: currentCapacity += donation.quantity
        const updatedNGOProfile: NGOProfileData = {
          ...ngoProfile,
          currentCapacity: ngoProfile.currentCapacity + donation.quantity,
          updatedAt: nowStr,
        };
        localStorage.setItem(NGO_PROFILE_STORAGE_KEY, JSON.stringify(updatedNGOProfile));

        // 5. Update Module 5 Radius Expansion Matching State -> ACCEPTED (Halting Module 5)
        const allStatesRaw = localStorage.getItem(MATCHING_STATE_STORAGE_KEY);
        if (allStatesRaw) {
          try {
            const statesList: DonationMatchingState[] = JSON.parse(allStatesRaw);
            const stIdx = statesList.findIndex((s) => s.donationId === donation.id);
            if (stIdx >= 0) {
              statesList[stIdx].status = 'ACCEPTED';
              statesList[stIdx].radiusStage = 'COMPLETED';
              statesList[stIdx].nextExpansionAt = null;
              statesList[stIdx].matchingCompletedAt = nowStr;
              statesList[stIdx].updatedAt = nowStr;
              localStorage.setItem(MATCHING_STATE_STORAGE_KEY, JSON.stringify(statesList));
            }
          } catch {
            /* ignore */
          }
        }

        // 6. MODULE 7 AUTOMATIC INTEGRATION: Create Delivery Task (PENDING_ASSIGNMENT)
        try {
          await deliveryService.createDeliveryTaskForAcceptedDonation(donation, ngoProfile, acceptanceRecord);
        } catch {
          /* ignore delivery task creation errors */
        }

        // 7. MODULE 8 NOTIFICATION INTEGRATION: Notify Donor & NGO
        try {
          // Notify Donor
          await notificationService.createNotification({
            userId: donation.donorId || 'usr_donor_1',
            type: 'DONATION_ACCEPTED',
            title: 'Donation Accepted!',
            message: `Your food donation for '${donation.foodName}' has been accepted by ${ngoProfile.organizationName}.`,
            priority: 'HIGH',
            referenceType: 'DONATION',
            referenceId: donation.id,
          });

          // Notify NGO
          await notificationService.createNotification({
            userId: (ngoProfile as any).userId || ngoProfile.id,
            type: 'DONATION_ACCEPTED',
            title: 'Donation Acceptance Confirmed',
            message: `You successfully accepted '${donation.foodName}' (${donation.quantity} ${donation.unit}). Delivery task is pending volunteer assignment.`,
            priority: 'HIGH',
            referenceType: 'DONATION',
            referenceId: donation.id,
          });
        } catch {
          /* ignore notification errors */
        }

        return {
          success: true,
          message: 'Donation accepted successfully.',
          donationId: donation.id,
          matchId,
          ngoId: ngoProfile.id,
          organizationName: ngoProfile.organizationName,
          status: 'ACCEPTED',
          acceptedAt: nowStr,
          acceptanceRecord,
        };
      } finally {
        releaseLock();
      }
    }
  },

  // POST /api/matches/{matchId}/reject — Reject a matched donation
  rejectDonation: async (matchId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post<ApiResponse<{ success: boolean; message: string }>>(`/matches/${matchId}/reject`, { reason });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const ngoProfile: NGOProfileData = await ngoService.getNGOProfile();
      const matchRecord = await matchingService.getMatchDetails(matchId);
      if (!matchRecord) {
        throw new Error(`Match #${matchId} was not found.`);
      }

      if (matchRecord.ngoId !== ngoProfile.id) {
        throw new Error('FORBIDDEN: You can only reject matches assigned to your organization.');
      }

      if (matchRecord.matchStatus !== 'OFFERED') {
        throw new Error(`Match status is '${matchRecord.matchStatus}' and cannot be rejected.`);
      }

      const nowStr = new Date().toISOString();
      const allMatchesRaw = localStorage.getItem(MATCHES_STORAGE_KEY);
      if (allMatchesRaw) {
        try {
          const matchesList: DonationMatch[] = JSON.parse(allMatchesRaw);
          const mIdx = matchesList.findIndex((m) => m.id === matchId);
          if (mIdx >= 0) {
            matchesList[mIdx].matchStatus = 'REJECTED';
            matchesList[mIdx].specialInstructions = reason ? `Rejected Reason: ${reason}` : undefined;
            matchesList[mIdx].updatedAt = nowStr;
            localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matchesList));
          }
        } catch {
          /* ignore */
        }
      }

      return {
        success: true,
        message: 'Donation offer rejected.',
      };
    }
  },

  // GET /api/donations/{donationId}/acceptance — Fetch acceptance record for a donation
  getDonationAcceptance: async (donationId: string): Promise<DonationAcceptanceRecord | null> => {
    try {
      const res = await api.get<ApiResponse<DonationAcceptanceRecord>>(`/donations/${donationId}/acceptance`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const acceptances = getStoredAcceptances();
      const found = acceptances.find((a) => a.donationId === donationId && a.status === 'CONFIRMED');
      return found || null;
    }
  },
};
