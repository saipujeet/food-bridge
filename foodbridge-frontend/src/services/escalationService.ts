import api from './api';
import type {
  DonationMatchingState,
  MatchingHistoryRecord,
  ApiResponse,
  MatchingStateStatus,
} from '../types';
import {
  INITIAL_RADIUS_KM,
  MAX_RADIUS_LIMIT_KM,
  evaluateEscalationStopConditions,
  getNextRadiusStage,
  calculateNextExpansionTime,
  calculateRemainingTimeMinutes,
} from '../utils/escalationEngine';
import { matchingService } from './matchingService';
import { donationService } from './donationService';

const MATCHING_STATE_STORAGE_KEY = 'foodbridge_mock_donation_matching_states';
const MATCHING_HISTORY_STORAGE_KEY = 'foodbridge_mock_donation_matching_history';

/**
 * Gets mock persisted matching states.
 */
const getStoredMatchingStates = (): DonationMatchingState[] => {
  const raw = localStorage.getItem(MATCHING_STATE_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return [];
};

/**
 * Saves mock matching states.
 */
const saveStoredMatchingStates = (states: DonationMatchingState[]) => {
  localStorage.setItem(MATCHING_STATE_STORAGE_KEY, JSON.stringify(states));
};

/**
 * Gets mock history records.
 */
const getStoredHistory = (): MatchingHistoryRecord[] => {
  const raw = localStorage.getItem(MATCHING_HISTORY_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return [];
};

/**
 * Saves history records.
 */
const saveStoredHistory = (history: MatchingHistoryRecord[]) => {
  localStorage.setItem(MATCHING_HISTORY_STORAGE_KEY, JSON.stringify(history));
};

export const escalationService = {
  // GET /api/matching/donation/{donationId}/status — Fetch donation matching state
  getMatchingState: async (donationId: string): Promise<DonationMatchingState | null> => {
    try {
      const res = await api.get<ApiResponse<DonationMatchingState>>(`/matching/donation/${donationId}/status`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const states = getStoredMatchingStates();
      const existing = states.find((s) => s.donationId === donationId);
      if (existing) return existing;

      // If no matching state exists yet, check if donation exists and auto-start state at 5 km
      const donation = await donationService.getDonationById(donationId);
      if (donation && (donation.status === 'AVAILABLE' || donation.status === 'MATCHING')) {
        return escalationService.startMatchingState(donationId);
      }
      return null;
    }
  },

  // POST /api/matching/donation/{donationId}/start — Initialize matching process at 5 km
  startMatchingState: async (donationId: string): Promise<DonationMatchingState> => {
    try {
      const res = await api.post<ApiResponse<DonationMatchingState>>(`/matching/donation/${donationId}/start`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const states = getStoredMatchingStates();
      const existingIndex = states.findIndex((s) => s.donationId === donationId);

      // Prevent starting active matching twice
      if (existingIndex >= 0 && states[existingIndex].status === 'ACTIVE') {
        return states[existingIndex];
      }

      const donation = await donationService.getDonationById(donationId);
      if (!donation) {
        throw new Error(`Donation #${donationId} was not found.`);
      }

      const now = new Date();
      const nowStr = now.toISOString();
      const remainingMinutes = calculateRemainingTimeMinutes(donation.availableUntil, now);
      const nextExpansion = calculateNextExpansionTime(now, remainingMinutes, 15);

      // Re-use Module 4 to execute initial 5 km matching
      const initialMatches = await matchingService.runMatching(donationId, INITIAL_RADIUS_KM);

      const newState: DonationMatchingState = {
        id: `mstate_${donationId}`,
        donationId,
        currentRadiusKm: INITIAL_RADIUS_KM,
        radiusStage: 'INITIAL',
        status: 'ACTIVE',
        lastExpansionAt: nowStr,
        nextExpansionAt: nextExpansion.toISOString(),
        matchingStartedAt: nowStr,
        matchesFoundCount: initialMatches.length,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      if (existingIndex >= 0) {
        states[existingIndex] = newState;
      } else {
        states.push(newState);
      }
      saveStoredMatchingStates(states);

      // Record History Event
      const historyRecord: MatchingHistoryRecord = {
        id: `mhist_${donationId}_5km_${Date.now()}`,
        donationId,
        radiusKm: INITIAL_RADIUS_KM,
        stage: 'INITIAL',
        expandedAt: nowStr,
        newMatchesFound: initialMatches.length,
        totalMatchesCount: initialMatches.length,
        notes: `Initial search executed at 5 km radius. Found ${initialMatches.length} verified NGO match(es).`,
      };
      const history = getStoredHistory();
      history.push(historyRecord);
      saveStoredHistory(history);

      return newState;
    }
  },

  // POST /api/matching/donation/{donationId}/expand — Expand search radius (5 -> 10 -> 15 -> 20 km)
  expandMatchingRadius: async (donationId: string): Promise<DonationMatchingState> => {
    try {
      const res = await api.post<ApiResponse<DonationMatchingState>>(`/matching/donation/${donationId}/expand`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const states = getStoredMatchingStates();
      const stateIndex = states.findIndex((s) => s.donationId === donationId);
      if (stateIndex < 0) {
        throw new Error(`Matching process has not been started for donation #${donationId}.`);
      }

      const currentState = states[stateIndex];
      const donation = await donationService.getDonationById(donationId);
      if (!donation) {
        throw new Error(`Donation #${donationId} was not found.`);
      }

      const now = new Date();
      const nowStr = now.toISOString();

      // Check Stop Conditions (NGO Acceptance, Expiration, Max Radius Limit)
      const stopEval = evaluateEscalationStopConditions(
        donation.status,
        donation.availableUntil,
        currentState.currentRadiusKm,
        now
      );

      if (stopEval.shouldStop) {
        const updatedStoppedState: DonationMatchingState = {
          ...currentState,
          status: stopEval.nextStatus || 'STOPPED',
          nextExpansionAt: null,
          matchingCompletedAt: nowStr,
          updatedAt: nowStr,
        };
        states[stateIndex] = updatedStoppedState;
        saveStoredMatchingStates(states);
        return updatedStoppedState;
      }

      // Calculate Next Radius Stage
      const { nextRadius, nextStage } = getNextRadiusStage(currentState.currentRadiusKm);
      if (!nextRadius) {
        const cappedState: DonationMatchingState = {
          ...currentState,
          status: 'MAX_RADIUS_REACHED',
          nextExpansionAt: null,
          matchingCompletedAt: nowStr,
          updatedAt: nowStr,
        };
        states[stateIndex] = cappedState;
        saveStoredMatchingStates(states);
        return cappedState;
      }

      // Re-use Module 4 to execute matching engine for new expanded radius
      const expandedMatches = await matchingService.runMatching(donationId, nextRadius);

      const remainingMinutes = calculateRemainingTimeMinutes(donation.availableUntil, now);
      const isMaxRadius = nextRadius >= MAX_RADIUS_LIMIT_KM;
      const nextExpansion = isMaxRadius ? null : calculateNextExpansionTime(now, remainingMinutes, 15);

      const nextStatus: MatchingStateStatus = isMaxRadius ? 'MAX_RADIUS_REACHED' : 'ACTIVE';

      const updatedState: DonationMatchingState = {
        ...currentState,
        currentRadiusKm: nextRadius,
        radiusStage: nextStage,
        status: nextStatus,
        lastExpansionAt: nowStr,
        nextExpansionAt: nextExpansion ? nextExpansion.toISOString() : null,
        matchesFoundCount: expandedMatches.length,
        matchingCompletedAt: isMaxRadius ? nowStr : undefined,
        updatedAt: nowStr,
      };

      states[stateIndex] = updatedState;
      saveStoredMatchingStates(states);

      // Record History Event
      const historyRecord: MatchingHistoryRecord = {
        id: `mhist_${donationId}_${nextRadius}km_${Date.now()}`,
        donationId,
        radiusKm: nextRadius,
        stage: nextStage,
        expandedAt: nowStr,
        newMatchesFound: Math.max(0, expandedMatches.length - currentState.matchesFoundCount),
        totalMatchesCount: expandedMatches.length,
        notes: `Search radius expanded to ${nextRadius} km (${nextStage}). Total matches: ${expandedMatches.length}.`,
      };
      const history = getStoredHistory();
      history.push(historyRecord);
      saveStoredHistory(history);

      return updatedState;
    }
  },

  // GET /api/matching/donation/{donationId}/history — Get radius expansion history logs
  getMatchingHistory: async (donationId: string): Promise<MatchingHistoryRecord[]> => {
    try {
      const res = await api.get<ApiResponse<MatchingHistoryRecord[]>>(`/matching/donation/${donationId}/history`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const history = getStoredHistory();
      return history.filter((h) => h.donationId === donationId);
    }
  },

  // Scheduler Simulator — Scans active matching states and expands eligible ones
  runAutomatedEscalationScheduler: async (): Promise<number> => {
    const states = getStoredMatchingStates();
    const now = new Date();
    let expansionsProcessed = 0;

    for (const state of states) {
      if (state.status === 'ACTIVE' && state.nextExpansionAt) {
        const nextTime = new Date(state.nextExpansionAt);
        if (now >= nextTime) {
          try {
            await escalationService.expandMatchingRadius(state.donationId);
            expansionsProcessed++;
          } catch {
            /* ignore idempotent scheduler error */
          }
        }
      }
    }

    return expansionsProcessed;
  },
};
