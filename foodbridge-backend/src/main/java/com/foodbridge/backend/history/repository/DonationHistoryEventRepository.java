package com.foodbridge.backend.history.repository;

import com.foodbridge.backend.history.entity.DonationHistoryEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonationHistoryEventRepository extends JpaRepository<DonationHistoryEvent, Long> {

    List<DonationHistoryEvent> findByDonationIdOrderByCreatedAtDescIdDesc(Long donationId);

    List<DonationHistoryEvent> findByDonationCodeOrderByCreatedAtDescIdDesc(String donationCode);

    Page<DonationHistoryEvent> findByDonorIdOrderByCreatedAtDescIdDesc(Long donorId, Pageable pageable);

    Page<DonationHistoryEvent> findByMatchedNgoIdOrderByCreatedAtDescIdDesc(Long matchedNgoId, Pageable pageable);

    Page<DonationHistoryEvent> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);

    @Query("SELECT e FROM DonationHistoryEvent e WHERE " +
           "(:donorId IS NULL OR e.donorId = :donorId) AND " +
           "(:ngoId IS NULL OR e.matchedNgoId = :ngoId) AND " +
           "(:donationId IS NULL OR e.donationId = :donationId) AND " +
           "(:donationCode IS NULL OR LOWER(e.donationCode) LIKE LOWER(CONCAT('%', :donationCode, '%'))) AND " +
           "(:eventType IS NULL OR e.eventType = :eventType) AND " +
           "(:status IS NULL OR e.newStatus = :status) AND " +
           "(:fromTime IS NULL OR e.createdAt >= :fromTime) AND " +
           "(:toTime IS NULL OR e.createdAt <= :toTime) " +
           "ORDER BY e.createdAt DESC, e.id DESC")
    Page<DonationHistoryEvent> filterDonationEvents(
            @Param("donorId") Long donorId,
            @Param("ngoId") Long ngoId,
            @Param("donationId") Long donationId,
            @Param("donationCode") String donationCode,
            @Param("eventType") String eventType,
            @Param("status") String status,
            @Param("fromTime") LocalDateTime fromTime,
            @Param("toTime") LocalDateTime toTime,
            Pageable pageable
    );
}
