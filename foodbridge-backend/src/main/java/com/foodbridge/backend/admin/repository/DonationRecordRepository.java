package com.foodbridge.backend.admin.repository;

import com.foodbridge.backend.admin.entity.DonationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DonationRecordRepository extends JpaRepository<DonationRecord, Long> {
    Optional<DonationRecord> findByDonationCode(String donationCode);
    List<DonationRecord> findAllByOrderByCreatedAtDesc();
    List<DonationRecord> findByStatus(String status);
    List<DonationRecord> findByDonorIdOrderByCreatedAtDesc(Long donorId);
    List<DonationRecord> findByMatchedNgoIdOrderByCreatedAtDesc(Long matchedNgoId);
    List<DonationRecord> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
    List<DonationRecord> findByDonorIdAndCreatedAtBetween(Long donorId, LocalDateTime from, LocalDateTime to);
    List<DonationRecord> findByMatchedNgoIdAndCreatedAtBetween(Long matchedNgoId, LocalDateTime from, LocalDateTime to);

    long countByStatus(String status);
    long countByDonorId(Long donorId);
    long countByDonorIdAndStatus(Long donorId, String status);
    long countByMatchedNgoIdAndStatus(Long matchedNgoId, String status);

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM DonationRecord d WHERE d.status = 'DELIVERED'")
    Double sumDeliveredQuantity();

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM DonationRecord d WHERE d.status = 'DELIVERED' AND d.deliveredAt >= :start AND d.deliveredAt < :end")
    Double sumDeliveredQuantityBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM DonationRecord d WHERE d.createdAt >= :start AND d.createdAt < :end")
    Double sumCreatedQuantityBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM DonationRecord d WHERE d.donorId = :donorId")
    Double sumDonorOfferedQuantity(@Param("donorId") Long donorId);

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM DonationRecord d WHERE d.donorId = :donorId AND d.status = 'DELIVERED'")
    Double sumDonorDistributedQuantity(@Param("donorId") Long donorId);

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM DonationRecord d WHERE d.matchedNgoId = :ngoId AND d.status = 'DELIVERED' AND d.deliveredAt >= :start AND d.deliveredAt < :end")
    Double sumNgoReceivedQuantityBetween(@Param("ngoId") Long ngoId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
