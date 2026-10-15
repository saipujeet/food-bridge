import React, { useState } from 'react';
import { useNGOMatches } from '../../hooks/useNGOMatches';
import { useAcceptance } from '../../hooks/useAcceptance';
import type { DonationMatch } from '../../types';
import { MatchCard } from '../../components/matching/MatchCard';
import { MatchDetailsModal } from '../../components/matching/MatchDetailsModal';
import { AcceptDonationModal } from '../../components/matching/AcceptDonationModal';
import { RejectDonationModal } from '../../components/matching/RejectDonationModal';
import { AcceptanceSuccessModal } from '../../components/matching/AcceptanceSuccessModal';
import { AcceptanceConflictModal } from '../../components/matching/AcceptanceConflictModal';
import { MatchingLoader } from '../../components/matching/MatchingLoader';
import { MatchingEmptyState } from '../../components/matching/MatchingEmptyState';
import { MatchingErrorState } from '../../components/matching/MatchingErrorState';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Layers, Search, RefreshCw, Filter } from 'lucide-react';

export const MatchedDonations: React.FC = () => {
  const { showToast } = useToast();
  const {
    matches,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    refetchMatches,
  } = useNGOMatches();

  const {
    acceptanceRecord,
    isLoading: isAcceptanceLoading,
    conflictMessage,
    clearConflict,
    acceptDonation,
    rejectDonation,
  } = useAcceptance();

  const [selectedMatch, setSelectedMatch] = useState<DonationMatch | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  const handleViewDetails = (match: DonationMatch) => {
    setSelectedMatch(match);
    setIsDetailsModalOpen(true);
  };

  const handleOpenAcceptModal = (match: DonationMatch) => {
    setSelectedMatch(match);
    setIsAcceptModalOpen(true);
  };

  const handleOpenRejectModal = (match: DonationMatch) => {
    setSelectedMatch(match);
    setIsRejectModalOpen(true);
  };

  const handleConfirmAccept = async (notes?: string) => {
    if (!selectedMatch) return;
    const res = await acceptDonation(selectedMatch.id, notes);
    setIsAcceptModalOpen(false);
    if (res && res.success) {
      setIsSuccessModalOpen(true);
      refetchMatches();
    }
  };

  const handleConfirmReject = async (reason?: string) => {
    if (!selectedMatch) return;
    const ok = await rejectDonation(selectedMatch.id, reason);
    setIsRejectModalOpen(false);
    if (ok) {
      showToast('Offer Rejected', 'The matched donation offer has been removed.', 'info');
      refetchMatches();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Module 6 NGO Acceptance Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Matched Surplus Food Offers
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Accept or reject surplus food donations matched to your NGO. Acceptance is transactionally secured with concurrency control.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refetchMatches}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4 text-emerald-700" />}
        >
          Refresh Matches
        </Button>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Search by food name, donor, category, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>

          {(['ALL', 'OFFERED', 'ACCEPTED', 'REJECTED', 'EXPIRED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* MATCHES GRID VIEW */}
      {isLoading ? (
        <MatchingLoader radiusKm={5} />
      ) : error ? (
        <MatchingErrorState error={error} onRetry={refetchMatches} />
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onViewDetails={handleViewDetails}
              onAccept={handleOpenAcceptModal}
              onReject={handleOpenRejectModal}
            />
          ))}
        </div>
      ) : (
        <MatchingEmptyState radiusKm={5} />
      )}

      {/* MATCH DETAILS MODAL */}
      <MatchDetailsModal
        match={selectedMatch}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onAccept={handleOpenAcceptModal}
        onReject={handleOpenRejectModal}
      />

      {/* ACCEPTANCE CONFIRMATION MODAL */}
      <AcceptDonationModal
        match={selectedMatch}
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={handleConfirmAccept}
        isLoading={isAcceptanceLoading}
      />

      {/* REJECTION CONFIRMATION MODAL */}
      <RejectDonationModal
        match={selectedMatch}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        isLoading={isAcceptanceLoading}
      />

      {/* ACCEPTANCE SUCCESS MODAL */}
      <AcceptanceSuccessModal
        record={acceptanceRecord}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* 409 CONFLICT MODAL */}
      <AcceptanceConflictModal
        isOpen={!!conflictMessage}
        message={conflictMessage}
        onClose={clearConflict}
        onRefresh={refetchMatches}
      />
    </div>
  );
};
