package com.foodbridge.backend.history.repository;

import com.foodbridge.backend.history.entity.DeliveryHistoryEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeliveryHistoryEventRepository extends JpaRepository<DeliveryHistoryEvent, Long> {

    List<DeliveryHistoryEvent> findByDeliveryIdOrderByCreatedAtDescIdDesc(Long deliveryId);

    List<DeliveryHistoryEvent> findByDeliveryCodeOrderByCreatedAtDescIdDesc(String deliveryCode);

    List<DeliveryHistoryEvent> findByDonationIdOrderByCreatedAtDescIdDesc(Long donationId);

    Page<DeliveryHistoryEvent> findByVolunteerIdOrderByCreatedAtDescIdDesc(Long volunteerId, Pageable pageable);

    Page<DeliveryHistoryEvent> findByNgoIdOrderByCreatedAtDescIdDesc(Long ngoId, Pageable pageable);

    Page<DeliveryHistoryEvent> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);

    @Query("SELECT e FROM DeliveryHistoryEvent e WHERE " +
           "(:volunteerId IS NULL OR e.volunteerId = :volunteerId) AND " +
           "(:ngoId IS NULL OR e.ngoId = :ngoId) AND " +
           "(:deliveryId IS NULL OR e.deliveryId = :deliveryId) AND " +
           "(:deliveryCode IS NULL OR LOWER(e.deliveryCode) LIKE LOWER(CONCAT('%', :deliveryCode, '%'))) AND " +
           "(:donationId IS NULL OR e.donationId = :donationId) AND " +
           "(:eventType IS NULL OR e.eventType = :eventType) AND " +
           "(:status IS NULL OR e.newStatus = :status) AND " +
           "(:fromTime IS NULL OR e.createdAt >= :fromTime) AND " +
           "(:toTime IS NULL OR e.createdAt <= :toTime) " +
           "ORDER BY e.createdAt DESC, e.id DESC")
    Page<DeliveryHistoryEvent> filterDeliveryEvents(
            @Param("volunteerId") Long volunteerId,
            @Param("ngoId") Long ngoId,
            @Param("deliveryId") Long deliveryId,
            @Param("deliveryCode") String deliveryCode,
            @Param("donationId") Long donationId,
            @Param("eventType") String eventType,
            @Param("status") String status,
            @Param("fromTime") LocalDateTime fromTime,
            @Param("toTime") LocalDateTime toTime,
            Pageable pageable
    );
}
